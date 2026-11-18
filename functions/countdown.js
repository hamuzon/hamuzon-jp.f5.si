
export async function onRequest(context) {
    const { request } = context;
    const url = new URL(request.url);
    const hostname = url.hostname;

    const BASE_YEAR = 2025;
    const DEFAULT_TZ = 'Asia/Tokyo';

    // URL正規化
    if (
        url.pathname !== '/' &&
        url.pathname.endsWith('/')
    ) {
        url.pathname = url.pathname.replace(/\/+$/, '');
        return Response.redirect(url.toString(), 308);
    }

    // タイムゾーン取得・検証
    const userDefaultTz = request.cf?.timezone || DEFAULT_TZ;
    const requestedTz = url.searchParams.get('tz');

    let tz = requestedTz || userDefaultTz;

    try {
        new Intl.DateTimeFormat('en-US', {
            timeZone: tz
        });
    } catch {
        tz = userDefaultTz;
    }

    if (requestedTz === userDefaultTz || (requestedTz && requestedTz !== tz)) {
        const cleanUrl = new URL(url);
        cleanUrl.searchParams.delete('tz');
        return Response.redirect(cleanUrl.toString(), 308);
    }

    // 言語設定
    const langParam = url.searchParams.get('lang');
    const acceptLang = request.headers.get('Accept-Language') || '';

    const isJa = langParam
        ? langParam !== 'en'
        : acceptLang.toLowerCase().includes('ja');

    if (langParam === 'ja') {
        const cleanUrl = new URL(url);
        cleanUrl.searchParams.delete('lang');
        return Response.redirect(cleanUrl.toString(), 308);
    }

    const currentYear = Number(
        new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            timeZone: tz
        }).format(new Date())
    );

    const nextYear = currentYear + 1;

    const yearDisplay = currentYear > BASE_YEAR
        ? `${BASE_YEAR} ~ ${currentYear}`
        : BASE_YEAR;

    const t = isJa ? {
        htmlLang: 'ja',
        title: `${nextYear}年カウントダウン`,
        pageTitle: `${nextYear}年カウントダウン`,
        desc: `${nextYear}年（来年）の元旦までの残り時間をリアルタイムでカウントダウン表示します。`,
        countText: `${nextYear}年`,
        countLabel: 'まで残り',
        day: '日',
        hour: '時間',
        minute: '分',
        second: '秒',
        millisecond: 'ミリ秒',
        now: '現在時刻',
        settings: '設定',
        timezone: 'タイムゾーン',
        language: '言語',
        selected: '選択中',
        localTime: '現地時間',
        close: '閉じる',
        newYear: 'あけましておめでとうございます！',
        newYearSub: '素晴らしい一年になりますように。',
        footer: 'New Year Countdown'
    } : {
        htmlLang: 'en',
        title: `Countdown to ${nextYear}`,
        pageTitle: `Countdown to ${nextYear}`,
        desc: `Real-time countdown to New Year's Day ${nextYear}.`,
        countText: String(nextYear),
        countLabel: 'TIME REMAINING',
        day: 'DAYS',
        hour: 'HOURS',
        minute: 'MINUTES',
        second: 'SECONDS',
        millisecond: 'MS',
        now: 'CURRENT TIME',
        settings: 'Settings',
        timezone: 'Timezone',
        language: 'Language',
        selected: 'Selected',
        localTime: 'Local time',
        close: 'Close',
        newYear: 'Happy New Year!',
        newYearSub: 'Wishing you a wonderful year.',
        footer: 'New Year Countdown'
    };

    let copyrightContent = '';

    if (hostname.includes('hamusata.f5.si')) {
        copyrightContent =
            `&copy; ${yearDisplay} ${t.footer} <a href="https://hamusata.f5.si" target="_blank" rel="noopener noreferrer">@hamusata</a>`;
    } else if (hostname.includes('hamuzon-jp.f5.si')) {
        copyrightContent =
            `&copy; ${yearDisplay} ${t.footer} <a href="https://hamuzon-jp.f5.si" target="_blank" rel="noopener noreferrer">@hamuzon</a>`;
    } else {
        copyrightContent = `&copy; ${yearDisplay} ${t.footer}`;
    }

    const html = `<!DOCTYPE html>
<html lang="${t.htmlLang}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="theme-color" content="#080b18">
<meta name="description" content="${t.desc}">
<meta property="og:title" content="${t.title}">
<meta property="og:description" content="${t.desc}">
<meta property="og:type" content="website">
<meta name="twitter:card" content="summary">

<title>${t.title}</title>

<script>
(function() {
    const saved = localStorage.getItem('countdown-theme');
    const systemDark = matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.dataset.theme =
        saved || (systemDark ? 'dark' : 'light');
})();
</script>

<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800&family=Noto+Sans+JP:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">

<style>
:root {
    color-scheme: dark;
    --bg: #080b18;
    --text: #f8fafc;
    --muted: #94a3b8;
    --panel: rgba(255,255,255,.07);
    --panel-border: rgba(255,255,255,.12);
    --accent: #8b5cf6;
    --accent2: #06b6d4;
    --shadow: rgba(0,0,0,.3);
}

:root[data-theme="light"] {
    color-scheme: light;
    --bg: #f5f1ff;
    --text: #29243a;
    --muted: #77718b;
    --panel: rgba(255,255,255,.55);
    --panel-border: rgba(255,255,255,.8);
    --accent: #7c3aed;
    --accent2: #0891b2;
    --shadow: rgba(91,70,140,.12);
}

* {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
}

html {
    min-height: 100%;
    background: var(--bg);
}

body {
    min-height: 100vh;
    min-height: 100dvh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 110px 20px 95px;
    overflow-x: hidden;
    color: var(--text);
    font-family: 'Noto Sans JP', sans-serif;
    background:
        radial-gradient(ellipse at 15% 15%, rgba(124,58,237,.25), transparent 45%),
        radial-gradient(ellipse at 85% 75%, rgba(6,182,212,.20), transparent 45%),
        radial-gradient(ellipse at 50% 50%, rgba(236,72,153,.10), transparent 60%),
        var(--bg);
    transition: background .3s, color .3s;
}

button, select {
    font: inherit;
}

button {
    color: inherit;
}

header {
    position: fixed;
    z-index: 20;
    top: 0;
    left: 0;
    width: 100%;
    min-height: 76px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 15px 180px;
    background: var(--panel);
    border-bottom: 1px solid var(--panel-border);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
}

#page_title {
    font-size: clamp(1.1rem, 3vw, 1.8rem);
    font-weight: 800;
    text-align: center;
    letter-spacing: .04em;
}

.headerControls {
    position: absolute;
    right: 20px;
    top: 50%;
    transform: translateY(-50%);
    display: flex;
    align-items: center;
    gap: 8px;
}

.headerBtn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    min-height: 40px;
    padding: 7px 13px;
    border-radius: 999px;
    border: 1px solid var(--panel-border);
    background: var(--panel);
    cursor: pointer;
    transition: .2s;
}

.headerBtn:hover {
    background: rgba(139,92,246,.2);
    transform: translateY(-2px);
}

.headerBtn .material-icons {
    font-size: 19px;
}

#tzHeaderName {
    font-size: .8rem;
    font-weight: 700;
}

.settingsIconBtn {
    width: 40px;
    height: 40px;
    border: 1px solid var(--panel-border);
    border-radius: 50%;
    background: var(--panel);
    display: grid;
    place-items: center;
    cursor: pointer;
    transition: .2s;
}

.settingsIconBtn:hover {
    transform: rotate(45deg);
    background: rgba(139,92,246,.2);
}

.countdownBlock {
    width: 100%;
    max-width: 1100px;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 16px;
    animation: appear .8s ease both;
}

@keyframes appear {
    from { opacity: 0; transform: translateY(18px); }
    to { opacity: 1; transform: translateY(0); }
}

.countText {
    font-family: 'Orbitron', sans-serif;
    font-size: clamp(3rem, 11vw, 7rem);
    font-weight: 800;
    line-height: 1.2;
    letter-spacing: .04em;
    background: linear-gradient(
        110deg,
        #22d3ee,
        #818cf8,
        #c084fc,
        #f472b6,
        #22d3ee
    );
    background-size: 300% 300%;
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    animation: gradient 12s ease infinite;
}

@keyframes gradient {
    0%, 100% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
}

.countLabel {
    font-size: clamp(.95rem, 3vw, 1.3rem);
    font-weight: 700;
    letter-spacing: .2em;
    color: var(--muted);
}

.countdown {
    display: flex;
    justify-content: center;
    align-items: stretch;
    flex-wrap: wrap;
    gap: clamp(8px, 2vw, 18px);
    width: 100%;
    margin: 15px 0;
}

.time-unit {
    min-width: clamp(75px, 14vw, 135px);
    padding: 20px 12px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 8px;
    border-radius: 18px;
    background: var(--panel);
    border: 1px solid var(--panel-border);
    box-shadow: 0 10px 35px var(--shadow);
    backdrop-filter: blur(15px);
    -webkit-backdrop-filter: blur(15px);
    transition: transform .2s, background .2s;
}

.time-unit:hover {
    transform: translateY(-5px);
}

.time-unit > span:first-child {
    font-family: 'Orbitron', sans-serif;
    font-size: clamp(2rem, 6vw, 4.2rem);
    font-weight: 700;
    line-height: 1.1;
    font-variant-numeric: tabular-nums;
    background: linear-gradient(135deg, var(--accent2), var(--accent));
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
}

.countSmall {
    color: var(--muted);
    font-size: .72rem;
    font-weight: 700;
    letter-spacing: .12em;
}

.nowTime {
    margin-top: 12px;
    padding: 13px 22px;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
    gap: 5px;
    border: 1px solid var(--panel-border);
    border-radius: 999px;
    background: var(--panel);
    color: var(--muted);
    font-family: 'Orbitron', 'Noto Sans JP', sans-serif;
    font-size: clamp(.8rem, 2.5vw, 1.15rem);
    font-weight: 600;
    font-variant-numeric: tabular-nums;
}

.nowTime > span {
    color: var(--text);
}

.nowTime .nowLabel {
    margin-right: 8px;
    color: var(--muted);
    font-family: 'Noto Sans JP', sans-serif;
    font-size: .75em;
}

footer {
    position: fixed;
    z-index: 10;
    bottom: 0;
    left: 0;
    width: 100%;
    padding: 17px 10px;
    text-align: center;
    font-size: .85rem;
    color: var(--muted);
    background: var(--panel);
    border-top: 1px solid var(--panel-border);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
}

footer a {
    color: var(--text);
    font-weight: 800;
    text-decoration: none;
}

footer a:hover {
    color: var(--accent2);
}

#tzPanel {
    display: none;
    position: fixed;
    z-index: 50;
    top: 85px;
    right: 20px;
    width: min(380px, calc(100vw - 30px));
    max-height: calc(100dvh - 110px);
    overflow-y: auto;
    padding: 22px;
    border-radius: 20px;
    background: var(--bg);
    color: var(--text);
    border: 1px solid var(--panel-border);
    box-shadow: 0 20px 70px var(--shadow);
    backdrop-filter: blur(25px);
    -webkit-backdrop-filter: blur(25px);
    animation: panelAppear .2s ease;
}

@keyframes panelAppear {
    from { opacity: 0; transform: translateY(-8px); }
    to { opacity: 1; transform: translateY(0); }
}

.panelHeader {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 22px;
}

.panelHeader h2 {
    font-size: 1.2rem;
}

#panelClose {
    width: 34px;
    height: 34px;
    border: 0;
    border-radius: 50%;
    background: var(--panel);
    cursor: pointer;
}

.panelLabel {
    display: block;
    margin: 18px 0 9px;
    font-weight: 700;
    font-size: .9rem;
}

#tzPanel select {
    width: 100%;
    min-height: 45px;
    padding: 10px;
    border: 1px solid var(--panel-border);
    border-radius: 10px;
    background: var(--panel);
    color: var(--text);
    outline: none;
}

#tzPanel select:focus {
    border-color: var(--accent);
}

#tzPanel select option {
    background: var(--bg);
    color: var(--text);
}

.panelDetail {
    margin-top: 12px;
    padding: 13px;
    border-radius: 12px;
    background: var(--panel);
    color: var(--muted);
    font-size: .83rem;
    line-height: 1.8;
    overflow-wrap: anywhere;
}

.panelDivider {
    margin: 20px 0;
    border: 0;
    border-top: 1px solid var(--panel-border);
}

.newYearBlock {
    padding: 35px 20px;
    border-radius: 25px;
    background: var(--panel);
    border: 1px solid var(--panel-border);
    box-shadow: 0 15px 50px var(--shadow);
    font-size: clamp(1.1rem, 4vw, 1.7rem);
    line-height: 2;
    animation: appear 1s ease both;
}

.newYearYear {
    display: block;
    font-family: 'Orbitron', sans-serif;
    font-size: clamp(3rem, 12vw, 7rem);
    font-weight: 800;
    background: linear-gradient(120deg, #22d3ee, #a78bfa, #f472b6);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
}

@media (max-width: 650px) {
    body {
        padding: 100px 12px 85px;
    }

    header {
        min-height: 68px;
        justify-content: flex-start;
        padding: 12px 12px;
    }

    #page_title {
        max-width: calc(100% - 135px);
        font-size: 1rem;
        text-align: left;
    }

    .headerControls {
        right: 10px;
        gap: 5px;
    }

    .headerBtn {
        min-height: 36px;
        padding: 6px 9px;
    }

    #tzHeaderName {
        max-width: 95px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .settingsIconBtn {
        width: 36px;
        height: 36px;
    }

    .time-unit {
        min-width: calc(33.333% - 12px);
        padding: 15px 7px;
        border-radius: 14px;
    }

    .time-unit > span:first-child {
        font-size: clamp(1.7rem, 9vw, 3rem);
    }

    .countdown {
        gap: 9px;
    }

    .nowTime {
        border-radius: 14px;
        padding: 12px;
    }

    #tzPanel {
        top: 75px;
        right: 10px;
    }
}

@media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
        animation-duration: .01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: .01ms !important;
        scroll-behavior: auto !important;
    }
}
</style>
</head>

<body>

<header>
    <h1 id="page_title">${t.pageTitle}</h1>

    <div class="headerControls">
        <button id="tzHeaderBtn" class="headerBtn" type="button"
            title="${t.timezone}" aria-label="${t.timezone}">
            <i class="material-icons">schedule</i>
            <span id="tzHeaderName"></span>
        </button>

        <button id="tzSettingsBtn" class="settingsIconBtn" type="button"
            title="${t.settings}" aria-label="${t.settings}"
            aria-expanded="false">
            <i class="material-icons">settings</i>
        </button>
    </div>
</header>

<div id="tzPanel" role="dialog" aria-label="${t.settings}">
    <div class="panelHeader">
        <h2>${t.settings}</h2>
        <button id="panelClose" type="button" aria-label="${t.close}">
            <i class="material-icons">close</i>
        </button>
    </div>

    <label for="tzSelect" class="panelLabel">${t.timezone}</label>
    <select id="tzSelect"></select>
    <div id="tzCurrentDetail" class="panelDetail"></div>

    <hr class="panelDivider">

    <label for="langSelect" class="panelLabel">${t.language}</label>
    <select id="langSelect">
        <option value="ja" ${isJa ? 'selected' : ''}>日本語 (Japanese)</option>
        <option value="en" ${!isJa ? 'selected' : ''}>English</option>
    </select>
</div>

<main class="countdownBlock">
    <div class="countText">${t.countText}</div>
    <div class="countLabel">${t.countLabel}</div>

    <div class="countdown" aria-live="off">
        <div class="time-unit">
            <span class="days">0</span>
            <span class="countSmall">${t.day}</span>
        </div>

        <div class="time-unit">
            <span class="hours">00</span>
            <span class="countSmall">${t.hour}</span>
        </div>

        <div class="time-unit">
            <span class="minutes">00</span>
            <span class="countSmall">${t.minute}</span>
        </div>

        <div class="time-unit">
            <span class="seconds">00</span>
            <span class="countSmall">${t.second}</span>
        </div>

        <div class="time-unit">
            <span class="milliseconds">00</span>
            <span class="countSmall">${t.millisecond}</span>
        </div>
    </div>

    <div class="nowTime">
        <span class="nowLabel">${t.now}</span>
        <span class="nowYear">0000</span>/<span class="nowMonth">00</span>/<span class="nowDay">00</span>
        &nbsp;
        <span class="nowHour">00</span>:<span class="nowMinute">00</span>:<span class="nowSecond">00</span>
    </div>
</main>

<footer>
    ${copyrightContent}
</footer>

<script>
'use strict';

const IS_JA = ${isJa};
const CURRENT_TZ = ${JSON.stringify(tz)};

const browserTz = (() => {
    try {
        return Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Tokyo';
    } catch {
        return 'Asia/Tokyo';
    }
})();

const urlParams = new URLSearchParams(location.search);
const currentTz = urlParams.get('tz') || CURRENT_TZ;

let timeOffset = 0;
let newYearShown = false;
let lastSecond = -1;
let lastYearNum = 0;

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
    'Asia/Kolkata': 'デリー / インド',
    'Asia/Dubai': 'ドバイ（UAE）',
    'Asia/Vladivostok': 'ウラジオストク（ロシア）',
    'Europe/London': 'ロンドン（イギリス）',
    'Europe/Paris': 'パリ（フランス）',
    'Europe/Berlin': 'ベルリン（ドイツ）',
    'Europe/Rome': 'ローマ（イタリア）',
    'Europe/Moscow': 'モスクワ（ロシア）',
    'Europe/Kyiv': 'キーウ（ウクライナ）',
    'America/New_York': 'ニューヨーク（米国東部）',
    'America/Chicago': 'シカゴ（米国中部）',
    'America/Denver': 'デンバー（米国山岳部）',
    'America/Los_Angeles': 'ロサンゼルス（米国西部）',
    'Pacific/Honolulu': 'ホノルル（ハワイ）',
    'America/Toronto': 'トロント（カナダ）',
    'America/Vancouver': 'バンクーバー（カナダ）',
    'America/Sao_Paulo': 'サンパウロ（ブラジル）',
    'Africa/Cairo': 'カイロ（エジプト）',
    'Africa/Johannesburg': 'ヨハネスブルグ（南アフリカ）',
    'Australia/Sydney': 'シドニー（豪州東部）',
    'Australia/Perth': 'パース（豪州西部）',
    'Pacific/Auckland': 'オークランド（ニュージーランド）',
    'UTC': '協定世界時 (UTC)'
};

function getCityDisplayName(zone) {
    if (IS_JA && CITY_JA[zone]) return CITY_JA[zone];

    return zone.split('/').pop().replace(/_/g, ' ');
}

function getTzParts(date) {
    const parts = tzFormatter.formatToParts(date);

    const get = type => {
        const item = parts.find(p => p.type === type);
        return Number(item?.value || 0);
    };

    return {
        year: get('year'),
        month: get('month'),
        day: get('day'),
        hour: get('hour'),
        minute: get('minute'),
        second: get('second')
    };
}

const tzFormatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: currentTz,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23'
});

function getTimeZoneInfo(zone, date = new Date()) {
    try {
        const parts = new Intl.DateTimeFormat(
            IS_JA ? 'ja-JP' : 'en-US',
            {
                timeZone: zone,
                timeZoneName: 'long',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hourCycle: 'h23'
            }
        ).formatToParts(date);

        const get = type =>
            parts.find(p => p.type === type)?.value || '';

        const offsetParts = new Intl.DateTimeFormat('en-US', {
            timeZone: zone,
            timeZoneName: 'longOffset'
        }).formatToParts(date);

        const gmt =
            offsetParts.find(p => p.type === 'timeZoneName')?.value ||
            'GMT+00:00';

        return {
            tz: zone,
            city: getCityDisplayName(zone),
            name: get('timeZoneName'),
            utcOffset: gmt.replace('GMT', 'UTC'),
            offsetMinutes: (() => {
                const match = gmt.match(/GMT([+-])(\\d{2}):(\\d{2})/);
                if (!match) return 0;

                const sign = match[1] === '-' ? -1 : 1;
                return sign * (
                    Number(match[2]) * 60 +
                    Number(match[3])
                );
            })(),
            time: get('hour') + ':' + get('minute') + ':' + get('second')
        };
    } catch {
        return {
            tz: zone,
            city: zone,
            name: zone,
            utcOffset: 'UTC',
            offsetMinutes: 0,
            time: '--:--:--'
        };
    }
}

// タイムゾーンリスト
(function initTimezoneList() {
    const select = document.getElementById('tzSelect');

    let zones = [];

    try {
        zones = Intl.supportedValuesOf('timeZone');
    } catch {}

    if (!zones.length) {
        zones = [
            'UTC',
            'Asia/Tokyo',
            'America/New_York',
            'Europe/London',
            'Europe/Paris',
            'Asia/Singapore',
            'Australia/Sydney'
        ];
    }

    if (!zones.includes('UTC')) zones.push('UTC');

    const now = new Date();

    const infos = zones.map(zone =>
        getTimeZoneInfo(zone, now)
    );

    infos.sort((a, b) =>
        a.offsetMinutes - b.offsetMinutes ||
        a.city.localeCompare(b.city)
    );

    infos.forEach(info => {
        const option = document.createElement('option');

        option.value = info.tz;
        option.textContent =
            info.utcOffset + ' ' +
            info.city + ' (' + info.tz + ')';

        option.selected = info.tz === currentTz;

        select.appendChild(option);
    });
})();

// 設定パネル
const panel = document.getElementById('tzPanel');
const settingsBtn = document.getElementById('tzSettingsBtn');

function togglePanel(force) {
    const open = typeof force === 'boolean'
        ? force
        : panel.style.display !== 'block';

    panel.style.display = open ? 'block' : 'none';
    settingsBtn.setAttribute('aria-expanded', String(open));
}

settingsBtn.addEventListener('click', () => togglePanel());

document.getElementById('tzHeaderBtn')
    .addEventListener('click', () => togglePanel());

document.getElementById('panelClose')
    .addEventListener('click', () => togglePanel(false));

document.addEventListener('keydown', event => {
    if (event.key === 'Escape') togglePanel(false);
});

document.addEventListener('click', event => {
    if (
        panel.style.display === 'block' &&
        !panel.contains(event.target) &&
        !settingsBtn.contains(event.target) &&
        !document.getElementById('tzHeaderBtn').contains(event.target)
    ) {
        togglePanel(false);
    }
});

// タイムゾーン変更
document.getElementById('tzSelect')
    .addEventListener('change', function() {
        const next = new URL(location.href);

        if (this.value === browserTz) {
            next.searchParams.delete('tz');
        } else {
            next.searchParams.set('tz', this.value);
        }

        location.href = next.toString();
    });

// 言語変更
document.getElementById('langSelect')
    .addEventListener('change', function() {
        const next = new URL(location.href);

        if (this.value === 'ja') {
            next.searchParams.delete('lang');
        } else {
            next.searchParams.set('lang', this.value);
        }

        location.href = next.toString();
    });

// 時刻同期
async function syncTime() {
    const encTz = encodeURIComponent(currentTz);

    const hostPref = location.hostname.includes('hamuzon-jp.f5.si')
        ? 'hamuzon-jp'
        : 'hamusata';

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

    const externalEndpoint =
        'https://timeapi.io/api/Time/current/zone?timeZone=' + encTz;

    const endpoints = hostPref === 'hamuzon-jp'
        ? [...hamuzonEndpoints, ...hamusataEndpoints, externalEndpoint]
        : [...hamusataEndpoints, ...hamuzonEndpoints, externalEndpoint];

    function parseData(data) {
        if (!data) return null;

        if (typeof data.unix_ms === 'number') return data.unix_ms;
        if (typeof data.unixtime === 'number') return data.unixtime * 1000;
        if (typeof data.timestamp === 'number') return data.timestamp * 1000;

        if (data.utc_datetime) return Date.parse(data.utc_datetime);
        if (data.dateTime) return Date.parse(data.dateTime);

        return null;
    }

    for (const endpoint of endpoints) {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);

        try {
            const sent = Date.now();

            const response = await fetch(endpoint, {
                cache: 'no-store',
                signal: controller.signal
            });

            const received = Date.now();

            if (!response.ok) continue;

            const data = await response.json();
            const serverMs = parseData(data);

            if (!Number.isFinite(serverMs)) continue;

            timeOffset = serverMs + (received - sent) / 2 - received;
            return true;
        } catch {
            // 次のAPIを試す
        } finally {
            clearTimeout(timeout);
        }
    }

    return false;
}

function getNow() {
    return new Date(Date.now() + timeOffset);
}

// 新年のUTC時刻を計算
function getNewYearUtcMs(year) {
    const guess = Date.UTC(year, 0, 1);

    const parts = getTzParts(new Date(guess));

    const localAsUtc = Date.UTC(
        parts.year,
        parts.month - 1,
        parts.day,
        parts.hour,
        parts.minute,
        parts.second
    );

    const offset = localAsUtc - guess;

    return guess - offset;
}

// DOM更新
function updateCountdown() {
    const now = getNow();
    const parts = getTzParts(now);

    const year = parts.year;

    if (parts.month === 1 && parts.day === 1) {
        if (!newYearShown) {
            newYearShown = true;

            const title = IS_JA
                ? year + '年 あけましておめでとう！'
                : 'Happy New Year ' + year + '!';

            document.querySelector('.countLabel').textContent = '';

            document.querySelector('.countdown').innerHTML =
                '<div class="newYearBlock">' +
                '<div>' + (IS_JA ? '🎉 新年（元旦）になりました！ 🎉' : '🎉 Happy New Year! 🎉') + '</div>' +
                '<span class="newYearYear">' + year + (IS_JA ? '年' : '') + '</span>' +
                '<div>${t.newYear}</div>' +
                '<div style="font-size:.75em;color:var(--muted)">${t.newYearSub}</div>' +
                '</div>';

            document.querySelector('.countText').textContent = '';
            document.querySelector('.nowTime').style.display = 'none';

            document.getElementById('page_title').textContent = title;
            document.title = title;
        }

        return;
    }

    const target = getNewYearUtcMs(year + 1);
    const remaining = Math.max(0, target - now.getTime());

    const days = Math.floor(remaining / 86400000);
    const hours = Math.floor(remaining / 3600000) % 24;
    const minutes = Math.floor(remaining / 60000) % 60;
    const seconds = Math.floor(remaining / 1000) % 60;
    const milliseconds = Math.floor((remaining % 1000) / 10);

    document.querySelector('.days').textContent = days;
    document.querySelector('.hours').textContent = String(hours).padStart(2, '0');
    document.querySelector('.minutes').textContent = String(minutes).padStart(2, '0');
    document.querySelector('.seconds').textContent = String(seconds).padStart(2, '0');
    document.querySelector('.milliseconds').textContent = String(milliseconds).padStart(2, '0');

    if (lastYearNum !== year + 1) {
        lastYearNum = year + 1;

        const countText = IS_JA
            ? (year + 1) + '年'
            : String(year + 1);

        const title = IS_JA
            ? (year + 1) + '年カウントダウン'
            : 'Countdown to ' + (year + 1);

        document.querySelector('.countText').textContent = countText;
        document.getElementById('page_title').textContent = title;
        document.title = title;
    }
}

function updateNowTime() {
    const now = getNow();
    const p = getTzParts(now);

    const set = (selector, value) => {
        document.querySelector(selector).textContent = value;
    };

    set('.nowYear', p.year);
    set('.nowMonth', String(p.month).padStart(2, '0'));
    set('.nowDay', String(p.day).padStart(2, '0'));
    set('.nowHour', String(p.hour).padStart(2, '0'));
    set('.nowMinute', String(p.minute).padStart(2, '0'));
    set('.nowSecond', String(p.second).padStart(2, '0'));

    const info = getTimeZoneInfo(currentTz, now);

    const badge = document.getElementById('tzHeaderName');

    badge.textContent =
        info.city + ' [' + info.utcOffset + ']';

    const detail = document.getElementById('tzCurrentDetail');

    detail.textContent =
        '${t.selected}: ' + info.city + ' / ' +
        info.name + ' (' + info.utcOffset + ') / ' +
        currentTz + ' / ${t.localTime}: ' + info.time;
}

// 描画ループ
function animationLoop() {
    const now = getNow();
    const milliseconds = now.getMilliseconds();

    // ミリ秒は100ms単位で更新
    const tick = Math.floor(milliseconds / 100);

    if (tick !== lastSecond) {
        lastSecond = tick;
        updateCountdown();
    }
}

function clockLoop() {
    updateNowTime();
}

updateCountdown();
updateNowTime();

setInterval(animationLoop, 50);
setInterval(clockLoop, 1000);

// 初回同期・30分ごとの再同期
syncTime();
setInterval(syncTime, 30 * 60 * 1000);
</script>

</body>
</html>`;

    return new Response(html, {
        headers: {
            'Content-Type': 'text/html; charset=UTF-8',
            'Cache-Control': 'no-store',
            'X-Content-Type-Options': 'nosniff',
            'Referrer-Policy': 'strict-origin-when-cross-origin'
        }
    });
}
