// Week5 確認テストのフォーム（Part1 和文英訳24問）と回答シートを作る。
// Part3② はリピート（録画をSlackで提出）になったので、フォームには入れない。
// 使い方：script.google.com で新しいプロジェクトを作り、この中身を貼り付けて createWeek5Form を実行する。
// 実行後、「実行ログ」にフォームのURL（生徒用）と回答シートのIDが出る。

const PART1 = [
  '今日は昨日より暑いです。',
  '私の兄は私より3歳年上です。',
  'この箱はあの箱より重いです。',
  '東京は大阪より大きいですか？',
  '彼は私より速く走ります。',
  'この本はあの本よりおもしろいです。',
  '英語を話すことは、読むことより難しいです。',
  'もっとゆっくり話してもらえますか？',
  '私は前より英語の映画をたくさん見ています。',
  '私の町には、この街より公園がたくさんあります。',
  '私は肉より魚の方が好きです。',
  '彼女は私より歌が上手です。',
  '今日の天気は昨日より悪いです。',
  '私は前ほど緊張しなくなりました。',
  '今日は今年で一番寒い日です。',
  '富士山は日本で一番高い山です。',
  '彼はクラスで一番背が高いです。',
  'これはこの店で一番高い（値段の）かばんです。',
  '3人の中で、誰が一番早く起きますか？',
  '家族の中で、母が一番料理が上手です。',
  '一番大切なのは、毎日続けることです。',
  '昔、私の部屋は今より小さかったです。',
  '私は前より上手に料理ができます。',
  '犬と猫、どちらの方が好きですか？'
];


function createWeek5Form() {
  const form = FormApp.create('Week5 確認テスト｜Part1 和文英訳');
  form.setDescription(
    'Week5 確認テストの Part1（和文英訳）の解答フォームです。\n' +
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
  const ss = SpreadsheetApp.create('Week5 確認テスト｜Part1 和文英訳（回答）');
  form.setDestination(FormApp.DestinationType.SPREADSHEET, ss.getId());

  // フォームと回答シートはマイドライブに置いたままにする。
  // 生徒が見る教材フォルダ（リンクを知っている人は閲覧可）に入れると、全員の名前と回答が見えてしまうため

  Logger.log('生徒用フォームURL：' + form.getPublishedUrl());
  Logger.log('フォーム編集URL：' + form.getEditUrl());
  Logger.log('回答シートID：' + ss.getId());
}
