// --- 要素取得 ---
const fileInput = document.getElementById('fileInput');
const openBtn = document.getElementById('openBtn');
const saveBtn = document.getElementById('saveBtn');
const downloadBtn = document.getElementById('downloadBtn');
const newBtn = document.getElementById('newBtn');
const codeEl = document.getElementById('code');
const tablist = document.getElementById('tablist');
const status = document.getElementById('status');
const dropArea = document.getElementById('dropArea');
const filenameInput = document.getElementById('filenameInput');

const fontsize = document.getElementById('fontsize');
const fontfamily = document.getElementById('fontfamily');
const themeToggle = document.getElementById('themeToggle');
const settingBtn = document.getElementById('settingBtn');
const settingPanel = document.getElementById('settingPanel');

const bgColor = document.getElementById('bgColor');
const panelColor = document.getElementById('panelColor');
const accentColor = document.getElementById('accentColor');
const highlightColor = document.getElementById('highlightColor');
const textColor = document.getElementById('textColor');
const saveThemeBtn = document.getElementById('saveThemeBtn');
const loadThemeBtn = document.getElementById('loadThemeBtn');

const helpBtn = document.getElementById('helpBtn');
const helpModal = document.getElementById('helpModal');

// --- タブ管理 ---
let tabs = [];
let activeId = null;

// ユニークID生成
function uid() { return 'f' + Math.random().toString(36).slice(2, 9); }
function setStatus(s) { status.textContent = s; }

// タブ描画
function renderTabs() {
  tablist.innerHTML = '';
  tabs.forEach(t => {
    const el = document.createElement('div');
    el.className = 'tab' + (t.id === activeId ? ' active' : '');
    const span = document.createElement('span');
    span.textContent = t.name;
    span.contentEditable = true;
    span.onblur = () => { t.name = span.textContent; updateFileInfo(); };
    el.appendChild(span);
    const close = document.createElement('span');
    close.textContent = '×';
    close.className = 'closeTab';
    close.onclick = e => { e.stopPropagation(); closeTab(t.id); };
    el.appendChild(close);
    el.onclick = () => activateTab(t.id);
    tablist.appendChild(el);
  });
}

// 新規タブ
function newTab(name = 'untitled.txt', text = '') {
  const t = { id: uid(), name, text, savedText: text };
  tabs.unshift(t);
  activeId = t.id;
  renderTabs();
  loadActive();
}

// タブ切替
function activateTab(id) {
  activeId = id;
  renderTabs();
  loadActive();
}

// タブ閉じる
function closeTab(id) {
  tabs = tabs.filter(t => t.id !== id);
  if (activeId === id) activeId = tabs[0] ? tabs[0].id : null;
  renderTabs();
  loadActive();
}

// 現在タブ読み込み
function loadActive() {
  const t = tabs.find(x => x.id === activeId);
  if (!t) { codeEl.value = ''; setStatus('ファイルなし'); updateFileInfo(); return; }
  codeEl.value = t.text;
  filenameInput.value = t.name;
  setStatus(t.text === t.savedText ? '保存済み' : '未保存');
  updateFileInfo();
  updateLineNumbers();
}

// 行番号更新
function updateLineNumbers() {
  const lines = codeEl.value.split('\n').length;
  const linenums = document.getElementById('linenums');
  if (linenums) {
    linenums.innerHTML = '';
    for (let i = 1; i <= lines; i++) linenums.innerHTML += i + '<br>';
  }
}

// ファイル情報表示
function updateFileInfo() {
  const t = tabs.find(x => x.id === activeId);
  const info = document.getElementById('fileInfo');
  if (!t) { info.textContent = 'ファイルなし'; return; }
  const lines = t.text.split('\n').length;
  info.textContent = `${t.name} | ${lines}行`;
}

// --- ファイル操作 ---
openBtn.onclick = () => fileInput.click();
fileInput.onchange = async e => {
  const files = [...e.target.files];
  for (const f of files) {
    if (f.type.startsWith('image') || f.type.startsWith('video')) continue;
    const text = await f.text();
    newTab(f.name, text);
  }
  fileInput.value = '';
};

// 保存
saveBtn.onclick = () => {
  const t = tabs.find(x => x.id === activeId);
  if (!t) return;
  t.text = codeEl.value;
  t.savedText = t.text;
  t.name = filenameInput.value || t.name;
  setStatus('保存済み');
  renderTabs();
  updateFileInfo();
};

