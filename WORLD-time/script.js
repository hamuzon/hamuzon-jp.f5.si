const timezoneSelect = document.getElementById("timezone-select");
const timezonesContainer = document.getElementById("timezones");
const errorMessage = document.getElementById("error-message");

const DEFAULT_TIMEZONE = "Asia/Tokyo";
const clocksToUpdate = [];
let baseUtcDate = null;
let basePerformanceTime = 0;

function isValidTimeZone(tz) {
  try {
    new Intl.DateTimeFormat(undefined, { timeZone: tz });
    return true;
  } catch (e) {
    return false;
  }
}

const LOCAL_TIMEZONE = isValidTimeZone(Intl.DateTimeFormat().resolvedOptions().timeZone)
  ? Intl.DateTimeFormat().resolvedOptions().timeZone
  : DEFAULT_TIMEZONE;

let allTimezones = [];
try {
  if (typeof Intl !== "undefined" && typeof Intl.supportedValuesOf === "function") {
    allTimezones = Intl.supportedValuesOf("timeZone");
  }
} catch (e) {
  console.error(e);
}

const essentialTimezones = new Set([
  "Asia/Tokyo", "UTC", "America/New_York", "Europe/London", 
  "Europe/Paris", "Asia/Singapore", "Australia/Sydney"
]);
allTimezones.forEach(tz => essentialTimezones.add(tz));
allTimezones = Array.from(essentialTimezones).sort();

timezoneSelect.innerHTML = "";
allTimezones.forEach(tz => {
  const option = document.createElement("option");
  option.value = tz;
  option.textContent = tz;
  timezoneSelect.appendChild(option);
});

const TIME_API_ENDPOINTS = [
  { url: "https://api-time.hamuzon-jp.f5.si/api/Time/?timeZone=UTC", hint: 'UTC' },
  { url: "https://api-time.hamuzon-jp.f5.si/api/Time/?timeZone=JST", hint: 'Asia/Tokyo' },
  { url: "https://api-time.hamusata.f5.si/api/Time/?timeZone=UTC", hint: 'UTC' },
  { url: "https://api-time.hamusata.f5.si/api/Time/?timeZone=JST", hint: 'Asia/Tokyo' },
  { url: "https://timeapi.io/api/Time/current/zone?timeZone=UTC", hint: 'UTC' }
];

function buildFreshUrl(url) {
  const cacheBuster = `_=${Date.now()}`;
  return url.includes('?') ? `${url}&${cacheBuster}` : `${url}?${cacheBuster}`;
}

async function fetchTimeApi(url) {
  const res = await fetch(buildFreshUrl(url), {
    method: 'GET',
    mode: 'cors',
    cache: 'no-store'
  });
  if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
  return res.json();
}

async function fetchTimeApiWithLatency(endpoint) {
  const requestDateNow = Date.now();
  const data = await fetchTimeApi(endpoint.url);
  const responseDateNow = Date.now();
  return {
    data,
    requestDateNow,
    responseDateNow,
    url: endpoint.url,
    hint: endpoint.hint
  };
}

function parseTimeApiDateTime(dateTime, hint) {
  if (!dateTime) return NaN;
  const normalized = String(dateTime).trim();
  const hasZone = /[Zz]$|[+-]\d{2}:?\d{2}$/.test(normalized);
  if (hasZone) {
    return new Date(normalized).getTime();
  }

  const timestamp = normalized.replace(' ', 'T');
  if (hint === 'Asia/Tokyo' || hint === 'JST') {
    return new Date(`${timestamp}+09:00`).getTime();
  }
  if (hint === 'UTC') {
    return new Date(`${timestamp}Z`).getTime();
  }
  return new Date(`${timestamp}Z`).getTime();
}

function resolveServerTime(data, hint = 'UTC') {
  if (data.dateTime) {
    return parseTimeApiDateTime(data.dateTime, hint);
  }
  if (data.utc_datetime) {
    return parseTimeApiDateTime(data.utc_datetime, 'UTC');
  }
  if (data.datetime) {
    return parseTimeApiDateTime(data.datetime, hint);
  }
  if (data.currentDateTime) {
    return parseTimeApiDateTime(data.currentDateTime, hint);
  }
  if (typeof data.unixtime === 'number') {
    return data.unixtime * 1000;
  }
  if (typeof data.timestamp === 'number') {
    return data.timestamp * 1000;
  }
  if (data.year != null && data.month != null && data.day != null) {
    return Date.UTC(data.year, data.month - 1, data.day, data.hour || 0, data.minute || 0, data.second || 0, data.milliSeconds || 0);
  }
  throw new Error('Unsupported time API response format');
}

