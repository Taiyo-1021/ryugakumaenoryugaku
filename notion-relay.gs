// 確認テストFB → 記録シート・Notion 中継（Google Apps Script）
//
// 添削ツール（tensaku-tool.html）の「記録してNotionを作成」から呼ばれ、
// 1. 記録シートに、その生徒のその週の行を書き込む（同じ生徒・週の古い行は置き換える）
// 2. Notionの「確認テストFB」データベースに生徒のFBページを作る
// また action: "part1" のときは、Part 1（グーグルフォーム）の回答シートを読んで返す
// Notionの鍵はここ（スクリプトプロパティ）にだけ置き、ツールには書かない。
//
// スクリプトプロパティ（プロジェクトの設定 → スクリプト プロパティ）：
//   NOTION_TOKEN : Notionの連携（インテグレーション）のシークレット
//   NOTION_DB_ID : 確認テストFBデータベースのID
//   PASSCODE     : 講師だけが知る合言葉（ツールの設定欄に入れるものと同じ）
//   SHEET_ID     : 記録シート（Googleスプレッドシート）のID

const NOTION_VERSION = '2022-06-28';

function doPost(e) {
  try {
    const conf = PropertiesService.getScriptProperties();
    const body = JSON.parse(e.postData.contents);
    if (!body.pass || body.pass !== conf.getProperty('PASSCODE')) {
      return reply({ error: '合言葉が違います。' });
    }
    if (body.action === 'part1') return reply(readPart1(body.sheetId));

    // 1. 記録シート
    const saved = saveRows(conf.getProperty('SHEET_ID'), body.week, body.student, body.rows || []);

    // 2. Notion
    const props = {
      'タイトル': { title: [plain(body.title || '')] },
      '生徒': { rich_text: [plain(body.student || '')] },
      '担当': { rich_text: [plain(body.teacher || '')] },
      '今週の重点': { rich_text: [plain(body.focus || '')] }
    };
    if (body.week) props['週'] = { select: { name: body.week } };
    setNumber(props, '文型（/24）', body.part1);
    setNumber(props, '瞬間英作文（/20）', body.part2);
    setNumber(props, '発音（/17）', body.part3);
    if (body.support2) props['補助教材：瞬間英作文'] = { select: { name: body.support2 } };
    if (body.support3) props['補助教材：発音'] = { select: { name: body.support3 } };

    let created;
    try {
      created = notion('post', 'pages', {
        parent: { database_id: conf.getProperty('NOTION_DB_ID') },
        icon: { type: 'emoji', emoji: '📝' },
        properties: props
      });
      appendBlocks(created.id, markdownToBlocks(body.markdown || ''));
    } catch (err) {
      return reply({ error: '記録シートには' + saved + '行を記録しましたが、Notionのページは' + (created ? '途中までしか' : '') + '作れませんでした（' + err.message + '）' });
    }
    return reply({ url: created.url, rows: saved });
  } catch (err) {
    return reply({ error: String(err && err.message ? err.message : err) });
  }
}

// Part 1の回答シートを読む。読めるのは「フォームにつながった、名前に『確認テスト』を含むシート」だけ
function readPart1(sheetId) {
  if (!sheetId) return { error: 'この週の回答シートが設定されていません。' };
  const ss = SpreadsheetApp.openById(sheetId);
  if (!ss.getFormUrl() || ss.getName().indexOf('確認テスト') < 0) {
    return { error: '確認テストの回答シートではないため読み込めません。' };
  }
  const values = ss.getSheets()[0].getDataRange().getDisplayValues();
  const header = values.shift() || [];
  // 同じ名前で複数回答があれば、最後の回答を使う
  const byName = {};
  values.forEach(function (r) {
    const name = String(r[1] || '').trim();
    if (name) byName[name] = r;
  });
  return {
    header: header,
    students: Object.keys(byName).map(function (name) { return { name: name, row: byName[name] }; })
  };
}

