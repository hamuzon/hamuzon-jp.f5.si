// === 定数・設定キー ===
const APP_NAME = "Birthday-counter";
const CURRENT_SAVE_VERSION = "1.0";
const SUPPORTED_VERSIONS = ["1.0"];
const STORAGE_KEY = "birthdayData";
const SETTINGS_KEY = "birthdaySettings";

// === 保存／読み込み ===
function saveLocal(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}
function loadLocal() {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : null;
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
    sound: false
  };
}

// === 日付計算ユーティリティ ===
function isLeapYear(year) {
  return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
}
function daysInMonth(year, month) {
  if (month === 2) return isLeapYear(year) ? 29 : 28;
  return [31,28,31,30,31,30,31,31,30,31,30,31][month-1];
}
function calculateCountdown(month, day) {
  const now = new Date();
  let year = now.getFullYear();
  let next = new Date(year, month-1, day);
  if (next < now) {
    next = new Date(year+1, month-1, day);
  }
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
  const birthdayThisYear = new Date(today.getFullYear(), month-1, day);
  if (today < birthdayThisYear) age--;
  return age;
}
function isToday(month, day) {
  const now = new Date();
  return (now.getMonth()+1 === month) && (now.getDate() === day);
}

// === 季節判定・紙吹雪絵文字切替 ===
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

// === UI更新・カウントダウン開始 ===
let countdownInterval = null;

function updateFormDayMax(year, month) {
  const dayInput = document.getElementById('day');
  if (!year) year = new Date().getFullYear();
  if (!month) month = 1;
  const maxDay = daysInMonth(year, month);
  dayInput.max = maxDay;
  if(dayInput.value > maxDay) dayInput.value = maxDay;
}

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

    let season = getSeason(data.month);
    document.body.classList.add('birthday');
    document.body.style.setProperty('--confetti-content', `"${confettiEmojiMap[season]}"`);

    specialUI.innerHTML = `
      <div class="celebration">🎉 お誕生日おめでとうございます！ 🎂🎈</div>
      <div id="confettiContainer"></div>
    `;

    if (settings.confetti) {
      triggerConfetti();
    }

    if (settings.sound) {
      playSound();
    }

    if (settings.withAge && data.year) {
      const age = calculateAge(data.year, data.month, data.day);
      ageEl.textContent = `今日は ${age} 歳の誕生日です！ 🎊`;
    } else {
      ageEl.textContent = '素敵な1日を！🌟';
    }

    return;
  }

  // 通常カウントダウン表示
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

// === 設定UI制御 ===
const settingsBtn = document.getElementById('settingsBtn');
const settingsModal = document.getElementById('settingsModal');
const closeSettingsBtn = document.getElementById('closeSettingsBtn');
const toggleAgeDisplay = document.getElementById('toggleAgeDisplay');
const toggleConfetti = document.getElementById('toggleConfetti');
const toggleSound = document.getElementById('toggleSound');

function openSettings() {
  settingsModal.classList.remove('hidden');
}

function closeSettings() {
  settingsModal.classList.add('hidden');
}

settingsBtn.addEventListener('click', openSettings);
closeSettingsBtn.addEventListener('click', closeSettings);
settingsModal.addEventListener('click', e => {
  if (e.target === settingsModal) closeSettings();
});

// === 設定変更反映 ===
function applySettings(settings) {
  toggleAgeDisplay.checked = settings.withAge;
  toggleConfetti.checked = settings.confetti;
  toggleSound.checked = settings.sound;

  // フォームの年表示切り替え
  const yearInput = document.getElementById('yearInput');
  yearInput.classList.toggle('hidden', !settings.withAge);
  document.getElementById('year').required = settings.withAge;
}
// === 紙吹雪 ===
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

  confetti.addEventListener('animationend', () => {
    confetti.remove();
  });
}

