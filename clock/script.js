// ======= DOM取得 =======
const timezoneSelect = document.getElementById("timezone-select");
const timezonesContainer = document.getElementById("timezones");
const errorMessage = document.getElementById("error-message");

// ======= 時計管理 =======
const clocksToUpdate = [];
let baseUtcDate = null;
let basePerformanceTime = null;

// ======= 利用可能タイムゾーンをセレクトに追加 =======
const allTimezones = Intl.supportedValuesOf("timeZone");
allTimezones.forEach(tz => {
  const option = document.createElement("option");
  option.value = tz;
  option.textContent = tz;
  timezoneSelect.appendChild(option);
});

// ======= 複数APIからUTC取得（フェイルオーバー） =======
async function fetchUtcTime() {
  const urls = [
    "https://worldtimeapi.org/api/timezone/Etc/UTC",
    "https://timeapi.io/api/Time/current/zone?timeZone=UTC",
    "https://worldclockapi.com/api/json/utc/now"
  ];

  for (const url of urls) {
    try {
      const res = await fetch(url);
      if (!res.ok) continue;
      const data = await res.json();

      if (data.utc_datetime) return new Date(data.utc_datetime);       // worldtimeapi
      if (data.dateTime) return new Date(data.dateTime);               // timeapi.io
      if (data.currentDateTime) return new Date(data.currentDateTime); // worldclockapi
    } catch (e) {
      continue;
    }
  }

  // 全API失敗時は端末時間
  return new Date();
}

// ======= ネット時間同期 =======
async function syncTimeFromInternet() {
  try {
    baseUtcDate = await fetchUtcTime();
    basePerformanceTime = performance.now();
    errorMessage.textContent = "";
  } catch (e) {
    baseUtcDate = new Date();
    basePerformanceTime = performance.now();
    errorMessage.textContent = "※ インターネットからの時間取得に失敗しました。端末の時間を使用します。";
  }
}

// ======= タイムゾーン追加 =======
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

// ======= タイムゾーン削除 =======
function removeTimezone(id) {
  const idx = clocksToUpdate.findIndex(obj => obj.id === id + "-time");
  if (idx !== -1) clocksToUpdate.splice(idx, 1);

  const el = document.getElementById(id);
  if (el) el.remove();
}

// ======= 時計更新 =======
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

// ======= 初期化 =======
window.addEventListener("DOMContentLoaded", async () => {
  timezoneSelect.value = "Asia/Tokyo"; // 初期値
  await syncTimeFromInternet();
  addTimezone(); // 最初の1個表示
  setInterval(updateClocks, 1000); // 1秒ごとに更新
});

document.getElementById("add-button").addEventListener("click", addTimezone);