// 記録シートのA〜K列だけを読み書きする（M列から右の集計の数式には触らない）
function saveRows(sheetId, week, student, rows) {
  if (!sheetId || !rows.length) return 0;
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const sheet = SpreadsheetApp.openById(sheetId).getSheets()[0];
    const width = 11;
    const lastRow = Math.max(sheet.getLastRow(), 1);
    const current = lastRow > 1 ? sheet.getRange(2, 1, lastRow - 1, width).getValues() : [];
    // 空の行と、同じ週・同じ生徒の古い行を除く
    const kept = current.filter(function (r) {
      const empty = r.every(function (c) { return c === '' || c === null; });
      return !empty && !(String(r[0]) === String(week) && String(r[1]) === String(student));
    });
    const incoming = rows.map(function (r) {
      const row = r.slice(0, width);
      while (row.length < width) row.push('');
      return row.map(function (c, i) {
        const v = c === null || c === undefined ? '' : String(c);
        if (v === '') return '';
        if ((i === 3 || i === 7 || i === 8) && !isNaN(Number(v))) return Number(v); // Part・瞬発力・点数は数値
        return /^[=+\-@]/.test(v) ? "'" + v : v; // 数式として読まれないように
      });
    });
    const all = kept.concat(incoming);
    if (current.length) sheet.getRange(2, 1, current.length, width).clearContent();
    if (all.length) sheet.getRange(2, 1, all.length, width).setValues(all);
    return incoming.length;
  } finally {
    lock.releaseLock();
  }
}

