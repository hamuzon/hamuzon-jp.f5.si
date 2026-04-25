/**
 * Birthday-Counter v2.1 (Final Robust Edition)
 * STRICT v2.1 Saving | HYBRID v2.0/v2.1 Reading
 */

const APP_NAME = "Birthday-counter";
const CURRENT_SAVE_VERSION = "2.1";
const SECRET_KEY_BASE = "bday-v2-core-cipher-9182"; 

// v2.1 独自内部キー
const propMapV21 = { 
  month: 'db_m_val', day: 'db_d_val', year: 'db_y_val', 
  withAge: 'wa_flag', app: 'app_ref', seed: 'sc_seed', ver: 'format_ver'
};

// --- Security Core ---

async function getCryptoKey() {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey("raw", enc.encode(SECRET_KEY_BASE), "PBKDF2", false, ["deriveKey"]);
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
  combined.set(iv); combined.set(new Uint8Array(ciphertext), iv.length);
  return btoa(String.fromCharCode(...combined));
}

async function decryptData(encoded) {
  try {
    const combined = new Uint8Array(atob(encoded).split("").map(c => c.charCodeAt(0)));
    const key = await getCryptoKey();
    const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv: combined.slice(0, 12) }, key, combined.slice(12));
    return new TextDecoder().decode(decrypted);
  } catch (e) { return null; }
}

// v2.1 保存ロジック (Rolling Scramble)
function rollingScramble(data) {
  const seed = Math.floor(Math.random() * 256);
  const s = {};
  s[propMapV21.ver] = "2.1";
  s[propMapV21.seed] = (seed ^ 0xFF).toString(36);
  if (data.month) s[propMapV21.month] = ((data.month + seed) ^ 0xA5).toString(36);
  if (data.day) s[propMapV21.day] = ((data.day + seed) ^ 0x5A).toString(36);
  if (data.year) s[propMapV21.year] = ((data.year + seed) ^ 0xBD).toString(36);
  s[propMapV21.withAge] = data.withAge ? "1" : "0";
  s[propMapV21.app] = data.app.split('').reverse().join('');
  s.noise = Math.random().toString(36).substring(2, 10);
  return s;
}

// 統合復元ロジック (ハイブリッド判定)
function smartUnscramble(s) {
  // 1. 内部キー sc_seed があれば、器に関わらず v2.1 として処理
  if (s[propMapV21.seed]) {
    try {
      const seed = parseInt(s[propMapV21.seed], 36) ^ 0xFF;
      const app = s[propMapV21.app]?.split('').reverse().join('');
      if (app !== APP_NAME) return null;
      return {
        app,
        month: (parseInt(s[propMapV21.month], 36) ^ 0xA5) - seed,
        day: (parseInt(s[propMapV21.day], 36) ^ 0x5A) - seed,
        year: s[propMapV21.year] ? (parseInt(s[propMapV21.year], 36) ^ 0xBD) - seed : null,
        withAge: s[propMapV21.withAge] === "1"
      };
    } catch (e) { return null; }
  }
  
  // 2. 旧キー m, d 等があれば v2.0 として処理
  if (s.m || s.d) {
    return {
      month: s.m || s.month, day: s.d || s.day, year: s.y || s.year,
      withAge: s.wa !== undefined ? s.wa : s.withAge, app: APP_NAME
    };
  }
  return null;
}

// --- Storage Handling ---

async function loadLocal() {
  const v2 = localStorage.getItem('birthdayData_v2');
  if (v2) {
    const dec = await decryptData(v2);
    if (dec) {
      const data = smartUnscramble(JSON.parse(dec));
      if (data) return data;
    }
  }
  const old = localStorage.getItem('birthdayData');
  if (old) {
    try { return JSON.parse(old); } catch (e) { return null; }
  }
  return null;
}

// 保存は絶対に v2.1 方式のみ
async function saveLocal(data) {
  const scrambled = rollingScramble(data);
  const encrypted = await encryptData(JSON.stringify(scrambled));
  localStorage.setItem('birthdayData_v2', encrypted);
}

// --- Main App Logic ---

function getLocalTimeParts() {
  const now = new Date();
  const options = { year: 'numeric', month: 'numeric', day: 'numeric', timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone };
  const parts = new Intl.DateTimeFormat('en-US', options).formatToParts(now);
  const get = type => parseInt(parts.find(p => p.type === type).value, 10);
  return { y: get('year'), m: get('month'), d: get('day') };
}

function calculateAge(year, month, day) {
  const local = getLocalTimeParts();
  let age = local.y - year;
  const today = new Date(local.y, local.m - 1, local.d);
  const birthdayThisYear = new Date(local.y, month - 1, day);
  if (today < birthdayThisYear) age--;
  return age;
}

function isToday(month, day) {
  const local = getLocalTimeParts();
  if (local.m === month && local.d === day) return true;
  // Leap year support: Feb 29th birthdays are celebrated on March 1st in common years
  if (month === 2 && day === 29 && local.m === 3 && local.d === 1) {
    const isLeap = (local.y % 4 === 0 && local.y % 100 !== 0) || (local.y % 400 === 0);
    return !isLeap;
  }
  return false;
}

