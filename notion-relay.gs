// 確認テストFB → Notion 中継（Google Apps Script）
//
// 添削ツール（tensaku-tool.html）の「Notionにページを作成」から呼ばれ、
// Notionの「確認テストFB」データベースに生徒のFBページを作る。
// Notionの鍵はここ（スクリプトプロパティ）にだけ置き、ツールには書かない。
//
// スクリプトプロパティ（プロジェクトの設定 → スクリプト プロパティ）：
//   NOTION_TOKEN : Notionの連携（インテグレーション）のシークレット
//   NOTION_DB_ID : 確認テストFBデータベースのID
//   PASSCODE     : 講師だけが知る合言葉（ツールの設定欄に入れるものと同じ）

const NOTION_VERSION = '2022-06-28';

function doPost(e) {
  try {
    const conf = PropertiesService.getScriptProperties();
    const body = JSON.parse(e.postData.contents);
    if (!body.pass || body.pass !== conf.getProperty('PASSCODE')) {
      return reply({ error: '合言葉が違います。' });
    }

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

    const blocks = markdownToBlocks(body.markdown || '');
    const created = notion('post', 'pages', {
      parent: { database_id: conf.getProperty('NOTION_DB_ID') },
      icon: { type: 'emoji', emoji: '📝' },
      properties: props,
      children: blocks.slice(0, 100)
    });
    // 1回に送れるブロックは100個までなので、残りは追記する
    for (let i = 100; i < blocks.length; i += 100) {
      notion('patch', 'blocks/' + created.id + '/children', { children: blocks.slice(i, i + 100) });
    }
    return reply({ url: created.url });
  } catch (err) {
    return reply({ error: String(err && err.message ? err.message : err) });
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

// **太字** を含む1行を、Notionのrich_textに変換する
function richText(line) {
  const parts = [];
  const re = /\*\*(.+?)\*\*/g;
  let last = 0, m;
  while ((m = re.exec(line)) !== null) {
    if (m.index > last) parts.push(plain(line.slice(last, m.index)));
    const bold = plain(m[1]);
    bold.annotations = { bold: true };
    parts.push(bold);
    last = re.lastIndex;
  }
  if (last < line.length) parts.push(plain(line.slice(last)));
  return parts.length ? parts : [plain('')];
}

// ツールが出すMarkdown（見出し・箇条書き・番号付きリスト・段落）をNotionのブロックにする
function markdownToBlocks(md) {
  const blocks = [];
  md.replace(/\r/g, '').split('\n').forEach(function (raw) {
    const line = raw.trimEnd();
    if (!line.trim() || /^```/.test(line.trim())) return;
    let m;
    if ((m = line.match(/^###\s+(.*)$/))) blocks.push({ type: 'heading_3', heading_3: { rich_text: richText(m[1]) } });
    else if ((m = line.match(/^##\s+(.*)$/))) blocks.push({ type: 'heading_2', heading_2: { rich_text: richText(m[1]) } });
    else if ((m = line.match(/^#\s+(.*)$/))) blocks.push({ type: 'heading_1', heading_1: { rich_text: richText(m[1]) } });
    else if ((m = line.match(/^\s*[-・*]\s+(.*)$/))) blocks.push({ type: 'bulleted_list_item', bulleted_list_item: { rich_text: richText(m[1]) } });
    else if ((m = line.match(/^\s*\d+[.．]\s+(.*)$/))) blocks.push({ type: 'numbered_list_item', numbered_list_item: { rich_text: richText(m[1]) } });
    else blocks.push({ type: 'paragraph', paragraph: { rich_text: richText(line) } });
  });
  return blocks;
}