function triggerConfetti() {
  const container = document.getElementById('confettiContainer');
  if (!container) return;
  const count = 100;

  for (let i = 0; i < count; i++) {
    setTimeout(() => {
      createConfettiPiece(container);
    }, i * 10);
  }
}

// === 簡単祝祭音（短いベル） ===
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

// === ファイル名フォーマット ===
function formatDateForFilename(date) {
  const pad = n => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())}_${pad(date.getHours())}-${pad(date.getMinutes())}-${pad(date.getSeconds())}`;
}

// === JSONエクスポート ===
function exportJSON() {
  const savedData = loadLocal();
  if (!savedData) return;

  const now = new Date();
  const json = {
    savedAtUTC: now.toISOString(),
    savedAtJST: new Date(now.getTime() + 9*3600*1000).toISOString().replace('Z', '+09:00'),
    settings: {
      app: APP_NAME,
      version: CURRENT_SAVE_VERSION,
      year: savedData.year,
      month: savedData.month,
      day: savedData.day,
      withAge: savedData.withAge
    }
  };

  const filename = `${APP_NAME}-${CURRENT_SAVE_VERSION}_${formatDateForFilename(now)}.json`;
  const blob = new Blob([JSON.stringify(json, null, 2)], {type:"application/json"});

  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

// === JSONインポート ===
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

// === DOM初期化・イベント設定 ===
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('birthdayForm');
  const withAgeCheckbox = document.getElementById('withAge');
  const yearInput = document.getElementById('yearInput');
  const importFile = document.getElementById('importFile');
  const exportBtn = document.getElementById('exportBtn');

  exportBtn.classList.add('hidden');

  // 年入力表示切替
  withAgeCheckbox.onchange = () => {
    yearInput.classList.toggle('hidden', !withAgeCheckbox.checked);
    document.getElementById('year').required = withAgeCheckbox.checked;
  };

  // JSON ファイル読み込み処理
  importFile.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    importJSON(file, (settings) => {
      document.getElementById('month').value = settings.month;
      document.getElementById('day').value = settings.day;
      withAgeCheckbox.checked = settings.withAge;
      document.getElementById('year').value = settings.year ?? '';
      yearInput.classList.toggle('hidden', !settings.withAge);

      // 保存設定も反映
      const appSettings = loadSettings();
      appSettings.withAge = settings.withAge;
      saveSettings(appSettings);
    });
    e.target.value = '';
  };

  // 初期設定ロード
  const appSettings = loadSettings();
  applySettings(appSettings);

  // 保存済みデータあればカウントダウン開始
  const saved = loadLocal();
  if (saved) {
    startCountdown(saved, appSettings);
  }

  // フォーム送信
  form.onsubmit = (e) => {
    e.preventDefault();
    const withAge = withAgeCheckbox.checked;
    const year = withAge ? parseInt(document.getElementById('year').value, 10) : null;
    const month = parseInt(document.getElementById('month').value, 10);
    const day = parseInt(document.getElementById('day').value, 10);

    if (withAge && (!year || year < 1900 || year > 2100)) return;
    if (month < 1 || month > 12) return;

    // 日にちは月の最大日数を考慮
    const maxDay = daysInMonth(year || new Date().getFullYear(), month);
    if (day < 1 || day > maxDay) return;

    const data = { year, month, day, withAge };
    saveLocal(data);
    startCountdown(data, loadSettings());
  };

  // エクスポートボタン
  exportBtn.onclick = () => {
    exportJSON();
  };

  // 設定変更時に設定保存＆反映
  toggleAgeDisplay.onchange = () => {
    const s = loadSettings();
    s.withAge = toggleAgeDisplay.checked;
    saveSettings(s);
    applySettings(s);
  };
  toggleConfetti.onchange = () => {
    const s = loadSettings();
    s.confetti = toggleConfetti.checked;
    saveSettings(s);
  };
  toggleSound.onchange = () => {
    const s = loadSettings();
    s.sound = toggleSound.checked;
    saveSettings(s);
  };
});