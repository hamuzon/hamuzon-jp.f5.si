const timezoneSelect = document.getElementById("timezone-select");
const timezonesContainer = document.getElementById("timezones");
const errorMessage = document.getElementById("error-message");

const DEFAULT_TIMEZONE = "Asia/Tokyo";
const clocksToUpdate = [];
let baseUtcDate = null;
let basePerformanceTime = 0;

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

async function syncTimeFromInternet() {
  try {
    const startTime = (window.performance && window.performance.now) ? performance.now() : Date.now();
    const res = await fetch("https://timeapi.io/api/Time/current/zone?timeZone=UTC", {
      method: 'GET',
      mode: 'cors',
      cache: 'no-cache'
    });
    if (!res.ok) throw new Error();
    const data = await res.json();
    const endTime = (window.performance && window.performance.now) ? performance.now() : Date.now();
    const latency = (endTime - startTime) / 2;

    const serverTime = data.dateTime ? new Date(data.dateTime.endsWith('Z') ? data.dateTime : data.dateTime + 'Z').getTime() : 
      Date.UTC(data.year, data.month - 1, data.day, data.hour, data.minute, data.seconds, data.milliSeconds || 0);

    baseUtcDate = new Date(serverTime + latency);
    basePerformanceTime = endTime;
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
  el.className = "timezone";
  el.id = uniqueId;
  el.innerHTML = `
    <div class="label">${tz}</div>
    <div class="time" id="${uniqueId}-time">
      <div>----</div>
      <div>--:--:--</div>
    </div>
    <button class="remove-button">×</button>
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
      el.children[0].textContent = `${g("year")}/${g("month")}/${g("day")}`;
      el.children[1].textContent = `${g("hour")}:${g("minute")}:${g("second")}`;
    } catch (e) {
      el.children[1].textContent = "Error";
    }
  });
}

window.addEventListener("DOMContentLoaded", async () => {
  const defaultTz = allTimezones.includes(DEFAULT_TIMEZONE) ? DEFAULT_TIMEZONE : allTimezones[0];
  timezoneSelect.value = defaultTz;
  await syncTimeFromInternet();
  addTimezone(defaultTz);
  setInterval(updateClocks, 1000);
  setInterval(syncTimeFromInternet, 60000);
});
document.getElementById("add-button").onclick = () => addTimezone();