function calculateCountdown(month, day) {
  const now = new Date();
  const local = getLocalTimeParts();
  let next = new Date(local.y, month - 1, day);
  if (next < now) next.setFullYear(next.getFullYear() + 1);
  const diff = next - now;
  return {
    d: Math.floor(diff / 86400000), h: Math.floor((diff / 3600000) % 24),
    m: Math.floor((diff / 60000) % 60), s: Math.floor((diff / 1000) % 60)
  };
}

let timerInterval = null;

function startCountdown(data) {
  const form = document.getElementById('birthdayForm');
  const countdown = document.getElementById('countdown');
  const specialUI = document.getElementById('specialUI');
  const timeEl = document.getElementById('time');
  const ageEl = document.getElementById('age');
  const exportBtn = document.getElementById('exportBtn');

  form.classList.add('hidden');
  if (exportBtn) exportBtn.classList.remove('hidden');

  const update = () => {
    if (isToday(data.month, data.day)) {
      clearInterval(timerInterval);
      countdown.classList.add('hidden');
      specialUI.classList.remove('hidden');
      specialUI.innerHTML = `<div class="celebration">${t('celebration')}</div>`;
      if (data.withAge && data.year) {
        const age = calculateAge(data.year, data.month, data.day);
        ageEl.textContent = t('todayAge').replace('{age}', age);
      }
      return;
    }

    countdown.classList.remove('hidden');
    const r = calculateCountdown(data.month, data.day);
    timeEl.textContent = `${r.d}${t('unitDays')} ${r.h}${t('unitHours')} ${r.m}${t('unitMinutes')} ${r.s}${t('unitSeconds')}`;
    
    if (data.withAge && data.year) {
      const age = calculateAge(data.year, data.month, data.day);
      ageEl.textContent = t('nextAge').replace('{age}', age + 1);
    }
  };
  update();
  timerInterval = setInterval(update, 1000);
}

document.addEventListener('DOMContentLoaded', async () => {
  const uiMapping = {
    'mainTitle': 'title',
    'monthLabel': 'monthLabel',
    'dayLabel': 'dayLabel',
    'yearLabel': 'yearLabel',
    'withAgeLabel': 'withAge',
    'startBtn': 'btnStart',
    'importLabel': 'btnImport',
    'exportBtn': 'btnExport',
    'resetBtn': 'btnReset'
  };
  Object.entries(uiMapping).forEach(([id, key]) => {
    const el = document.getElementById(id);
    if (el) el.textContent = t(key);
  });

  const withAge = document.getElementById('withAge');
  const yearInput = document.getElementById('yearInput');
  const yearField = document.getElementById('year');
  const form = document.getElementById('birthdayForm');
  const importFile = document.getElementById('importFile');

  withAge.onchange = () => {
    const isChecked = withAge.checked;
    yearInput.classList.toggle('hidden', !isChecked);
    if (yearField) {
      yearField.required = isChecked;
      if (!isChecked) yearField.value = '';
    }
  };

  const saved = await loadLocal();
  if (saved) startCountdown(saved);

  form.onsubmit = async (e) => {
    e.preventDefault();
    const data = { month: parseInt(document.getElementById('month').value), day: parseInt(document.getElementById('day').value), withAge: withAge.checked, app: APP_NAME };
    if (data.withAge) data.year = parseInt(document.getElementById('year').value);
    await saveLocal(data);
    startCountdown(data);
  };

  document.getElementById('resetBtn').onclick = () => {
    clearInterval(timerInterval);
    localStorage.removeItem('birthdayData_v2');
    localStorage.removeItem('birthdayData');
    location.reload();
  };

  document.getElementById('exportBtn').onclick = async () => {
    const saved = await loadLocal();
    if (!saved) return;
    const scrambled = rollingScramble(saved);
    const encrypted = await encryptData(JSON.stringify(scrambled));
    
    // エクスポートは絶対に v2.1 形式
    const json = {
      app_identifier: "Birthday-Counter",
      version: CURRENT_SAVE_VERSION,
      payload: encrypted,
      exported_at: new Date().toISOString()
    };
    
    const now = new Date();
    const pad = n => String(n).padStart(2, '0');
    const filename = `${APP_NAME}-v${CURRENT_SAVE_VERSION}_${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())}_${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}.json`;
    const blob = new Blob([JSON.stringify(json, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  importFile.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const json = JSON.parse(ev.target.result);
        let encrypted = json.payload || json.d; // v2.1 か v2.0 の暗号部
        let data = null;
        
        if (encrypted) {
          const dec = await decryptData(encrypted);
          if (dec) data = smartUnscramble(JSON.parse(dec)); // 内部キーで世代を自動判別
        } else if (json.settings) {
          data = json.settings; // v1.0
        }

        if (data) { await saveLocal(data); location.reload(); }
        else { alert("Failed to import."); }
      } catch (err) { alert("Error."); }
    };
    reader.readAsText(file);
    e.target.value = '';
  };
});
