// ============================
// Birthday-Counter App Config
// ============================

const APP_NAME = "Birthday-counter";
const CURRENT_SAVE_VERSION = "2.0";
const SUPPORTED_VERSIONS = ["1.0", "2.0"];
const SECRET_KEY_BASE = "bday-v2-core-cipher-9182"; 

// ============================
// Data Security
// ============================

async function getCryptoKey() {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw", enc.encode(SECRET_KEY_BASE), "PBKDF2", false, ["deriveKey"]
  );
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt: enc.encode("bday-salt-v2"), iterations: 100000, hash: "SHA-256" },
    keyMaterial, { name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]
  );
}

async function encryptData(text) {
  const enc = new TextEncoder();
  const key = await getCryptoKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ciphertext = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, enc.encode(text));
  
  const combined = new Uint8Array(iv.length + ciphertext.byteLength);
  combined.set(iv);
  combined.set(new Uint8Array(ciphertext), iv.length);
  return btoa(String.fromCharCode(...combined));
}

async function decryptData(encoded) {
  try {
    const combined = new Uint8Array(atob(encoded).split("").map(c => c.charCodeAt(0)));
    const iv = combined.slice(0, 12);
    const ciphertext = combined.slice(12);
    const key = await getCryptoKey();
    const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, ciphertext);
    return new TextDecoder().decode(decrypted);
  } catch (e) { return null; }
}

const propMap = { month: 'm', day: 'd', year: 'y', withAge: 'wa', app: 'a' };
const revMap = Object.fromEntries(Object.entries(propMap).map(([k, v]) => [v, k]));

function scramble(data) {
  const s = {};
  for (const k in data) if (propMap[k]) s[propMap[k]] = data[k];
  s.z = Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2);
  return s;
}

function unscramble(data) {
  const u = {};
  for (const k in data) if (revMap[k]) u[revMap[k]] = data[k];
  return u;
}

function legacyDecrypt(data) {
  try {
    return JSON.parse(data);
  } catch { return null; }
}

// ============================
// Storage Handling
// ============================

async function saveLocal(data) {
  const scrambled = scramble(data);
  const encrypted = await encryptData(JSON.stringify(scrambled));
  localStorage.setItem('birthdayData_v2', encrypted);
}

async function loadLocal() {
  const v2 = localStorage.getItem('birthdayData_v2');
  if (v2) {
    const decrypted = await decryptData(v2);
    if (decrypted) return unscramble(JSON.parse(decrypted));
  }

  // 旧バージョン互換
  const oldData = localStorage.getItem('birthdayData');
  return oldData ? legacyDecrypt(oldData) : null;
}

// ============================
// Utility
// ============================

/**
 * ユーザーのタイムゾーン設定に基づいた現在の日付（年・月・日）を取得
 */
function getLocalTimeParts() {
  const now = new Date();
  const options = { year: 'numeric', month: 'numeric', day: 'numeric', timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone };
  const parts = new Intl.DateTimeFormat('en-US', options).formatToParts(now);
  const get = type => parseInt(parts.find(p => p.type === type).value, 10);
  return { y: get('year'), m: get('month'), d: get('day') };
}

