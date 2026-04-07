"use strict";

const TODO_VERSION = "1.1";
const SUPPORTED_VERSIONS = ["1.0", "1.1"];
const STORAGE_KEY = "todo_events_V1.1";

let todos = {};
let tagColors = {};
let selectedDate = null;
let isEditMode = false;

document.addEventListener("DOMContentLoaded", () => {
  const listContainer = document.getElementById("todo-list-container");
  const modalBg = document.getElementById("modal-bg");
  const modalDate = document.getElementById("modal-date");
  const todoDate = document.getElementById("todo-date");
  const todoTime = document.getElementById("todo-time");
  const todoText = document.getElementById("todo-text");

  const addBtn = document.getElementById("add-todo-btn");
  const saveBtn = document.getElementById("save-btn");
  const deleteBtn = document.getElementById("delete-btn");
  const closeBtn = document.getElementById("close-btn");

  const saveJsonBtn = document.getElementById("save-json-btn");
  const loadJsonBtn = document.getElementById("load-json-btn");
  const loadInput = document.getElementById("load-json-input");

  // yyyy-mm-dd形式にフォーマット
  function formatDateKey(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  }

  // 表示用：2025年7月11日 みたいな形式に変換
  function formatDateJP(dateKey) {
    const [y, m, d] = dateKey.split("-");
    return `${y}年${parseInt(m)}月${parseInt(d)}日`;
  }

  // ローカルストレージに現在の状態を保存
  function saveToLocalStorage() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
    // tagColorsも必要ならここで保存（将来用）
    localStorage.setItem(STORAGE_KEY + "_tags", JSON.stringify(tagColors));
  }

  // TODOリスト描画
  function renderTodoList() {
    listContainer.innerHTML = "";
    const keys = Object.keys(todos).sort();

    keys.forEach(dateKey => {
      const block = document.createElement("div");
      block.className = "todo-date-block";
      block.tabIndex = 0;
      block.setAttribute("role", "button");
      block.setAttribute("aria-label", `${formatDateJP(dateKey)} のTODO`);

      const heading = document.createElement("h4");
      heading.textContent = formatDateJP(dateKey);
      block.appendChild(heading);

      const item = document.createElement("div");
      item.className = "todo-item";

      if (typeof todos[dateKey] === "string" && todos[dateKey].trim() !== "") {
        // 改行も保持して表示
        item.textContent = todos[dateKey];
      } else {
        item.textContent = "(未入力)";
        item.classList.add("empty");
      }

      block.appendChild(item);

      block.onclick = () => openModal(dateKey, true);
      block.onkeydown = e => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openModal(dateKey, true);
        }
      };

      listContainer.appendChild(block);
    });
  }

  // モーダル開く
  function openModal(dateKey, editMode = false) {
    isEditMode = editMode;
    selectedDate = dateKey;
    modalDate.textContent = `📅 ${formatDateJP(dateKey)}`;

    todoDate.value = dateKey;

    const raw = todos[dateKey] || "";

    if (raw.trim() !== "") {
      todoText.value = raw;
      todoTime.value = "";
    } else {
      todoText.value = "";
      todoTime.value = "";
    }

    modalBg.hidden = false;
    todoText.focus();
  }

  // モーダル閉じる
  function closeModal() {
    modalBg.hidden = true;
    selectedDate = null;
  }

  // 新規追加ボタン
  addBtn.onclick = () => {
    const todayKey = formatDateKey(new Date());
    openModal(todayKey);
  };

  // 保存ボタン
  saveBtn.onclick = () => {
    const date = todoDate.value;
    const time = todoTime.value.trim();
    const text = todoText.value.trim();

    if (!date) {
      alert("⚠️ 日付を選択してください。");
      todoDate.focus();
      return;
    }
    if (!text) {
      alert("⚠️ TODO内容を入力してください。");
      todoText.focus();
      return;
    }
    const entry = time ? `${time} ${text}` : text;

    if (todos[date] && date !== selectedDate) {
      todos[date] = todos[date] + "\n" + entry;
    } else {
      todos[date] = entry;
    }

    saveToLocalStorage();
    renderTodoList();
    closeModal();
  };

  // 削除ボタン
  deleteBtn.onclick = () => {
    if (selectedDate && todos[selectedDate]) {
      if (confirm("🗑️ このTODOを削除しますか？")) {
        delete todos[selectedDate];
        saveToLocalStorage();
        renderTodoList();
        closeModal();
      }
    }
  };

  closeBtn.onclick = closeModal;

  modalBg.onclick = e => {
    if (e.target === modalBg) closeModal();
  };

  // JSON保存
  saveJsonBtn.onclick = () => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");
    const h = String(now.getHours()).padStart(2, "0");
    const mi = String(now.getMinutes()).padStart(2, "0");
    const s = String(now.getSeconds()).padStart(2, "0");

    const json = {
      savedAt: now.toISOString(),
      events: todos,
      settings: {
        app: "todo-list",
        version: TODO_VERSION,
        tagColors
      }
    };

    const blob = new Blob([JSON.stringify(json, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `todo-${TODO_VERSION}_${y}-${m}-${d}_${h}-${mi}-${s}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // JSON読込
  loadJsonBtn.onclick = () => loadInput.click();

  loadInput.onchange = e => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const json = JSON.parse(ev.target.result);
        loadFromJSON(json);
        alert("✅ 読み込み完了");
      } catch (err) {
        alert("❌ 読み込みエラー: " + err.message);
      }
      loadInput.value = "";
    };
    reader.readAsText(file);
  };

  // JSONから復元
  function loadFromJSON(json) {
    if (!json || typeof json !== "object") throw new Error("不正なJSONです");

    let settings = json.settings;

    if (
      settings &&
      typeof settings === "object" &&
      !settings.app &&
      !settings.version &&
      settings.tagColors
    ) {
      settings = {
        app: "todo-list",
        version: TODO_VERSION,
        tagColors: settings.tagColors
      };
    }

    if (!settings || settings.app !== "todo-list" || !SUPPORTED_VERSIONS.includes(settings.version)) {
      throw new Error("対応していない形式です");
    }

    if (!json.events || typeof json.events !== "object") {
      throw new Error("events がありません");
    }

    todos = json.events;
    tagColors = settings.tagColors || {};
    saveToLocalStorage(); // 読込時に保存
    renderTodoList();
  }

  // ローカルストレージから復元 (v1.1 と v1.0 の両方をケア)
  function init() {
    const storedV11 = localStorage.getItem(STORAGE_KEY);
    const storedV10 = localStorage.getItem("todo_events"); // v1.0のキー

    if (storedV11) {
      try {
        todos = JSON.parse(storedV11);
      } catch (e) {
        console.error("V1.1 parse error", e);
      }
    } else if (storedV10) {
      // V1.1がなくてV1.0がある場合、移行
      try {
        todos = JSON.parse(storedV10);
        console.log("Migrated from V1.0");
        saveToLocalStorage();
      } catch (e) {
        console.error("V1.0 migration error", e);
      }
    }

    // タグカラーの復元
    const storedTags = localStorage.getItem(STORAGE_KEY + "_tags");
    if (storedTags) {
      try {
        tagColors = JSON.parse(storedTags);
      } catch (e) {}
    }

    renderTodoList();
  }

  init();
});

