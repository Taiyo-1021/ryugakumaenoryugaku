// 確認テストFB → 記録シート・Notion 中継（Google Apps Script）
//
// 添削ツール（tensaku-tool.html）から呼ばれる。
//   （actionなし）「記録してNotionに下書きを作成」
//       1. 記録シートに、その生徒のその週の行を書き込む（同じ生徒・週の古い行は置き換える）
//       2. Notionの「確認テストFB」データベースに下書きページを作る（講師だけが見られる場所）
//   action: "publish"  レッスン後の「生徒に公開」
//       講師が直した下書きを、その生徒専用のページ（Web公開する場所）の中へコピーする
//   action: "drafts"   その週に下書きがある生徒の一覧を返す
//   action: "part1"    Part 1（グーグルフォーム）の回答シートを読んで返す
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
    // 名前の空白（半角・全角）は取り除いて、同じ人として扱う
    if (body.student !== undefined) body.student = normalizeName(body.student);
    if (body.asStudent !== undefined) body.asStudent = normalizeName(body.asStudent);
    if (body.action === 'part1') return reply(readPart1(body.sheetId));
    if (body.action === 'drafts') return reply(listDrafts(conf.getProperty('NOTION_DB_ID'), body.week));
    if (body.action === 'publish') {
      const lock = LockService.getScriptLock();
      lock.waitLock(30000);
      try { return reply(publish(conf, body)); } finally { lock.releaseLock(); }
    }

    // 初めての名前が、すでにいる生徒の名前と似ていたら、書き込む前に確認する
    if (!body.confirmNew) {
      const similar = similarNames(body.student, knownStudents(conf));
      if (similar.length) return reply({ needConfirm: true, similar: similar });
    }

    // Notionの下書きが講師に直されていたら、消す前に確認する
    const oldDrafts = findDrafts(conf.getProperty('NOTION_DB_ID'), body.week, body.student);
    if (!body.overwrite) {
      const edited = oldDrafts.filter(function (p) { return editedAfterCreate(conf, p); })[0];
      if (edited) return reply({ needOverwrite: true, edited: edited.last_edited_time });
    }

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
      // 同じ週・同じ生徒の古い下書きは消して（ゴミ箱へ）、作り直す
      oldDrafts.forEach(function (p) {
        notion('patch', 'pages/' + p.id, { archived: true });
        conf.deleteProperty('DRAFT_DONE_' + p.id);
      });
      created = notion('post', 'pages', {
        parent: { database_id: conf.getProperty('NOTION_DB_ID') },
        icon: { type: 'emoji', emoji: '📝' },
        properties: props
      });
      appendBlocks(created.id, markdownToBlocks(body.markdown || ''));
      // 作り終えた時点の更新日時を覚えておく（これより後に変わっていれば、講師が直したということ）
      conf.setProperty('DRAFT_DONE_' + created.id, notion('get', 'pages/' + created.id).last_edited_time);
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
    const name = normalizeName(r[1]);
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
  const opt = {
    method: method,
    headers: {
      Authorization: 'Bearer ' + PropertiesService.getScriptProperties().getProperty('NOTION_TOKEN'),
      'Notion-Version': NOTION_VERSION
    },
    muteHttpExceptions: true
  };
  if (payload !== undefined) {
    opt.contentType = 'application/json';
    opt.payload = JSON.stringify(payload);
  }
  // 回数制限（429）や一時的なエラー（5xx）のときは、少し待ってやり直す
  let res;
  for (let i = 0; ; i++) {
    res = UrlFetchApp.fetch('https://api.notion.com/v1/' + path, opt);
    const code = res.getResponseCode();
    if ((code === 429 || code >= 500) && i < 5) {
      const after = Number((res.getHeaders() || {})['Retry-After'] || (res.getHeaders() || {})['retry-after']);
      Utilities.sleep(after > 0 ? after * 1000 : 500 * Math.pow(2, i));
      continue;
    }
    break;
  }
  const json = JSON.parse(res.getContentText());
  if (res.getResponseCode() >= 300) throw new Error('Notion：' + (json.message || res.getResponseCode()));
  return json;
}

// ============================================================
// 下書きと、生徒に公開
// ============================================================
function findDrafts(dbId, week, student) {
  if (!week || !student) return [];
  const res = notion('post', 'databases/' + dbId + '/query', {
    filter: { and: [{ property: '週', select: { equals: week } }, { property: '生徒', rich_text: { equals: student } }] },
    sorts: [{ timestamp: 'created_time', direction: 'descending' }]
  });
  return res.results;
}

