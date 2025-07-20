// ============================
// Birthday-Counter App Config
// ============================

const APP_NAME = "Birthday-counter";
const CURRENT_SAVE_VERSION = "1.0";
const SUPPORTED_VERSIONS = ["1.0"];

// ============================
// Local Storage
// ============================

function saveLocal(data) {
  localStorage.setItem('birthdayData', JSON.stringify(data));
}

function loadLocal() {
  const data = localStorage.getItem('birthdayData');
  return data ? JSON.parse(data) : null;
}

// ============================
// Utility
// ============================

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

function formatDateForFilename(date) {
  const pad = n => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}_${pad(date.getHours())}-${pad(date.getMinutes())}-${pad(date.getSeconds())}`;
}

function toJST(date) {
  const jst = new Date(date.getTime() + 9 * 60 * 60 * 1000);
  return jst.toISOString().replace('Z', '+09:00');
}

function isToday(month, day) {
  const now = new Date();
  return (now.getMonth() + 1 === month) && (now.getDate() === day);
}

// ============================
// UI: Countdown & Special UI
// ============================

function startCountdown(data) {
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
    specialUI.innerHTML = `<div class="celebration">🎉 お誕生日おめでとうございます！ 🎂🎈</div>`;

    if (data.withAge && data.year) {
      const age = calculateAge(data.year, data.month, data.day);
      ageEl.textContent = `今日は ${age} 歳の誕生日です！ 🎊`;
    } else {
      ageEl.textContent = '素敵な1日を！🌟';
    }

    document.body.classList.add('birthday');
    return;
  }

  // 通常カウントダウン
  countdownEl.classList.remove('hidden');
  specialUI.classList.add('hidden');
  document.body.classList.remove('birthday');

  function update() {
    const t = calculateCountdown(data.month, data.day);
    timeEl.textContent = `${t.days}日 ${t.hours}時間 ${t.minutes}分 ${t.seconds}秒`;

    if (data.withAge && data.year) {
      const age = calculateAge(data.year, data.month, data.day);
      ageEl.textContent = `次の誕生日で ${age + 1} 歳になります`;
    } else {
      ageEl.textContent = '';
    }
  }

  update();
  const interval = setInterval(update, 1000);

  document.getElementById('resetBtn').onclick = () => {
    clearInterval(interval);
    localStorage.removeItem('birthdayData');
    countdownEl.classList.add('hidden');
    specialUI.classList.add('hidden');
    form.classList.remove('hidden');
    exportBtn.classList.add('hidden');
    document.body.classList.remove('birthday');
  };
}

// ============================
// DOM Ready
// ============================

document.addEventListener('DOMContentLoaded', () => {
  const exportBtn = document.getElementById('exportBtn');
  const form = document.getElementById('birthdayForm');
  const withAgeCheckbox = document.getElementById('withAge');
  const yearInput = document.getElementById('yearInput');
  const importFile = document.getElementById('importFile');

  exportBtn.classList.add('hidden');

  // 年入力切り替え
  withAgeCheckbox.onchange = () => {
    yearInput.classList.toggle('hidden', !withAgeCheckbox.checked);
    document.getElementById('year').required = withAgeCheckbox.checked;
  };

  // JSON ファイル読み込み処理
  importFile.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target.result);
        const settings = json.settings;

        if (!settings || settings.app !== APP_NAME || !SUPPORTED_VERSIONS.includes(settings.version)) return;

        const data = {
          year: settings.year ?? null,
          month: settings.month,
          day: settings.day,
          withAge: settings.withAge
        };

        // フォームに反映
        document.getElementById('month').value = data.month;
        document.getElementById('day').value = data.day;
        withAgeCheckbox.checked = data.withAge;
        document.getElementById('year').value = data.year ?? '';
        yearInput.classList.toggle('hidden', !data.withAge);
      } catch (e) {
        // 無視
      }
    };

    reader.readAsText(file);
    e.target.value = '';
  };

  // 初期データあれば起動
  const saved = loadLocal();
  if (saved) {
    startCountdown(saved);
  }

  // フォーム送信
  form.onsubmit = (e) => {
    e.preventDefault();
    const withAge = withAgeCheckbox.checked;
    const year = withAge ? parseInt(document.getElementById('year').value, 10) : null;
    const month = parseInt(document.getElementById('month').value, 10);
    const day = parseInt(document.getElementById('day').value, 10);

    if (withAge && (!year || year < 1900 || year > 2100)) return;
    if (month < 1 || month > 12 || day < 1 || day > 31) return;

    const data = { year, month, day, withAge };
    saveLocal(data);
    startCountdown(data);
  };

  // JSON エクスポート
  exportBtn.onclick = () => {
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
        withAge: savedData.withAge
      }
    };

    const filename = `${APP_NAME}-${CURRENT_SAVE_VERSION}_${formatDateForFilename(now)}.json`;
    const blob = new Blob([JSON.stringify(json, null, 2)], { type: "application/json" });

    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    URL.revokeObjectURL(a.href);
  };
});
