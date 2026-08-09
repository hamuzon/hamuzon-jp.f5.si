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

function getTimeApiEndpoints(targetZone) {
  const tz = targetZone || (timezoneSelect && timezoneSelect.value) || LOCAL_TIMEZONE || 'UTC';
  const encodedTz = encodeURIComponent(tz);
  return [
    { url: `https://api-time.hamuzon-jp.f5.si/api/Time/current/zone?timeZone=${encodedTz}`, hint: tz },
    { url: `https://api-time.hamusata.f5.si/api/Time/current/zone?timeZone=${encodedTz}`, hint: tz },
    { url: `https://timeapi.io/api/Time/current/zone?timeZone=${encodedTz}`, hint: tz },
    { url: "https://api-time.hamuzon-jp.f5.si/api/Time/?timeZone=UTC", hint: 'UTC' },
    { url: "https://api-time.hamuzon-jp.f5.si/api/Time/?timeZone=JST", hint: 'Asia/Tokyo' },
    { url: "https://api-time.hamusata.f5.si/api/Time/?timeZone=UTC", hint: 'UTC' },
    { url: "https://api-time.hamusata.f5.si/api/Time/?timeZone=JST", hint: 'Asia/Tokyo' },
    { url: "https://timeapi.io/api/Time/current/zone?timeZone=UTC", hint: 'UTC' }
  ];
}

function buildFreshUrl(url) {
  const cacheBuster = `_=${Date.now()}`;
  return url.includes('?') ? `${url}&${cacheBuster}` : `${url}?${cacheBuster}`;
}

async function fetchTimeApi(url) {
  const res = await fetch(buildFreshUrl(url));
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

function getUtcMsFromLocalParts(year, month, day, hour, minute, second, milliSeconds, timeZone) {
  let tz = timeZone || 'UTC';
  if (tz.toUpperCase() === 'JST') tz = 'Asia/Tokyo';
  if (tz.toUpperCase() === 'EST') tz = 'America/New_York';
  if (tz.toUpperCase() === 'PST') tz = 'America/Los_Angeles';
  if (tz.toUpperCase() === 'CST') tz = 'America/Chicago';

  const guessUtc = Date.UTC(year, month - 1, day, hour, minute, second, 0);

  try {
    const dtf = new Intl.DateTimeFormat('en-CA', {
      timeZone: tz,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hourCycle: 'h23'
    });
    const parts = dtf.formatToParts(guessUtc);
    const getPart = type => {
      const val = parseInt(parts.find(p => p.type === type)?.value ?? '0', 10);
      return (type === 'hour' && val === 24) ? 0 : val;
    };

    const formattedYear = getPart('year');
    const formattedMonth = getPart('month');
    const formattedDay = getPart('day');
    const formattedHour = getPart('hour');
    const formattedMinute = getPart('minute');
    const formattedSecond = getPart('second');

    const formattedUtc = Date.UTC(formattedYear, formattedMonth - 1, formattedDay, formattedHour, formattedMinute, formattedSecond, 0);
    const offsetMs = formattedUtc - guessUtc;
    return guessUtc - offsetMs + (milliSeconds || 0);
  } catch (e) {
    return guessUtc + (milliSeconds || 0);
  }
}

function parseTimeApiDateTime(dateTime, hint, targetTz) {
  if (!dateTime) return NaN;
  const normalized = String(dateTime).trim();
  const hasZone = /[Zz]$|[+-]\d{2}:?\d{2}$/.test(normalized);
  if (hasZone) {
    return new Date(normalized).getTime();
  }

  const tz = targetTz || hint || 'UTC';
  const match = normalized.match(/^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2}):(\d{2})(?:\.(\d+))?/);
  if (match) {
    const year = parseInt(match[1], 10);
    const month = parseInt(match[2], 10);
    const day = parseInt(match[3], 10);
    const hour = parseInt(match[4], 10);
    const minute = parseInt(match[5], 10);
    const second = parseInt(match[6], 10);
    const msStr = match[7] || '0';
    const milliSeconds = parseInt(msStr.slice(0, 3).padEnd(3, '0'), 10);
    return getUtcMsFromLocalParts(year, month, day, hour, minute, second, milliSeconds, tz);
  }

  const timestamp = normalized.replace(' ', 'T');
  if (tz === 'Asia/Tokyo' || tz === 'JST') {
    return new Date(`${timestamp}+09:00`).getTime();
  }
  if (tz === 'UTC') {
    return new Date(`${timestamp}Z`).getTime();
  }
  return new Date(`${timestamp}Z`).getTime();
}

function resolveServerTime(data, hint = 'UTC') {
  const tz = data.timeZone || data.timezone || data.timeZoneName || hint;

  if (typeof data.unixtime === 'number') {
    return data.unixtime * 1000;
  }
  if (typeof data.timestamp === 'number') {
    return data.timestamp * 1000;
  }
  if (data.dateTime) {
    return parseTimeApiDateTime(data.dateTime, hint, tz);
  }
  if (data.utc_datetime) {
    return parseTimeApiDateTime(data.utc_datetime, 'UTC', 'UTC');
  }
  if (data.datetime) {
    return parseTimeApiDateTime(data.datetime, hint, tz);
  }
  if (data.currentDateTime) {
    return parseTimeApiDateTime(data.currentDateTime, hint, tz);
  }
  if (data.year != null && data.month != null && data.day != null) {
    return getUtcMsFromLocalParts(
      data.year,
      data.month,
      data.day,
      data.hour || 0,
      data.minute || 0,
      data.seconds != null ? data.seconds : (data.second || 0),
      data.milliSeconds || 0,
      tz
    );
  }
  throw new Error('Unsupported time API response format');
}

async function syncTimeFromInternet(targetZone) {
  try {
    const endpoints = getTimeApiEndpoints(targetZone);
    const fetches = await Promise.allSettled(endpoints.map(endpoint => fetchTimeApiWithLatency(endpoint)));

    const results = fetches
      .filter(result => result.status === 'fulfilled')
      .map(result => result.value);

    if (results.length === 0) {
      throw new Error('All time endpoints failed');
    }

    let correctedTime = null;
    for (const result of results) {
      try {
        const serverTime = resolveServerTime(result.data, result.hint);
        if (isNaN(serverTime)) continue;
        const roundTripDelay = result.responseDateNow - result.requestDateNow;
        correctedTime = serverTime + roundTripDelay / 2;
        break;
      } catch (e) {
        console.warn(`Time API format unsupported for ${result.url}:`, e);
      }
    }

    if (correctedTime === null || isNaN(correctedTime)) {
      throw new Error('No usable time API response format found');
    }

    const deviceTimeNow = Date.now();
    const deviceOffset = correctedTime - deviceTimeNow;

    baseUtcDate = new Date(deviceTimeNow + deviceOffset);
    basePerformanceTime = (window.performance && window.performance.now) ? performance.now() : Date.now();
    errorMessage.textContent = "";
  } catch (e) {
    console.error("Time sync failed:", e);
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
  await syncTimeFromInternet(defaultTz);
  addTimezone(defaultTz);
  setInterval(updateClocks, 1000);
  setInterval(() => syncTimeFromInternet(timezoneSelect.value), 60000);

  timezoneSelect.addEventListener("change", () => syncTimeFromInternet(timezoneSelect.value));
  const addButton = document.getElementById("add-button");
  if (addButton) {
    addButton.onclick = () => {
      addTimezone();
      syncTimeFromInternet(timezoneSelect.value);
    };
  }
});
