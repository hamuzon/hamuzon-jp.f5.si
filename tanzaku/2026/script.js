"use strict";

const ownWrapper = document.getElementById('ownWrapper');
const btnArea = document.getElementById('btnArea');
const wishInput = document.getElementById('wishInput');
const nameInput = document.getElementById('nameInput');
const colorSelect = document.getElementById('colorSelect');
const saveBtn = document.getElementById('saveBtn');
const postBtn = document.getElementById('postBtn');

// 特殊文字エスケープ
function escapeHtml(text) {
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
  return text.replace(/[&<>"']/g, m => map[m]);
}

// 画面に縦書き短冊表示
function addOwn() {
  const text = wishInput.value.trim();
  if (!text) {
    alert('願い事を書いてください');
    return;
  }
  const name = nameInput.value.trim();
  const color = colorSelect.value;

  const safeText = escapeHtml(text);
  const safeName = escapeHtml(name);

  // 改行ごとに分割して、少しずつ開始位置を下げる（段差をつける）
  const linesHtml = safeText.split('\n').map((line, i) => {
    return `<div style="padding-top: ${i * 1.5}rem;">${line}</div>`;
  }).join('');

  ownWrapper.innerHTML =
    '<div class="string"></div>' +
    `<div class="tanzaku ${color}">` +
    `${linesHtml}` +
    `<div class="name">${safeName ? (safeName.startsWith('　') ? safeName : '　' + safeName) : ''}</div>` +
    `</div>`;

  ownWrapper.style.display = 'flex';
  btnArea.style.display = 'flex';
  ownWrapper.classList.remove('hidden');
  btnArea.classList.remove('hidden');

  ownWrapper.dataset.wish = text;
  ownWrapper.dataset.name = name;
  ownWrapper.dataset.color = color;
}

// ファイル名生成
function generateFilename(color) {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const hh = String(now.getHours()).padStart(2, '0');
  const mi = String(now.getMinutes()).padStart(2, '0');
  const ss = String(now.getSeconds()).padStart(2, '0');
  return `wish-2026_${color}_${yyyy}-${mm}_${dd}-${hh}-${mi}-${ss}.png`;
}

// 画像生成用短冊作成
function createImageTanzaku(wish, name, color) {
  const colorStyles = {
    red: {
      background: 'linear-gradient(90deg, #f9c0c0, #f4a1a1)',
      borderColor: '#d45454',
      color: '#4a0b0b'
    },
    blue: {
      background: 'linear-gradient(90deg, #a7c9f9, #7fa8f4)',
      borderColor: '#3b5da3',
      color: '#102353'
    },
    yellow: {
      background: 'linear-gradient(90deg, #fff7b3, #fff1a5)',
      borderColor: '#d4c245',
      color: '#4a420b'
    },
    green: {
      background: 'linear-gradient(90deg, #b7f4b6, #8ae68a)',
      borderColor: '#4da34d',
      color: '#0b3a0b'
    },
    purple: {
      background: 'linear-gradient(90deg, #dab6f4, #c692f4)',
      borderColor: '#774da3',
      color: '#3a0b53'
    },
  };

  const style = colorStyles[color] || colorStyles.red;

  const wrapper = document.createElement('div');
  wrapper.style.background = style.background;
  wrapper.style.border = `3px solid ${style.borderColor}`;
  wrapper.style.borderRadius = "12px";
  wrapper.style.width = "260px";
  wrapper.style.padding = "20px";
  wrapper.style.boxShadow = "0 8px 16px rgba(0,0,0,0.4)";
  wrapper.style.color = style.color;
  wrapper.style.fontSize = "22px";
  wrapper.style.fontFamily = "'Yu Mincho', serif";
  wrapper.style.display = "flex";
  wrapper.style.flexDirection = "column";
  wrapper.style.justifyContent = "center";
  wrapper.style.alignItems = "center";
  wrapper.style.textAlign = "center";
  wrapper.style.userSelect = "none";
  wrapper.style.whiteSpace = "pre-wrap";
  wrapper.style.wordBreak = "break-word";
  wrapper.style.position = "relative";
  wrapper.style.lineHeight = "1.3";

  if (name) {
    const nameP = document.createElement('p');
    nameP.style.margin = "0 0 12px 0";
    nameP.style.fontSize = "20px";
    nameP.style.color = "#555";
    nameP.textContent = `🎋${name}🎋`;
    wrapper.appendChild(nameP);
  }

  const lines = wish.split('\n');
  lines.forEach((line, i) => {
    const wishP = document.createElement('p');
    wishP.style.margin = "0";
    wishP.style.width = "100%";
    wishP.style.textAlign = "center";
    wishP.style.paddingLeft = `${i * 1.5}rem`; 
    
    wishP.textContent = (i === 0 ? '🌟' : '') + line + (i === lines.length - 1 ? '🌟' : '');
    wrapper.appendChild(wishP);
  });

  const footerP = document.createElement('p');
  footerP.style.margin = "12px 0 0 0";
  footerP.style.fontSize = "14px";
  footerP.style.color = "#999";
  footerP.textContent = "🎋短冊 2026 / Tanzaku 2026🎋";
  wrapper.appendChild(footerP);

  return wrapper;
}

// 保存ボタン
saveBtn.onclick = () => {
  const wish = ownWrapper.dataset.wish;
  if (!wish) {
    alert('短冊がありません。願い事を書いてください。');
    return;
  }
  const name = ownWrapper.dataset.name || '';
  const color = ownWrapper.dataset.color || 'red';
  const imgTanzaku = createImageTanzaku(wish, name, color);

  // 画面外に配置してレンダリング
  imgTanzaku.style.position = 'fixed';
  imgTanzaku.style.left = '-9999px';
  imgTanzaku.style.top = '0';
  document.body.appendChild(imgTanzaku);

  // html-to-image を使用して画像を生成
  setTimeout(() => {
    htmlToImage.toPng(imgTanzaku, { backgroundColor: null, pixelRatio: 2 })
      .then(dataUrl => {
        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = generateFilename(color);
        a.click();
        document.body.removeChild(imgTanzaku);
      })
      .catch(err => {
        alert('画像生成に失敗しました: ' + err.message);
        document.body.removeChild(imgTanzaku);
      });
  }, 500);
};

// 投稿ボタン（X共有）
postBtn.onclick = () => {
  const wish = ownWrapper.dataset.wish || '';
  const name = ownWrapper.dataset.name || '';

  if (!wish) {
    alert('願い事を書いてください');
    return;
  }

  // 投稿テキスト作成
  let postText = '';
  if (name) {
    postText += `🎋${name}🎋\n`;
  }

  postText += `🌟${wish}🌟
🎋願いごと / Wish🎋

https://hamuzon-jp.f5.si/wish
https://hamuzon-jp.f5.si/wish-2026

#七夕 #Tanabata #StarFestival #Tanzaku`;

  // エンコード
  const postUrl = encodeURIComponent(postText);

  // X（旧Twitter）投稿
  window.open(
    `https://twitter.com/intent/tweet?text=${postUrl}`,
    '_blank'
  );
};

// ページ読み込み時にURLパラメータ（w, n, c）があれば反映して表示
window.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const wish = params.get('w') || params.get('wish');
  const name = params.get('n') || params.get('name');
  const color = params.get('c') || params.get('color');

  if (wish) {
    wishInput.value = wish;
    if (name) nameInput.value = name;
    if (color) colorSelect.value = color;
    addOwn();
  }
});