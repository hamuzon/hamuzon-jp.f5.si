// ============================
// 定数・設定キー
// ============================
const APP_NAME = "Birthday-counter";
const CURRENT_SAVE_VERSION = "1.0";
const SUPPORTED_VERSIONS = ["1.0"];
const STORAGE_KEY = "birthdayData";
const SETTINGS_KEY = "birthdaySettings";

// ============================
// ローカルストレージ保存／読み込み
// ============================
function saveLocal(data) {
  const saveObj = { version: CURRENT_SAVE_VERSION, data };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(saveObj));
}

function loadLocal() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (!parsed.version || !SUPPORTED_VERSIONS.includes(parsed.version)) return null;
    return parsed.data;
  } catch {
    return null;
  }
}

function saveSettings(settings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

function loadSettings() {
  const s = localStorage.getItem(SETTINGS_KEY);
  if (s) return JSON.parse(s);
  return {
    withAge: false,
    confetti: true,
    sound: false,
  };
}

// ============================
// 日付計算ユーティリティ
// ============================
function isLeapYear(year) {
  return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
}

function daysInMonth(year, month) {
  if (month === 2) return isLeapYear(year) ? 29 : 28;
  return [31,28,31,30,31,30,31,31,30,31,30,31][month-1];
}

function calculateCountdown(month, day) {
  const now = new Date();
  let next = new Date(now.getFullYear(), month - 1, day);
  if (next < now) next.setFullYear(next.getFullYear() + 1);
  const diff = next - now;
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

function calculateAge(year, month, day) {
  const today = new Date();
  let age = today.getFullYear() - year;
  const birthdayThisYear = new Date(today.getFullYear(), month - 1, day);
  if (today < birthdayThisYear) age--;
  return age;
}

function isToday(month, day) {
  const now = new Date();
  return now.getMonth() + 1 === month && now.getDate() === day;
}

function formatDateForFilename(date) {
  const pad = n => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}_${pad(date.getHours())}-${pad(date.getMinutes())}-${pad(date.getSeconds())}`;
}

function toJST(date) {
  const jst = new Date(date.getTime() + 9 * 60 * 60 * 1000);
  return jst.toISOString().replace('Z', '+09:00');
}

// ============================
// 季節判定・紙吹雪絵文字マップ
// ============================
function getSeason(month) {
  if ([12,1,2].includes(month)) return 'winter';
  if ([3,4,5].includes(month)) return 'spring';
  if ([6,7,8].includes(month)) return 'summer';
  return 'autumn';
}

const confettiEmojiMap = {
  winter: "❄️⛄️❄️❄️⛄️❄️",
  spring: "🌸🌷🌸🌷🌸",
  summer: "🌞🌴🌊🍉🌞",
  autumn: "🍁🍂🎃🌰🍁"
};

// ============================
// 紙吹雪アニメーション
// ============================
function createConfettiPiece(container) {
  const confetti = document.createElement('div');
  confetti.classList.add('confetti');
  confetti.style.left = Math.random() * 100 + 'vw';
  confetti.style.top = '-10px';
  confetti.style.backgroundColor = `hsl(${Math.random() * 360}, 80%, 60%)`;
  const size = 5 + Math.random() * 5;
  confetti.style.width = size + 'px';
  confetti.style.height = size + 'px';
  container.appendChild(confetti);
  confetti.addEventListener('animationend', () => confetti.remove());
}

function triggerConfetti() {
  const container = document.getElementById('confettiContainer');
  if (!container) return;
  const count = 100;
  for (let i = 0; i < count; i++) {
    setTimeout(() => createConfettiPiece(container), i * 10);
  }
}

// ============================
// 簡単祝祭音（短いベル）
// ============================
function playSound() {
  if (!window.AudioContext) return;
  const ctx = new AudioContext();
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = 'triangle';
  o.frequency.setValueAtTime(880, ctx.currentTime);
  g.gain.setValueAtTime(0.1, ctx.currentTime);
  o.connect(g);
  g.connect(ctx.destination);
  o.start();
  o.stop(ctx.currentTime + 0.2);
}

// ============================
// カウントダウン・UI更新
// ============================
let countdownInterval = null;

function startCountdown(data, settings) {
  const timeEl = document.getElementById('time');
  const ageEl = document.getElementById('age');
  const countdownEl = document.getElementById('countdown');
  const form = document.getElementById('birthdayForm');
  const exportBtn = document.getElementById('exportBtn');
  const specialUI = document.getElementById('specialUI');

  form.classList.add('hidden');
  exportBtn.classList.remove('hidden');

  const todayIsBirthday = isToday(data.month, data.day);

  if (todayIsBirthday) {
    countdownEl.classList.add('hidden');
    specialUI.classList.remove('hidden');

    const season = getSeason(data.month);
    document.body.classList.add('birthday');
    document.body.style.setProperty('--confetti-content', `"${confettiEmojiMap[season]}"`);

    specialUI.innerHTML = `
      <div class="celebration">🎉 お誕生日おめでとうございます！ 🎂🎈</div>
      <div id="confettiContainer"></div>
    `;

    if (settings.confetti) triggerConfetti();
    if (settings.sound) playSound();

    if (settings.withAge && data.year) {
      const age = calculateAge(data.year, data.month, data.day);
      ageEl.textContent = `今日は ${age} 歳の誕生日です！ 🎊`;
    } else {
      ageEl.textContent = '素敵な1日を！🌟';
    }

    return;
  }

  countdownEl.classList.remove('hidden');
  specialUI.classList.add('hidden');
  document.body.classList.remove('birthday');
  document.body.style.removeProperty('--confetti-content');

  function update() {
    const t = calculateCountdown(data.month, data.day);
    timeEl.textContent = `${t.days}日 ${t.hours}時間 ${t.minutes}分 ${t.seconds}秒`;

    if (settings.withAge && data.year) {
      const age = calculateAge(data.year, data.month, data.day);
      ageEl.textContent = `次の誕生日で ${age + 1} 歳になります`;
    } else {
      ageEl.textContent = '';
    }
  }

  update();
  clearInterval(countdownInterval);
  countdownInterval = setInterval(update, 1000);

  document.getElementById('resetBtn').onclick = () => {
    clearInterval(countdownInterval);
    localStorage.removeItem(STORAGE_KEY);
    countdownEl.classList.add('hidden');
    specialUI.classList.add('hidden');
    form.classList.remove('hidden');
    exportBtn.classList.add('hidden');
    document.body.classList.remove('birthday');
  };
}

// ============================
// JSON エクスポート・インポート
// ============================
function exportJSON() {
  const savedData = loadLocal();
  if (!savedData) return;

  const now = new Date();
  const json = {
    savedAtUTC: now.toISOString(),
    savedAtJST: toJST(now),
    settings: {
      app: APP_NAME,
      version: CURRENT_SAVE_VERSION,
      year: savedData.year,
      month: savedData.month,
      day: savedData.day,
      withAge: savedData.withAge,
    }
  };

  const filename = `${APP_NAME}-${CURRENT_SAVE_VERSION}_${formatDateForFilename(now)}.json`;
  const blob = new Blob([JSON.stringify(json, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

function importJSON(file, onComplete) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (event) => {
    try {
      const json = JSON.parse(event.target.result);
      const settings = json.settings;
      if (!settings || settings.app !== APP_NAME || !SUPPORTED_VERSIONS.includes(settings.version)) {
        alert("対応していないデータです");
        return;
      }
      onComplete(settings);
    } catch {
      alert("ファイルの読み込みに失敗しました");
    }
  };
  reader.readAsText(file);
}

// ============================
// 設定UI制御と反映
// ============================
function applySettings(settings) {
  document.getElementById('withAge').checked = settings.withAge;
  document.getElementById('toggleAgeDisplay').checked = settings.withAge;
  document.getElementById('toggleConfetti').checked = settings.confetti;
  document.getElementById('toggleSound').checked = settings.sound;

  const yearInput = document.getElementById('yearInput');
  yearInput.classList.toggle('hidden', !settings.withAge);
  document.getElementById('year').required = settings.withAge;
}

// ============================
// DOM初期化・イベント設定
// ============================
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('birthdayForm');
  const withAgeCheckbox = document.getElementById('withAge');
  const yearInput = document.getElementById('yearInput');
  const importFile = document.getElementById('importFile');
  const exportBtn = document.getElementById('exportBtn');

  exportBtn.classList.add('hidden');

  withAgeCheckbox.onchange = () => {
    yearInput.classList.toggle('hidden', !withAgeCheckbox.checked);
    document.getElementById('year').required = withAgeCheckbox.checked;

    const settings = loadSettings();
    settings.withAge = withAgeCheckbox.checked;
    saveSettings(settings);
  };

  importFile.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    importJSON(file, (settings) => {
      document.getElementById('month').value = settings.month;
      document.getElementById('day').value = settings.day;
      withAgeCheckbox.checked = settings.withAge;
      document.getElementById('year').value = settings.year ?? '';
      yearInput.classList.toggle('hidden', !settings.withAge);

      const appSettings = loadSettings();
      appSettings.withAge = settings.withAge;
      saveSettings(appSettings);
    });
    e.target.value = '';
  };

  const appSettings = loadSettings();
  applySettings(appSettings);

  const saved = loadLocal();
  if (saved) {
    startCountdown(saved, appSettings);
  }

  form.onsubmit = (e) => {
    e.preventDefault();
    const withAge = withAgeCheckbox.checked;
    const year = withAge ? parseInt(document.getElementById('year').value, 10) : null;
    const month = parseInt(document.getElementById('month').value, 10);
    const day = parseInt(document.getElementById('day').value, 10);

    if (withAge && (!year || year < 1900 || year > 2100)) return;
    if (month < 1 || month > 12) return;
    const maxDay = daysInMonth(year || new Date().getFullYear(), month);
    if (day < 1 || day > maxDay) return;

    const data = { year, month, day, withAge };
    saveLocal(data);
    startCountdown(data, loadSettings());
  };

  exportBtn.onclick = exportJSON;

  // 設定チェックボックス連動保存
  document.getElementById('toggleAgeDisplay').onchange = (e) => {
    const s = loadSettings();
    s.withAge = e.target.checked;
    saveSettings(s);
    applySettings(s);
  };
  document.getElementById('toggleConfetti').onchange = (e) => {
    const s = loadSettings();
    s.confetti = e.target.checked;
    saveSettings(s);
  };
  document.getElementById('toggleSound').onchange = (e) => {
    const s = loadSettings();
    s.sound = e.target.checked;
    saveSettings(s);
  };
});