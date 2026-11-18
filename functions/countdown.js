export async function onRequest(context) {
    const { request } = context;
    const url = new URL(request.url);
    const hostname = url.hostname;

    // 末尾スラッシュがある場合はスラッシュなしにリダイレクト
    if (url.pathname.endsWith('/') && url.pathname !== '/') {
        const cleanUrl = url.toString().replace(/\/+$/, '');
        return Response.redirect(cleanUrl, 307);
    }

    const baseYear = 2025;

    // ユーザーの推定タイムゾーン（Cloudflareの位置情報、なければAsia/Tokyo）
    const userDefaultTz = request.cf?.timezone || 'Asia/Tokyo';
    const requestedTz = url.searchParams.get('tz');
    const tz = requestedTz || userDefaultTz;

    // ユーザー自身の標準タイムゾーンと同じ場合は URL から消す
    if (requestedTz && requestedTz === userDefaultTz) {
        const cleanUrl = new URL(url);
        cleanUrl.searchParams.delete('tz');
        return Response.redirect(cleanUrl.toString(), 307);
    }

    // 言語判定: ?lang=en で英語、なければ Accept-Language で判定（jaがデフォルト）
    const langParam = url.searchParams.get('lang');
    const acceptLang = request.headers.get('Accept-Language') || '';
    const isJa = langParam ? langParam !== 'en' : acceptLang.toLowerCase().includes('ja');

    // ?lang=ja はデフォルトなので URL から消す（リダイレクト）
    if (langParam === 'ja') {
        const cleanUrl = new URL(url);
        cleanUrl.searchParams.delete('lang');
        return Response.redirect(cleanUrl.toString(), 307);
    }

    const currentYear = parseInt(
        new Intl.DateTimeFormat('en-US', { year: 'numeric', timeZone: tz }).format(new Date())
    );
    const nextYear = currentYear + 1;
    const yearDisplay = currentYear > baseYear ? `${baseYear} ~ ${currentYear}` : baseYear;

    // i18n
    const t = isJa ? {
        htmlLang: 'ja',
        title: `${nextYear}年カウントダウン`,
        pageTitle: `${nextYear}年カウントダウン！`,
        desc: `${nextYear}年（来年）の元旦までの残り時間をリアルタイムでカウントダウン表示します。`,
        ogTitle: `${nextYear}年カウントダウン！`,
        ogDesc: `来年 (${nextYear})年の元旦までの残り時間をリアルタイムでカウントダウン！`,
        countText: `${nextYear}年`,
        countLabel: 'まで残り',
        dayUnit: '日',
        tzLabel: '<i class="material-icons" style="font-size:1.15rem;vertical-align:text-bottom;">language</i> タイムゾーンを選択',
        tzCurrent: `現在: ${tz}`,
        settingsTitle: '設定',
        langLabel: '<i class="material-icons" style="font-size:1.15rem;vertical-align:text-bottom;">translate</i> 言語を選択',
        nowSep: { y: '年 / ', m: '月 / ', d: '日' },
    } : {
        htmlLang: 'en',
        title: `Countdown to ${nextYear}`,
        pageTitle: `Countdown to ${nextYear}!`,
        desc: `Real-time countdown to New Year's Day ${nextYear}.`,
        ogTitle: `Countdown to ${nextYear}!`,
        ogDesc: `Real-time countdown to New Year ${nextYear}!`,
        countText: `${nextYear}`,
        countLabel: 'Time Remaining',
        dayUnit: 'd',
        tzLabel: '<i class="material-icons" style="font-size:1.15rem;vertical-align:text-bottom;">language</i> Select Timezone',
        tzCurrent: `Current: ${tz}`,
        settingsTitle: 'Settings',
        langLabel: '<i class="material-icons" style="font-size:1.15rem;vertical-align:text-bottom;">translate</i> Select Language',
        nowSep: { y: '/', m: '/', d: '' },
    };

    let copyrightContent = "";
    if (hostname.includes("hamusata.f5.si")) {
        copyrightContent = `&copy; ${yearDisplay} New Year Countdown <a href="https://hamusata.f5.si" target="_blank" rel="noopener noreferrer">@hamusata</a>`;
    } else if (hostname.includes("hamuzon-jp.f5.si")) {
        copyrightContent = `&copy; ${yearDisplay} New Year Countdown <a href="https://hamuzon-jp.f5.si" target="_blank" rel="noopener noreferrer">@hamuzon</a>`;
    } else {
        copyrightContent = `&copy; ${yearDisplay} New Year Countdown`;
    }

    const html = `<!DOCTYPE html>
<html lang="${t.htmlLang}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${t.title}</title>
<meta name="description" content="${t.desc}">
<meta property="og:title" content="${t.ogTitle}">
<meta property="og:description" content="${t.ogDesc}">
<meta property="og:type" content="website">
<meta name="twitter:card" content="summary">
<script>
    const theme = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    document.documentElement.className = theme;
</script>
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@100;700&family=Orbitron:wght@400;700&display=swap" rel="stylesheet">
<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
<style>
    html { background: #0a0a0a; }
    html.light { background: #fde2ea; }
    html.dark { background: #0a0a0a; }
    * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Noto Sans JP', 'Arial', sans-serif; }
    body {
        min-height: 100dvh; display: flex; flex-direction: column;
        justify-content: center; align-items: center; text-align: center;
        line-height: 1.4; overflow-x: hidden; font-weight: 500;
        transition: background-color 0.3s, color 0.3s;
        font-size: clamp(0.9rem, 1.5vw, 1.1rem); background-attachment: fixed;
    }
    .light body {
        background: radial-gradient(ellipse 80% 60% at 70% 20%, rgba(175, 109, 255, 0.85), transparent 68%),
            radial-gradient(ellipse 70% 60% at 20% 80%, rgba(255, 100, 180, 0.75), transparent 68%),
            radial-gradient(ellipse 60% 50% at 60% 65%, rgba(255, 235, 170, 0.98), transparent 68%),
            radial-gradient(ellipse 65% 40% at 50% 60%, rgba(120, 190, 255, 0.3), transparent 68%),
            linear-gradient(180deg, #f7eaff 0%, #fde2ea 100%);
        color: #333;
    }
    .dark body {
        background-color: #0a0a0a;
        background-image: radial-gradient(ellipse at 20% 30%, rgba(56, 189, 248, 0.4) 0%, transparent 60%),
            radial-gradient(ellipse at 80% 70%, rgba(139, 92, 246, 0.3) 0%, transparent 70%),
            radial-gradient(ellipse at 60% 20%, rgba(236, 72, 153, 0.25) 0%, transparent 50%),
            radial-gradient(ellipse at 40% 80%, rgba(34, 197, 94, 0.2) 0%, transparent 65%);
        color: #fff;
    }
    header {
        position: fixed; top: 0; width: 100%; padding: 1rem 0;
        background: rgba(255,255,255,0.05);
        -webkit-backdrop-filter: blur(12px);
        backdrop-filter: blur(12px);
        z-index: 10;
    }
    #page_title { font-size: clamp(1.2rem, 4vw, 2.2rem); font-weight: 600; }
    .countText {
        font-size: clamp(2.5rem, 10vw, 5rem); font-weight: bold;
        background: linear-gradient(45deg, #0089ff, #0040ff, #b03bff, #f23bff, #ff4ad2, #ff2626, #fc8c1c, #f6fc47, #6cf542, #42f566, #0089ff, #0040ff, #b03bff, #f23bff, #ff4ad2, #ff2626, #fc8c1c, #f6fc47, #6cf542, #42f566);
        background-size: 1500% 1500%;
        -webkit-background-clip: text;
        background-clip: text;
        -webkit-text-fill-color: transparent;
        animation: bggradient 30s linear infinite;
        -webkit-user-select: none;
        user-select: none;
        margin-bottom: 0.2em;
    }
    @keyframes bggradient { 0% { background-position: 0% 100%; } 100% { background-position: 83% 100%; } }
    .countLabel { font-size: clamp(1.2rem, 5vw, 2.5rem); font-weight: bold; margin-bottom: 0.5em; color: inherit; }
    .countSmall { font-size: 0.65em; font-weight: bold; color: inherit; }
    .countdown {
        font-family: 'Orbitron', 'Noto Sans JP', sans-serif;
        font-size: clamp(2.5rem, 13vw, 7rem); font-weight: bold; color: inherit;
        margin-bottom: 0.3em; line-height: 1; display: flex; flex-wrap: wrap;
        justify-content: center; align-items: center; gap: 0.2em 0.4em;
    }
    .nowTime {
        font-family: 'Orbitron', 'Noto Sans JP', sans-serif;
        font-size: clamp(0.9rem, 4vw, 2rem); font-weight: bold; color: inherit;
        margin-top: 0.3em; margin-bottom: 1em;
    }
    footer {
        position: fixed; bottom: 0; left: 0; width: 100%; text-align: center;
        padding: clamp(0.8rem, 2vw, 1.2rem) 0; font-size: clamp(0.8rem, 2vw, 1rem);
        color: inherit; background: rgba(255,255,255,0.05);
        -webkit-backdrop-filter: blur(12px);
        backdrop-filter: blur(12px);
        border-top: 1px solid rgba(255,255,255,0.2);
    }
    footer a { color: inherit; text-decoration: none; font-weight: bold; }
    @media(max-width: 480px) { .countdown { font-size: clamp(2rem, 15vw, 4rem); } }
    .time-unit { display: inline-flex; align-items: baseline; white-space: nowrap; }
    .countdownBlock { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1rem; }
    .headerControls {
        position: fixed; top: 0.6rem; right: 1rem;
        display: inline-flex; align-items: center; gap: 0.4rem; z-index: 20;
    }
    .tzHeaderBtn {
        background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2);
        padding: 0.3rem 0.75rem; border-radius: 9999px; color: inherit;
        font-size: clamp(0.75rem, 1.8vw, 0.9rem); font-weight: 600; cursor: pointer;
        display: inline-flex; align-items: center; gap: 0.3rem;
        -webkit-backdrop-filter: blur(8px);
        backdrop-filter: blur(8px);
        transition: background 0.2s, border-color 0.2s;
    }
    .tzHeaderBtn:hover { background: rgba(255, 255, 255, 0.2); border-color: rgba(255, 255, 255, 0.35); }
    .light .tzHeaderBtn { background: rgba(0, 0, 0, 0.05); border-color: rgba(0, 0, 0, 0.12); }
    .light .tzHeaderBtn:hover { background: rgba(0, 0, 0, 0.1); }
    .headerBtnIcon { font-size: 1.1rem; vertical-align: middle; }
    .settingsIconBtn {
        background: none; border: none; cursor: pointer; color: inherit;
        font-size: 1.5rem; display: flex; align-items: center;
    }
    .settingsIconBtn i { font-size: 1.8rem; }
    #tzPanel {
        display: none; position: fixed; top: 3.5rem; right: 1rem;
        background: rgba(30,30,30,0.95);
        -webkit-backdrop-filter: blur(12px);
        backdrop-filter: blur(12px);
        color: #fff; padding: 1rem 1.2rem; border-radius: 12px; z-index: 30;
        box-shadow: 0 4px 20px rgba(0,0,0,0.4);
        min-width: 320px; max-width: 92vw; max-height: 80vh;
        overflow-y: auto; text-align: left;
    }
    .panelLabel { font-weight: bold; display: block; margin-bottom: 0.4rem; }
    .panelIcon { font-size: 1.15rem; vertical-align: text-bottom; }
    .panelDetail { margin-top: 0.7rem; font-size: 0.85rem; line-height: 1.5; opacity: 0.9; }
    .panelDivider {
        border: none; border-top: 1px solid rgba(255,255,255,0.15);
        margin: 1rem 0 0.8rem 0;
    }
    #tzPanel select {
        width: 100%; padding: 0.5rem; border-radius: 6px;
        border: 1px solid #555; background: #222; color: #fff; font-size: 0.9rem;
    }
    .light #tzPanel { background: rgba(255,255,255,0.95) !important; color: #333 !important; }
    .light #tzPanel select { background: #f5f5f5; color: #333; border-color: #ccc; }
    .light .panelDivider { border-top-color: rgba(0,0,0,0.12); }
    .newYearBlock {
        font-size: clamp(1.5rem, 6vw, 3.5rem);
        line-height: 1.6;
        text-align: center;
    }
    .newYearYear {
        font-size: clamp(2rem, 8vw, 5rem);
    }
</style>
</head>
<body>
    <header>
        <h1 id="page_title">${t.pageTitle}</h1>
        <div class="headerControls">
            <button id="tzHeaderBtn" title="${t.settingsTitle}" class="tzHeaderBtn">
                <i class="material-icons headerBtnIcon">schedule</i> <span id="tzHeaderName">${tz}</span>
            </button>
            <button id="tzSettingsBtn" title="${t.settingsTitle}" class="settingsIconBtn">
                <i class="material-icons">settings</i>
            </button>
        </div>
    </header>

    <!-- 設定パネル -->
    <div id="tzPanel">
        <label for="tzSelect" class="panelLabel">${t.tzLabel}</label>
        <select id="tzSelect"></select>
        <div id="tzCurrentDetail" class="panelDetail">${t.tzCurrent}</div>

        <hr class="panelDivider">

        <label for="langSelect" class="panelLabel">${t.langLabel}</label>
        <select id="langSelect">
            <option value="ja" ${isJa ? 'selected' : ''}>日本語 (Japanese)</option>
            <option value="en" ${!isJa ? 'selected' : ''}>English</option>
        </select>
    </div>

    <div class="countdownBlock">
        <span class="countText">${t.countText}</span>
        <span class="countLabel">${t.countLabel}</span>

        <div class="countdown">
            <div class="time-unit"><span class="days">0</span><span class="countSmall">${t.dayUnit}</span></div>
            <div class="time-unit"><span class="hours">00</span> :</div>
            <div class="time-unit"><span class="minutes">00</span> :</div>
            <div class="time-unit"><span class="seconds">00</span> .</div>
            <div class="time-unit"><span class="milliseconds">00</span></div>
        </div>

        <div class="nowTime">
            <span class="nowYear">0</span>${t.nowSep.y}
            <span class="nowMonth">0</span>${t.nowSep.m}
            <span class="nowDay">0</span>${t.nowSep.d}&nbsp;
            <span class="nowHour">00</span> :
            <span class="nowMinute">00</span> :
            <span class="nowSecond">00</span>
        </div>
    </div>

    <footer id="footer-copy">
        ${copyrightContent}
    </footer>

    <script>
        const isJa = ${isJa};
        
        // 端末（ユーザー）のローカルタイムゾーンを自動検出
        const browserTz = (function() {
            try {
                return Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Tokyo';
            } catch(e) {
                return 'Asia/Tokyo';
            }
        })();

        // URLパラメータ指定があればそれを使い、なければユーザー自身のタイムゾーンを使用
        const urlParams = new URLSearchParams(location.search);
        const currentTz = urlParams.get('tz') || browserTz;

        let lastYearNum = 0;
        let timeOffset = 0;
        let newYearShown = false;

        // 主要都市・地域の和名辞書
        const CITY_JA = {
            'Asia/Tokyo': '東京（日本）',
            'Asia/Seoul': 'ソウル（韓国）',
            'Asia/Shanghai': '北京 / 上海（中国）',
            'Asia/Hong_Kong': '香港',
            'Asia/Taipei': '台北（台湾）',
            'Asia/Singapore': 'シンガポール',
            'Asia/Manila': 'マニラ（フィリピン）',
            'Asia/Bangkok': 'バンコク（タイ）',
            'Asia/Jakarta': 'ジャカルタ（インドネシア）',
            'Asia/Ho_Chi_Minh': 'ホーチミン（ベトナム）',
            'Asia/Kolkata': 'デリー / インド',
            'Asia/Dhaka': 'ダッカ（バングラデシュ）',
            'Asia/Karachi': 'カラチ（パキスタン）',
            'Asia/Kathmandu': 'カトマンズ（ネパール）',
            'Asia/Yangon': 'ヤンゴン（ミャンマー）',
            'Asia/Colombo': 'コロンボ（スリランカ）',
            'Asia/Dubai': 'ドバイ（UAE）',
            'Asia/Riyadh': 'リヤド（サウジアラビア）',
            'Asia/Tehran': 'テヘラン（イラン）',
            'Asia/Jerusalem': 'エルサレム（イスラエル）',
            'Asia/Vladivostok': 'ウラジオストク（ロシア）',
            'Asia/Ulaanbaatar': 'ウランバートル（モンゴル）',
            'Asia/Almaty': 'アルマティ（カザフスタン）',
            'Asia/Tashkent': 'タシケント（ウズベキスタン）',
            'Asia/Kamchatka': 'カムチャツカ（ロシア）',
            'Europe/London': 'ロンドン（イギリス）',
            'Europe/Dublin': 'ダブリン（アイルランド）',
            'Europe/Paris': 'パリ（フランス）',
            'Europe/Berlin': 'ベルリン（ドイツ）',
            'Europe/Rome': 'ローマ（イタリア）',
            'Europe/Madrid': 'マドリード（スペイン）',
            'Europe/Lisbon': 'リスボン（ポルトガル）',
            'Europe/Amsterdam': 'アムステルダム（オランダ）',
            'Europe/Brussels': 'ブリュッセル（ベルギー）',
            'Europe/Zurich': 'チューリッヒ（スイス）',
            'Europe/Vienna': 'ウィーン（オーストリア）',
            'Europe/Stockholm': 'ストックホルム（スウェーデン）',
            'Europe/Oslo': 'オスロ（ノルウェー）',
            'Europe/Copenhagen': 'コペンハーゲン（デンマーク）',
            'Europe/Helsinki': 'ヘルシンキ（フィンランド）',
            'Europe/Warsaw': 'ワルシャワ（ポーランド）',
            'Europe/Prague': 'プラハ（チェコ）',
            'Europe/Budapest': 'ブダペスト（ハンガリー）',
            'Europe/Athens': 'アテネ（ギリシャ）',
            'Europe/Bucharest': 'ブカレスト（ルーマニア）',
            'Europe/Moscow': 'モスクワ（ロシア）',
            'Europe/Kiev': 'キーウ（ウクライナ）',
            'Europe/Kyiv': 'キーウ（ウクライナ）',
            'Europe/Istanbul': 'イスタンブール（トルコ）',
            'America/New_York': 'ニューヨーク（米国東部）',
            'America/Detroit': 'デトロイト（米国東部）',
            'America/Chicago': 'シカゴ（米国中部）',
            'America/Denver': 'デンバー（米国山岳部）',
            'America/Phoenix': 'フェニックス（アリゾナ州）',
            'America/Los_Angeles': 'ロサンゼルス（米国西部）',
            'America/Anchorage': 'アンカレッジ（アラスカ）',
            'Pacific/Honolulu': 'ホノルル（ハワイ）',
            'America/Toronto': 'トロント（カナダ）',
            'America/Vancouver': 'バンクーバー（カナダ）',
            'America/Montreal': 'モントリオール（カナダ）',
            'America/Mexico_City': 'メキシコシティ（メキシコ）',
            'America/Sao_Paulo': 'サンパウロ（ブラジル）',
            'America/Buenos_Aires': 'ブエノスアイレス（アルゼンチン）',
            'America/Argentina/Buenos_Aires': 'ブエノスアイレス（アルゼンチン）',
            'America/Santiago': 'サンティアゴ（チリ）',
            'America/Bogota': 'ボゴタ（コロンビア）',
            'America/Lima': 'リマ（ペルー）',
            'America/Caracas': 'カラカス（ベネズエラ）',
            'America/Havana': 'ハバナ（キューバ）',
            'America/Panama': 'パナマ',
            'Africa/Cairo': 'カイロ（エジプト）',
            'Africa/Johannesburg': 'ヨハネスブルグ（南アフリカ）',
            'Africa/Nairobi': 'ナイロビ（ケニア）',
            'Africa/Lagos': 'ラゴス（ナイジェリア）',
            'Africa/Casablanca': 'カサブランカ（モロッコ）',
            'Africa/Accra': 'アクラ（ガーナ）',
            'Africa/Addis_Ababa': 'アディスアベバ（エチオピア）',
            'Australia/Sydney': 'シドニー（豪州東部）',
            'Australia/Melbourne': 'メルボルン（豪州東部）',
            'Australia/Brisbane': 'ブリスベン（豪州）',
            'Australia/Perth': 'パース（豪州西部）',
            'Australia/Adelaide': 'アデレード（豪州中部）',
            'Australia/Darwin': 'ダーウィン（豪州北部）',
            'Pacific/Auckland': 'オークランド（ニュージーランド）',
            'Pacific/Fiji': 'フィジー',
            'Pacific/Guam': 'グアム',
            'Pacific/Tahiti': 'タヒチ',
            'Pacific/Noumea': 'ニューカレドニア',
            'UTC': '協定世界時 (UTC)'
        };

        // 地名ラベルの取得（和名辞書にあれば和名、なければ英語都市名を綺麗に整形）
        function getCityDisplayName(z) {
            if (isJa && CITY_JA[z]) return CITY_JA[z];
            const parts = z.split('/');
            const raw = parts[parts.length - 1];
            return raw.replace(/_/g, ' ');
        }

        // タイムゾーン詳細情報の取得
        function getTimeZoneInfo(tzName, date) {
            const d = date || new Date();
            try {
                const parts = new Intl.DateTimeFormat(isJa ? 'ja-JP' : 'en-US', {
                    timeZone: tzName,
                    timeZoneName: 'long',
                    hour: '2-digit', minute: '2-digit', second: '2-digit',
                    hourCycle: 'h23'
                }).formatToParts(d);
                const tzLong = (parts.find(function(p) { return p.type === 'timeZoneName'; }) || {}).value || '';
                const h = (parts.find(function(p) { return p.type === 'hour'; }) || {}).value || '00';
                const m = (parts.find(function(p) { return p.type === 'minute'; }) || {}).value || '00';
                const s = (parts.find(function(p) { return p.type === 'second'; }) || {}).value || '00';

                const offParts = new Intl.DateTimeFormat('en-US', { timeZone: tzName, timeZoneName: 'longOffset' }).formatToParts(d);
                const gmt = (offParts.find(function(p) { return p.type === 'timeZoneName'; }) || {}).value || 'GMT+00:00';
                const utcOffset = gmt.replace('GMT', 'UTC');

                // オフセット（分単位）を計算（ソート用）
                let minutes = 0;
                const match = gmt.match(/GMT([+-])(\\d{2}):(\\d{2})/);
                if (match) {
                    const sign = match[1] === '-' ? -1 : 1;
                    minutes = sign * (parseInt(match[2], 10) * 60 + parseInt(match[3], 10));
                }

                return {
                    tz: tzName,
                    city: getCityDisplayName(tzName),
                    name: tzLong,
                    utcOffset: utcOffset,
                    offsetMinutes: minutes,
                    time: h + ':' + m + ':' + s,
                    shortTime: h + ':' + m
                };
            } catch(e) {
                return {
                    tz: tzName,
                    city: tzName,
                    name: tzName,
                    utcOffset: 'UTC',
                    offsetMinutes: 0,
                    time: '--:--:--',
                    shortTime: '--:--'
                };
            }
        }

        // ===== タイムゾーンリスト（Intl.supportedValuesOf で動的生成 & UTC時差順ソート） =====
        (function() {
            const sel = document.getElementById('tzSelect');
            let zones = [];
            try {
                if (typeof Intl !== 'undefined' && typeof Intl.supportedValuesOf === 'function') {
                    zones = Intl.supportedValuesOf('timeZone');
                }
            } catch(e) {}
            if (zones.length === 0) {
                zones = ['UTC','Asia/Tokyo','America/New_York','Europe/London','Europe/Paris','Asia/Singapore','Australia/Sydney'];
            }

            const now = new Date();
            const tzList = zones.map(function(z) {
                return getTimeZoneInfo(z, now);
            });

            // 時差順（西から東: UTC-12 から UTC+14）にソート
            tzList.sort(function(a, b) {
                if (a.offsetMinutes !== b.offsetMinutes) {
                    return a.offsetMinutes - b.offsetMinutes;
                }
                return a.city.localeCompare(b.city);
            });

            tzList.forEach(function(info) {
                const opt = document.createElement('option');
                opt.value = info.tz;

                // 例: "UTC+09:00 東京（日本） - 日本標準時 (Asia/Tokyo)"
                let label = info.utcOffset + ' ' + info.city;
                if (info.name && info.name !== info.city && info.name !== info.tz) {
                    label += ' - ' + info.name;
                }
                label += ' (' + info.tz + ')';

                opt.textContent = label;
                if (info.tz === currentTz) opt.selected = true;
                sel.appendChild(opt);
            });
        })();

        // 設定パネル開閉（設定ボタンとヘッダーバッジのどちらを押しても開閉）
        function toggleTzPanel() {
            const panel = document.getElementById('tzPanel');
            panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
        }
        document.getElementById('tzSettingsBtn').addEventListener('click', toggleTzPanel);
        const headerBadgeBtn = document.getElementById('tzHeaderBtn');
        if (headerBadgeBtn) {
            headerBadgeBtn.addEventListener('click', toggleTzPanel);
        }

        // タイムゾーン変更: ユーザーの端末タイムゾーンと同じなら tz パラメータをURLから消す
        document.getElementById('tzSelect').addEventListener('change', function() {
            const u = new URL(location);
            if (this.value === browserTz) {
                u.searchParams.delete('tz');
            } else {
                u.searchParams.set('tz', this.value);
            }
            location.href = u.toString();
        });

        // 言語変更: 日本語なら lang パラメータをURLから消し、英語なら ?lang=en を設定
        const langSel = document.getElementById('langSelect');
        if (langSel) {
            langSel.addEventListener('change', function() {
                const u = new URL(location);
                if (this.value === 'ja') {
                    u.searchParams.delete('lang');
                } else {
                    u.searchParams.set('lang', this.value);
                }
                location.href = u.toString();
            });
        }

        // ===== 時刻同期 =====
        async function syncTime() {
            let hostPref = null;
            try {
                const hn = location.hostname;
                if (hn.includes('hamuzon-jp.f5.si')) hostPref = 'hamuzon-jp';
                else if (hn.includes('hamusata.f5.si')) hostPref = 'hamusata';
            } catch(e) {}

            const encTz = encodeURIComponent(currentTz || 'UTC');

            const parseData = function(d) {
                if (!d) return null;
                if (typeof d.unix_ms === 'number') return d.unix_ms;
                if (typeof d.unixtime === 'number') return d.unixtime * 1000;
                if (typeof d.timestamp === 'number') return d.timestamp * 1000;
                if (d.utc_datetime) return Date.parse(d.utc_datetime);
                if (d.dateTime) {
                    const dt = String(d.dateTime).trim();
                    if (/[Zz]|[+-]\d{2}/.test(dt)) return Date.parse(dt);
                    try {
                        const guessUtc = Date.parse(dt + 'Z');
                        const p = getTzParts(new Date(guessUtc));
                        const localAsUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
                        return guessUtc - (localAsUtc - guessUtc);
                    } catch(e) {
                        return Date.parse(dt + 'Z');
                    }
                }
                return null;
            };

            const hamuzonEndpoints = [
                'https://api-time.hamuzon-jp.f5.si/api/?timeZone=' + encTz,
                'https://api-time.hamuzon-jp.f5.si/api/time',
                'https://api-time.hamuzon-jp.f5.si/'
            ];
            const hamusataEndpoints = [
                'https://api-time.hamusata.f5.si/api/?timeZone=' + encTz,
                'https://api-time.hamusata.f5.si/api/time',
                'https://api-time.hamusata.f5.si/'
            ];
            const externalEndpoint = 'https://timeapi.io/api/Time/current/zone?timeZone=' + encTz;

            let urls = [];
            if (hostPref === 'hamuzon-jp') {
                urls = hamuzonEndpoints.concat(hamusataEndpoints).concat([externalEndpoint]);
            } else if (hostPref === 'hamusata') {
                urls = hamusataEndpoints.concat(hamuzonEndpoints).concat([externalEndpoint]);
            } else {
                urls = hamuzonEndpoints.concat(hamusataEndpoints).concat([externalEndpoint]);
            }

            for (let i = 0; i < urls.length; i++) {
                try {
                    const sendTime = Date.now();
                    const res = await fetch(urls[i], { cache: 'no-store' });
                    const receiveTime = Date.now();
                    const data = await res.json();
                    const serverMs = parseData(data);
                    if (!serverMs || isNaN(serverMs)) continue;
                    const rtt = receiveTime - sendTime;
                    timeOffset = serverMs + rtt / 2 - receiveTime;
                    return;
                } catch (_) {}
            }
        }

        function getNow() {
            return new Date(Date.now() + timeOffset);
        }

        // 指定タイムゾーンでの現在時刻パーツを取得
        const tzFormatter = new Intl.DateTimeFormat('en-CA', {
            timeZone: currentTz,
            year: 'numeric', month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit', second: '2-digit',
            hourCycle: 'h23'
        });

        function getTzParts(date) {
            const parts = tzFormatter.formatToParts(date);
            const g = function(type) {
                const item = parts.find(function(p) { return p.type === type; });
                return parseInt(item ? item.value : '0', 10);
            };
            return {
                year: g('year'),
                month: g('month'),
                day: g('day'),
                hour: g('hour'),
                minute: g('minute'),
                second: g('second')
            };
        }

        // 指定タイムゾーンでの「翌年1月1日 00:00:00」のUTCミリ秒を計算
        function getNewYearUtcMs(year) {
            const guessUtc = Date.UTC(year, 0, 1, 0, 0, 0);
            const p = getTzParts(new Date(guessUtc));
            const localAsUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
            const offsetMs = localAsUtc - guessUtc;
            return guessUtc - offsetMs;
        }

        // ===== カウントダウン更新 =====
        function updateCountdown() {
            const now = getNow();
            const p = getTzParts(now);
            const yr = p.year;
            const month = p.month - 1; // 0=Jan
            const day = p.day;

            // 1月1日 = 元旦表示
            const isNewYear = (month === 0 && day === 1);

            if (isNewYear && !newYearShown) {
                newYearShown = true;
                const dispYear = yr;
                const msg1 = isJa ? '🎉 新年（元旦）になりました！ 🎉' : '🎉 Happy New Year! 🎉';
                const msg2 = isJa ? 'あけましておめでとうございます！' : 'Wishing you a wonderful year!';
                const titleMsg = isJa ? (dispYear + '年 あけましておめでとう！') : ('Happy New Year ' + dispYear + '!');
                document.querySelector('.countLabel').textContent = '';
                document.querySelector('.countdown').innerHTML =
                    '<div class="newYearBlock">' +
                    msg1 + '<br>' +
                    '<span class="newYearYear">' + dispYear + (isJa ? '年' : '') + '</span><br>' +
                    msg2 +
                    '</div>';
                document.querySelector('.countText').textContent = '';
                document.getElementById('page_title').textContent = titleMsg;
                document.title = titleMsg;
                return;
            }
            if (isNewYear) return;

            // 指定タイムゾーンでの来年1月1日までの残り時間
            const targetMs = getNewYearUtcMs(yr + 1);
            const remaining = targetMs - now.getTime();

            const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
            const hours = Math.floor((remaining / (1000 * 60 * 60)) % 24);
            const minutes = Math.floor((remaining / (1000 * 60)) % 60);
            const seconds = Math.floor((remaining / 1000) % 60);
            const milliseconds = Math.floor((remaining / 10) % 100);

            document.querySelector('.days').textContent = days;
            document.querySelector('.hours').textContent = hours < 10 ? '0' + hours : hours;
            document.querySelector('.minutes').textContent = minutes < 10 ? '0' + minutes : minutes;
            document.querySelector('.seconds').textContent = seconds < 10 ? '0' + seconds : seconds;
            document.querySelector('.milliseconds').textContent = milliseconds < 10 ? '0' + milliseconds : milliseconds;

            const nextYearNum = yr + 1;
            if (lastYearNum !== nextYearNum) {
                lastYearNum = nextYearNum;
                const countTxt = isJa ? (nextYearNum + '年') : String(nextYearNum);
                const titleTxt = isJa ? (nextYearNum + '年カウントダウン！') : ('Countdown to ' + nextYearNum + '!');
                document.querySelector('.countText').textContent = countTxt;
                document.getElementById('page_title').textContent = titleTxt;
                document.title = titleTxt;
            }
        }

        function updateNowTime() {
            const now = getNow();
            const p = getTzParts(now);
            document.querySelector('.nowYear').textContent = p.year;
            document.querySelector('.nowMonth').textContent = p.month;
            document.querySelector('.nowDay').textContent = p.day;
            document.querySelector('.nowHour').textContent = p.hour < 10 ? '0' + p.hour : p.hour;
            document.querySelector('.nowMinute').textContent = p.minute < 10 ? '0' + p.minute : p.minute;
            document.querySelector('.nowSecond').textContent = p.second < 10 ? '0' + p.second : p.second;

            // ヘッダーのタイムゾーン表示と設定パネル詳細を更新
            const curInfo = getTimeZoneInfo(currentTz, now);
            const headerNameEl = document.getElementById('tzHeaderName');
            if (headerNameEl) {
                let badgeText = curInfo.city;
                if (curInfo.utcOffset) {
                    badgeText += ' [' + curInfo.utcOffset + ']';
                }
                headerNameEl.textContent = badgeText;
            }

            const detailEl = document.getElementById('tzCurrentDetail');
            if (detailEl) {
                let dText = '<b>' + (isJa ? '選択中' : 'Selected') + ':</b> ' + curInfo.city + '<br>';
                dText += curInfo.name + ' (' + curInfo.utcOffset + ')<br>';
                dText += '<span style="opacity:0.75;">' + currentTz + '</span><br>';
                dText += '<i class="material-icons" style="font-size:1rem;vertical-align:text-bottom;">schedule</i> ' + (isJa ? '現地時間' : 'Local time') + ': ' + curInfo.time;
                detailEl.innerHTML = dText;
            }
        }

        setInterval(updateCountdown, 10);
        setInterval(updateNowTime, 1000);
        updateCountdown();
        updateNowTime();
        syncTime();
        setInterval(syncTime, 30 * 60 * 1000);
    </script>
</body>
</html>`;

    return new Response(html, {
        headers: {
            "content-type": "text/html;charset=UTF-8",
        },
    });
}
