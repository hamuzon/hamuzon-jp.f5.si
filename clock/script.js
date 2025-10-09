const timezoneSelect = document.getElementById("timezone-select");
const timezonesContainer = document.getElementById("timezones");
const errorMessage = document.getElementById("error-message");

const clocksToUpdate = [];

let baseUtcDate = null;
let basePerformanceTime = null;

const allTimezones = Intl.supportedValuesOf("timeZone");
allTimezones.forEach(tz => {
  const option = document.createElement("option");
  option.value = tz;
  option.textContent = tz;
  timezoneSelect.appendChild(option);
});

async function syncTimeFromInternet() {
  try {
    const res = await fetch("https://worldtimeapi.org/api/timezone/Etc/UTC");
    if (!res.ok) throw new Error("Fetch failed");
    const data = await res.json();
    baseUtcDate = new Date(data.utc_datetime);
    basePerformanceTime = performance.now();
    errorMessage.textContent = "";
  } catch (e) {
    baseUtcDate = new Date();
    basePerformanceTime = performance.now();
    errorMessage.textContent = "※ インターネットからの時間取得に失敗しました。端末の時間を使用します。";
  }
}

function addTimezone() {
  const tz = timezoneSelect.value;
  const uniqueId = "tz_" + tz.replace(/[^a-zA-Z0-9]/g, "_") + "_" + Date.now();

  const container = document.createElement("div");
  container.className = "timezone";
  container.id = uniqueId;

  container.innerHTML = `
    <div class="label">${tz}</div>
    <div class="time" id="${uniqueId}-time">--:--:--</div>
    <button class="remove-button" aria-label="削除 ${tz}" title="削除 ${tz}">×</button>
  `;

  container.querySelector(".remove-button").addEventListener("click", () => {
    removeTimezone(uniqueId);
  });

  timezonesContainer.appendChild(container);

  clocksToUpdate.push({ id: uniqueId + "-time", tz: tz });
}

function removeTimezone(id) {
  const idx = clocksToUpdate.findIndex(obj => obj.id === id + "-time");
  if (idx !== -1) clocksToUpdate.splice(idx, 1);

  const el = document.getElementById(id);
  if (el) el.remove();
}

function updateClocks() {
  if (!baseUtcDate || basePerformanceTime === null) return;

  const elapsed = performance.now() - basePerformanceTime;
  const nowUtc = new Date(baseUtcDate.getTime() + elapsed);

  clocksToUpdate.forEach(clock => {
    const formatter = new Intl.DateTimeFormat("ja-JP", {
      timeZone: clock.tz,
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    });
    const formattedTime = formatter.format(nowUtc);
    const el = document.getElementById(clock.id);
    if (el) el.textContent = formattedTime;
  });
}

window.addEventListener("DOMContentLoaded", async () => {
  timezoneSelect.value = "Asia/Tokyo";
  await syncTimeFromInternet();
  addTimezone();
  setInterval(updateClocks, 1000);
});

document.getElementById("add-button").addEventListener("click", addTimezone);