(function() {
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
        other: "その他情報",
        battery: "バッテリー情報"
      },
      os: `<span class="selectable">OS名</span>`,
      version: `<span class="selectable">バージョン</span>`,
      device: `<span class="selectable">端末名</span>`,
      browser: `<span class="selectable">ブラウザ</span>`,
      browserVersion: `<span class="selectable">バージョン</span>`,
      ua: `<span class="selectable">ユーザーエージェント</span>`,
      screen: `<span class="selectable">画面解像度</span>`,
      viewport: `<span class="selectable">ビューポート</span>`,
      colorDepth: `<span class="selectable">色深度</span>`,
      pixelDepth: `<span class="selectable">ピクセル深度</span>`,
      cpu: `<span class="selectable">CPUコア数</span>`,
      cpuName: `<span class="selectable">CPU名</span>`,
      memory: `<span class="selectable">メモリ：最大 8GBまで</span>`,
      gpu: `<span class="selectable">GPU名</span>`,
      ipv4: `<span class="selectable">IPv4アドレス</span>`,
      ipv6: `<span class="selectable">IPv6アドレス</span>`,
      ip: `<span class="selectable">現在使用IP</span>`,
      online: `<span class="selectable">オンライン状態</span>`,
      language: `<span class="selectable">ブラウザ言語</span>`,
      fetchedAt: `<span class="selectable">取得時刻</span>`,
      now: `<span class="selectable">現在時刻</span>`,
      timezone: `<span class="selectable">タイムゾーン</span>`,
      batteryLevel: `<span class="selectable">バッテリー残量</span>`,
      batteryCharging: `<span class="selectable">充電状態</span>`,
      unknown: `<span class="selectable">不明</span>`,
      online_yes: `<span class="selectable">オンライン</span>`,
      online_no: `<span class="selectable">オフライン</span>`,
      light: "ライト",
      dark: "ダーク",
      footer: {
        copyright: "&copy; 2025 device-info",
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
        other: "Other Information",
        battery: "Battery Information"
      },
      os: `<span class="selectable">Operating System</span>`,
      version: `<span class="selectable">Version</span>`,
      device: `<span class="selectable">Device Name</span>`,
      browser: `<span class="selectable">Browser</span>`,
      browserVersion: `<span class="selectable">Version</span>`,
      ua: `<span class="selectable">User Agent</span>`,
      screen: `<span class="selectable">Screen Resolution</span>`,
      viewport: `<span class="selectable">Viewport</span>`,
      colorDepth: `<span class="selectable">Color Depth</span>`,
      pixelDepth: `<span class="selectable">Pixel Depth</span>`,
      cpu: `<span class="selectable">CPU Cores</span>`,
      cpuName: `<span class="selectable">CPU Name</span>`,
      memory: `<span class="selectable">Memory: Max 8GB</span>`,
      gpu: `<span class="selectable">GPU Name</span>`,
      ipv4: `<span class="selectable">IPv4 Address</span>`,
      ipv6: `<span class="selectable">IPv6 Address</span>`,
      ip: `<span class="selectable">Current IP</span>`,
      online: `<span class="selectable">Online Status</span>`,
      language: `<span class="selectable">Browser Language</span>`,
      fetchedAt: `<span class="selectable">Fetched At</span>`,
      now: `<span class="selectable">Current Time</span>`,
      timezone: `<span class="selectable">Timezone</span>`,
      batteryLevel: `<span class="selectable">Battery Level</span>`,
      batteryCharging: `<span class="selectable">Charging Status</span>`,
      unknown: `<span class="selectable">Unknown</span>`,
      online_yes: `<span class="selectable">Online</span>`,
      online_no: `<span class="selectable">Offline</span>`,
      light: "Light",
      dark: "Dark",
      footer: {
        copyright: "&copy; 2025 device-info",
        warning: "Displayed information may not be accurate.",
        library: `Libraries used: 
          <a href="https://www.ipify.org/" target="_blank" rel="noopener noreferrer">ipify API</a>,
          <a href="https://developer.mozilla.org/en-US/docs/Web/API/Device_Memory_API" target="_blank" rel="noopener noreferrer">Device Memory API</a>,
          <a href="https://developer.mozilla.org/en-US/docs/Web/API" target="_blank" rel="noopener noreferrer">Web API</a>,
          <a href="https://wicg.github.io/ua-client-hints/" target="_blank" rel="noopener noreferrer">UA Client Hints</a>`
      }
    }
  };

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
    other: document.getElementById('table-other'),
    battery: document.getElementById('table-battery')
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
    other: document.getElementById('cat-other'),
    battery: document.getElementById('cat-battery')
  };

  let currentLang = localStorage.getItem("lang") || (navigator.language.startsWith("ja") ? "ja" : "en");
  let darkMode = localStorage.getItem("mode") === "dark" || (localStorage.getItem("mode") === null && window.matchMedia('(prefers-color-scheme: dark)').matches);

  async function getOsBrowserByUACh() {
    const result = { os: "", version: "", device: "", browser: "", browserVersion: "" };
    if (navigator.userAgentData?.getHighEntropyValues) {
      try {
        const ch = await navigator.userAgentData.getHighEntropyValues(["platform","platformVersion","model","uaFullVersion"]);
        result.os = ch.platform || "";
        result.version = ch.platformVersion || "";
        result.device = ch.model || "";
        if (navigator.userAgentData.brands?.length) {
          const b = navigator.userAgentData.brands.find(x => !/Not.?A.?Brand/i.test(x.brand));
          if (b) { result.browser = b.brand; result.browserVersion = b.version; }
        }
      } catch(e){}
    }
    return result;
  }

  function getOsBrowserByUA() {
    const ua = navigator.userAgent;
    let os = dict[currentLang].unknown, version = dict[currentLang].unknown, device = dict[currentLang].unknown;
    if (/Android/.test(ua)) { os="Android"; version=(ua.match(/Android\s+([\d.]+)/)||[])[1]||version; device=(ua.match(/;\s?([^;\/]+)\s+Build/i)||[])[1]||device; }
    else if (/iPhone|iPad|iPod/.test(ua)) { version=(ua.match(/OS (\d+)[_.](\d+)/)||[])[1]||version; device=/iPhone/.test(ua)?"iPhone":"iPad"; os=device==="iPhone"?"iOS":"iPadOS"; }
    else if (/Windows NT/.test(ua)) { const ver=(ua.match(/Windows NT ([\d.]+)/)||[])[1]; const map={"10.0":"10 / 11","6.3":"8.1","6.2":"8","6.1":"7","6.0":"Vista","5.1":"XP"}; os="Windows"; version=map[ver]||ver||version; device="PC"; }
    else if (/Mac OS X/.test(ua)) { os="macOS"; version=(ua.match(/Mac OS X (\d+[_\.]\d+)/)||[])[1]?.replace(/_/g,".")||version; device="Mac"; }
    else if (/Linux/.test(navigator.platform)) { os="Linux"; device=currentLang==="ja"?"Linux端末":"Linux device"; }
    let browser=dict[currentLang].unknown,bver=dict[currentLang].unknown;
    if (/Edg\//.test(ua)) browser="Microsoft Edge", bver=(ua.match(/Edg\/([\d\.]+)/)||[])[1]||bver;
    else if (/OPR\//.test(ua)) browser="Opera", bver=(ua.match(/OPR\/([\d\.]+)/)||[])[1]||bver;
    else if (/Chrome\//.test(ua)) browser="Chrome", bver=(ua.match(/Chrome\/([\d\.]+)/)||[])[1]||bver;
    else if (/Firefox\//.test(ua)) browser="Firefox", bver=(ua.match(/Firefox\/([\d\.]+)/)||[])[1]||bver;
    else if (/Safari/.test(ua) && !/Chrome/.test(ua)) browser="Safari", bver=(ua.match(/Version\/([\d\.]+)/)||[])[1]||bver;
    return { os, version, device, browser, browserVersion:bver };
  }

  function getCpuNameByUA() {
    const ua = navigator.userAgent;
    if (/arm|aarch64/i.test(ua)) return currentLang==="ja"?`ARM (推定)`:`ARM (Estimated)`;
    if (/x86_64|Win64|WOW64|amd64/i.test(ua)) return currentLang==="ja"?`x64 (推定)`:`x64 (Estimated)`;
    if (/i686|i386|x86/i.test(ua)) return currentLang==="ja"?`x86 (推定)`:`x86 (Estimated)`;
    if (/PPC|PowerPC/i.test(ua)) return currentLang==="ja"?`PowerPC (推定)`:`PowerPC (Estimated)`;
    if (/mips/i.test(ua)) return currentLang==="ja"?`MIPS (推定)`:`MIPS (Estimated)`;
    return dict[currentLang].unknown;
  }

  function getGPUName() {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) return dict[currentLang].unknown;
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    if (debugInfo) return gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || dict[currentLang].unknown;
    return dict[currentLang].unknown;
  }

  function createRow(label,value){
    const row=document.createElement('tr');
    row.innerHTML=`<th scope="row">${label}</th><td>${value||dict[currentLang].unknown}</td>`;
    return row;
  }

  async function fetchIPData() {
    const ipv4 = await fetch('https://api.ipify.org?format=json').then(res=>res.json()).then(d=>d.ip||dict[currentLang].unknown).catch(()=>dict[currentLang].unknown);
    const ipv6 = await fetch('https://api6.ipify.org/?format=json').then(res=>res.json()).then(d=>d.ip||dict[currentLang].unknown).catch(()=>dict[currentLang].unknown);
    const currentIP = await fetch('https://api64.ipify.org?format=json').then(res=>res.json()).then(d=>d.ip||dict[currentLang].unknown).catch(()=>dict[currentLang].unknown);
    return { ipv4, ipv6, currentIP };
  }

  async function updateBattery() {
    if(!navigator.getBattery) return { level: dict[currentLang].unknown, charging: dict[currentLang].unknown };
    try {
      const battery = await navigator.getBattery();
      const level = Math.round(battery.level*100)+'%';
      const charging = battery.charging ? dict[currentLang].online_yes : dict[currentLang].online_no;
      return { level, charging };
    } catch(e){ return { level: dict[currentLang].unknown, charging: dict[currentLang].unknown }; }
  }

  async function updateInfo() {
    const lang = dict[currentLang];
    Object.values(tables).forEach(tbl=>tbl.innerHTML='');
    const [osch, osua] = await Promise.all([getOsBrowserByUACh(), getOsBrowserByUA()]);
    const ipData = await fetchIPData();
    const batteryData = await updateBattery();

    osUaChLabel.innerHTML = lang.os_ch;
    [[lang.os,osch.os||lang.unknown],[lang.version,osch.version||lang.unknown],[lang.device,osch.device||lang.unknown]].forEach(([l,v])=>tables.os_ua_ch.appendChild(createRow(l,v)));

    osUaLabel.innerHTML = lang.os_ua;
    [[lang.os,osua.os],[lang.version,osua.version],[lang.device,osua.device]].forEach(([l,v])=>tables.os_ua.appendChild(createRow(l,v)));

    browserUaChLabel.innerHTML = lang.browser_ch;
    [[lang.browser,osch.browser||lang.unknown],[lang.browserVersion,osch.browserVersion||lang.unknown]].forEach(([l,v])=>tables.browser_ua_ch.appendChild(createRow(l,v)));

    browserUaLabel.innerHTML = lang.browser_ua;
    [[lang.browser,osua.browser],[lang.browserVersion,osua.browserVersion]].forEach(([l,v])=>tables.browser_ua.appendChild(createRow(l,v)));

    [[lang.screen,`${screen.width} x ${screen.height}`],[lang.viewport,`${window.innerWidth} x ${window.innerHeight}`],[lang.colorDepth,screen.colorDepth],[lang.pixelDepth,screen.pixelDepth]].forEach(([l,v])=>tables.screen.appendChild(createRow(l,v)));

    const cpuCores = typeof navigator.hardwareConcurrency==="number"?navigator.hardwareConcurrency:lang.unknown;
    const memory = typeof navigator.deviceMemory==="number"?`${Math.min(navigator.deviceMemory,8)} GB`:lang.unknown;
    const gpuName = getGPUName();
    [[lang.cpu,cpuCores],[lang.cpuName,getCpuNameByUA()],[lang.memory,memory],[lang.gpu,gpuName]].forEach(([l,v])=>tables.cpu.appendChild(createRow(l,v)));

    [[lang.ipv4, ipData.ipv4],[lang.ipv6, ipData.ipv6],[lang.ip, ipData.currentIP]].forEach(([label, ip]) => { tables.network.appendChild(createRow(label, ip)); });
    tables.network.appendChild(createRow(lang.online, navigator.onLine?lang.online_yes:lang.online_no));

    [[lang.language,navigator.language||lang.unknown],[lang.fetchedAt,new Date().toLocaleString()],[lang.now,''],[lang.timezone,Intl.DateTimeFormat().resolvedOptions().timeZone||lang.unknown]].forEach(([l,v])=>tables.other.appendChild(createRow(l,v)));

    [[lang.batteryLevel,batteryData.level],[lang.batteryCharging,batteryData.charging]].forEach(([l,v])=>tables.battery.appendChild(createRow(l,v)));

    footerWarning.innerHTML = lang.footer.warning;
    footerLibrary.innerHTML = lang.footer.library;
  }

  function updateCurrentTime() {
    const nowStr = new Date().toLocaleString();
    const rows = tables.other.querySelectorAll('tr');
    for(const row of rows){ if(row.firstElementChild?.textContent===dict[currentLang].now.replace(/<[^>]+>/g,'')){ row.lastElementChild.textContent=nowStr; break; } }
  }

  function setLang(lang){
    currentLang=lang;
    localStorage.setItem("lang",lang);
    titleEl.textContent=dict[lang].title;
    Object.entries(dict[lang].category).forEach(([key,label])=>{ if(sectionTitles[key]) sectionTitles[key].textContent=label; });
    btnJa.classList.toggle('active',lang==='ja');
    btnEn.classList.toggle('active',lang==='en');
    btnJa.setAttribute('aria-pressed',lang==='ja');
    btnEn.setAttribute('aria-pressed',lang==='en');
    btnLight.textContent=dict[lang].light+" / Light";
    btnDark.textContent=dict[lang].dark+" / Dark";
    document.body.setAttribute("lang",lang);
    updateInfo();
  }

  function setMode(isDark){
    darkMode=isDark;
    localStorage.setItem("mode",isDark?"dark":"light");
    document.body.classList.toggle('light',!darkMode);
    btnLight.classList.toggle('active',!darkMode);
    btnDark.classList.toggle('active',darkMode);
    btnLight.setAttribute('aria-pressed',!darkMode);
    btnDark.setAttribute('aria-pressed',darkMode);
    favicon.href=isDark?'icon-dark.png':'icon-light.png';
  }

  btnJa.addEventListener('click',()=>{ setLang('ja'); });
  btnEn.addEventListener('click',()=>{ setLang('en'); });
  btnLight.addEventListener('click',()=>setMode(false));
  btnDark.addEventListener('click',()=>setMode(true));

  setMode(darkMode);
  setLang(currentLang);
  setInterval(updateCurrentTime,1000);

  (function() {
    const siteConfig = {
      "hamuzon.github.io": { baseYear: 2025, user: "@hamuzon", link: "https://hamuzon.github.io" },
      "hamusata.f5.si": { baseYear: 2025, user: "@hamusata", link: "https://hamusata.f5.si" },
      "device-info.hamusata.f5.si": { baseYear: 2025, user: "@hamusata", link: "https://hamusata.f5.si" },
      "device-info.hamuzon-jp.f5.si": { baseYear: 2025, user: "@hamuzon", link: "https://hamuzon-jp.f5.si" },
      "hamuzon-jp.f5.si": { baseYear: 2025, user: "@hamuzon", link: "https://hamuzon-jp.f5.si" },
      "default": { baseYear: 2025, user: "device-info", link: "" },
    };
    const host = window.location.hostname;
    const config = siteConfig[host] || siteConfig["default"];
    const currentYear = new Date().getFullYear();
    const yearText = currentYear > config.baseYear ? `${config.baseYear}~${currentYear}` : `${config.baseYear}`;
    if (footerCopyright) {
      if (config.link) {
        footerCopyright.innerHTML = `&copy; ${yearText} <a href="${config.link}" target="_blank" rel="noopener noreferrer">${config.user}</a> device-info`;
      } else {
        footerCopyright.innerHTML = `&copy; ${yearText} device-info`;
      }
    }
  })();
})();
