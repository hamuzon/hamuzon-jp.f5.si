const timezoneSelect = document.getElementById("timezone-select");
const timezonesContainer = document.getElementById("timezones");
const errorMessage = document.getElementById("error-message");

const clocksToUpdate = [];
let timeOffset = 0;

const allTimezones = Intl.supportedValuesOf("timeZone");
allTimezones.forEach(tz => {
  const option = document.createElement("option");
  option.value = tz;
  option.textContent = tz;
  timezoneSelect.appendChild(option);
});

const timeSources = [
  "https://worldtimeapi.org/api/timezone/Etc/UTC",
  "https://timeapi.io/api/Time/current/zone?timeZone=UTC",
  "https://nowapi.vercel.app/api/now"
];

async function syncTimeFromInternet() {
  let success = false;
  for (const url of timeSources) {
    try {
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) throw new Error();
      const data = await res.json();

      let rawDateStr = data.utc_datetime || data.dateTime || data.dateString;
      if (rawDateStr) {
        // 文字列がUTCであることを保証するため、Zがない場合は付与し、
        // スペースが含まれる場合はTに置換してISO形式に整形する
        let formattedStr = rawDateStr.replace(" ", "T");
        if (!formattedStr.includes("Z") && !formattedStr.includes("+")) {
          formattedStr += "Z";
        }
        const serverTime = new Date(formattedStr).getTime();
        timeOffset = serverTime - Date.now();
        errorMessage.textContent = "";
        success = true;
        break;
      } else {
        throw new Error();
      }
    } catch (e) {
      console.warn(`Failed to fetch time from: ${url}`);
    }
  }
  if (!success) {
    timeOffset = 0;
    errorMessage.textContent = "※ インターネット時間取得に失敗。端末時間を使用します。";
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
    const el = c.el;
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

    const g = t => parts.find(p => p.type === t)?.value;

    el.querySelector(".date-display").textContent = `${g("year")}/${g("month")}/${g("day")}`;
    el.querySelector(".time-display").textContent = `${g("hour")}:${g("minute")}:${g("second")}`;
  });
}

window.addEventListener("DOMContentLoaded", async () => {
  timezoneSelect.value = "Asia/Tokyo";
  await syncTimeFromInternet();
  addTimezone("Asia/Tokyo");
  setInterval(updateClocks, 1000);
  setInterval(syncTimeFromInternet, 30000);
});

document.getElementById("add-button").onclick = () => addTimezone();