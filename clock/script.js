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
      const res = await fetch(url);
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
        serverTime = new Date(formattedStr).getTime();
      } else {
        throw new Error();
      }

      timeOffset = serverTime - Date.now();
      errorMessage.textContent = "";
      success = true;
      break;
    } catch (e) {
      console.warn(`Failed: ${url}`);
    }
  }
  if (!success) {
    timeOffset = 0;
    errorMessage.textContent = "※ インターネット時間取得に失敗。端末時間を使用します。";
  }
}

function addTimezone() {
  const tz = timezoneSelect.value;
  const uniqueId = "tz_" + tz.replace(/[^a-zA-Z0-9]/g, "_") + "_" + Date.now();

  const container = document.createElement("div");
  container.className = "timezone-item";
  container.id = uniqueId;
  container.innerHTML = `
    <div class="label">${tz}</div>
    <div class="time" id="${uniqueId}-time">--:--:--</div>
    <button class="remove-button">×</button>
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
  const correctedNow = new Date(Date.now() + timeOffset);
  clocksToUpdate.forEach(clock => {
    const el = document.getElementById(clock.id);
    if (el) {
      el.textContent = correctedNow.toLocaleString("ja-JP", {
        timeZone: clock.tz,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hourCycle: "h23" // 24時間表記を強制し、00時/24時のブレを防止
      });
    }
  });
}

window.addEventListener("DOMContentLoaded", async () => {
  timezoneSelect.value = "Asia/Tokyo";
  await syncTimeFromInternet();
  addTimezone();
  setInterval(updateClocks, 1000);
});

document.getElementById("add-button").addEventListener("click", addTimezone);