// ダウンロード
downloadBtn.onclick = () => {
  const t = tabs.find(x => x.id === activeId);
  if (!t) return;
  const blob = new Blob([t.text], { type: 'text/plain' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = t.name;
  a.click();
  URL.revokeObjectURL(a.href);
};

// 新規ボタン
newBtn.onclick = () => newTab();

// --- テキスト入力 ---
codeEl.oninput = () => {
  const t = tabs.find(x => x.id === activeId);
  if (!t) return;
  t.text = codeEl.value;
  setStatus(t.text === t.savedText ? '保存済み' : '未保存');
  updateLineNumbers();
  updateFileInfo();
};

codeEl.addEventListener('input', updateLineNumbers);
codeEl.addEventListener('scroll', () => {
  const ln = document.getElementById('linenums');
  if (ln) ln.scrollTop = codeEl.scrollTop;
});

// --- フォント設定 ---
fontsize.onchange = e => { codeEl.style.fontSize = e.target.value + 'px'; }
fontfamily.onchange = e => { codeEl.style.fontFamily = e.target.value; }

// --- テーマ切替 ---
themeToggle.onclick = () => {
  document.body.dataset.theme = document.body.dataset.theme === 'light' ? 'dark' : 'light';
};

// --- 設定パネル表示 ---
settingBtn.onclick = () => {
  settingPanel.style.display = settingPanel.style.display === 'none' ? 'block' : 'none';
};

// --- ドラッグ&ドロップ ---
dropArea.addEventListener('dragover', e => e.preventDefault());
dropArea.addEventListener('drop', async e => {
  e.preventDefault();
  const files = [...e.dataTransfer.files];
  for (const f of files) {
    if (f.type.startsWith('image') || f.type.startsWith('video')) continue;
    const text = await f.text();
    newTab(f.name, text);
  }
});

// タップで開く（スマホ対応）
dropArea.addEventListener('click', () => fileInput.click());

// --- テーマ変更 ---
function applyTheme() {
  document.body.style.backgroundColor = bgColor.value;
  document.body.style.color = textColor.value;
  document.querySelectorAll('.sidebar,.editor').forEach(el => { el.style.backgroundColor = panelColor.value; });
  document.querySelectorAll('.tab.active').forEach(el => { el.style.backgroundColor = highlightColor.value; });
  document.querySelectorAll('button, select').forEach(el => { el.style.backgroundColor = accentColor.value; });
}
bgColor.oninput = applyTheme;
panelColor.oninput = applyTheme;
accentColor.oninput = applyTheme;
highlightColor.oninput = applyTheme;
textColor.oninput = applyTheme;

// --- テーマ保存/読み込み ---
saveThemeBtn.onclick = () => {
  const theme = {
    bg: bgColor.value,
    panel: panelColor.value,
    accent: accentColor.value,
    highlight: highlightColor.value,
    text: textColor.value,
    fontSize: fontsize.value,
    fontFamily: fontfamily.value,
    themeMode: document.body.dataset.theme
  };
  const blob = new Blob([JSON.stringify(theme, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  const now = new Date();
  a.download = `fileeditor_THEME_${now.getFullYear()}-${now.getMonth()+1}-${now.getDate()}_${now.getHours()}-${now.getMinutes()}-${now.getSeconds()}.json`;
  a.href = URL.createObjectURL(blob);
  a.click();
  URL.revokeObjectURL(a.href);
};

loadThemeBtn.onclick = () => {
  const input = document.createElement('input');
  input.type = 'file'; input.accept = '.json';
  input.onchange = async e => {
    const f = e.target.files[0];
    if (!f) return;
    const data = JSON.parse(await f.text());
    bgColor.value = data.bg;
    panelColor.value = data.panel;
    accentColor.value = data.accent;
    highlightColor.value = data.highlight;
    textColor.value = data.text;
    fontsize.value = data.fontSize;
    fontfamily.value = data.fontFamily;
    document.body.dataset.theme = data.themeMode;
    applyTheme();
  };
  input.click();
};

// --- ヘルプモーダル ---
helpBtn.onclick = () => { helpModal.style.display = 'block'; }
helpModal.addEventListener('click', e => {
  if (e.target === helpModal) helpModal.style.display = 'none';
});
settingPanel.addEventListener('click', e => {
  if (e.target === settingPanel) settingPanel.style.display = 'none';
});

// --- 初期設定 ---
document.addEventListener('DOMContentLoaded', () => {
  newTab();
  applyTheme();
});
