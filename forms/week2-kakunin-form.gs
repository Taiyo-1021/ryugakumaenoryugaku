// Week2 確認テストのフォーム（Part1 和文英訳24問）と回答シートを作る。
// Part3② はリピート（録画をSlackで提出）になったので、フォームには入れない。
// 使い方：script.google.com で新しいプロジェクトを作り、この中身を貼り付けて createWeek2Form を実行する。
// 実行後、「実行ログ」にフォームのURL（生徒用）と回答シートのIDが出る。

const PART1 = [
  '私は新しいスポーツに挑戦したいです。',
  '音楽を聴くことは、私をリラックスさせます。',
  '彼は将来、医者になることを夢見ています。',
  '私は宿題を終えるために、図書館に行きました。',
  '彼女は英語を話すのが得意です。',
  '私たちは、もっと練習することに決めました。',
  '彼は新しい言語を学ぶことを楽しんでいます。',
  '友達は私に彼の新しい自転車に乗らせてくれました。',
  '父は私に毎朝犬を散歩させました。',
  '私の夢は、有名な歌手になることです。',
  '彼女は毎朝走ることを続けています。',
  '何か新しいことに挑戦するのは怖いことがあります。',
  '私には、今日やるべきことがたくさんあります。',
  '私は将来、留学することを望んでいます。',
  '彼は嘘をつくことをやめました。',
  '先生は私に毎日英語の日記を書くように言いました。',
  '私は子どもたちが公園でサッカーをしているのを見ました。',
  '彼らはパーティーを開くことを計画しています。',
  '私は新しいことを学ぶことに興味があります。',
  '彼には話す相手がいません。',
  '私は宿題を終えたことを覚えています。',
  '私はその知らせを聞いて驚きました。',
  '私は誰かが私の名前を呼ぶのを聞きました。',
  '私は彼に手伝ってほしいです。'
];


function createWeek2Form() {
  const form = FormApp.create('Week2 確認テスト｜Part1 和文英訳');
  form.setDescription(
    'Week2 確認テストの Part1（和文英訳）の解答フォームです。\n' +
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
  const ss = SpreadsheetApp.create('Week2 確認テスト｜Part1 和文英訳（回答）');
  form.setDestination(FormApp.DestinationType.SPREADSHEET, ss.getId());

  // フォームと回答シートはマイドライブに置いたままにする。
  // 生徒が見る教材フォルダ（リンクを知っている人は閲覧可）に入れると、全員の名前と回答が見えてしまうため

  Logger.log('生徒用フォームURL：' + form.getPublishedUrl());
  Logger.log('フォーム編集URL：' + form.getEditUrl());
  Logger.log('回答シートID：' + ss.getId());
}
