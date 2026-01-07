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

  ownWrapper.innerHTML =
    '<div class="string"></div>' +
    `<div class="tanzaku ${color}">` +
    `${safeText}<div class="name">${safeName ? safeName : ''}</div>` +
    `</div>`;

  ownWrapper.style.display = 'flex';
  btnArea.style.display = 'flex';

  ownWrapper.dataset.wish = text;
  ownWrapper.dataset.name = name;
  ownWrapper.dataset.color = color;
}

// ファイル名生成
function generateFilename() {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const hh = String(now.getHours()).padStart(2, '0');
  const mi = String(now.getMinutes()).padStart(2, '0');
  const ss = String(now.getSeconds()).padStart(2, '0');
  return `tanzaku_${yyyy}${mm}${dd}_${hh}${mi}${ss}.png`;
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

  if(name) {
    const nameP = document.createElement('p');
    nameP.style.margin = "0 0 12px 0";
    nameP.style.fontSize = "20px";
    nameP.style.color = "#555";
    nameP.textContent = `🎋${name}🎋`;
    wrapper.appendChild(nameP);
  }

  const wishP = document.createElement('p');
  wishP.style.margin = "0";
  wishP.textContent = `🌟${wish}🌟`;
  wrapper.appendChild(wishP);

  const footerP = document.createElement('p');
  footerP.style.margin = "12px 0 0 0";
  footerP.style.fontSize = "14px";
  footerP.style.color = "#999";
  footerP.textContent = "🎋短冊 2026🎋";
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
  document.body.appendChild(imgTanzaku);
  html2canvas(imgTanzaku, { backgroundColor: null, scale: 2 }).then(canvas => {
    canvas.toBlob(blob => {
      if (!blob) {
        alert('画像の作成に失敗しました。');
        document.body.removeChild(imgTanzaku);
        return;
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = generateFilename();
      a.click();
      URL.revokeObjectURL(url);
      document.body.removeChild(imgTanzaku);
    });
  }).catch(err => {
    alert('画像生成に失敗しました: ' + err.message);
    document.body.removeChild(imgTanzaku);
  });
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
  postText += `🌟${wish}🌟\n🎋願いごと🎋\n#七夕 #短冊 #願い事 #Tanabata #Tanzaku #Wish #StarFestival #JapaneseFestival`;

  // URL（複数URLをまとめてエンコード）
  const url = encodeURIComponent('https://hamuzon.web.fc2.com/wish \nhttps://hamuzon.web.fc2.com/wish-2026');

  // X（旧Twitter）投稿URL
  const postUrl = encodeURIComponent(postText);
  window.open(`https://x.com/intent/post?text=${postUrl}&url=${url}`, '_blank');
};