function calculateCountdown(month, day) {
  const now = new Date();
  const local = getLocalTimeParts();
  let next = new Date(local.y, month - 1, day);
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
  const local = getLocalTimeParts();
  let age = local.y - year;
  const today = new Date(local.y, local.m - 1, local.d);
  const birthdayThisYear = new Date(local.y, month - 1, day);
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
  const local = getLocalTimeParts();
  if (local.m === month && local.d === day) return true;
  
  // うるう年対応: 2月29日生まれで、平年の場合は3月1日を誕生日とする
  if (month === 2 && day === 29 && local.m === 3 && local.d === 1) {
    const isLeap = (local.y % 4 === 0 && local.y % 100 !== 0) || (local.y % 400 === 0);
    return !isLeap;
  }
  return false;
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
    specialUI.innerHTML = `<div class="celebration">${t('celebration')}</div>`;

    if (data.withAge && data.year) {
      const age = calculateAge(data.year, data.month, data.day);
      ageEl.textContent = t('todayAge').replace('{age}', age);
    } else {
      ageEl.textContent = t('enjoyDay');
    }

    document.body.classList.add('birthday');
    return;
  }

  // 通常カウントダウン
  countdownEl.classList.remove('hidden');
  specialUI.classList.add('hidden');
  document.body.classList.remove('birthday');

  function update() {
    const remain = calculateCountdown(data.month, data.day);
    const res = `${remain.days}${t('unitDays')} ${remain.hours}${t('unitHours')} ${remain.minutes}${t('unitMinutes')} ${remain.seconds}${t('unitSeconds')}`;
    timeEl.textContent = res;

    if (data.withAge && data.year) {
      const age = calculateAge(data.year, data.month, data.day);
      ageEl.textContent = t('nextAge').replace('{age}', age + 1);
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
  // UIの翻訳適用
  document.querySelector('h1').textContent = t('title');
  if (document.getElementById('yearLabel')) document.getElementById('yearLabel').textContent = t('yearLabel');
  if (document.getElementById('monthLabel')) document.getElementById('monthLabel').textContent = t('monthLabel');
  if (document.getElementById('dayLabel')) document.getElementById('dayLabel').textContent = t('dayLabel');
  document.getElementById('withAgeLabel').textContent = t('withAge');
  document.getElementById('startBtn').textContent = t('btnStart');
  document.getElementById('resetBtn').textContent = t('btnReset');
  document.getElementById('exportBtn').textContent = t('btnExport');
  document.getElementById('importLabel').textContent = t('btnImport');

  const exportBtn = document.getElementById('exportBtn');
  const form = document.getElementById('birthdayForm');
  const withAgeCheckbox = document.getElementById('withAge');
  const yearInput = document.getElementById('yearInput');
  const importFile = document.getElementById('importFile');

  exportBtn.classList.add('hidden');

  // 年入力切り替え
  // チェックがない時は入力欄を完全に消す(文字も含め)
  yearInput.classList.add('hidden');
  withAgeCheckbox.onchange = () => {
    const isChecked = withAgeCheckbox.checked;
    yearInput.classList.toggle('hidden', !isChecked);
    document.getElementById('year').required = withAgeCheckbox.checked;
    if (!withAgeCheckbox.checked) document.getElementById('year').value = '';
  };

  // JSON ファイル読み込み処理
  importFile.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const json = JSON.parse(event.target.result);
        let settings;

        if (json.v === "2.0") {
          const decrypted = await decryptData(json.d);
          if (decrypted) {
            const parsed = JSON.parse(decrypted);
            settings = unscramble(parsed);
          }
        } else if (json.settings) {
          settings = json.settings; // v1.0
        }

        if (!settings || (settings.app !== APP_NAME && settings.a !== APP_NAME)) return;

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
  loadLocal().then(saved => { if (saved) startCountdown(saved); });

  // フォーム送信
  form.onsubmit = async (e) => {
    e.preventDefault();
    const withAge = withAgeCheckbox.checked;
    const year = withAge ? parseInt(document.getElementById('year').value, 10) : null;
    const month = parseInt(document.getElementById('month').value, 10);
    const day = parseInt(document.getElementById('day').value, 10);

    if (withAge && (!year || year < 1900 || year > 2100)) return;
    if (month < 1 || month > 12 || day < 1 || day > 31) return;

    // セキュリティ対策: 年齢表示がオフなら year プロパティを保存しない
    const data = { month, day, withAge };
    if (withAge) data.year = year;

    await saveLocal(data);
    startCountdown(data);
  };

  // JSON エクスポート
  exportBtn.onclick = async () => {
    const savedData = await loadLocal();
    if (!savedData) return;

    const now = new Date();
    const settings = {
      app: APP_NAME,
      month: savedData.month,
      day: savedData.day,
      withAge: savedData.withAge
    };
    if (savedData.withAge) settings.year = savedData.year;

    const json = {
      v: "2.0",
      ts: now.toISOString(),
      d: await encryptData(JSON.stringify(scramble(settings)))
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
