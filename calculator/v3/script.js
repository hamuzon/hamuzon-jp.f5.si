const display = document.getElementById('display');
function appendValue(value) {
  const ops = "+-*/^%";
  const lastChar = display.value.slice(-1);
  if (value === '.') {
    const tokens = display.value.split(/[\+\-\*\/\^%()]/);
    const currentNum = tokens[tokens.length - 1];
    if (currentNum.includes('.')) return;
    if (currentNum.length === 0) value = '0.';
  }
  if (display.value === '0' && value !== '.') {
    if (!ops.includes(value)) {
      display.value = value;
      return;
    }
  }
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
    exp = exp.replace(/π/g, 'Math.PI');
    exp = exp.replace(/e/g, 'Math.E');
    exp = exp.replace(/log\(/g, 'Math.log10(');
    exp = exp.replace(/ln\(/g, 'Math.log(');
    exp = exp.replace(/sin\(/g, 'Math.sin(');
    exp = exp.replace(/cos\(/g, 'Math.cos(');
    exp = exp.replace(/tan\(/g, 'Math.tan(');
    exp = exp.replace(/√/g, 'Math.sqrt');
    exp = exp.replace(/\^/g, '**');
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
function applyTheme(theme) {
  document.body.dataset.theme = theme;
}
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
applyTheme(prefersDark.matches ? 'dark' : 'light');
prefersDark.addEventListener('change', e => {
  applyTheme(e.matches ? 'dark' : 'light');
});
if (navigator.userAgentData) {
  navigator.userAgentData.getHighEntropyValues(['platform', 'platformVersion'])
  .then(data => {
    console.log('OS:', data.platform);
    console.log('OS Version:', data.platformVersion);
  });
} else {
  console.log('navigator.userAgent:', navigator.userAgent);
}

function clearEntry() {
  display.value = '';
}