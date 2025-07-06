const sets = {
  lower: "abcdefghijklmnopqrstuvwxyz",
  upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  number: "0123456789",
  symbol: "!?#$%&=~/*-_+@",
  ambiguous: "Ilji1Oo0"
};

const chkLower = document.getElementById("chkLower");
const chkUpper = document.getElementById("chkUpper");
const chkNumber = document.getElementById("chkNumber");
const chkSymbol = document.getElementById("chkSymbol");
const chkExcludeAmbiguous = document.getElementById("chkExcludeAmbiguous");
const lengthRange = document.getElementById("lengthRange");
const lengthNumber = document.getElementById("lengthNumber");
const countRange = document.getElementById("countRange");
const countNumber = document.getElementById("countNumber");
const resultsDiv = document.getElementById("results");
const saveBtn = document.getElementById("saveBtn");
const regenBtn = document.getElementById("regenBtn");

// スライダーと数値入力を連動させる関数
function syncRangeAndNumber(rangeEl, numberEl) {
  rangeEl.addEventListener("input", () => {
    numberEl.value = rangeEl.value;
    generateAndDisplay();
  });
  numberEl.addEventListener("input", () => {
    let val = parseInt(numberEl.value);
    if (isNaN(val)) return;
    if (val < parseInt(numberEl.min)) val = numberEl.min;
    if (val > parseInt(numberEl.max)) val = numberEl.max;
    numberEl.value = val;
    rangeEl.value = val;
    generateAndDisplay();
  });
}

syncRangeAndNumber(lengthRange, lengthNumber);
syncRangeAndNumber(countRange, countNumber);

// チェックボックスの変化で再生成
[chkLower, chkUpper, chkNumber, chkSymbol, chkExcludeAmbiguous].forEach(el => {
  el.addEventListener("change", generateAndDisplay);
});

function generatePassword(length, charSet) {
  let result = "";
  const array = new Uint32Array(length);
  window.crypto.getRandomValues(array);
  for (let i = 0; i < length; i++) {
    result += charSet.charAt(array[i] % charSet.length);
  }
  return result;
}

function createCopyButton(text) {
  const btn = document.createElement("button");
  btn.textContent = "コピー";
  btn.className = "copy-btn";
  btn.addEventListener("click", () => {
    navigator.clipboard.writeText(text).then(() => {
      btn.textContent = "コピー完了！";
      setTimeout(() => (btn.textContent = "コピー"), 1500);
    });
  });
  return btn;
}

function generateAndDisplay() {
  resultsDiv.innerHTML = "";
  let charSet = "";
  if (chkLower.checked) charSet += sets.lower;
  if (chkUpper.checked) charSet += sets.upper;
  if (chkNumber.checked) charSet += sets.number;
  if (chkSymbol.checked) charSet += sets.symbol;

  if (charSet === "") {
    resultsDiv.textContent = "最低1種類の文字種を選んでください。";
    return;
  }

  if (chkExcludeAmbiguous.checked) {
    charSet = charSet
      .split("")
      .filter(c => !sets.ambiguous.includes(c))
      .join("");
    if (charSet.length === 0) {
      resultsDiv.textContent = "判別しづらい文字を除外しすぎて文字がありません。";
      return;
    }
  }

  const length = parseInt(lengthRange.value);
  const count = parseInt(countRange.value);

  for (let i = 0; i < count; i++) {
    const pw = generatePassword(length, charSet);
    const div = document.createElement("div");
    div.className = "result-item";

    const span = document.createElement("span");
    span.textContent = pw;

    div.appendChild(span);
    div.appendChild(createCopyButton(pw));
    resultsDiv.appendChild(div);
  }
}

saveBtn.addEventListener("click", () => {
  const pwElements = resultsDiv.querySelectorAll(".result-item > span");
  if (pwElements.length === 0) {
    alert("パスワードが生成されていません。");
    return;
  }
  const text = Array.from(pwElements).map(el => el.textContent).join("\n");
  const now = new Date();
  const y = now.getFullYear();
  const mo = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const h = String(now.getHours()).padStart(2, "0");
  const mi = String(now.getMinutes()).padStart(2, "0");
  const s = String(now.getSeconds()).padStart(2, "0");
  const filename = `password_${y}${mo}${d}${h}${mi}${s}.txt`;

  const blob = new Blob([text], { type: "text/plain" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
});

// 「再生成」ボタンで生成
regenBtn.addEventListener("click", generateAndDisplay);

// 最初の生成
generateAndDisplay();
