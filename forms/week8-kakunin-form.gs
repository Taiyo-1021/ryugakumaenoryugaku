// Week8 確認テストのフォーム（Part1 和文英訳24問）と回答シートを作る。
// Part3② はリピート（録画をSlackで提出）になったので、フォームには入れない。
// 使い方：script.google.com で新しいプロジェクトを作り、この中身を貼り付けて createWeek8Form を実行する。
// 実行後、「実行ログ」にフォームのURL（生徒用）と回答シートのIDが出る。

const PART1 = [
  '私には、毎朝ジョギングをする友達がいます。',
  '彼女は、私が一番尊敬している先生です。',
  '彼は、私がいつも頼れる人です。',
  '私は、お母さんが医者の友達を知っています。',
  '人前で話すのが苦手な生徒はたくさんいます。',
  'これは、私の人生を変えた本です。',
  'これは、私が先週買ったかばんです。',
  '彼女は、私が今でも覚えている話をしてくれました。',
  'ここは、私がリラックスできる場所です。',
  '私は、初めて彼に会った日を覚えています。',
  '私が住んでいる町は、海の近くにあります。',
  '私に必要なのは、もっと練習することです。',
  'これは、私が毎日使っているものです。',
  '私は、先生が言ったことを覚えています。',
  'この仕事の好きなところは、いろいろな人に会えることです。',
  'それが、私が彼を信頼している理由です。',
  '私は、彼がどうやってその問題を解決したのか知りたいです。',
  '私は、なぜ彼女が怒っていたのか分かりません。',
  'これが、私が英語を勉強する方法です。',
  'あなたが日本に来た理由は何ですか？',
  '何が起きても、私はあなたの味方です。',
  'どんなに疲れていても、私は毎晩日記を書きます。',
  'いつ会っても、彼は笑顔です。',
  '好きな本をどれでも選んでいいですよ。'
];


function createWeek8Form() {
  const form = FormApp.create('Week8 確認テスト｜Part1 和文英訳');
  form.setDescription(
    'Week8 確認テストの Part1（和文英訳）の解答フォームです。\n' +
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
  const ss = SpreadsheetApp.create('Week8 確認テスト｜Part1 和文英訳（回答）');
  form.setDestination(FormApp.DestinationType.SPREADSHEET, ss.getId());

  // フォームと回答シートはマイドライブに置いたままにする。
  // 生徒が見る教材フォルダ（リンクを知っている人は閲覧可）に入れると、全員の名前と回答が見えてしまうため

  Logger.log('生徒用フォームURL：' + form.getPublishedUrl());
  Logger.log('フォーム編集URL：' + form.getEditUrl());
  Logger.log('回答シートID：' + ss.getId());
}
