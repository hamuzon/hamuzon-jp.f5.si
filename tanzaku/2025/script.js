const ownWrapper = document.getElementById('ownWrapper');
const btnArea = document.getElementById('btnArea');

function escapeHtml(text) {
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
  return text.replace(/[&<>"']/g, m => map[m]);
}

function addOwn() {
  const text = document.getElementById('wishInput').value.trim();
  if (!text) {
    alert('願い事を書いてください');
    return;
  }
  const name = document.getElementById('nameInput').value.trim();
  const color = document.getElementById('colorSelect').value;

  const safeText = escapeHtml(text);
  const safeName = escapeHtml(name);

  // 画面表示
  ownWrapper.innerHTML =
    '<div class="string"></div>' +
    `<div class="tanzaku ${color}">` +
    `${safeText}<div class="name">${safeName ? safeName : ''}</div>` +
    `</div>`;
  ownWrapper.classList.remove('hidden');
  btnArea.style.display = 'flex';

  ownWrapper.dataset.wish = text;
  ownWrapper.dataset.name = name;
  ownWrapper.dataset.color = color;
}

function generateFilename(color) {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const hh = String(now.getHours()).padStart(2, '0');
  const mi = String(now.getMinutes()).padStart(2, '0');
  const ss = String(now.getSeconds()).padStart(2, '0');
  return `wish-2025_${color}_${yyyy}-${mm}_${dd}-${hh}-${mi}-${ss}.png`;
}

function createImageTanzaku(wish, name, color) {
  // 色ごとのスタイルマップ
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
  footerP.textContent = "🎋願いごと🎋";
  wrapper.appendChild(footerP);

  return wrapper;
}

document.getElementById('saveBtn').onclick = () => {
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
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = generateFilename(color);
      a.click();
      URL.revokeObjectURL(url);
      document.body.removeChild(imgTanzaku);
    });
  });
};

document.getElementById('postBtn').onclick = () => {
  const wish = ownWrapper.dataset.wish || '';
  const name = ownWrapper.dataset.name || '';
  if (!wish) {
    alert('願い事を書いてください');
    return;
  }

  let tweetText = '';
  if (name) {
    tweetText += `🎋${name}🎋\n`;
  }

  tweetText += `🌟${wish}🌟\n`;
  tweetText += `🎋願いごと🎋\n\n`;

  tweetText +=
    'https://hamuzon-jp.f5.si/wish\n' +
    'https://hamuzon-jp.f5.si/wish-2025\n\n';

  tweetText += '#七夕 #TanzakuMaker';

  window.open(
    `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`,
    '_blank'
  );
};
