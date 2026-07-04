window.addEventListener('DOMContentLoaded', async () => {
  const params = new URLSearchParams(window.location.search);
  const wish = params.get('w') || params.get('wish');
  const name = params.get('n') || params.get('name') || '';
  const color = params.get('c') || params.get('color') || 'red';

  if (!wish?.trim()) {
    document.getElementById('loadingArea').classList.add('hidden');
    document.getElementById('errorArea').classList.remove('hidden');
    return;
  }

  const imgTanzaku = createImageTanzaku(
    wish.trim(),
    name.trim(),
    color
  );

  const renderTarget = document.getElementById('render-target');
  renderTarget.appendChild(imgTanzaku);

  try {
    const canvas = await html2canvas(imgTanzaku, {
      backgroundColor: null,
      scale: 2,
      useCORS: true
    });

    const dataUrl = canvas.toDataURL('image/png');

    const img = document.createElement('img');
    img.src = dataUrl;
    img.className = 'tanzaku-img';
    img.alt = 'Tanzaku';

    const dlLink = document.createElement('a');
    dlLink.href = dataUrl;
    dlLink.download = generateFilename(color);
    dlLink.className = 'action-btn';
    dlLink.textContent = '💾 画像を保存 / Download';

    const imageWrapper = document.getElementById('imageWrapper');
    imageWrapper.appendChild(img);

    const btnRow = document.createElement('div');
    btnRow.style.cssText =
      'display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin:12px 0;';

    btnRow.appendChild(dlLink);
    imageWrapper.after(btnRow);

    document.getElementById('loadingArea').classList.add('hidden');
    document.getElementById('resultArea').classList.remove('hidden');

  } catch (err) {
    console.error('Image generation failed:', err);
  } finally {
    renderTarget.removeChild(imgTanzaku);
  }
});


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
    }
  };

  const style = colorStyles[color] || colorStyles.red;

  const wrapper = document.createElement('div');

  Object.assign(wrapper.style, {
    background: style.background,
    border: `3px solid ${style.borderColor}`,
    borderRadius: "12px",
    width: "260px",
    padding: "20px",
    boxSizing: "border-box",
    boxShadow: "0 8px 16px rgba(0,0,0,0.4)",
    color: style.color,
    fontSize: "22px",
    fontFamily: "'Yu Mincho', 'Hiragino Mincho ProN', 'MS PMincho', serif",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
    userSelect: "none",
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
    lineHeight: "1.3",
    overflow: "hidden"
  });

  // 名前
  if (name) {
    const nameP = document.createElement('p');
    Object.assign(nameP.style, {
      margin: "0 0 12px 0",
      fontSize: "20px",
      color: "#555"
    });
    nameP.textContent = `🎋${name}🎋`;
    wrapper.appendChild(nameP);
  }

  // 願い
  const wishP = document.createElement('p');
  wishP.style.margin = "0";
  wishP.textContent = `🌟${wish}🌟`;
  wrapper.appendChild(wishP);

  // フッター
  const footerP = document.createElement('p');
  Object.assign(footerP.style, {
    margin: "12px 0 0 0",
    fontSize: "14px",
    color: "#999"
  });
  footerP.textContent = "🎋短冊 2026 / Tanzaku 2026🎋";
  wrapper.appendChild(footerP);

  return wrapper;
}