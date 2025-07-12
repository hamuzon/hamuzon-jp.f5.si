(function () {
  const dict = {
    ja: {
      title: "デバイス情報",
      os_ch: "OS情報（UA-CH）",
      os_ua: "OS情報（User-Agent）",
      browser_ch: "ブラウザ情報（UA-CH）",
      browser_ua: "ブラウザ情報（User-Agent）",
      category: {
        os: "OS情報",
        browser: "ブラウザ情報",
        screen: "画面情報",
        cpu: "CPU・メモリ",
        network: "ネットワーク情報",
        other: "その他情報"
      },
      os: "OS名", version: "バージョン", device: "端末名", browser: "ブラウザ", browserVersion: "バージョン", ua: "ユーザーエージェント",
      screen: "画面解像度", viewport: "ビューポート", colorDepth: "色深度", pixelDepth: "ピクセル深度",
      cpu: "CPUコア数", cpuName: "CPU名", memory: "メモリ(概算)", ipv4: "IPv4アドレス", ipv6: "IPv6アドレス", ip: "現在使用IP",
      online: "オンライン状態", language: "ブラウザ言語", cookiesEnabled: "クッキー有効", fetchedAt: "取得時刻", now: "現在時刻", timezone: "タイムゾーン",
      unknown: "不明", not_available: "取得不可", online_yes: "オンライン", online_no: "オフライン",
      light: "ライト",
      dark: "ダーク",
      footer: {
        copyright: "© 2025 device-info",
        warning: "表示される情報は一部、正確でない可能性があります。",
        library: `使用ライブラリ: 
          <a href="https://www.ipify.org/" target="_blank" rel="noopener noreferrer">ipify API</a>,
          <a href="https://developer.mozilla.org/ja/docs/Web/API/Device_Memory_API" target="_blank" rel="noopener noreferrer">Device Memory API</a>,
          <a href="https://developer.mozilla.org/ja/docs/Web/API" target="_blank" rel="noopener noreferrer">Web API</a>,
          <a href="https://wicg.github.io/ua-client-hints/" target="_blank" rel="noopener noreferrer">UA Client Hints</a>`
      }
    },
    en: {
      title: "Device Information",
      os_ch: "OS Information (UA-CH)",
      os_ua: "OS Information (User-Agent)",
      browser_ch: "Browser Information (UA-CH)",
      browser_ua: "Browser Information (User-Agent)",
      category: {
        os: "OS Information",
        browser: "Browser Information",
        screen: "Screen Information",
        cpu: "CPU & Memory",
        network: "Network Information",
        other: "Other Information"
      },
      os: "Operating System", version: "Version", device: "Device Name", browser: "Browser", browserVersion: "Version", ua: "User Agent",
      screen: "Screen Resolution", viewport: "Viewport", colorDepth: "Color Depth", pixelDepth: "Pixel Depth",
      cpu: "CPU Cores", cpuName: "CPU Name", memory: "Memory (approx.)", ipv4: "IPv4 Address", ipv6: "IPv6 Address", ip: "Current IP",
      online: "Online Status", language: "Browser Language", cookiesEnabled: "Cookies Enabled", fetchedAt: "Fetched At", now: "Current Time", timezone: "Timezone",
      unknown: "Unknown", not_available: "Not available", online_yes: "Online", online_no: "Offline",
      light: "Light",
      dark: "Dark",
      footer: {
        copyright: "© 2025 device-info",
        warning: "Displayed information may not be accurate.",
        library: `Libraries used: 
          <a href="https://www.ipify.org/" target="_blank" rel="noopener noreferrer">ipify API</a>,
          <a href="https://developer.mozilla.org/en-US/docs/Web/API/Device_Memory_API" target="_blank" rel="noopener noreferrer">Device Memory API</a>,
          <a href="https://developer.mozilla.org/en-US/docs/Web/API" target="_blank" rel="noopener noreferrer">Web API</a>,
          <a href="https://wicg.github.io/ua-client-hints/" target="_blank" rel="noopener noreferrer">UA Client Hints</a>`
      }
    }
  };

  // 言語自動判定
  let currentLang = localStorage.getItem("lang");
  if (!currentLang) {
    currentLang = navigator.language && navigator.language.startsWith("ja") ? "ja" : "en";
    localStorage.setItem("lang", currentLang);
  }
  // ダーク/ライトモード自動
  let darkMode = localStorage.getItem("mode") === "dark" ||
    (localStorage.getItem("mode") === null && window.matchMedia('(prefers-color-scheme: dark)').matches);

  // 要素取得
  const titleEl = document.getElementById('title');
  const btnJa = document.getElementById('btn-ja');
  const btnEn = document.getElementById('btn-en');
  const btnLight = document.getElementById('btn-light');
  const btnDark = document.getElementById('btn-dark');
  const favicon = document.getElementById('favicon');
  const footerCopyright = document.getElementById('footer-copyright');
  const footerWarning = document.getElementById('footer-warning');
  const footerLibrary = document.getElementById('footer-library');
  const tables = {
    os_ua_ch: document.getElementById('table-os-ua-ch'),
    os_ua: document.getElementById('table-os-ua'),
    browser_ua_ch: document.getElementById('table-browser-ua-ch'),
    browser_ua: document.getElementById('table-browser-ua'),
    screen: document.getElementById('table-screen'),
    cpu: document.getElementById('table-cpu'),
    network: document.getElementById('table-network'),
    other: document.getElementById('table-other')
  };
  const osUaChLabel = document.getElementById('os-ua-ch-label');
  const osUaLabel = document.getElementById('os-ua-label');
  const browserUaChLabel = document.getElementById('browser-ua-ch-label');
  const browserUaLabel = document.getElementById('browser-ua-label');
  const sectionTitles = {
    os: document.getElementById('cat-os'),
    browser: document.getElementById('cat-browser'),
    screen: document.getElementById('cat-screen'),
    cpu: document.getElementById('cat-cpu'),
    network: document.getElementById('cat-network'),
    other: document.getElementById('cat-other')
  };

  async function getOsBrowserByUACh() {
    const result = { os: "", version: "", device: "", browser: "", browserVersion: "" };
    if (navigator.userAgentData && navigator.userAgentData.getHighEntropyValues) {
      try {
        const ch = await navigator.userAgentData.getHighEntropyValues([
          "platform", "platformVersion", "model", "uaFullVersion"
        ]);
        result.os = ch.platform || "";
        result.version = ch.platformVersion || "";
        result.device = ch.model || "";
        if (navigator.userAgentData.brands && navigator.userAgentData.brands.length) {
          const b = navigator.userAgentData.brands.find(x => !/Not.?A.?Brand/i.test(x.brand));
          if (b) {
            result.browser = b.brand;
            result.browserVersion = b.version;
          }
        }
      } catch(e) { }
    }
    return result;
  }
  function getOsBrowserByUA() {
    const ua = navigator.userAgent;
    let os = dict[currentLang].unknown, version = dict[currentLang].unknown, device = dict[currentLang].unknown;
    if (/Android/.test(ua)) {
      os = "Android";
      version = (ua.match(/Android\s+([\d.]+)/)||[])[1]||version;
      device = (ua.match(/;\s?([^;\/]+)\s+Build/i)||[])[1]||device;
    } else if (/iPhone|iPad|iPod/.test(ua)) {
      version = (ua.match(/OS (\d+)[_.](\d+)/)||[])[1]||version;
      device = /iPhone/.test(ua) ? "iPhone" : "iPad";
      os = device === "iPhone" ? "iOS" : "iPadOS";
    } else if (/Windows NT/.test(ua)) {
      const ver = (ua.match(/Windows NT ([\d.]+)/)||[])[1];
      const map = { "10.0": "10 / 11", "6.3": "8.1", "6.2": "8", "6.1": "7", "6.0": "Vista", "5.1": "XP" };
      os = "Windows";
      version = map[ver]||ver||version;
      device = "PC";
    } else if (/Mac OS X/.test(ua)) {
      os = "macOS";
      version = (ua.match(/Mac OS X (\d+[_\.]\d+)/)||[])[1]?.replace(/_/g,".")||version;
      device = "Mac";
    } else if (/Linux/.test(navigator.platform)) {
      os = "Linux";
      device = currentLang === "ja" ? "Linux端末" : "Linux device";
    }
    let browser = dict[currentLang].unknown, bver = dict[currentLang].unknown;
    if (/Edg\//.test(ua)) { browser = "Microsoft Edge"; bver = (ua.match(/Edg\/([\d\.]+)/)||[])[1]||bver;}
    else if (/OPR\//.test(ua)) { browser = "Opera"; bver = (ua.match(/OPR\/([\d\.]+)/)||[])[1]||bver;}
    else if (/Chrome\//.test(ua)) { browser = "Chrome"; bver = (ua.match(/Chrome\/([\d\.]+)/)||[])[1]||bver;}
    else if (/Firefox\//.test(ua)) { browser = "Firefox"; bver = (ua.match(/Firefox\/([\d\.]+)/)||[])[1]||bver;}
    else if (/Safari/.test(ua) && !/Chrome/.test(ua)) { browser = "Safari"; bver = (ua.match(/Version\/([\d\.]+)/)||[])[1]||bver;}
    return { os, version, device, browser, browserVersion: bver };
  }
  function getCpuNameByUA() {
    const ua = navigator.userAgent;
    if (/arm|aarch64/i.test(ua)) return currentLang === "ja" ? "ARM (推定)" : "ARM (Estimated)";
    if (/x86_64|Win64|WOW64|amd64/i.test(ua)) return currentLang === "ja" ? "x64 (推定)" : "x64 (Estimated)";
    if (/i686|i386|x86/i.test(ua)) return currentLang === "ja" ? "x86 (推定)" : "x86 (Estimated)";
    if (/PPC|PowerPC/i.test(ua)) return currentLang === "ja" ? "PowerPC (推定)" : "PowerPC (Estimated)";
    if (/mips/i.test(ua)) return currentLang === "ja" ? "MIPS (推定)" : "MIPS (Estimated)";
    return dict[currentLang].not_available;
  }
  function createRow(label, value) {
    const row = document.createElement('tr');
    row.innerHTML = `<th scope="row">${label}</th><td>${value||dict[currentLang].unknown}</td>`;
    return row;
  }
  async function fetchIPData() {
    const ipv4 = await fetch('https://api.ipify.org?format=json')
      .then(res => res.json()).then(data => data.ip || dict[currentLang].unknown)
      .catch(() => dict[currentLang].unknown);
    const ipv6 = await fetch('https://api64.ipify.org?format=json')
      .then(res => res.json()).then(data => data.ip || dict[currentLang].unknown)
      .catch(() => dict[currentLang].unknown);
    const currentIP = ipv6 && ipv6 !== dict[currentLang].unknown ? ipv6 : ipv4;
    return { ipv4, ipv6, currentIP };
  }
  async function updateInfo() {
    const lang = dict[currentLang];
    Object.values(tables).forEach(tbl => tbl.innerHTML = '');
    const [osch, osua] = await Promise.all([getOsBrowserByUACh(), getOsBrowserByUA()]);
    osUaChLabel.textContent = lang.os_ch;
    [
      [lang.os, osch.os || lang.unknown],
      [lang.version, osch.version || lang.unknown],
      [lang.device, osch.device || lang.unknown]
    ].forEach(([l,v]) => tables.os_ua_ch.appendChild(createRow(l,v)));
    osUaLabel.textContent = lang.os_ua;
    [
      [lang.os, osua.os],
      [lang.version, osua.version],
      [lang.device, osua.device]
    ].forEach(([l,v]) => tables.os_ua.appendChild(createRow(l,v)));
    browserUaChLabel.textContent = lang.browser_ch;
    [
      [lang.browser, osch.browser || lang.unknown],
      [lang.browserVersion, osch.browserVersion || lang.unknown]
    ].forEach(([l,v]) => tables.browser_ua_ch.appendChild(createRow(l,v)));
    browserUaLabel.textContent = lang.browser_ua;
    [
      [lang.browser, osua.browser],
      [lang.browserVersion, osua.browserVersion]
    ].forEach(([l,v]) => tables.browser_ua.appendChild(createRow(l,v)));
    // 画面
    const screenRes = `${screen.width} x ${screen.height}`;
    const viewport = `${window.innerWidth} x ${window.innerHeight}`;
    const colorDepth = screen.colorDepth;
    const pixelDepth = screen.pixelDepth;
    [
      [lang.screen, screenRes],
      [lang.viewport, viewport],
      [lang.colorDepth, colorDepth],
      [lang.pixelDepth, pixelDepth]
    ].forEach(([l,v]) => tables.screen.appendChild(createRow(l,v)));
    // CPU・メモリ
    const cpuCores = typeof navigator.hardwareConcurrency === "number" ? navigator.hardwareConcurrency : lang.unknown;
    let memory = lang.unknown;
    if (typeof navigator.deviceMemory === "number") {
      memory = `${navigator.deviceMemory} GB`;
    }
    [
      [lang.cpu, cpuCores],
      [lang.cpuName, getCpuNameByUA()],
      [lang.memory, memory]
    ].forEach(([l,v]) => tables.cpu.appendChild(createRow(l,v)));
    // ネットワーク
    const { ipv4, ipv6, currentIP } = await fetchIPData();
    const onlineStatus = navigator.onLine ? lang.online_yes : lang.online_no;
    [
      [lang.ipv4, ipv4],
      [lang.ipv6, ipv6],
      [lang.ip, currentIP],
      [lang.online, onlineStatus]
    ].forEach(([l,v]) => tables.network.appendChild(createRow(l,v)));
    // その他
    const language = navigator.language || lang.unknown;
    const cookiesEnabled = navigator.cookieEnabled ? lang.online_yes : lang.online_no;
    const fetchedAt = new Date();
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || lang.unknown;
    [
      [lang.language, language],
      [lang.cookiesEnabled, cookiesEnabled],
      [lang.fetchedAt, fetchedAt.toLocaleString()],
      [lang.now, ''],
      [lang.timezone, timezone]
    ].forEach(([l,v]) => tables.other.appendChild(createRow(l,v)));
    // フッター
    footerCopyright.textContent = lang.footer.copyright;
    footerWarning.textContent = lang.footer.warning;
    footerLibrary.innerHTML = lang.footer.library;
  }
  function updateCurrentTime() {
    const nowStr = new Date().toLocaleString();
    const rows = tables.other.querySelectorAll('tr');
    for (const row of rows) {
      if (row.firstElementChild?.textContent === dict[currentLang].now) {
        row.lastElementChild.textContent = nowStr;
        break;
      }
    }
  }
  function setLang(lang) {
    currentLang = lang;
    localStorage.setItem("lang", lang);
    titleEl.textContent = dict[lang].title;
    Object.entries(dict[lang].category).forEach(([key, label]) => {
      if (sectionTitles[key]) sectionTitles[key].textContent = label;
    });
    btnJa.classList.toggle('active', lang === 'ja');
    btnEn.classList.toggle('active', lang === 'en');
    btnJa.setAttribute('aria-pressed', lang === 'ja');
    btnEn.setAttribute('aria-pressed', lang === 'en');
    btnLight.textContent = dict[lang].light + " / Light";
    btnDark.textContent = dict[lang].dark + " / Dark";
    document.body.setAttribute("lang", lang);
    updateInfo();
  }
  function setMode(isDark) {
    darkMode = isDark;
    localStorage.setItem("mode", isDark ? "dark" : "light");
    document.body.classList.toggle('light', !darkMode);
    btnLight.classList.toggle('active', !darkMode);
    btnDark.classList.toggle('active', darkMode);
    btnLight.setAttribute('aria-pressed', !darkMode);
    btnDark.setAttribute('aria-pressed', darkMode);
    favicon.href = isDark ? 'icon-dark.png' : 'icon-light.png';
  }
  btnJa.addEventListener('click', () => setLang('ja'));
  btnEn.addEventListener('click', () => setLang('en'));
  btnLight.addEventListener('click', () => setMode(false));
  btnDark.addEventListener('click', () => setMode(true));
  setMode(darkMode);
  setLang(currentLang);
  setInterval(updateCurrentTime, 1000);

  // 言語ごとに単一言語だけ表示にする（混在部も切替）
  function toggleLanguageOnlyDisplay(lang) {
    for (const key in sectionTitles) {
      const h2 = sectionTitles[key];
      if (!h2) continue;
      h2.textContent = dict[lang].category[key];
    }
    btnLight.textContent = dict[lang].light;
    btnDark.textContent = dict[lang].dark;
  }
  btnJa.addEventListener('click', () => toggleLanguageOnlyDisplay('ja'));
  btnEn.addEventListener('click', () => toggleLanguageOnlyDisplay('en'));
  toggleLanguageOnlyDisplay(currentLang);
})();