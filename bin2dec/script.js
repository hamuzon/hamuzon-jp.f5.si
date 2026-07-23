const inBin = document.getElementById('inBin');
const inDec = document.getElementById('inDec');
const outBin = document.getElementById('outBin');
const outDec = document.getElementById('outDec');
const themeSelect = document.getElementById('themeSelect');

const updateBinToDec = () => {
    let val = inBin.value.replace(/[^01-]/g, '');
    if (val.indexOf('-') > 0) val = val.replace(/-/g, '');
    inBin.value = val;

    if (!val || val === '-') {
        outBin.innerText = '-';
        return;
    }

    let dec = parseInt(val, 2);
    if (val[0] === '1' && val.length > 1) dec -= Math.pow(2, val.length);
    outBin.innerText = dec;
};

const updateDecToBin = () => {
    let val = inDec.value.replace(/[^0-9-]/g, '');
    if (val.indexOf('-') > 0) val = val.replace(/-/g, '');
    inDec.value = val;

    const num = parseInt(val, 10);
    if (isNaN(num)) {
        outDec.innerText = '-';
        return;
    }

    if (num >= 0) {
        outDec.innerText = '0' + num.toString(2);
    } else {
        const bits = Math.max(num.toString(2).length, 2);
        outDec.innerText = (num >>> 0).toString(2).slice(-bits);
    }
};

const formatBinaryWithPadding = (number, minLength) => {
    let binStr = "";
    if (number >= 0) {
        binStr = "0" + number.toString(2);
    } else {
        const bits = Math.max(number.toString(2).length, 2);
        binStr = (number >>> 0).toString(2).slice(-bits);
    }

    if (binStr.length < minLength) {
        const padChar = binStr[0] === '1' ? '1' : '0';
        return binStr.padStart(minLength, padChar);
    }
    return binStr;
};

const handleStep = (e, type) => {
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        e.preventDefault();
        if (type === 'bin') {
            const currentLen = inBin.value.length;
            let curDec = parseInt(outBin.innerText, 10) || 0;
            const nextDec = e.key === 'ArrowUp' ? curDec + 1 : curDec - 1;
            inBin.value = formatBinaryWithPadding(nextDec, currentLen);
            updateBinToDec();
        } else {
            let curDec = parseInt(inDec.value, 10) || 0;
            inDec.value = e.key === 'ArrowUp' ? curDec + 1 : curDec - 1;
            updateDecToBin();
        }
    }
};

inBin.oninput = updateBinToDec;
inDec.oninput = updateDecToBin;
inBin.onkeydown = (e) => handleStep(e, 'bin');
inDec.onkeydown = (e) => handleStep(e, 'dec');

const switchTab = (isBin) => {
    document.getElementById('panelBin').classList.toggle('is-hidden', !isBin);
    document.getElementById('panelDec').classList.toggle('is-hidden', isBin);
    document.getElementById('tabBin').className = isBin ? 'active' : '';
    document.getElementById('tabDec').className = isBin ? '' : 'active';
};

document.getElementById('tabBin').onclick = () => switchTab(true);
document.getElementById('tabDec').onclick = () => switchTab(false);

const applyTheme = (mode) => {
    let target = mode;
    if (mode === 'system') {
        target = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    document.documentElement.className = target;
};

themeSelect.onchange = (e) => {
    localStorage.setItem('tool_theme', e.target.value);
    applyTheme(e.target.value);
};

window.onload = () => {
    const baseYear = 2025;
    const currentYear = new Date().getFullYear();
    const hostname = location.hostname;
    const footer = document.getElementById("footer-copy");

    let copyrightYear = currentYear > baseYear ? `${baseYear}~${currentYear}` : `${baseYear}`;
    let footerHTML = `&copy; ${copyrightYear} `;

    if (hostname.includes("hamuzon-jp.f5.si") || hostname.includes("hamuzon.web.fc2.com") || hostname.includes("hamuzon.github.io")) {
        footerHTML += `<a href="#" target="_blank">@hamuzon</a>`;
    } else if (hostname.includes("hamusata.f5.si")) {
        footerHTML += `<a href="#" target="_blank">@hamusata</a>`;
    } else {
        footerHTML += `Binary &harr; Decimal Converter`;
    }

    if (footer) footer.innerHTML = footerHTML;

    const saved = localStorage.getItem('tool_theme') || 'system';
    themeSelect.value = saved;
    applyTheme(saved);
};

window.matchMedia('(prefers-color-scheme: dark)').onchange = () => {
    if (themeSelect.value === 'system') applyTheme('system');
};
