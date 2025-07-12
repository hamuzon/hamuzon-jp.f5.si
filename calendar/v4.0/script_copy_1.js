"use strict";

// --- サポートバージョン ---
const SUPPORTED_VERSIONS = ["1.0", "2.0", "3.0", "4.0"];
const CURRENT_SAVE_VERSION = "4.0";

// --- HTML要素取得 ---
const calendarBody = document.getElementById("calendar-body");
const monthYear = document.getElementById("month-year");
const prevMonthBtn = document.getElementById("prev-month");
const nextMonthBtn = document.getElementById("next-month");
const todayBtn = document.getElementById("today-button");

const modalBg = document.getElementById("modal-bg");
const modalDateTitle = document.getElementById("modal-date");
const eventList = document.getElementById("event-list");
const newEventStart = document.getElementById("new-event-start");
const newEventEnd = document.getElementById("new-event-end");
const newEventText = document.getElementById("new-event-text");
const newEventLocation = document.getElementById("new-event-location");
const newEventNotify = document.getElementById("new-event-notify");
const addEventBtn = document.getElementById("add-event-btn");
const closeBtn = document.getElementById("close-btn");

const settingsBtn = document.getElementById("settings-btn");
const settingsModalBg = document.getElementById("settings-modal-bg");
const tagColorList = document.getElementById("tag-color-list");
const newTagName = document.getElementById("new-tag-name");
const newTagColor = document.getElementById("new-tag-color");
const addTagBtn = document.getElementById("add-tag-btn");
const settingsCancelBtn = document.getElementById("settings-cancel-btn");

const saveJsonBtn = document.getElementById("save-json-btn");
const loadJsonBtn = document.getElementById("load-json-btn");
const loadJsonInput = document.getElementById("load-json-input");

// --- 状態管理 ---
let currentDate = new Date();
currentDate.setHours(0, 0, 0, 0);

let calendarData = {
  version: CURRENT_SAVE_VERSION,
  events: {},
  tagColors: {
    "#仕事": "#4a7c59",
    "#プライベート": "#d27c7c",
    "#重要": "#7c4a7c"
  }
};

// --- localStorageキー ---
const STORAGE_KEY = "calendarData-v4";

// --- 保存関数 ---
function saveToLocalStorage() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(calendarData));
}

