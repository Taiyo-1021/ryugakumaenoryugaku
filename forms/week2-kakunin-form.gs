// Week2 確認テストのフォーム（Part1 和文英訳24問＋Part3② リスニング6問）と回答シートを作る。
// 使い方：script.google.com で新しいプロジェクトを作り、この中身を貼り付けて createWeek2Form を実行する。
// 実行後、「実行ログ」にフォームのURL（生徒用）と回答シートのIDが出る。

const WEEK2_FOLDER_ID = '1n6Ym3XUtQ_eEC6vRiGRMftNcD2ufi3bG'; // Week2 フォルダ
const LISTENING_URL = 'https://taiyo-1021.github.io/ryugakumaenoryugaku/week2-kakunin-listening.html';

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

// 正解は1-A、2-B、3-C、4-B、5-C、6-D（フォームには表示しない）
const LISTENING = [
  ['What did the man do for the first time?',
    ['He traveled alone.', 'He opened a shop.', 'He made chai.', 'He studied Hindi.']],
  ['Why was the man confused?',
    ['The shop was closed.', "He didn't understand a gesture.", 'He lost his bag.', 'The chai was too hot.']],
  ['What did the shop owner let the man do?',
    ['Take a photo', 'Use the phone', 'Try some chai', 'Work in the shop']],
  ['What was the speaker afraid of in high school?',
    ['Talking to teachers', 'Making mistakes in English class', 'Reading stories', 'Going to school']],
  ['What did the teacher tell the speaker to do?',
    ['Study harder', 'Write a diary', 'Speak more slowly', 'Join a club']],
  ["What is the speaker's dream?",
    ['To write stories', 'To live abroad', 'To be a singer', 'To become a teacher']]
];

function createWeek2Form() {
  const form = FormApp.create('Week2 確認テスト｜Part1 和文英訳・Part3② リスニング');
  form.setDescription(
    'Week2 確認テストの Part1（和文英訳）と Part3②（リスニング）の解答フォームです。\n' +
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

  form.addPageBreakItem()
    .setTitle('PART3②｜リスニング（TOEIC形式）')
    .setHelpText('下のリンクから音声（会話1つ・トーク1つ、各2回まで）を聞き、答えをA〜Dから選んでください。\n' + LISTENING_URL);
  LISTENING.forEach(function (q, i) {
    const item = form.addMultipleChoiceItem();
    item.setTitle('L' + (i + 1) + '. ' + q[0])
      .setChoices(q[1].map(function (text, k) {
        return item.createChoice('ABCD'.charAt(k) + '）' + text);
      }))
      .setRequired(true);
  });

  // 回答シート（名前に「確認テスト」を含むことが、添削ツールで読み込む条件）
  const ss = SpreadsheetApp.create('Week2 確認テスト｜Part1 和文英訳・Part3② リスニング（回答）');
  form.setDestination(FormApp.DestinationType.SPREADSHEET, ss.getId());

  try {
    const folder = DriveApp.getFolderById(WEEK2_FOLDER_ID);
    DriveApp.getFileById(form.getId()).moveTo(folder);
    DriveApp.getFileById(ss.getId()).moveTo(folder);
  } catch (e) {
    Logger.log('Week2フォルダへの移動はできませんでした（マイドライブに作成済み）：' + e);
  }

  Logger.log('生徒用フォームURL：' + form.getPublishedUrl());
  Logger.log('フォーム編集URL：' + form.getEditUrl());
  Logger.log('回答シートID：' + ss.getId());
}
