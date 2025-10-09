// ======= DOM取得 =======
const timezoneSelect = document.getElementById("timezone-select");
const timezonesContainer = document.getElementById("timezones");
const errorMessage = document.getElementById("error-message");

// ======= 時計管理 =======
const clocksToUpdate = [];
let baseUtcDate = null;
let basePerformanceTime = null;

// ======= ブラウザ言語判定 =======
const userLang = navigator.language || "en-US";

// ======= 利用可能タイムゾーンをセレクトに追加 =======
const allTimezones = Intl.supportedValuesOf("timeZone");

// Intl.DisplayNamesで日本語/英語表示
const tzDisplayNames = new Intl.DisplayNames(
  [userLang.startsWith("ja") ? "ja" : "en"],
  { type: "timeZone" }
);

allTimezones.forEach(tz => {
  const option = document.createElement("option");
  option.value = tz;
  option.textContent = tzDisplayNames.of(tz) || tz;
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

      if (data.utc_datetime) return new Date(data.utc_datetime);
      if (data.dateTime) return new Date(data.dateTime);
      if (data.currentDateTime) return new Date(data.currentDateTime);
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

// ======= URLからタイムゾーン復元 =======
function loadTimezonesFromURL() {
  const params = new URLSearchParams(window.location.search);
  const tzParams = params.getAll("tz"); 
  tzParams.forEach(tz => {
    if (allTimezones.includes(tz)) {
      timezoneSelect.value = tz;
      addTimezone();
    }
  });
}

// ======= 現在のタイムゾーンをURLに反映 =======
function updateURLWithTimezones() {
  const params = new URLSearchParams();
  clocksToUpdate.forEach(clock => {
    params.append("tz", clock.tz);
  });
  const newURL = `${window.location.pathname}?${params.toString()}`;
  window.history.replaceState({}, "", newURL);
}

// ======= タイムゾーン追加 =======
function addTimezone() {
  const tz = timezoneSelect.value;
  const displayName = tzDisplayNames.of(tz) || tz;
  const uniqueId = "tz_" + tz.replace(/[^a-zA-Z0-9]/g, "_") + "_" + Date.now();

  // 重複追加防止
  if (clocksToUpdate.some(c => c.tz === tz)) return;

  const container = document.createElement("div");
  container.className = "timezone";
  container.id = uniqueId;

  container.innerHTML = `
    <div class="label">${displayName}</div>
    <div class="time" id="${uniqueId}-time">--:--:--</div>
    <button class="remove-button" aria-label="削除 ${displayName}" title="削除 ${displayName}">×</button>
  `;

  container.querySelector(".remove-button").addEventListener("click", () => {
    removeTimezone(uniqueId);
    updateURLWithTimezones(); // 削除後URL更新
  });

  timezonesContainer.appendChild(container);
  clocksToUpdate.push({ id: uniqueId + "-time", tz: tz });

  updateURLWithTimezones(); // 追加後URL更新
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
    const formatter = new Intl.DateTimeFormat(userLang, {
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
  loadTimezonesFromURL(); // URLから復元
  if (clocksToUpdate.length === 0) addTimezone(); // デフォルト1個
  setInterval(updateClocks, 1000); // 1秒ごとに更新
});

document.getElementById("add-button").addEventListener("click", addTimezone);