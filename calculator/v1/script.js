const display = document.getElementById('display');

function appendValue(value) {
  const ops = "+-*/^%";
  const lastChar = display.value.slice(-1);

  // 小数点重複防止
  if (value === '.') {
    const tokens = display.value.split(/[\+\-\*\/\^%()]/);
    const currentNum = tokens[tokens.length - 1];
    if (currentNum.includes('.')) return;
    if (currentNum.length === 0) value = '0.';
  }

  // 先頭の0対策
  if (display.value === '0' && value !== '.') {
    if (!ops.includes(value)) {
      display.value = value;
      return;
    }
  }

  // 連続演算子の置き換え
  if (ops.includes(lastChar) && ops.includes(value)) {
    display.value = display.value.slice(0, -1) + value;
    return;
  }

  display.value += value;
}

function clearDisplay() {
  display.value = '';
}

function backspace() {
  display.value = display.value.slice(0, -1);
}

function toggleSign() {
  let exp = display.value;
  if (!exp) return;

  // 数値部分のみ反転（最後の数値を探す）
  const match = exp.match(/(-?\d+\.?\d*)$/);
  if (!match) return;

  const numStr = match[0];
  const num = parseFloat(numStr);
  const inverted = (-num).toString();

  display.value = exp.slice(0, match.index) + inverted;
}

function calculateResult() {
  try {
    if (display.value.trim() === '') return;

    let exp = display.value;

    // √ をMath.sqrt()へ変換
    exp = exp.replace(/√/g, 'Math.sqrt');

    // ^を**に変換
    exp = exp.replace(/\^/g, '**');

    // % を割り算に変換（例えば50%なら0.5）
    exp = exp.replace(/(\d+(\.\d+)?)%/g, '($1/100)');

    let result = eval(exp);

    if (!isFinite(result) || isNaN(result)) {
      display.value = 'Error';
      return;
    }

    result = parseFloat(result.toFixed(10));

    display.value = result.toString();
  } catch {
    display.value = 'Error';
  }
}

// キーボード入力対応
document.addEventListener('keydown', function(e) {
  const allowedKeys = '0123456789+-*/().^%';
  if (allowedKeys.includes(e.key)) {
    appendValue(e.key);
    e.preventDefault();
  } else if (e.key === 'Enter') {
    calculateResult();
    e.preventDefault();
  } else if (e.key === 'Backspace') {
    backspace();
    e.preventDefault();
  } else if (e.key === 'Escape') {
    clearDisplay();
    e.preventDefault();
  }
});

// テーマ切り替えの監視
function applyTheme(theme) {
  document.body.dataset.theme = theme;
}

const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
applyTheme(prefersDark.matches ? 'dark' : 'light');
prefersDark.addEventListener('change', e => {
  applyTheme(e.matches ? 'dark' : 'light');
});

// OS情報取得
if (navigator.userAgentData) {
  navigator.userAgentData.getHighEntropyValues(['platform', 'platformVersion'])
  .then(data => {
    console.log('OS:', data.platform);
    console.log('OS Version:', data.platformVersion);
  });
} else {
  console.log('navigator.userAgent:', navigator.userAgent);
}