function listDrafts(dbId, week) {
  const names = [];
  let cursor;
  do {
    const q = { filter: { property: '週', select: { equals: week || '' } }, page_size: 100 };
    if (cursor) q.start_cursor = cursor;
    const res = notion('post', 'databases/' + dbId + '/query', q);
    res.results.forEach(function (p) {
      const name = ((p.properties['生徒'] || {}).rich_text || []).map(function (t) { return t.plain_text; }).join('');
      if (name && names.indexOf(name) < 0) names.push(name);
    });
    cursor = res.has_more ? res.next_cursor : null;
  } while (cursor);
  return { students: names };
}

// 下書きが、作ったあとに講師に直されたか（Notionの更新日時は分単位）
function editedAfterCreate(conf, page) {
  const done = conf.getProperty('DRAFT_DONE_' + page.id);
  if (!done) return true; // 記録がない古い下書きは、念のため「直された」とみなす
  return new Date(page.last_edited_time).getTime() > new Date(done).getTime();
}

// ページがまだ使えるか（ゴミ箱に入っていないか）
function alivePage(id) {
  if (!id) return null;
  try {
    const p = notion('get', 'pages/' + id);
    return p.archived || p.in_trash ? null : p;
  } catch (e) {
    return null;
  }
}

// 生徒専用ページを置く場所（データベースの1行。ここ自体は公開しない）
function studentRoot(conf) {
  const page = alivePage(conf.getProperty('STUDENT_ROOT_ID'));
  if (page) return page.id;
  const created = notion('post', 'pages', {
    parent: { database_id: conf.getProperty('NOTION_DB_ID') },
    icon: { type: 'emoji', emoji: '📚' },
    properties: { 'タイトル': { title: [plain('（触らない）生徒専用ページの置き場')] } }
  });
  conf.setProperty('STUDENT_ROOT_ID', created.id);
  return created.id;
}

// 生徒専用ページ（この単位でWeb公開する）。なければ作る
function studentPage(conf, student) {
  const key = 'STUDENT_PAGE_' + student;
  const page = alivePage(conf.getProperty(key));
  if (page) return { id: page.id, url: page.url, isNew: false };
  const created = notion('post', 'pages', {
    parent: { page_id: studentRoot(conf) },
    icon: { type: 'emoji', emoji: '🎓' },
    properties: { title: { title: [plain(student + 'さんのフィードバック')] } }
  });
  conf.setProperty(key, created.id);
  return { id: created.id, url: created.url, isNew: true };
}

// ============================================================
// 生徒の名前
// ============================================================
function normalizeName(name) {
  return String(name || '').replace(/[\s　]+/g, '');
}

// 記録シートと、専用ページがある生徒の名前
function knownStudents(conf) {
  const names = {};
  conf.getKeys().forEach(function (k) { if (k.indexOf('STUDENT_PAGE_') === 0) names[k.slice(13)] = true; });
  const sheetId = conf.getProperty('SHEET_ID');
  if (sheetId) {
    const sheet = SpreadsheetApp.openById(sheetId).getSheets()[0];
    if (sheet.getLastRow() > 1) {
      sheet.getRange(2, 2, sheet.getLastRow() - 1, 1).getValues().forEach(function (r) {
        const n = normalizeName(r[0]);
        if (n) names[n] = true;
      });
    }
  }
  return Object.keys(names);
}

// 旧字体・異体字をそろえる（似ているかの判定だけに使う）
const KANJI_VARIANTS = { '髙': '高', '﨑': '崎', '嵜': '崎', '齋': '斉', '齊': '斉', '斎': '斉', '邊': '辺', '邉': '辺', '澤': '沢',
  '濱': '浜', '廣': '広', '嶋': '島', '嶌': '島', '櫻': '桜', '國': '国', '藝': '芸', '德': '徳', '惠': '恵', '眞': '真',
  '槇': '槙', '龍': '竜', '瀨': '瀬', '冨': '富', '條': '条', '實': '実', '彌': '弥', '壽': '寿', '曾': '曽', '萬': '万' };
function looseName(name) {
  return name.split('').map(function (c) { return KANJI_VARIANTS[c] || c; }).join('')
    .replace(/[ァ-ヶ]/g, function (c) { return String.fromCharCode(c.charCodeAt(0) - 0x60); });
}
function editDistance(a, b) {
  const d = [];
  for (let i = 0; i <= a.length; i++) { d[i] = [i]; }
  for (let j = 0; j <= b.length; j++) { d[0][j] = j; }
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
  }
  return d[a.length][b.length];
}
// 初めての名前なら、似ている名前の一覧を返す（同じ名前がすでにいれば空）
function similarNames(name, known) {
  if (!name || known.indexOf(name) >= 0) return [];
  const a = looseName(name);
  return known.filter(function (k) {
    const b = looseName(k);
    if (a === b) return true;                                    // 異体字・カタカナの違いだけ
    if (a.length >= 2 && b.length >= 2 && (a.indexOf(b) >= 0 || b.indexOf(a) >= 0)) return true; // 名字だけ・フルネーム
    return Math.min(a.length, b.length) >= 3 && editDistance(a, b) <= 1; // 1文字だけ違う
  });
}

