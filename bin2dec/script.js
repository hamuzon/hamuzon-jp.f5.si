function setFavicon(mode) {
  document.getElementById('favicon').href = (mode === 'dark') ? 'icon-dark.png' : 'icon-light.png';
}
function initMode() {
  const select = document.getElementById('colorModeSelect');
  const saved = localStorage.getItem('colorMode');
  select.value = saved || 'system';
  applyMode(select.value);
}
function getSystemMode() {
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}
function applyMode(mode) {
  const body = document.body;
  if (mode === 'system') mode = getSystemMode();
  body.classList.remove('light', 'dark');
  body.classList.add(mode);
  setFavicon(mode);
}
document.getElementById('colorModeSelect').addEventListener('change', (e) => {
  const mode = e.target.value;
  localStorage.setItem('colorMode', mode);
  applyMode(mode);
});
document.getElementById('tabBinToDec').addEventListener('click', () => {
  showTab('binToDec', 'tabBinToDec');
});
document.getElementById('tabDecToBin').addEventListener('click', () => {
  showTab('decToBin', 'tabDecToBin');
});
function showTab(contentId, tabId) {
  ['binToDec', 'decToBin'].forEach(id => {
    document.getElementById(id).style.display = (id === contentId) ? 'block' : 'none';
  });
  ['tabBinToDec', 'tabDecToBin'].forEach(id => {
    const tab = document.getElementById(id);
    const active = id === tabId;
    tab.classList.toggle('active', active);
    tab.setAttribute('aria-selected', active);
  });
}
function bin2dec(binaryString) {
  if (!/^[01]+$/.test(binaryString)) {
    throw new Error('無効な2進数です。');
  }
  const isNegative = binaryString[0] === '1';
  let decimalNumber = 0;
  for (let i = 0; i < binaryString.length; i++) {
    decimalNumber = decimalNumber * 2 + (binaryString.charAt(i) === '1' ? 1 : 0);
  }
  if (isNegative) decimalNumber -= 2 ** binaryString.length;
  return decimalNumber;
}
function convertBinToDec() {
  const input = document.getElementById('binaryInput').value.trim();
  const result = document.getElementById('binToDecResult');
  result.textContent = '';
  try {
    result.textContent = `10進数: ${bin2dec(input)}`;
  } catch (e) {
    result.textContent = e.message;
  }
}
function dec2bin(num) {
  if (!Number.isInteger(num)) throw new Error('整数を入力してください。');
  if (num === 0) return '0';
  const isNeg = num < 0;
  if (!isNeg) return '0' + num.toString(2);
  const bits = num.toString(2).length + 1;
  const comp = (1 << bits) + num;
  return '1' + comp.toString(2);
}
function convertDecToBin() {
  const inputStr = document.getElementById('decimalInput').value.trim();
  const result = document.getElementById('decToBinResult');
  result.textContent = '';
  try {
    const num = Number(inputStr);
    result.textContent = `2進数: ${dec2bin(num)}`;
  } catch (e) {
    result.textContent = e.message;
  }
}
window.onload = () => {
  initMode();
  showTab('binToDec', 'tabBinToDec');
};
