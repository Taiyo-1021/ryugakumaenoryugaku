// Week4 確認テストのフォーム（Part1 和文英訳24問）と回答シートを作る。
// Part3② はリピート（録画をSlackで提出）になったので、フォームには入れない。
// 使い方：script.google.com で新しいプロジェクトを作り、この中身を貼り付けて createWeek4Form を実行する。
// 実行後、「実行ログ」にフォームのURL（生徒用）と回答シートのIDが出る。

const PART1 = [
  '私はスペイン語を少し話すことができます。',
  'ドアを閉めてもらえますか？',
  '子どもの頃、私は泳ぐことができませんでした。',
  '来月には、一人で運転できるようになるでしょう。',
  '昨日、私はなんとか終電に乗ることができました。',
  'あなたはもっと水を飲むべきです。',
  '夜遅くにコーヒーを飲むべきではありません。',
  '雨が降っているので、傘を持っていった方がいいよ。',
  '遅刻しない方がいいよ。',
  '私たちは9時に会社に着くことになっています。',
  '彼はたぶん明日来るでしょう。',
  '今夜は雪が降るかもしれません。',
  '彼女はその知らせを聞いたら驚くかもしれません。',
  '私は今週末、出かけないかもしれません。',
  '窓を開けてもいいですか？',
  '私は今日、レポートを書き終えなければなりません。',
  '彼は毎朝6時に起きなければなりません。',
  '明日は会社に行く必要はありません。',
  'ここで写真を撮ってはいけません。',
  '私たちはパスポートを持っていかなければなりません。',
  '先生に聞いてみてもいいと思うよ。',
  '明日までにこの本を返さなければなりませんか？',
  '私は来年、留学できるかもしれません。',
  'ここで待っていればいいのですか？（待つことになっていますか）'
];


function createWeek4Form() {
  const form = FormApp.create('Week4 確認テスト｜Part1 和文英訳');
  form.setDescription(
    'Week4 確認テストの Part1（和文英訳）の解答フォームです。\n' +
    'わからない問題も調べずに、自分の知識の範囲内で英文を組み立てましょう。');
  form.setCollectEmail(false);
  form.setShowLinkToRespondAgain(false);

  form.addTextItem()
    .setTitle('お名前（漢字・フルネーム）')
    .setHelpText('毎週同じ書き方で入力してください（例：山田花子）。')
    .setRequired(true);

  form.addPageBreakItem()
    .setTitle('PART1｜文法チェック（和文英訳）')
    .setHelpText('次の日本語を英語にしてください。1問ずつ、思いついた表現で大丈夫です。わからない場合も、書けるところまで書いてください。');
  PART1.forEach(function (jp, i) {
    form.addTextItem().setTitle('Q' + (i + 1) + '. ' + jp);
  });

  // 回答シート（名前に「確認テスト」を含むことが、添削ツールで読み込む条件）
  const ss = SpreadsheetApp.create('Week4 確認テスト｜Part1 和文英訳（回答）');
  form.setDestination(FormApp.DestinationType.SPREADSHEET, ss.getId());

  // フォームと回答シートはマイドライブに置いたままにする。
  // 生徒が見る教材フォルダ（リンクを知っている人は閲覧可）に入れると、全員の名前と回答が見えてしまうため

  Logger.log('生徒用フォームURL：' + form.getPublishedUrl());
  Logger.log('フォーム編集URL：' + form.getEditUrl());
  Logger.log('回答シートID：' + ss.getId());
}