function notion(method, path, payload) {
  const res = UrlFetchApp.fetch('https://api.notion.com/v1/' + path, {
    method: method,
    contentType: 'application/json',
    headers: {
      Authorization: 'Bearer ' + PropertiesService.getScriptProperties().getProperty('NOTION_TOKEN'),
      'Notion-Version': NOTION_VERSION
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  });
  const json = JSON.parse(res.getContentText());
  if (res.getResponseCode() >= 300) throw new Error('Notion：' + (json.message || res.getResponseCode()));
  return json;
}

function reply(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function setNumber(props, name, value) {
  if (value !== null && value !== undefined && value !== '' && !isNaN(Number(value))) {
    props[name] = { number: Number(value) };
  }
}

function plain(text) {
  return { type: 'text', text: { content: String(text).slice(0, 2000) } };
}

// 開け閉めできる欄（トグル）の中身は、トグルを作ったあとに追記する（1回で送れる入れ子は2段までのため）
function appendBlocks(parentId, blocks) {
  for (let i = 0; i < blocks.length; i += 100) {
    const chunk = blocks.slice(i, i + 100);
    const res = notion('patch', 'blocks/' + parentId + '/children', {
      children: chunk.map(function (b) { const c = Object.assign({}, b); delete c._children; return c; })
    });
    chunk.forEach(function (b, j) {
      if (b._children && b._children.length) appendBlocks(res.results[j].id, b._children);
    });
  }
}

// **太字** と `タグ` を含む1行を、Notionのrich_textに変換する
function richText(line) {
  const parts = [];
  const re = /\*\*(.+?)\*\*|`([^`]+)`/g;
  let last = 0, m;
  while ((m = re.exec(line)) !== null) {
    if (m.index > last) parts.push(plain(line.slice(last, m.index)));
    const t = plain(m[1] !== undefined ? m[1] : m[2]);
    t.annotations = m[1] !== undefined ? { bold: true } : { code: true };
    parts.push(t);
    last = re.lastIndex;
  }
  if (last < line.length) parts.push(plain(line.slice(last)));
  return parts.length ? parts : [plain('')];
}

function tableCells(line) {
  return line.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map(function (c) { return c.trim(); });
}

// ツールが出すMarkdownをNotionのブロックにする
//   # ## ###：見出し　- ：箇条書き　1. ：番号付き　- [ ] ：チェックボックス　---：区切り線
//   | a | b |：表　> ：色つきの枠（先頭が絵文字ならそのアイコン）　▶ 〜 ◀：開け閉めできる欄
function markdownToBlocks(md) {
  const lines = String(md).replace(/\r/g, '').split('\n');
  const blocks = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i].replace(/\s+$/, '');
    const t = line.trim();
    let m;
    if (!t || /^```/.test(t) || t === '◀') { i++; continue; }
    if (/^▶\s*/.test(t)) {
      // ◀ までを中身にする
      const inner = [];
      let depth = 0;
      i++;
      while (i < lines.length) {
        const u = lines[i].trim();
        if (/^▶/.test(u)) depth++;
        if (u === '◀') { if (depth === 0) break; depth--; }
        inner.push(lines[i]);
        i++;
      }
      i++;
      blocks.push({ type: 'toggle', toggle: { rich_text: richText(t.replace(/^▶\s*/, '')) }, _children: markdownToBlocks(inner.join('\n')) });
      continue;
    }
    if (/^\|/.test(t)) {
      const rows = [];
      let header = false;
      while (i < lines.length && /^\|/.test(lines[i].trim())) {
        const cells = tableCells(lines[i]);
        if (cells.every(function (c) { return /^:?-{2,}:?$/.test(c); })) header = rows.length === 1;
        else rows.push(cells);
        i++;
      }
      const width = Math.max.apply(null, rows.map(function (r) { return r.length; }));
      blocks.push({
        type: 'table',
        table: {
          table_width: width, has_column_header: header, has_row_header: false,
          children: rows.map(function (r) {
            const cells = [];
            for (let k = 0; k < width; k++) cells.push(r[k] ? richText(r[k]) : []);
            return { type: 'table_row', table_row: { cells: cells } };
          })
        }
      });
      continue;
    }
    if (/^>/.test(t)) {
      const texts = [];
      while (i < lines.length && /^>/.test(lines[i].trim())) {
        texts.push(lines[i].trim().replace(/^>\s?/, ''));
        i++;
      }
      let icon = null;
      const em = texts[0].match(/^(\p{Extended_Pictographic}️?)\s*/u);
      if (em) { icon = em[1]; texts[0] = texts[0].slice(em[0].length); }
      const rich = [];
      texts.forEach(function (x, k) { if (k) rich.push(plain('\n')); Array.prototype.push.apply(rich, richText(x)); });
      blocks.push(icon
        ? { type: 'callout', callout: { rich_text: rich, icon: { type: 'emoji', emoji: icon }, color: 'gray_background' } }
        : { type: 'quote', quote: { rich_text: rich } });
      continue;
    }
    if (/^-{3,}$/.test(t)) blocks.push({ type: 'divider', divider: {} });
    else if ((m = t.match(/^#{4,}\s+(.*)$/)) || (m = t.match(/^###\s+(.*)$/))) blocks.push({ type: 'heading_3', heading_3: { rich_text: richText(m[1]) } });
    else if ((m = t.match(/^##\s+(.*)$/))) blocks.push({ type: 'heading_2', heading_2: { rich_text: richText(m[1]) } });
    else if ((m = t.match(/^#\s+(.*)$/))) blocks.push({ type: 'heading_1', heading_1: { rich_text: richText(m[1]) } });
    else if ((m = t.match(/^[-・*]\s+\[([ xX])\]\s*(.*)$/))) blocks.push({ type: 'to_do', to_do: { rich_text: richText(m[2]), checked: m[1] !== ' ' } });
    else if ((m = t.match(/^[-・*]\s+(.*)$/))) blocks.push({ type: 'bulleted_list_item', bulleted_list_item: { rich_text: richText(m[1]) } });
    else if ((m = t.match(/^\d+[.．]\s+(.*)$/))) blocks.push({ type: 'numbered_list_item', numbered_list_item: { rich_text: richText(m[1]) } });
    else blocks.push({ type: 'paragraph', paragraph: { rich_text: richText(t) } });
    i++;
  }
  return blocks;
}