async function syncTimeFromInternet() {
  try {
    const fetches = await Promise.allSettled(TIME_API_ENDPOINTS.map(endpoint => fetchTimeApiWithLatency(endpoint)));

    const results = fetches
      .filter(result => result.status === 'fulfilled')
      .map(result => result.value);

    if (results.length === 0) {
      throw new Error('All time endpoints failed');
    }

    let correctedTime = null;
    for (const result of results) {
      try {
        const serverTime = resolveServerTime(result.data);
        const roundTripDelay = result.responseDateNow - result.requestDateNow;
        correctedTime = serverTime + roundTripDelay / 2;
        break;
      } catch (e) {
        console.warn(`Time API format unsupported for ${result.url}:`, e);
      }
    }

    if (correctedTime === null) {
      throw new Error('No usable time API response format found');
    }

    const deviceTimeNow = Date.now();
    const deviceOffset = correctedTime - deviceTimeNow;

    baseUtcDate = new Date(deviceTimeNow + deviceOffset);
    basePerformanceTime = (window.performance && window.performance.now) ? performance.now() : Date.now();
    errorMessage.textContent = "";
  } catch (e) {
    baseUtcDate = new Date();
    basePerformanceTime = (window.performance && window.performance.now) ? performance.now() : Date.now();
    errorMessage.textContent = "※ ネットワーク同期失敗。端末時刻を表示中";
  }
}

function addTimezone(tz = timezoneSelect.value) {
  const uniqueId = "tz_" + tz.replace(/[^a-zA-Z0-9]/g, "_") + "_" + Date.now();
  const el = document.createElement("div");
  el.className = "timezone-item";
  el.id = uniqueId;
  el.innerHTML = `
    <div class="label">${tz}</div>
    <div class="time" id="${uniqueId}-time">
      <div class="date-display">----/--/--</div>
      <div class="time-display">--:--:--</div>
    </div>
    <button class="remove-button" aria-label="削除 ${tz}" title="削除 ${tz}">×</button>
  `;
  el.querySelector("button").onclick = () => {
    const i = clocksToUpdate.findIndex(c => c.id === uniqueId + "-time");
    if (i >= 0) clocksToUpdate.splice(i, 1);
    el.remove();
  };
  timezonesContainer.appendChild(el);
  clocksToUpdate.push({ id: uniqueId + "-time", tz: tz });
}

const formatterCache = new Map();

function updateClocks() {
  if (!baseUtcDate || isNaN(baseUtcDate.getTime())) return;
  const currentTime = (window.performance && window.performance.now) ? performance.now() : Date.now();
  const elapsed = currentTime - basePerformanceTime;
  const correctedNow = new Date(baseUtcDate.getTime() + elapsed);

  clocksToUpdate.forEach(c => {
    const el = document.getElementById(c.id);
    if (!el) return;
    try {
      if (!formatterCache.has(c.tz)) {
        formatterCache.set(c.tz, new Intl.DateTimeFormat("ja-JP", {
          timeZone: c.tz,
          year: "numeric", month: "2-digit", day: "2-digit",
          hour: "2-digit", minute: "2-digit", second: "2-digit",
          hourCycle: "h23"
        }));
      }
      const parts = formatterCache.get(c.tz).formatToParts(correctedNow);
      const g = t => parts.find(p => p.type === t)?.value;
      el.querySelector('.date-display').textContent = `${g("year")}/${g("month")}/${g("day")}`;
      el.querySelector('.time-display').textContent = `${g("hour")}:${g("minute")}:${g("second")}`;
    } catch (e) {
      el.querySelector('.time-display').textContent = "Error";
    }
  });
}

window.addEventListener("DOMContentLoaded", async () => {
  const defaultTz = allTimezones.includes(LOCAL_TIMEZONE)
    ? LOCAL_TIMEZONE
    : allTimezones.includes(DEFAULT_TIMEZONE)
      ? DEFAULT_TIMEZONE
      : allTimezones[0];

  timezoneSelect.value = defaultTz;
  await syncTimeFromInternet();
  addTimezone(defaultTz);
  setInterval(updateClocks, 1000);
  setInterval(syncTimeFromInternet, 60000);
});
document.getElementById("add-button").onclick = () => addTimezone();