function listChildren(id) {
  const out = [];
  let cursor;
  do {
    const res = notion('get', 'blocks/' + id + '/children?page_size=100' + (cursor ? '&start_cursor=' + cursor : ''));
    Array.prototype.push.apply(out, res.results);
    cursor = res.has_more ? res.next_cursor : null;
  } while (cursor);
  return out;
}

const TEACHER_PLACEHOLDER = '（ここに講師が書き足します）';
const COPY_TYPES = ['paragraph', 'heading_1', 'heading_2', 'heading_3', 'bulleted_list_item', 'numbered_list_item',
  'to_do', 'toggle', 'quote', 'callout', 'divider', 'table', 'code', 'bookmark', 'embed', 'equation', 'image', 'video'];

function cleanRich(arr) {
  return (arr || []).map(function (t) {
    const o = { type: t.type, annotations: t.annotations };
    if (t.type === 'text') o.text = { content: t.text.content, link: t.text.link };
    else if (t.type === 'mention') o.mention = t.mention;
    else if (t.type === 'equation') o.equation = t.equation;
    return o;
  });
}

// 下書きのブロックを、作り直せる形で読み出す（講師がNotionで直した内容もそのまま）
function readBlocks(id, skipped) {
  const out = [];
  listChildren(id).forEach(function (b) {
    const type = b.type;
    const data = b[type];
    // Notionにアップロードされた画像などは、リンクの期限が切れるのでコピーしない
    if (COPY_TYPES.indexOf(type) < 0 || (data && data.type === 'file')) { skipped.n++; return; }
    const copy = JSON.parse(JSON.stringify(data));
    if (copy.rich_text) copy.rich_text = cleanRich(copy.rich_text);
    if (copy.caption) copy.caption = cleanRich(copy.caption);
    if (copy.icon && copy.icon.type !== 'emoji') delete copy.icon;
    const block = { type: type };
    block[type] = copy;
    if (type === 'table') {
      copy.children = listChildren(b.id).map(function (r) {
        return { type: 'table_row', table_row: { cells: r.table_row.cells.map(cleanRich) } };
      });
    } else if (b.has_children) {
      block._children = readBlocks(b.id, skipped);
    }
    out.push(block);
  });
  return out;
}

function publish(conf, body) {
  const week = body.week, student = body.student;
  // 公開先の生徒（「同じ人」と答えたときは、すでにある名前のページに入れる）
  const owner = body.asStudent || student;
  if (!body.confirmNew && !alivePage(conf.getProperty('STUDENT_PAGE_' + owner))) {
    const similar = similarNames(owner, knownStudents(conf));
    if (similar.length) return { needConfirm: true, similar: similar };
  }
  const drafts = findDrafts(conf.getProperty('NOTION_DB_ID'), week, student);
  if (!drafts.length) return { error: week + ' ' + student + 'さんの下書きがNotionにありません。先に「記録してNotionに下書きを作成」を押してください。' };
  const skipped = { n: 0 };
  const blocks = readBlocks(drafts[0].id, skipped);
  if (JSON.stringify(blocks).indexOf(TEACHER_PLACEHOLDER) >= 0) {
    return { error: '「講師より」がまだ書かれていません。Notionの下書きの「（ここに講師が書き足します）」を書きかえてから、もう一度押してください。' };
  }
  const sp = studentPage(conf, owner);
  const title = week + ' 確認テストのフィードバック';
  // 同じ週のページがすでにあれば、中身だけ入れ替える（生徒に送ったリンクを変えない）
  const existing = listChildren(sp.id).filter(function (b) {
    return b.type === 'child_page' && b.child_page.title === title;
  })[0];
  let target;
  let oldBlocks = [];
  if (existing) {
    // 先に新しい中身を入れてから古い中身を消す（途中で止まってもページが空にならない）
    oldBlocks = listChildren(existing.id);
    target = notion('get', 'pages/' + existing.id);
  } else {
    target = notion('post', 'pages', {
      parent: { page_id: sp.id },
      icon: { type: 'emoji', emoji: '📝' },
      properties: { title: { title: [plain(title)] } }
    });
  }
  appendBlocks(target.id, blocks);
  oldBlocks.forEach(function (b) { notion('delete', 'blocks/' + b.id); });
  return { url: target.url, studentUrl: sp.url, newStudent: sp.isNew, updated: !!existing, skipped: skipped.n };
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