// --- バージョン変換関数群 ---
// v1.0 → v4.0
function convertV1toV4(data) {
  if ((!data.version || data.version === "1.0") && data.events && typeof data.events === "object") {
    const convertedEvents = {};
    for (const dateKey in data.events) {
      const val = data.events[dateKey];
      if (typeof val === "string") {
        const timeMatches = val.match(/(\d{1,2}:\d{2})(?:～(\d{1,2}:\d{2}))?/);
        const start = timeMatches ? timeMatches[1] : "";
        const end = timeMatches && timeMatches[2] ? timeMatches[2] : "";
        let text = val.replace(/(\d{1,2}:\d{2})(～(\d{1,2}:\d{2}))?/, "").replace(/#\S+/g, "").trim();
        const tags = val.match(/#\S+/g) || [];
        if (!convertedEvents[dateKey]) convertedEvents[dateKey] = [];
        convertedEvents[dateKey].push({ start, end, text: text.trim(), location: "", notify: false, tags });
      } else if (Array.isArray(val)) {
        convertedEvents[dateKey] = val.map(ev => {
          if (typeof ev === "string") {
            return { start: "", end: "", text: ev, location: "", notify: false, tags: [] };
          } else {
            return {
              start: ev.start || "",
              end: ev.end || "",
              text: ev.text || "",
              location: ev.location || "",
              notify: ev.notify || false,
              tags: (ev.tags || ev.text?.match(/#\S+/g) || [])
            };
          }
        });
      }
    }
    return {
      version: "4.0",
      events: convertedEvents,
      tagColors: data.settings?.tagColors || {}
    };
  }
  return data;
}
// v2.0 → v4.0
function convertV2toV4(data) {
  if (data.version === "2.0") {
    const convertedEvents = {};
    for (const dateKey in data.events) {
      convertedEvents[dateKey] = data.events[dateKey].map(ev => ({
        start: ev.start || "",
        end: ev.end || "",
        text: ev.text || "",
        location: ev.location || "",
        notify: ev.notify || false,
        tags: (ev.tags || ev.text?.match(/#\S+/g) || [])
      }));
    }
    return {
      version: "4.0",
      events: convertedEvents,
      tagColors: data.tagColors || {}
    };
  }
  return data;
}
// v3.0 → v4.0
function convertV3toV4(data) {
  if (data.version === "3.0") {
    const convertedEvents = {};
    for (const dateKey in data.events) {
      convertedEvents[dateKey] = data.events[dateKey].map(ev => ({
        start: ev.start || "",
        end: ev.end || "",
        text: ev.text || "",
        location: ev.location || "",
        notify: ev.notify || false,
        tags: (ev.tags || ev.text?.match(/#\S+/g) || [])
      }));
    }
    return {
      version: "4.0",
      events: convertedEvents,
      tagColors: data.tagColors || {}
    };
  }
  return data;
}
// 一括変換
function convertDataToV4(data) {
  if (!data) return data;
  if (data.version === "4.0") return data;
  if (data.version === "3.0") return convertV3toV4(data);
  if (data.version === "2.0") return convertV2toV4(data);
  return convertV1toV4(data);
}

// --- 日付フォーマット ---
function formatDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// --- カレンダー描画 ---
function drawCalendar(date) {
  calendarBody.innerHTML = "";
  const year = date.getFullYear();
  const month = date.getMonth();
  monthYear.textContent = `${year}年 ${month + 1}月`;

  const firstDay = new Date(year, month, 1);
  const firstWeekday = firstDay.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  for (let week = 0; week < 6; week++) {
    const tr = document.createElement("tr");

    for (let wd = 0; wd < 7; wd++) {
      const td = document.createElement("td");
      const cellIndex = week * 7 + wd;
      let dayNumber, cellDate, isAdjacent = false;

      if (cellIndex < firstWeekday) {
        dayNumber = daysInPrevMonth - (firstWeekday - cellIndex) + 1;
        cellDate = new Date(year, month - 1, dayNumber);
        isAdjacent = true;
      } else if (cellIndex >= firstWeekday + daysInMonth) {
        dayNumber = cellIndex - (firstWeekday + daysInMonth) + 1;
        cellDate = new Date(year, month + 1, dayNumber);
        isAdjacent = true;
      } else {
        dayNumber = cellIndex - firstWeekday + 1;
        cellDate = new Date(year, month, dayNumber);
      }

      const dayDiv = document.createElement("div");
      dayDiv.textContent = dayNumber;
      dayDiv.style.fontWeight = "bold";
      td.appendChild(dayDiv);
      td.dataset.date = formatDate(cellDate);

      if (wd === 0) td.classList.add("sunday");
      if (wd === 6) td.classList.add("saturday");
      if (isAdjacent) td.classList.add("adjacent-month");

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (cellDate.getTime() === today.getTime() && !isAdjacent) {
        td.classList.add("today");
      }

      const evList = calendarData.events[formatDate(cellDate)] || [];
      evList.forEach(ev => {
        const evDiv = document.createElement("span");
        evDiv.className = "event";

        // 時刻表示
        const timeText = ev.start && ev.end ? `${ev.start}〜${ev.end} ` : ev.start ? `${ev.start} ` : "";
        const textWithoutTags = ev.text.replace(/#\S+/g, "").trim();
        evDiv.textContent = timeText + textWithoutTags;

        // タグ表示
        (ev.tags || []).forEach(tag => {
          const tagSpan = document.createElement("span");
          tagSpan.className = "event-tag";
          tagSpan.textContent = tag;
          tagSpan.style.backgroundColor = calendarData.tagColors[tag] || "#777";
          evDiv.appendChild(tagSpan);
        });

        // 場所表示 (アイコン付き)
        if (ev.location) {
          const locSpan = document.createElement("span");
          locSpan.className = "event-location";
          locSpan.textContent = "📍 " + ev.location;
          locSpan.style.marginLeft = "4px";
          locSpan.style.fontSize = "0.75em";
          evDiv.appendChild(locSpan);
        }

        // 通知表示 (ベルアイコン)
        if (ev.notify) {
          const notifySpan = document.createElement("span");
          notifySpan.className = "event-notify";
          notifySpan.textContent = "🔔";
          notifySpan.style.marginLeft = "4px";
          evDiv.appendChild(notifySpan);
        }

        td.appendChild(evDiv);
      });

      if (!isAdjacent) {
        td.style.cursor = "pointer";
        td.addEventListener("click", () => openModal(cellDate));
      }

      tr.appendChild(td);
    }
    calendarBody.appendChild(tr);
  }
}

// --- モーダル操作 ---
let selectedDate = null;
let editingIndex = null;

function openModal(date) {
  selectedDate = formatDate(date);
  modalDateTitle.textContent = `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
  updateEventList();
  newEventStart.value = "";
  newEventEnd.value = "";
  newEventText.value = "";
  newEventLocation.value = "";
  newEventNotify.checked = false;
  editingIndex = null;
  addEventBtn.textContent = "追加 / Add";
  modalBg.style.display = "flex";
  newEventText.focus();
}
function closeModal() {
  modalBg.style.display = "none";
}
modalBg.addEventListener("click", e => { if (e.target === modalBg) closeModal(); });
closeBtn.addEventListener("click", closeModal);

function updateEventList() {
  eventList.innerHTML = "";
  const list = calendarData.events[selectedDate] || [];
  if (list.length === 0) {
    eventList.textContent = "予定はありません";
    return;
  }

  list.forEach((ev, i) => {
    const div = document.createElement("div");
    div.className = "event";

    const timeText = ev.start && ev.end ? `${ev.start}〜${ev.end} ` : ev.start ? `${ev.start} ` : "";
    const textWithoutTags = ev.text.replace(/#\S+/g, "").trim();

    const textSpan = document.createElement("span");
    textSpan.textContent = timeText + textWithoutTags;
    div.appendChild(textSpan);

    (ev.tags || []).forEach(tag => {
      const tagSpan = document.createElement("span");
      tagSpan.className = "event-tag";
      tagSpan.textContent = tag;
      tagSpan.style.backgroundColor = calendarData.tagColors[tag] || "#777";
      div.appendChild(tagSpan);
    });

    if (ev.location) {
      const locSpan = document.createElement("span");
      locSpan.textContent = "📍 " + ev.location;
      locSpan.style.marginLeft = "8px";
      locSpan.style.fontSize = "0.85em";
      div.appendChild(locSpan);
    }
    if (ev.notify) {
      const notifySpan = document.createElement("span");
      notifySpan.textContent = "🔔";
      notifySpan.style.marginLeft = "8px";
      div.appendChild(notifySpan);
    }

    const editBtn = document.createElement("button");
    editBtn.textContent = "編集";
    editBtn.addEventListener("click", () => {
      newEventStart.value = ev.start || "";
      newEventEnd.value = ev.end || "";
      newEventText.value = ev.text + (ev.tags ? " " + ev.tags.join(" ") : "");
      newEventLocation.value = ev.location || "";
      newEventNotify.checked = ev.notify || false;
      editingIndex = i;
      addEventBtn.textContent = "更新 / Update";
    });
    div.appendChild(editBtn);

    const delBtn = document.createElement("button");
    delBtn.textContent = "削除";
    delBtn.addEventListener("click", () => {
      if (confirm("この予定を削除しますか？")) {
        list.splice(i, 1);
        if (list.length === 0) delete calendarData.events[selectedDate];
        updateEventList();
        drawCalendar(currentDate);
        saveToLocalStorage();
      }
    });
    div.appendChild(delBtn);

    eventList.appendChild(div);
  });
}

// --- イベント追加・更新 ---
addEventBtn.addEventListener("click", () => {
  if (!selectedDate) return;
  const start = newEventStart.value.trim();
  const end = newEventEnd.value.trim();
  const fullText = newEventText.value.trim();
  const location = newEventLocation.value.trim();
  const notify = newEventNotify.checked;

  // タグ抽出 (#タグ形式)
  const tags = (fullText.match(/#\S+/g) || []).map(t => t.trim());

  // タグなしテキスト
  const text = fullText.replace(/#\S+/g, "").trim();

  if (!text) {
    alert("予定内容を入力してください");
    return;
  }

  if (!calendarData.events[selectedDate]) calendarData.events[selectedDate] = [];

  const eventObj = { start, end, text, location, notify, tags };

  if (editingIndex !== null && editingIndex >= 0) {
    calendarData.events[selectedDate][editingIndex] = eventObj;
  } else {
    calendarData.events[selectedDate].push(eventObj);
  }

  updateEventList();
  drawCalendar(currentDate);
  saveToLocalStorage();

  // 入力クリア・モーダル閉じず
  newEventStart.value = "";
  newEventEnd.value = "";
  newEventText.value = "";
  newEventLocation.value = "";
  newEventNotify.checked = false;
  editingIndex = null;
  addEventBtn.textContent = "追加 / Add";
});

// --- ナビゲーション ---
prevMonthBtn.addEventListener("click", () => {
  currentDate.setMonth(currentDate.getMonth() - 1);
  drawCalendar(currentDate);
});

nextMonthBtn.addEventListener("click", () => {
  currentDate.setMonth(currentDate.getMonth() + 1);
  drawCalendar(currentDate);
});

todayBtn.addEventListener("click", () => {
  currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);
  drawCalendar(currentDate);
});

// --- タグ設定モーダル ---
settingsBtn.addEventListener("click", () => {
  settingsModalBg.style.display = "flex";
  refreshTagColorList();
});
settingsCancelBtn.addEventListener("click", () => {
  settingsModalBg.style.display = "none";
});

function refreshTagColorList() {
  tagColorList.innerHTML = "";
  for (const tag in calendarData.tagColors) {
    const div = document.createElement("div");
    div.className = "tag-color-item";
    div.textContent = tag;
    div.style.backgroundColor = calendarData.tagColors[tag];
    div.addEventListener("click", () => {
      const newColor = prompt(`「${tag}」のカラーを16進数で入力してください（例: #aabbcc）`, calendarData.tagColors[tag]);
      if (newColor) {
        calendarData.tagColors[tag] = newColor;
        saveToLocalStorage();
        refreshTagColorList();
        drawCalendar(currentDate);
      }
    });
    tagColorList.appendChild(div);
  }
}
addTagBtn.addEventListener("click", () => {
  const tag = newTagName.value.trim();
  const color = newTagColor.value.trim();
  if (!tag || !color) {
    alert("タグ名とカラーを入力してください");
    return;
  }
  if (!tag.startsWith("#")) {
    alert("タグ名は # から始めてください");
    return;
  }
  calendarData.tagColors[tag] = color;
  newTagName.value = "";
  newTagColor.value = "#000000";
  saveToLocalStorage();
  refreshTagColorList();
  drawCalendar(currentDate);
});

// --- JSON保存 ---
saveJsonBtn.addEventListener("click", () => {
  calendarData.version = CURRENT_SAVE_VERSION;
  const dataStr = JSON.stringify(calendarData, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `Calendar-${CURRENT_SAVE_VERSION}_${new Date().toISOString().slice(0, 19).replace(/[:T]/g, "_")}.json`;
  a.click();
  URL.revokeObjectURL(a.href);
});

// --- JSON読み込み ---
loadJsonBtn.addEventListener("click", () => {
  loadJsonInput.click();
});
loadJsonInput.addEventListener("change", e => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = evt => {
    try {
      let loadedData = JSON.parse(evt.target.result);
      const originalVersion = loadedData.version || "不明";

      if (!SUPPORTED_VERSIONS.includes(originalVersion) && originalVersion !== "不明") {
        alert("対応していないデータ形式です");
        return;
      }

      loadedData = convertDataToV4(loadedData);

      calendarData = loadedData;

      saveToLocalStorage();
      drawCalendar(currentDate);

      alert(`読み込みました（元バージョン: ${originalVersion} → 現行: ${calendarData.version}）`);
    } catch (err) {
      alert("ファイルの読み込みに失敗しました");
    }
  };
  reader.readAsText(file);
  loadJsonInput.value = "";
});

// --- 起動時処理 ---
function loadFromLocalStorage() {
  const dataStr = localStorage.getItem(STORAGE_KEY);
  if (!dataStr) return;
  try {
    let loadedData = JSON.parse(dataStr);
    loadedData = convertDataToV4(loadedData);
    calendarData = loadedData;
  } catch {
    // 読み込み失敗は無視
  }
}
loadFromLocalStorage();
drawCalendar(currentDate);
