// 共通エンジン: 各 dayN.html は先に `const CURRENT_DAY = N;` を定義してから
// data.js → engine.js の順に読み込む。

const QUESTION_SEC = 7;
const ANSWER_SEC = 5;
const TOTAL_DAYS = 5;

const DATA = ALL_SENTENCES.filter(s => s.day <= CURRENT_DAY);

let order = [];
let idx = 0;
let phase = "question";
let timerInterval = null;
let remaining = 0;

let startScreen, playScreen, doneScreen, card, cardText, bar, timerNum, progressTop;

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function startSession() {
  order = shuffle(DATA.map((_, i) => i));
  idx = 0;
  startScreen.classList.add("hidden");
  doneScreen.classList.add("hidden");
  playScreen.classList.remove("hidden");
  showQuestion();
}

function updateTopProgress() {
  progressTop.textContent = `Day ${CURRENT_DAY} ${idx + 1} / ${DATA.length}`;
}

function showQuestion() {
  phase = "question";
  updateTopProgress();
  const item = DATA[order[idx]];
  card.classList.remove("answer");
  card.classList.add("question");
  cardText.textContent = item.jp;
  bar.classList.remove("answer-bar");
  runTimer(QUESTION_SEC, showAnswer);
}

function showAnswer() {
  phase = "answer";
  const item = DATA[order[idx]];
  card.classList.remove("question");
  card.classList.add("answer");
  cardText.textContent = item.en;
  bar.classList.add("answer-bar");
  runTimer(ANSWER_SEC, nextItem);
}

function nextItem() {
  idx++;
  if (idx >= order.length) {
    finishSession();
    return;
  }
  showQuestion();
}

function finishSession() {
  clearInterval(timerInterval);
  playScreen.classList.add("hidden");
  doneScreen.classList.remove("hidden");
  progressTop.textContent = "";
}

function runTimer(seconds, onComplete) {
  clearInterval(timerInterval);
  remaining = seconds;
  timerNum.textContent = remaining;

  bar.style.transition = "none";
  bar.style.width = "100%";
  void bar.offsetWidth;
  bar.style.transition = `width ${seconds}s linear`;
  bar.style.width = "0%";

  timerInterval = setInterval(() => {
    remaining--;
    if (remaining <= 0) {
      clearInterval(timerInterval);
      onComplete();
    } else {
      timerNum.textContent = remaining;
    }
  }, 1000);
}

function initEngine() {
  startScreen = document.getElementById("startScreen");
  playScreen = document.getElementById("playScreen");
  doneScreen = document.getElementById("doneScreen");
  card = document.getElementById("card");
  cardText = document.getElementById("cardText");
  bar = document.getElementById("bar");
  timerNum = document.getElementById("timerNum");
  progressTop = document.getElementById("progressTop");

  document.getElementById("dayBadge").textContent = `DAY ${CURRENT_DAY} / ${TOTAL_DAYS}`;
  document.getElementById("questionCount").textContent = DATA.length;
  const qc2 = document.getElementById("questionCount2");
  if (qc2) qc2.textContent = DATA.length;

  document.getElementById("startBtn").addEventListener("click", startSession);
  document.getElementById("restartBtn").addEventListener("click", startSession);

  const nextLink = document.getElementById("nextDayLink");
  if (nextLink) {
    if (CURRENT_DAY < TOTAL_DAYS) {
      nextLink.href = `day${CURRENT_DAY + 1}.html`;
      nextLink.textContent = `Day ${CURRENT_DAY + 1} へ進む`;
    } else {
      nextLink.classList.add("hidden");
    }
  }
}

document.addEventListener("DOMContentLoaded", initEngine);
