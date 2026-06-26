const timezoneSelect = document.getElementById("timezone-select");
const timezonesContainer = document.getElementById("timezones");
const errorMessage = document.getElementById("error-message");

const clocksToUpdate = [];
let timeOffset = 0;

const allTimezones = Intl.supportedValuesOf
  ? Intl.supportedValuesOf("timeZone")
  : ["Asia/Tokyo"];

allTimezones.forEach(tz => {
  const option = document.createElement("option");
  option.value = tz;
  option.textContent = tz;
  timezoneSelect.appendChild(option);
});

const timeSources = [
  "https://timeapi.io/api/Time/current/zone?timeZone=UTC",
  "https://worldclockapi.com/api/json/utc/now"
];

async function syncTimeFromInternet() {
  let success = false;

  for (const url of timeSources) {
    try {
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) throw new Error();

      const data = await res.json();

      let rawDateStr =
        data.dateTime ||
        data.utc_time ||
        data.currentDateTime ||
        data.datetime;

      if (!rawDateStr) continue;

      const serverTime = new Date(rawDateStr + "Z").getTime();

      if (isNaN(serverTime)) continue;

      timeOffset = serverTime - Date.now();
      errorMessage.textContent = "";
      success = true;
      break;
    } catch (e) {
      console.warn("Time sync failed:", url);
    }
  }

  if (!success) {
    timeOffset = 0;
    errorMessage.textContent =
      "※ インターネット時刻取得失敗（端末時刻を使用）";
  }
}

function addTimezone(tz = timezoneSelect.value) {
  const uniqueId =
    "tz_" + tz.replace(/[^a-zA-Z0-9]/g, "_") + "_" + Date.now();

  const el = document.createElement("div");
  el.className = "timezone-item";
  el.id = uniqueId;

  el.innerHTML = `
    <div class="label">${tz}</div>
    <div class="time" id="${uniqueId}-time">
      <div class="date-display">----/--/--</div>
      <div class="time-display">--:--:--</div>
    </div>
    <button class="remove-button">×</button>
  `;

  el.querySelector(".remove-button").onclick = () => {
    const i = clocksToUpdate.findIndex(c => c.id === uniqueId + "-time");
    if (i >= 0) clocksToUpdate.splice(i, 1);
    el.remove();
  };

  timezonesContainer.appendChild(el);

  clocksToUpdate.push({
    id: uniqueId + "-time",
    el: el.querySelector(".time"),
    tz: tz
  });
}

function updateClocks() {
  const correctedNow = new Date(Date.now() + timeOffset);

  clocksToUpdate.forEach(c => {
    const parts = new Intl.DateTimeFormat("ja-JP", {
      timeZone: c.tz,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hourCycle: "h23"
    }).formatToParts(correctedNow);

    const get = type => {
      const p = parts.find(x => x.type === type);
      return p ? p.value : "--";
    };

    c.el.querySelector(".date-display").textContent =
      `${get("year")}/${get("month")}/${get("day")}`;

    c.el.querySelector(".time-display").textContent =
      `${get("hour")}:${get("minute")}:${get("second")}`;
  });
}

window.addEventListener("DOMContentLoaded", async () => {
  await syncTimeFromInternet();

  timezoneSelect.value = "Asia/Tokyo";
  addTimezone("Asia/Tokyo");

  setInterval(updateClocks, 1000);
  setInterval(syncTimeFromInternet, 30000);
});

document.getElementById("add-button").onclick = () => addTimezone();