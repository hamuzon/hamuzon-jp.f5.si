
export async function onRequest(context) {
    const { request } = context;
    const url = new URL(request.url);
    const hostname = url.hostname;

    // 末尾スラッシュを削除
    if (url.pathname.endsWith('/') && url.pathname !== '/') {
        const cleanUrl = new URL(url);
        cleanUrl.pathname = cleanUrl.pathname.replace(/\/+$/, '');
        return Response.redirect(cleanUrl.toString(), 307);
    }

    const baseYear = 2025;

    const userDefaultTz = request.cf?.timezone || 'Asia/Tokyo';
    const requestedTz = url.searchParams.get('tz');
    const tz = requestedTz || userDefaultTz;

    if (requestedTz === userDefaultTz) {
        const cleanUrl = new URL(url);
        cleanUrl.searchParams.delete('tz');
        return Response.redirect(cleanUrl.toString(), 307);
    }

    const langParam = url.searchParams.get('lang');
    const acceptLang = request.headers.get('Accept-Language') || '';
    const isJa = langParam
        ? langParam !== 'en'
        : acceptLang.toLowerCase().includes('ja');

    if (langParam === 'ja') {
        const cleanUrl = new URL(url);
        cleanUrl.searchParams.delete('lang');
        return Response.redirect(cleanUrl.toString(), 307);
    }

    const currentYear = parseInt(
        new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            timeZone: tz
        }).format(new Date())
    );

    const nextYear = currentYear + 1;
    const yearDisplay = currentYear > baseYear
        ? `${baseYear} ~ ${currentYear}`
        : baseYear;

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
        tzLabel: 'タイムゾーンを選択',
        tzCurrent: `現在: ${tz}`,
        settingsTitle: '設定',
        langLabel: '言語を選択',
        nowSep: { y: '年 / ', m: '月 / ', d: '日' }
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
        tzLabel: 'Select Timezone',
        tzCurrent: `Current: ${tz}`,
        settingsTitle: 'Settings',
        langLabel: 'Select Language',
        nowSep: { y: '/', m: '/', d: '' }
    };

    let copyrightContent = '';

    if (hostname.includes('hamusata.f5.si')) {
        copyrightContent = `&copy; ${yearDisplay} New Year Countdown <a href="https://hamusata.f5.si" target="_blank" rel="noopener noreferrer">@hamusata</a>`;
    } else if (hostname.includes('hamuzon-jp.f5.si')) {
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
    const theme = window.matchMedia &&
        window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark' : 'light';

    document.documentElement.className = theme;
</script>

<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@100;700&family=Orbitron:wght@400;700&display=swap" rel="stylesheet">

<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">

<style>
    html {
        background: #0a0a0a;
    }

    html.light {
        background: #fde2ea;
    }

    html.dark {
        background: #0a0a0a;
    }

    * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
        font-family: 'Noto Sans JP', Arial, sans-serif;
    }

    body {
        min-height: 100dvh;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        text-align: center;
        line-height: 1.4;
        overflow-x: hidden;
        font-weight: 500;
        transition: background-color 0.3s, color 0.3s;
        font-size: clamp(0.9rem, 1.5vw, 1.1rem);
        background-attachment: fixed;
    }

    .light body {
        background:
            radial-gradient(ellipse 80% 60% at 70% 20%, rgba(175,109,255,.85), transparent 68%),
            radial-gradient(ellipse 70% 60% at 20% 80%, rgba(255,100,180,.75), transparent 68%),
            radial-gradient(ellipse 60% 50% at 60% 65%, rgba(255,235,170,.98), transparent 68%),
            radial-gradient(ellipse 65% 40% at 50% 60%, rgba(120,190,255,.3), transparent 68%),
            linear-gradient(180deg, #f7eaff 0%, #fde2ea 100%);
        color: #333;
    }

    .dark body {
        background-color: #0a0a0a;
        background-image:
            radial-gradient(ellipse at 20% 30%, rgba(56,189,248,.4), transparent 60%),
            radial-gradient(ellipse at 80% 70%, rgba(139,92,246,.3), transparent 70%),
            radial-gradient(ellipse at 60% 20%, rgba(236,72,153,.25), transparent 50%),
            radial-gradient(ellipse at 40% 80%, rgba(34,197,94,.2), transparent 65%);
        color: #fff;
    }

    header {
        position: fixed;
        top: 0;
        width: 100%;
        padding: .5rem 1rem;
        background: rgba(255,255,255,.05);
        -webkit-backdrop-filter: blur(12px);
        backdrop-filter: blur(12px);
        z-index: 10;
        display: grid;
        grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
        align-items: center;
        gap: .5rem;
        min-height: 3.2rem;
    }

    #page_title {
        grid-column: 2;
        justify-self: center;
        width: max-content;
        min-width: 0;
        font-size: clamp(1rem, 3.5vw, 2.2rem);
        font-weight: 600;
        text-align: center;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .countText {
        font-size: clamp(2.5rem, 10vw, 5rem);
        font-weight: bold;
        background: linear-gradient(
            45deg,
            #0089ff,#0040ff,#b03bff,#f23bff,#ff4ad2,
            #ff2626,#fc8c1c,#f6fc47,#6cf542,#42f566,
            #0089ff,#0040ff,#b03bff,#f23bff,#ff4ad2,
            #ff2626,#fc8c1c,#f6fc47,#6cf542,#42f566
        );
        background-size: 1500% 1500%;
        -webkit-background-clip: text;
        background-clip: text;
        -webkit-text-fill-color: transparent;
        animation: bggradient 30s linear infinite;
        user-select: none;
        margin-bottom: .2em;
    }

    @keyframes bggradient {
        0% { background-position: 0% 100%; }
        100% { background-position: 83% 100%; }
    }

    .countLabel {
        font-size: clamp(1.2rem, 5vw, 2.5rem);
        font-weight: bold;
        margin-bottom: .5em;
        color: inherit;
    }

    .countSmall {
        font-size: .65em;
        font-weight: bold;
        color: inherit;
    }

    .countdown {
        font-family: 'Orbitron', 'Noto Sans JP', sans-serif;
        font-size: clamp(2.5rem, 13vw, 7rem);
        font-weight: bold;
        color: inherit;
        margin-bottom: .3em;
        line-height: 1;
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        align-items: center;
        gap: .2em .4em;
    }

    .nowTime {
        font-family: 'Orbitron', 'Noto Sans JP', sans-serif;
        font-size: clamp(.9rem, 4vw, 2rem);
        font-weight: bold;
        color: inherit;
        margin-top: .3em;
        margin-bottom: 1em;
    }

    footer {
        position: fixed;
        bottom: 0;
        left: 0;
        width: 100%;
        text-align: center;
        padding: clamp(.8rem, 2vw, 1.2rem) 0;
        font-size: clamp(.8rem, 2vw, 1rem);
        color: inherit;
        background: rgba(255,255,255,.05);
        -webkit-backdrop-filter: blur(12px);
        backdrop-filter: blur(12px);
        border-top: 1px solid rgba(255,255,255,.2);
    }

    footer a {
        color: inherit;
        text-decoration: none;
        font-weight: bold;
    }

    .time-unit {
        display: inline-flex;
        align-items: baseline;
        white-space: nowrap;
    }

    .countdownBlock {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 1rem;
        width: 100%;
        padding: 5rem 1rem 4rem;
    }

    .headerControls {
        grid-column: 3;
        justify-self: end;
        display: inline-flex;
        align-items: center;
        gap: .4rem;
        z-index: 20;
        flex-shrink: 0;
    }

    .tzHeaderBtn {
        background: rgba(255,255,255,.08);
        border: 1px solid rgba(255,255,255,.18);
        padding: .3rem .75rem;
        border-radius: 9999px;
        color: inherit;
        font-size: clamp(.7rem, 1.8vw, .88rem);
        font-weight: 600;
        cursor: default;
        pointer-events: none;
        display: inline-flex;
        align-items: center;
        gap: .3rem;
        max-width: 180px;
        min-width: 0;
        overflow: hidden;
        -webkit-backdrop-filter: blur(8px);
        backdrop-filter: blur(8px);
        user-select: none;
        -webkit-user-select: none;
    }

    .tzHeaderBtn span {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .light .tzHeaderBtn {
        background: rgba(0,0,0,.05);
        border-color: rgba(0,0,0,.1);
    }

    .headerBtnIcon {
        font-size: 1.1rem;
        vertical-align: middle;
        flex-shrink: 0;
    }

    .settingsIconBtn {
        background: none;
        border: none;
        cursor: pointer;
        color: inherit;
        font-size: 1.5rem;
        display: flex;
        align-items: center;
        flex-shrink: 0;
    }

    .settingsIconBtn i {
        font-size: 1.8rem;
    }

    #tzPanel {
        display: none;
        position: fixed;
        top: 3.8rem;
        right: 1rem;

        width: min(420px, calc(100vw - 2rem));
        min-width: 0;
        max-width: calc(100vw - 2rem);

        background: rgba(30,30,30,.95);
        -webkit-backdrop-filter: blur(12px);
        backdrop-filter: blur(12px);
        color: #fff;
        padding: 1rem;
        border-radius: 12px;
        z-index: 30;
        box-shadow: 0 4px 20px rgba(0,0,0,.4);

        max-height: calc(100dvh - 5rem);
        overflow-y: auto;
        overflow-x: hidden;
        text-align: left;

        overflow-wrap: anywhere;
        scrollbar-color: rgba(255,255,255,.4) transparent;
        scrollbar-width: thin;
    }

    #tzPanel::-webkit-scrollbar {
        width: 8px;
    }

    #tzPanel::-webkit-scrollbar-track {
        background: transparent;
    }

    #tzPanel::-webkit-scrollbar-thumb {
        background: rgba(255,255,255,.4);
        border: 2px solid transparent;
        border-radius: 999px;
        background-clip: padding-box;
    }

    .panelLabel {
        font-weight: bold;
        display: block;
        margin-bottom: .5rem;
        line-height: 1.5;
    }

    .panelIcon {
        font-size: 1.15rem;
        vertical-align: text-bottom;
    }

    .panelDetail {
        margin-top: .7rem;
        font-size: .85rem;
        line-height: 1.7;
        opacity: .9;
        overflow-wrap: anywhere;
        word-break: break-word;
    }

    .panelDivider {
        border: none;
        border-top: 1px solid rgba(255,255,255,.15);
        margin: 1rem 0 .8rem;
    }

    #tzPanel select {
        display: block;
        width: 100%;
        min-width: 0;
        max-width: 100%;
        padding: .65rem;
        border-radius: 8px;
        border: 1px solid #555;
        background: #222;
        color: #fff;
        font-size: .9rem;
        line-height: 1.5;
        box-sizing: border-box;
    }

    .light #tzPanel {
        background: rgba(255,255,255,.95) !important;
        color: #333 !important;
        scrollbar-color: rgba(0,0,0,.3) transparent;
    }

    .light #tzPanel::-webkit-scrollbar-thumb {
        background: rgba(0,0,0,.3);
    }

    .light #tzPanel select {
        background: #f5f5f5;
        color: #333;
        border-color: #ccc;
    }

    .light .panelDivider {
        border-top-color: rgba(0,0,0,.12);
    }

    .newYearBlock {
        font-size: clamp(1.5rem, 6vw, 3.5rem);
        line-height: 1.6;
        text-align: center;
    }

    .newYearYear {
        font-size: clamp(2rem, 8vw, 5rem);
    }

    @media (max-width: 700px) {
        header {
            display: grid;
            grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
            grid-template-rows: auto auto;
            align-items: center;
            gap: .25rem .5rem;
            min-height: 6rem;
        }

        #page_title {
            grid-column: 2;
            grid-row: 1;
            position: static;
            transform: none;
            max-width: calc(100vw - 5rem);
        }

        .headerControls {
            display: contents;
        }

        #tzHeaderBtn {
            grid-column: 1 / -1;
            grid-row: 2;
            justify-self: end;
        }

        #tzSettingsBtn {
            grid-column: 3;
            grid-row: 1;
            justify-self: end;
        }

        #tzPanel {
            top: 6.25rem;
        }

        .countdownBlock {
            padding-top: 6rem;
        }
    }

    @media (max-width: 480px) {
        header {
            min-height: 5rem;
            padding: .4rem .5rem;
        }

        #page_title {
            font-size: clamp(.88rem, 4vw, 1.1rem);
        }

        .countdown {
            font-size: clamp(2rem, 15vw, 4rem);
            gap: .25em .3em;
        }

        .headerControls {
            gap: .25rem;
        }

        .tzHeaderBtn {
            max-width: 36vw;
            padding: .28rem .5rem;
            font-size: .68rem;
        }

        .tzHeaderBtn .headerBtnIcon {
            font-size: .95rem;
        }

        .settingsIconBtn i {
            font-size: 1.5rem;
        }

        #tzPanel {
            top: 5.25rem;
            right: .75rem;
            width: calc(100vw - 1.5rem);
            max-width: calc(100vw - 1.5rem);
            min-width: 0;
            padding: .9rem;
            max-height: calc(100dvh - 5rem);
        }

        #tzPanel select {
            font-size: 16px;
            padding: .7rem;
        }

        .panelDetail {
            font-size: .8rem;
            line-height: 1.7;
        }

        .countdownBlock {
            padding-left: .5rem;
            padding-right: .5rem;
        }
    }

    @media (max-width: 350px) {
        #page_title {
            font-size: .82rem;
        }

        .tzHeaderBtn {
            max-width: 28vw;
            font-size: .62rem;
        }

        .countdown {
            font-size: 2rem;
        }
    }
</style>
</head>

<body>

<header>
    <h1 id="page_title">${t.pageTitle}</h1>

    <div class="headerControls">

        <div
            id="tzHeaderBtn"
            class="tzHeaderBtn"
            aria-label="${tz}"
        >
            <i class="material-icons headerBtnIcon">schedule</i>
            <span id="tzHeaderName">${tz}</span>
        </div>

        <button
            id="tzSettingsBtn"
            title="${t.settingsTitle}"
            class="settingsIconBtn"
            aria-label="${t.settingsTitle}"
            aria-expanded="false"
            aria-controls="tzPanel"
        >
            <i class="material-icons">settings</i>
        </button>

    </div>
</header>

<div id="tzPanel">

    <label for="tzSelect" class="panelLabel">
        <i class="material-icons panelIcon">language</i>
        ${t.tzLabel}
    </label>

    <select id="tzSelect"></select>

    <div id="tzCurrentDetail" class="panelDetail">
        ${t.tzCurrent}
    </div>

    <hr class="panelDivider">

    <label for="langSelect" class="panelLabel">
        <i class="material-icons panelIcon">translate</i>
        ${t.langLabel}
    </label>

    <select id="langSelect">
        <option value="ja" ${isJa ? 'selected' : ''}>
            日本語 (Japanese)
        </option>
        <option value="en" ${!isJa ? 'selected' : ''}>
            English
        </option>
    </select>

</div>

<div class="countdownBlock">

    <span class="countText">${t.countText}</span>

    <span class="countLabel">${t.countLabel}</span>

    <div class="countdown">

        <div class="time-unit">
            <span class="days">0</span>
            <span class="countSmall">${t.dayUnit}</span>
        </div>

        <div class="time-unit">
            <span class="hours">00</span> :
        </div>

        <div class="time-unit">
            <span class="minutes">00</span> :
        </div>

        <div class="time-unit">
            <span class="seconds">00</span> .
        </div>

        <div class="time-unit">
            <span class="milliseconds">00</span>
        </div>

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

    const browserTz = (() => {
        try {
            return Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Tokyo';
        } catch(e) {
            return 'Asia/Tokyo';
        }
    })();

    const urlParams = new URLSearchParams(location.search);
    const currentTz = urlParams.get('tz') || browserTz;

    let lastYearNum = 0;
    let timeOffset = 0;
    let newYearShown = false;

    const CITY_JA = {
        'Africa/Abidjan': 'アビジャン（コートジボワール）',
        'Africa/Accra': 'アクラ（ガーナ）',
        'Africa/Addis_Ababa': 'アジスアベバ（エチオピア）',
        'Africa/Algiers': 'アルジェ（アルジェリア）',
        'Africa/Asmara': 'アスマラ（エリトリア）',
        'Africa/Bamako': 'バマコ（マリ）',
        'Africa/Bangui': 'バンギ（中央アフリカ共和国）',
        'Africa/Banjul': 'バンジュール（ガンビア）',
        'Africa/Bissau': 'ビサウ（ギニアビサウ）',
        'Africa/Blantyre': 'ブランタイヤ（マラウイ）',
        'Africa/Brazzaville': 'ブラザビル（コンゴ共和国）',
        'Africa/Bujumbura': 'ブジュンブラ（ブルンジ）',
        'Africa/Cairo': 'カイロ（エジプト）',
        'Africa/Casablanca': 'カサブランカ（モロッコ）',
        'Africa/Ceuta': 'セウタ（スペイン）',
        'Africa/Conakry': 'コナクリ（ギニア）',
        'Africa/Dakar': 'ダカール（セネガル）',
        'Africa/Dar_es_Salaam': 'ダルエスサラーム（タンザニア）',
        'Africa/Djibouti': 'ジブチ（ジブチ）',
        'Africa/Douala': 'ドゥアラ（カメルーン）',
        'Africa/El_Aaiun': 'アイウン（西サハラ）',
        'Africa/Freetown': 'フリータウン（シエラレオネ）',
        'Africa/Gaborone': 'ハボローネ（ボツワナ）',
        'Africa/Harare': 'ハラレ（ジンバブエ）',
        'Africa/Johannesburg': 'ヨハネスブルグ（南アフリカ）',
        'Africa/Juba': 'ジュバ（南スーダン）',
        'Africa/Kampala': 'カンパラ（ウガンダ）',
        'Africa/Khartoum': 'ハルツーム（スーダン）',
        'Africa/Kigali': 'キガリ（ルワンダ）',
        'Africa/Kinshasa': 'キンシャサ（コンゴ民主共和国）',
        'Africa/Lagos': 'ラゴス（ナイジェリア）',
        'Africa/Libreville': 'リーブルヴィル（ガボン）',
        'Africa/Lome': 'ロメ（トーゴ）',
        'Africa/Luanda': 'ルアンダ（アンゴラ）',
        'Africa/Lubumbashi': 'ルブンバシ（コンゴ民主共和国）',
        'Africa/Lusaka': 'ルサカ（ザンビア）',
        'Africa/Malabo': 'マラボ（赤道ギニア）',
        'Africa/Maputo': 'マプト（モザンビーク）',
        'Africa/Maseru': 'マセル（レソト）',
        'Africa/Mbabane': 'ムババーネ（エスワティニ）',
        'Africa/Mogadishu': 'モガディシオ（ソマリア）',
        'Africa/Monrovia': 'モンロビア（リベリア）',
        'Africa/Nairobi': 'ナイロビ（ケニア）',
        'Africa/Ndjamena': 'ンジャメナ（チャド）',
        'Africa/Niamey': 'ニアメ（ニジェール）',
        'Africa/Nouakchott': 'ヌアクショット（モーリタニア）',
        'Africa/Ouagadougou': 'ワガドゥグー（ブルキナファソ）',
        'Africa/Porto-Novo': 'ポルトノボ（ベナン）',
        'Africa/Sao_Tome': 'サントメ（サントメ・プリンシペ）',
        'Africa/Tripoli': 'トリポリ（リビア）',
        'Africa/Tunis': 'チュニス（チュニジア）',
        'Africa/Windhoek': 'ウィントフック（ナミビア）',
        'America/Adak': 'アダック（アメリカ合衆国）',
        'America/Anchorage': 'アンカレッジ（アメリカ合衆国）',
        'America/Anguilla': 'アンギラ（アンギラ）',
        'America/Antigua': 'アンティグア（アンティグア・バーブーダ）',
        'America/Araguaina': 'アラグァイナ（ブラジル）',
        'America/Argentina/Buenos_Aires': 'ブエノスアイレス（アルゼンチン）',
        'America/Argentina/Catamarca': 'カタマルカ（アルゼンチン）',
        'America/Argentina/Cordoba': 'コルドバ（アルゼンチン）',
        'America/Argentina/Jujuy': 'フフイ（アルゼンチン）',
        'America/Argentina/La_Rioja': 'ラリオハ（アルゼンチン）',
        'America/Argentina/Mendoza': 'メンドーサ（アルゼンチン）',
        'America/Argentina/Rio_Gallegos': 'リオガジェゴス（アルゼンチン）',
        'America/Argentina/Salta': 'サルタ（アルゼンチン）',
        'America/Argentina/San_Juan': 'サンフアン（アルゼンチン）',
        'America/Argentina/San_Luis': 'サンルイス（アルゼンチン）',
        'America/Argentina/Tucuman': 'トゥクマン（アルゼンチン）',
        'America/Argentina/Ushuaia': 'ウシュアイア（アルゼンチン）',
        'America/Aruba': 'アルバ（アルバ）',
        'America/Asuncion': 'アスンシオン（パラグアイ）',
        'America/Atikokan': 'アティコカン（カナダ）',
        'America/Bahia': 'バイーア（ブラジル）',
        'America/Bahia_Banderas': 'バイア・デ・バンデラス（メキシコ）',
        'America/Barbados': 'バルバドス（バルバドス）',
        'America/Belem': 'ベレン（ブラジル）',
        'America/Belize': 'ベリーズ（ベリーズ）',
        'America/Blanc-Sablon': 'ブラン・サブロン（カナダ）',
        'America/Boa_Vista': 'ボアビスタ（ブラジル）',
        'America/Bogota': 'ボゴタ（コロンビア）',
        'America/Boise': 'ボイシ（アメリカ合衆国）',
        'America/Cambridge_Bay': 'ケンブリッジベイ（カナダ）',
        'America/Campo_Grande': 'カンポグランデ（ブラジル）',
        'America/Cancun': 'カンクン（メキシコ）',
        'America/Caracas': 'カラカス（ベネズエラ）',
        'America/Cayenne': 'カイエンヌ（仏領ギアナ）',
        'America/Cayman': 'ケイマン（ケイマン諸島）',
        'America/Chicago': 'シカゴ（アメリカ合衆国）',
        'America/Chihuahua': 'チワワ（メキシコ）',
        'America/Ciudad_Juarez': 'シウダー・フアレス（メキシコ）',
        'America/Costa_Rica': 'コスタリカ（コスタリカ）',
        'America/Coyhaique': 'コイアイケ（チリ）',
        'America/Creston': 'クレストン（カナダ）',
        'America/Cuiaba': 'クイアバ（ブラジル）',
        'America/Curacao': 'キュラソー（キュラソー）',
        'America/Danmarkshavn': 'ダンマークスハウン（グリーンランド）',
        'America/Dawson': 'ドーソン（カナダ）',
        'America/Dawson_Creek': 'ドーソンクリーク（カナダ）',
        'America/Denver': 'デンバー（アメリカ合衆国）',
        'America/Detroit': 'デトロイト（アメリカ合衆国）',
        'America/Dominica': 'ドミニカ（ドミニカ国）',
        'America/Edmonton': 'エドモントン（カナダ）',
        'America/Eirunepe': 'エイルネペ（ブラジル）',
        'America/El_Salvador': 'エルサルバドル（エルサルバドル）',
        'America/Fort_Nelson': 'フォートネルソン（カナダ）',
        'America/Fortaleza': 'フォルタレザ（ブラジル）',
        'America/Glace_Bay': 'グレースベイ（カナダ）',
        'America/Goose_Bay': 'グースベイ（カナダ）',
        'America/Grand_Turk': 'グランドターク（タークス・カイコス諸島）',
        'America/Grenada': 'グレナダ（グレナダ）',
        'America/Guadeloupe': 'グアドループ（グアドループ）',
        'America/Guatemala': 'グアテマラ（グアテマラ）',
        'America/Guayaquil': 'グアヤキル（エクアドル）',
        'America/Guyana': 'ガイアナ（ガイアナ）',
        'America/Halifax': 'ハリファクス（カナダ）',
        'America/Havana': 'ハバナ（キューバ）',
        'America/Hermosillo': 'エルモシヨ（メキシコ）',
        'America/Indiana/Indianapolis': 'インディアナポリス（アメリカ合衆国）',
        'America/Indiana/Knox': 'ノックス（アメリカ合衆国）',
        'America/Indiana/Marengo': 'マレンゴ（アメリカ合衆国）',
        'America/Indiana/Petersburg': 'ピーターズバーグ（アメリカ合衆国）',
        'America/Indiana/Tell_City': 'テルシティ（アメリカ合衆国）',
        'America/Indiana/Vevay': 'ビベー（アメリカ合衆国）',
        'America/Indiana/Vincennes': 'ビンセンス（アメリカ合衆国）',
        'America/Indiana/Winamac': 'ウィナマック（アメリカ合衆国）',
        'America/Inuvik': 'イヌヴィク（カナダ）',
        'America/Iqaluit': 'イカルイット（カナダ）',
        'America/Jamaica': 'ジャマイカ（ジャマイカ）',
        'America/Juneau': 'ジュノー（アメリカ合衆国）',
        'America/Kentucky/Louisville': 'ルイビル（アメリカ合衆国）',
        'America/Kentucky/Monticello': 'モンティチェロ（アメリカ合衆国）',
        'America/Kralendijk': 'クラレンダイク（オランダ領カリブ）',
        'America/La_Paz': 'ラパス（ボリビア）',
        'America/Lima': 'リマ（ペルー）',
        'America/Los_Angeles': 'ロサンゼルス（アメリカ合衆国）',
        'America/Lower_Princes': 'ローワー・プリンセズ・クウォーター（シント・マールテン）',
        'America/Maceio': 'マセイオ（ブラジル）',
        'America/Managua': 'マナグア（ニカラグア）',
        'America/Manaus': 'マナウス（ブラジル）',
        'America/Marigot': 'マリゴ（サン・マルタン）',
        'America/Martinique': 'マルティニーク（マルティニーク）',
        'America/Matamoros': 'マタモロス（メキシコ）',
        'America/Mazatlan': 'マサトラン（メキシコ）',
        'America/Menominee': 'メノミニー（アメリカ合衆国）',
        'America/Merida': 'メリダ（メキシコ）',
        'America/Metlakatla': 'メトラカトラ（アメリカ合衆国）',
        'America/Mexico_City': 'メキシコシティ（メキシコ）',
        'America/Miquelon': 'ミクロン島（サンピエール島・ミクロン島）',
        'America/Moncton': 'モンクトン（カナダ）',
        'America/Monterrey': 'モンテレイ（メキシコ）',
        'America/Montevideo': 'モンテビデオ（ウルグアイ）',
        'America/Montserrat': 'モントセラト（モントセラト）',
        'America/Nassau': 'ナッソー（バハマ）',
        'America/New_York': 'ニューヨーク（アメリカ合衆国）',
        'America/Nome': 'ノーム（アメリカ合衆国）',
        'America/Noronha': 'ノローニャ（ブラジル）',
        'America/North_Dakota/Beulah': 'ビューラー（アメリカ合衆国）',
        'America/North_Dakota/Center': 'センター（アメリカ合衆国）',
        'America/North_Dakota/New_Salem': 'ニューセーラム（アメリカ合衆国）',
        'America/Nuuk': 'ヌーク（グリーンランド）',
        'America/Ojinaga': 'オヒナガ（メキシコ）',
        'America/Panama': 'パナマ（パナマ）',
        'America/Paramaribo': 'パラマリボ（スリナム）',
        'America/Phoenix': 'フェニックス（アメリカ合衆国）',
        'America/Port-au-Prince': 'ポルトープランス（ハイチ）',
        'America/Port_of_Spain': 'ポートオブスペイン（トリニダード・トバゴ）',
        'America/Porto_Velho': 'ポルトベーリョ（ブラジル）',
        'America/Puerto_Rico': 'プエルトリコ（プエルトリコ）',
        'America/Punta_Arenas': 'プンタアレナス（チリ）',
        'America/Rankin_Inlet': 'ランキンインレット（カナダ）',
        'America/Recife': 'レシフェ（ブラジル）',
        'America/Regina': 'レジャイナ（カナダ）',
        'America/Resolute': 'レゾリュート（カナダ）',
        'America/Rio_Branco': 'リオブランコ（ブラジル）',
        'America/Santarem': 'サンタレン（ブラジル）',
        'America/Santiago': 'サンティアゴ（チリ）',
        'America/Santo_Domingo': 'サントドミンゴ（ドミニカ共和国）',
        'America/Sao_Paulo': 'サンパウロ（ブラジル）',
        'America/Scoresbysund': 'イトコルトルミット（グリーンランド）',
        'America/Sitka': 'シトカ（アメリカ合衆国）',
        'America/St_Barthelemy': 'サン・バルテルミー（サン・バルテルミー）',
        'America/St_Johns': 'セントジョンズ（カナダ）',
        'America/St_Kitts': 'セントクリストファー（セントクリストファー・ネーヴィス）',
        'America/St_Lucia': 'セントルシア（セントルシア）',
        'America/St_Thomas': 'セントトーマス（米領ヴァージン諸島）',
        'America/St_Vincent': 'セントビンセント（セントビンセント及びグレナディーン諸島）',
        'America/Swift_Current': 'スウィフトカレント（カナダ）',
        'America/Tegucigalpa': 'テグシガルパ（ホンジュラス）',
        'America/Thule': 'チューレ（グリーンランド）',
        'America/Tijuana': 'ティフアナ（メキシコ）',
        'America/Toronto': 'トロント（カナダ）',
        'America/Tortola': 'トルトーラ（英領ヴァージン諸島）',
        'America/Vancouver': 'バンクーバー（カナダ）',
        'America/Whitehorse': 'ホワイトホース（カナダ）',
        'America/Winnipeg': 'ウィニペグ（カナダ）',
        'America/Yakutat': 'ヤクタット（アメリカ合衆国）',
        'Antarctica/Casey': 'ケーシー基地（南極）',
        'Antarctica/Davis': 'デービス基地（南極）',
        'Antarctica/DumontDUrville': 'デュモン・デュルヴィル基地（南極）',
        'Antarctica/Macquarie': 'マッコリー島（オーストラリア）',
        'Antarctica/Mawson': 'モーソン基地（南極）',
        'Antarctica/McMurdo': 'マクマード基地（南極）',
        'Antarctica/Palmer': 'パーマー基地（南極）',
        'Antarctica/Rothera': 'ロゼラ基地（南極）',
        'Antarctica/Syowa': '昭和基地（南極）',
        'Antarctica/Troll': 'トロル基地（南極）',
        'Antarctica/Vostok': 'ボストーク基地（南極）',
        'Arctic/Longyearbyen': 'ロングイェールビーン（スバールバル諸島）',
        'Asia/Aden': 'アデン（イエメン）',
        'Asia/Almaty': 'アルマトイ（カザフスタン）',
        'Asia/Amman': 'アンマン（ヨルダン）',
        'Asia/Anadyr': 'アナディリ（ロシア）',
        'Asia/Aqtau': 'アクタウ（カザフスタン）',
        'Asia/Aqtobe': 'アクトベ（カザフスタン）',
        'Asia/Ashgabat': 'アシガバード（トルクメニスタン）',
        'Asia/Atyrau': 'アティラウ（カザフスタン）',
        'Asia/Baghdad': 'バグダッド（イラク）',
        'Asia/Bahrain': 'バーレーン（バーレーン）',
        'Asia/Baku': 'バクー（アゼルバイジャン）',
        'Asia/Bangkok': 'バンコク（タイ）',
        'Asia/Barnaul': 'バルナウル（ロシア）',
        'Asia/Beirut': 'ベイルート（レバノン）',
        'Asia/Bishkek': 'ビシュケク（キルギス）',
        'Asia/Brunei': 'ブルネイ（ブルネイ）',
        'Asia/Chita': 'チタ（ロシア）',
        'Asia/Colombo': 'コロンボ（スリランカ）',
        'Asia/Damascus': 'ダマスカス（シリア）',
        'Asia/Dhaka': 'ダッカ（バングラデシュ）',
        'Asia/Dili': 'ディリ（東ティモール）',
        'Asia/Dubai': 'ドバイ（アラブ首長国連邦）',
        'Asia/Dushanbe': 'ドゥシャンベ（タジキスタン）',
        'Asia/Famagusta': 'ファマグスタ（キプロス）',
        'Asia/Gaza': 'ガザ（パレスチナ）',
        'Asia/Hebron': 'ヘブロン（パレスチナ）',
        'Asia/Ho_Chi_Minh': 'ホーチミン（ベトナム）',
        'Asia/Hong_Kong': '香港（中国）',
        'Asia/Hovd': 'ホブド（モンゴル）',
        'Asia/Irkutsk': 'イルクーツク（ロシア）',
        'Asia/Jakarta': 'ジャカルタ（インドネシア）',
        'Asia/Jayapura': 'ジャヤプラ（インドネシア）',
        'Asia/Jerusalem': 'エルサレム（イスラエル）',
        'Asia/Kabul': 'カブール（アフガニスタン）',
        'Asia/Kamchatka': 'カムチャッカ（ロシア）',
        'Asia/Karachi': 'カラチ（パキスタン）',
        'Asia/Kathmandu': 'カトマンズ（ネパール）',
        'Asia/Khandyga': 'ハンドゥイガ（ロシア）',
        'Asia/Kolkata': 'コルカタ（インド）',
        'Asia/Krasnoyarsk': 'クラスノヤルスク（ロシア）',
        'Asia/Kuala_Lumpur': 'クアラルンプール（マレーシア）',
        'Asia/Kuching': 'クチン（マレーシア）',
        'Asia/Kuwait': 'クウェート（クウェート）',
        'Asia/Macau': 'マカオ（中国）',
        'Asia/Magadan': 'マガダン（ロシア）',
        'Asia/Makassar': 'マカッサル（インドネシア）',
        'Asia/Manila': 'マニラ（フィリピン）',
        'Asia/Muscat': 'マスカット（オマーン）',
        'Asia/Nicosia': 'ニコシア（キプロス）',
        'Asia/Novokuznetsk': 'ノヴォクズネツク（ロシア）',
        'Asia/Novosibirsk': 'ノヴォシビルスク（ロシア）',
        'Asia/Omsk': 'オムスク（ロシア）',
        'Asia/Oral': 'オラル（カザフスタン）',
        'Asia/Phnom_Penh': 'プノンペン（カンボジア）',
        'Asia/Pontianak': 'ポンティアナック（インドネシア）',
        'Asia/Pyongyang': '平壌（北朝鮮）',
        'Asia/Qatar': 'カタール（カタール）',
        'Asia/Qostanay': 'コスタナイ（カザフスタン）',
        'Asia/Qyzylorda': 'クズロルダ（カザフスタン）',
        'Asia/Riyadh': 'リヤド（サウジアラビア）',
        'Asia/Sakhalin': 'サハリン（ロシア）',
        'Asia/Samarkand': 'サマルカンド（ウズベキスタン）',
        'Asia/Seoul': 'ソウル（韓国）',
        'Asia/Shanghai': '上海（中国）',
        'Asia/Singapore': 'シンガポール（シンガポール）',
        'Asia/Srednekolymsk': 'スレドネコリムスク（ロシア）',
        'Asia/Taipei': '台北（台湾）',
        'Asia/Tashkent': 'タシケント（ウズベキスタン）',
        'Asia/Tbilisi': 'トビリシ（ジョージア）',
        'Asia/Tehran': 'テヘラン（イラン）',
        'Asia/Thimphu': 'ティンプー（ブータン）',
        'Asia/Tokyo': '東京（日本）',
        'Asia/Tomsk': 'トムスク（ロシア）',
        'Asia/Ulaanbaatar': 'ウランバートル（モンゴル）',
        'Asia/Urumqi': 'ウルムチ（中国）',
        'Asia/Ust-Nera': 'ウスチネラ（ロシア）',
        'Asia/Vientiane': 'ビエンチャン（ラオス）',
        'Asia/Vladivostok': 'ウラジオストク（ロシア）',
        'Asia/Yakutsk': 'ヤクーツク（ロシア）',
        'Asia/Yangon': 'ヤンゴン（ミャンマー）',
        'Asia/Yekaterinburg': 'エカテリンブルク（ロシア）',
        'Asia/Yerevan': 'エレバン（アルメニア）',
        'Atlantic/Azores': 'アゾレス諸島（ポルトガル）',
        'Atlantic/Bermuda': 'バミューダ（バミューダ）',
        'Atlantic/Canary': 'カナリア諸島（スペイン）',
        'Atlantic/Cape_Verde': 'カーボベルデ（カーボベルデ）',
        'Atlantic/Faroe': 'フェロー諸島（フェロー諸島）',
        'Atlantic/Madeira': 'マデイラ（ポルトガル）',
        'Atlantic/Reykjavik': 'レイキャビク（アイスランド）',
        'Atlantic/South_Georgia': 'サウスジョージア（サウスジョージア・サウスサンドウィッチ諸島）',
        'Atlantic/St_Helena': 'セントヘレナ（セントヘレナ）',
        'Atlantic/Stanley': 'スタンレー（フォークランド諸島）',
        'Australia/Adelaide': 'アデレード（オーストラリア）',
        'Australia/Brisbane': 'ブリスベン（オーストラリア）',
        'Australia/Broken_Hill': 'ブロークンヒル（オーストラリア）',
        'Australia/Darwin': 'ダーウィン（オーストラリア）',
        'Australia/Eucla': 'ユークラ（オーストラリア）',
        'Australia/Hobart': 'ホバート（オーストラリア）',
        'Australia/Lindeman': 'リンデマン（オーストラリア）',
        'Australia/Lord_Howe': 'ロードハウ島（オーストラリア）',
        'Australia/Melbourne': 'メルボルン（オーストラリア）',
        'Australia/Perth': 'パース（オーストラリア）',
        'Australia/Sydney': 'シドニー（オーストラリア）',
        'Canada/Atlantic': 'カナダ大西洋時間',
        'Canada/Central': 'カナダ中部時間',
        'Canada/Eastern': 'カナダ東部時間',
        'Canada/Mountain': 'カナダ山岳部時間',
        'Canada/Newfoundland': 'カナダ・ニューファンドランド時間',
        'Canada/Pacific': 'カナダ太平洋時間',
        'Europe/Amsterdam': 'アムステルダム（オランダ）',
        'Europe/Andorra': 'アンドラ（アンドラ）',
        'Europe/Astrakhan': 'アストラハン（ロシア）',
        'Europe/Athens': 'アテネ（ギリシャ）',
        'Europe/Belgrade': 'ベオグラード（セルビア）',
        'Europe/Berlin': 'ベルリン（ドイツ）',
        'Europe/Bratislava': 'ブラチスラバ（スロバキア）',
        'Europe/Brussels': 'ブリュッセル（ベルギー）',
        'Europe/Bucharest': 'ブカレスト（ルーマニア）',
        'Europe/Budapest': 'ブダペスト（ハンガリー）',
        'Europe/Busingen': 'ビュージンゲン（ドイツ）',
        'Europe/Chisinau': 'キシナウ（モルドバ）',
        'Europe/Copenhagen': 'コペンハーゲン（デンマーク）',
        'Europe/Dublin': 'ダブリン（アイルランド）',
        'Europe/Gibraltar': 'ジブラルタル（ジブラルタル）',
        'Europe/Guernsey': 'ガーンジー（ガーンジー）',
        'Europe/Helsinki': 'ヘルシンキ（フィンランド）',
        'Europe/Isle_of_Man': 'マン島（マン島）',
        'Europe/Istanbul': 'イスタンブール（トルコ）',
        'Europe/Jersey': 'ジャージー（ジャージー）',
        'Europe/Kaliningrad': 'カリーニングラード（ロシア）',
        'Europe/Kirov': 'キーロフ（ロシア）',
        'Europe/Kyiv': 'キーウ（ウクライナ）',
        'Europe/Lisbon': 'リスボン（ポルトガル）',
        'Europe/Ljubljana': 'リュブリャナ（スロベニア）',
        'Europe/London': 'ロンドン（イギリス）',
        'Europe/Luxembourg': 'ルクセンブルク（ルクセンブルク）',
        'Europe/Madrid': 'マドリード（スペイン）',
        'Europe/Malta': 'マルタ（マルタ）',
        'Europe/Mariehamn': 'マリエハムン（オーランド諸島）',
        'Europe/Minsk': 'ミンスク（ベラルーシ）',
        'Europe/Monaco': 'モナコ（モナコ）',
        'Europe/Moscow': 'モスクワ（ロシア）',
        'Europe/Oslo': 'オスロ（ノルウェー）',
        'Europe/Paris': 'パリ（フランス）',
        'Europe/Podgorica': 'ポドゴリツァ（モンテネグロ）',
        'Europe/Prague': 'プラハ（チェコ）',
        'Europe/Riga': 'リガ（ラトビア）',
        'Europe/Rome': 'ローマ（イタリア）',
        'Europe/Samara': 'サマラ（ロシア）',
        'Europe/San_Marino': 'サンマリノ（サンマリノ）',
        'Europe/Sarajevo': 'サラエボ（ボスニア・ヘルツェゴビナ）',
        'Europe/Saratov': 'サラトフ（ロシア）',
        'Europe/Simferopol': 'シンフェロポリ（クリミア）',
        'Europe/Skopje': 'スコピエ（北マケドニア）',
        'Europe/Sofia': 'ソフィア（ブルガリア）',
        'Europe/Stockholm': 'ストックホルム（スウェーデン）',
        'Europe/Tallinn': 'タリン（エストニア）',
        'Europe/Tirane': 'ティラナ（アルバニア）',
        'Europe/Ulyanovsk': 'ウリヤノフスク（ロシア）',
        'Europe/Vaduz': 'ファドゥーツ（リヒテンシュタイン）',
        'Europe/Vatican': 'バチカン（バチカン市国）',
        'Europe/Vienna': 'ウィーン（オーストリア）',
        'Europe/Vilnius': 'ヴィリニュス（リトアニア）',
        'Europe/Volgograd': 'ボルゴグラード（ロシア）',
        'Europe/Warsaw': 'ワルシャワ（ポーランド）',
        'Europe/Zagreb': 'ザグレブ（クロアチア）',
        'Europe/Zurich': 'チューリッヒ（スイス）',
        'GMT': '協定世界時',
        'Indian/Antananarivo': 'アンタナナリボ（マダガスカル）',
        'Indian/Chagos': 'チャゴス諸島（英領インド洋地域）',
        'Indian/Christmas': 'クリスマス島（クリスマス島）',
        'Indian/Cocos': 'ココス諸島（ココス諸島）',
        'Indian/Comoro': 'コモロ（コモロ）',
        'Indian/Kerguelen': 'ケルゲレン諸島（仏領極南諸島）',
        'Indian/Mahe': 'マヘ（セーシェル）',
        'Indian/Maldives': 'モルディブ（モルディブ）',
        'Indian/Mauritius': 'モーリシャス（モーリシャス）',
        'Indian/Mayotte': 'マヨット（マヨット）',
        'Indian/Reunion': 'レユニオン（レユニオン）',
        'Pacific/Apia': 'アピア（サモア）',
        'Pacific/Auckland': 'オークランド（ニュージーランド）',
        'Pacific/Bougainville': 'ブーゲンビル（パプアニューギニア）',
        'Pacific/Chatham': 'チャタム諸島（ニュージーランド）',
        'Pacific/Chuuk': 'チューク（ミクロネシア連邦）',
        'Pacific/Easter': 'イースター島（チリ）',
        'Pacific/Efate': 'エファテ島（バヌアツ）',
        'Pacific/Fakaofo': 'ファカオフォ（トケラウ）',
        'Pacific/Fiji': 'フィジー（フィジー）',
        'Pacific/Funafuti': 'フナフティ（ツバル）',
        'Pacific/Galapagos': 'ガラパゴス諸島（エクアドル）',
        'Pacific/Gambier': 'ガンビエ諸島（仏領ポリネシア）',
        'Pacific/Guadalcanal': 'ガダルカナル（ソロモン諸島）',
        'Pacific/Guam': 'グアム（グアム）',
        'Pacific/Honolulu': 'ホノルル（アメリカ合衆国）',
        'Pacific/Kanton': 'カントン島（キリバス）',
        'Pacific/Kiritimati': 'キリスィマスィ島（キリバス）',
        'Pacific/Kosrae': 'コスラエ（ミクロネシア連邦）',
        'Pacific/Kwajalein': 'クェゼリン（マーシャル諸島）',
        'Pacific/Majuro': 'マジュロ（マーシャル諸島）',
        'Pacific/Marquesas': 'マルキーズ諸島（仏領ポリネシア）',
        'Pacific/Midway': 'ミッドウェー島（アメリカ合衆国）',
        'Pacific/Nauru': 'ナウル（ナウル）',
        'Pacific/Niue': 'ニウエ（ニウエ）',
        'Pacific/Norfolk': 'ノーフォーク島（ノーフォーク島）',
        'Pacific/Noumea': 'ヌメア（ニューカレドニア）',
        'Pacific/Pago_Pago': 'パゴパゴ（米領サモア）',
        'Pacific/Palau': 'パラオ（パラオ）',
        'Pacific/Pitcairn': 'ピトケアン諸島（ピトケアン諸島）',
        'Pacific/Pohnpei': 'ポンペイ（ミクロネシア連邦）',
        'Pacific/Port_Moresby': 'ポートモレスビー（パプアニューギニア）',
        'Pacific/Rarotonga': 'ラロトンガ（クック諸島）',
        'Pacific/Saipan': 'サイパン（北マリアナ諸島）',
        'Pacific/Tahiti': 'タヒチ（仏領ポリネシア）',
        'Pacific/Tarawa': 'タラワ（キリバス）',
        'Pacific/Tongatapu': 'トンガタプ（トンガ）',
        'Pacific/Wake': 'ウェーク島（アメリカ合衆国）',
        'Pacific/Wallis': 'ウォリス諸島（ウォリス・フツナ）',
        'US/Alaska': 'アラスカ時間',
        'US/Arizona': 'アリゾナ時間',
        'US/Central': 'アメリカ中部時間',
        'US/Eastern': 'アメリカ東部時間',
        'US/Hawaii': 'ハワイ時間',
        'US/Mountain': 'アメリカ山岳部時間',
        'US/Pacific': 'アメリカ太平洋時間',
        'Africa/Asmera': 'アスマラ（エリトリア）',
        'America/Buenos_Aires': 'ブエノスアイレス（アルゼンチン）',
        'America/Catamarca': 'カタマルカ（アルゼンチン）',
        'America/Coral_Harbour': 'コーラルハーバー（カナダ）',
        'America/Cordoba': 'コルドバ（アルゼンチン）',
        'America/Godthab': 'ヌーク（グリーンランド）',
        'America/Indianapolis': 'インディアナポリス（アメリカ合衆国）',
        'America/Jujuy': 'フフイ（アルゼンチン）',
        'America/Louisville': 'ルイビル（アメリカ合衆国）',
        'America/Mendoza': 'メンドーサ（アルゼンチン）',
        'Asia/Calcutta': 'コルカタ（インド）',
        'Asia/Katmandu': 'カトマンズ（ネパール）',
        'Asia/Rangoon': 'ヤンゴン（ミャンマー）',
        'Asia/Saigon': 'ホーチミン（ベトナム）',
        'Atlantic/Faeroe': 'フェロー諸島（フェロー諸島）',
        'Europe/Kiev': 'キーウ（ウクライナ）',
        'Pacific/Enderbury': 'エンダーベリー島（キリバス）',
        'Pacific/Ponape': 'ポナペ（ミクロネシア連邦）',
        'Pacific/Truk': 'チューク（ミクロネシア連邦）',
        'UTC': '協定世界時'
    }

    function getCityDisplayName(z) {
        if (isJa && CITY_JA[z]) return CITY_JA[z];

        const parts = z.split('/');
        return parts[parts.length - 1].replace(/_/g, ' ');
    }

    function getTimeZoneInfo(tzName, date) {
        const d = date || new Date();

        try {
            const parts = new Intl.DateTimeFormat(
                isJa ? 'ja-JP' : 'en-US',
                {
                    timeZone: tzName,
                    timeZoneName: 'long',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    hourCycle: 'h23'
                }
            ).formatToParts(d);

            const tzLong = (
                parts.find(p => p.type === 'timeZoneName') || {}
            ).value || '';

            const h = (parts.find(p => p.type === 'hour') || {}).value || '00';
            const m = (parts.find(p => p.type === 'minute') || {}).value || '00';
            const s = (parts.find(p => p.type === 'second') || {}).value || '00';

            const offParts = new Intl.DateTimeFormat('en-US', {
                timeZone: tzName,
                timeZoneName: 'longOffset'
            }).formatToParts(d);

            const gmt = (
                offParts.find(p => p.type === 'timeZoneName') || {}
            ).value || 'GMT+00:00';

            const utcOffset = gmt.replace('GMT', 'UTC');

            let minutes = 0;
            const match = gmt.match(/GMT([+-])(\\d{2}):(\\d{2})/);

            if (match) {
                const sign = match[1] === '-' ? -1 : 1;
                minutes = sign * (
                    parseInt(match[2], 10) * 60 +
                    parseInt(match[3], 10)
                );
            }

            return {
                tz: tzName,
                city: getCityDisplayName(tzName),
                name: tzLong,
                utcOffset,
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

    (function() {
        const sel = document.getElementById('tzSelect');

        let zones = [];

        try {
            if (
                typeof Intl !== 'undefined' &&
                typeof Intl.supportedValuesOf === 'function'
            ) {
                zones = Intl.supportedValuesOf('timeZone');
            }
        } catch(e) {}

        if (zones.length === 0) {
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

        const now = new Date();

        const utcInfo = getTimeZoneInfo('UTC', now);
        const utcGroup = document.createElement('optgroup');
        utcGroup.label = 'UTC';

        const utcOption = document.createElement('option');
        utcOption.value = 'UTC';
        utcOption.textContent = utcInfo.city + ' - ' + utcInfo.utcOffset;
        utcOption.selected = currentTz === 'UTC';
        utcGroup.appendChild(utcOption);

        const jstOption = document.createElement('option');
        jstOption.value = 'Asia/Tokyo';
        jstOption.textContent = isJa ? 'JST（日本時間）' : 'JST (Japan Standard Time)';
        jstOption.selected = currentTz === 'Asia/Tokyo';
        utcGroup.appendChild(jstOption);

        sel.appendChild(utcGroup);

        const tzList = zones
            .filter(z => z !== 'UTC')
            .map(z => getTimeZoneInfo(z, now));

        tzList.sort((a, b) => {
            if (a.offsetMinutes !== b.offsetMinutes) {
                return a.offsetMinutes - b.offsetMinutes;
            }

            return a.city.localeCompare(b.city);
        });

        tzList.forEach(info => {
            const opt = document.createElement('option');

            opt.value = info.tz;

            opt.textContent = info.city + ' - ' + info.utcOffset;

            if (info.tz === currentTz) {
                opt.selected = true;
            }

            sel.appendChild(opt);
        });

        if (
            currentTz !== 'UTC' &&
            currentTz !== 'Asia/Tokyo' &&
            !zones.includes(currentTz)
        ) {
            const opt = document.createElement('option');
            opt.value = currentTz;
            const currentInfo = getTimeZoneInfo(currentTz, now);
            opt.textContent = currentInfo.city + ' - ' + currentInfo.utcOffset;
            opt.selected = true;
            sel.insertBefore(opt, sel.firstChild);
        }
    })();

    function toggleTzPanel() {
        const panel = document.getElementById('tzPanel');
        const isOpen = panel.style.display === 'block';

        panel.style.display = isOpen ? 'none' : 'block';

        document.getElementById('tzSettingsBtn')
            .setAttribute('aria-expanded', String(!isOpen));

        document.getElementById('tzHeaderBtn')
            .setAttribute('aria-expanded', String(!isOpen));
    }

    document.getElementById('tzSettingsBtn')
        .addEventListener('click', toggleTzPanel);

    document.getElementById('tzHeaderBtn')
        .addEventListener('click', toggleTzPanel);

    document.addEventListener('click', function(e) {
        const panel = document.getElementById('tzPanel');
        const settings = document.getElementById('tzSettingsBtn');
        const headerBtn = document.getElementById('tzHeaderBtn');

        if (
            panel.style.display === 'block' &&
            !panel.contains(e.target) &&
            !settings.contains(e.target) &&
            !headerBtn.contains(e.target)
        ) {
            panel.style.display = 'none';
            settings.setAttribute('aria-expanded', 'false');
            headerBtn.setAttribute('aria-expanded', 'false');
        }
    });

    document.getElementById('tzSelect')
        .addEventListener('change', function() {
            const u = new URL(location.href);

            if (this.value === browserTz) {
                u.searchParams.delete('tz');
            } else {
                u.searchParams.set('tz', this.value);
            }

            location.href = u.toString();
        });

    document.getElementById('langSelect')
        .addEventListener('change', function() {
            const u = new URL(location.href);

            if (this.value === 'ja') {
                u.searchParams.delete('lang');
            } else {
                u.searchParams.set('lang', this.value);
            }

            location.href = u.toString();
        });

    async function syncTime() {
        let hostPref = null;

        const hn = location.hostname;

        if (hn.includes('hamuzon-jp.f5.si')) {
            hostPref = 'hamuzon-jp';
        } else if (hn.includes('hamusata.f5.si')) {
            hostPref = 'hamusata';
        }

        const encTz = encodeURIComponent(currentTz || 'UTC');

        function parseData(d) {
            if (!d) return null;

            if (typeof d.unix_ms === 'number') {
                return d.unix_ms;
            }

            if (typeof d.unixtime === 'number') {
                return d.unixtime * 1000;
            }

            if (typeof d.timestamp === 'number') {
                return d.timestamp * 1000;
            }

            if (d.utc_datetime) {
                return Date.parse(d.utc_datetime);
            }

            if (d.dateTime) {
                return Date.parse(String(d.dateTime).trim());
            }

            return null;
        }

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

        let urls = [];

        if (hostPref === 'hamuzon-jp') {
            urls = [...hamuzonEndpoints, ...hamusataEndpoints, externalEndpoint];
        } else if (hostPref === 'hamusata') {
            urls = [...hamusataEndpoints, ...hamuzonEndpoints, externalEndpoint];
        } else {
            urls = [...hamuzonEndpoints, ...hamusataEndpoints, externalEndpoint];
        }

        for (const endpoint of urls) {
            try {
                const sendTime = Date.now();

                const res = await fetch(endpoint, {
                    cache: 'no-store'
                });

                if (!res.ok) continue;

                const receiveTime = Date.now();
                const data = await res.json();
                const serverMs = parseData(data);

                if (!serverMs || isNaN(serverMs)) continue;

                const rtt = receiveTime - sendTime;

                timeOffset = serverMs + rtt / 2 - receiveTime;

                return;

            } catch(e) {}
        }
    }

    function getNow() {
        return new Date(Date.now() + timeOffset);
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

    function getTzParts(date) {
        const parts = tzFormatter.formatToParts(date);

        const g = type => {
            const item = parts.find(p => p.type === type);
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

    function getNewYearUtcMs(year) {
        const guessUtc = Date.UTC(year, 0, 1, 0, 0, 0);

        const p = getTzParts(new Date(guessUtc));

        const localAsUtc = Date.UTC(
            p.year,
            p.month - 1,
            p.day,
            p.hour,
            p.minute,
            p.second
        );

        const offsetMs = localAsUtc - guessUtc;

        return guessUtc - offsetMs;
    }

    function updateCountdown() {
        const now = getNow();
        const p = getTzParts(now);

        const yr = p.year;
        const month = p.month - 1;
        const day = p.day;

        const isNewYear = month === 0 && day === 1;

        if (isNewYear && !newYearShown) {
            newYearShown = true;

            const dispYear = yr;

            const msg1 = isJa
                ? '🎉 新年（元旦）になりました！ 🎉'
                : '🎉 Happy New Year! 🎉';

            const msg2 = isJa
                ? 'あけましておめでとうございます！'
                : 'Wishing you a wonderful year!';

            const titleMsg = isJa
                ? dispYear + '年 あけましておめでとう！'
                : 'Happy New Year ' + dispYear + '!';

            document.querySelector('.countLabel').textContent = '';

            document.querySelector('.countdown').innerHTML =
                '<div class="newYearBlock">' +
                msg1 +
                '<br><span class="newYearYear">' +
                dispYear +
                (isJa ? '年' : '') +
                '</span><br>' +
                msg2 +
                '</div>';

            document.querySelector('.countText').textContent = '';

            document.getElementById('page_title').textContent = titleMsg;
            document.title = titleMsg;

            return;
        }

        if (isNewYear) return;

        const targetMs = getNewYearUtcMs(yr + 1);
        const remaining = targetMs - now.getTime();

        const days = Math.floor(remaining / 86400000);
        const hours = Math.floor((remaining / 3600000) % 24);
        const minutes = Math.floor((remaining / 60000) % 60);
        const seconds = Math.floor((remaining / 1000) % 60);
        const milliseconds = Math.floor((remaining / 10) % 100);

        document.querySelector('.days').textContent = days;

        document.querySelector('.hours').textContent =
            String(hours).padStart(2, '0');

        document.querySelector('.minutes').textContent =
            String(minutes).padStart(2, '0');

        document.querySelector('.seconds').textContent =
            String(seconds).padStart(2, '0');

        document.querySelector('.milliseconds').textContent =
            String(milliseconds).padStart(2, '0');

        const nextYearNum = yr + 1;

        if (lastYearNum !== nextYearNum) {
            lastYearNum = nextYearNum;

            const countTxt = isJa
                ? nextYearNum + '年'
                : String(nextYearNum);

            const titleTxt = isJa
                ? nextYearNum + '年カウントダウン！'
                : 'Countdown to ' + nextYearNum + '!';

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

        document.querySelector('.nowHour').textContent =
            String(p.hour).padStart(2, '0');

        document.querySelector('.nowMinute').textContent =
            String(p.minute).padStart(2, '0');

        document.querySelector('.nowSecond').textContent =
            String(p.second).padStart(2, '0');

        const curInfo = getTimeZoneInfo(currentTz, now);

        const headerNameEl = document.getElementById('tzHeaderName');

        if (headerNameEl) {
            headerNameEl.textContent =
                curInfo.city + ' [' + curInfo.utcOffset + ']';
        }

        const detailEl = document.getElementById('tzCurrentDetail');

        if (detailEl) {
            detailEl.replaceChildren();

            const title = document.createElement('b');
            title.textContent = isJa ? '選択中: ' : 'Selected: ';

            const city = document.createElement('span');
            city.textContent = curInfo.city;

            const name = document.createElement('div');
            name.textContent = curInfo.name + ' (' + curInfo.utcOffset + ')';

            const zone = document.createElement('div');
            zone.style.opacity = '.75';
            zone.textContent = currentTz;

            const time = document.createElement('div');
            time.textContent =
                (isJa ? '現地時間: ' : 'Local time: ') + curInfo.time;

            detailEl.append(title, city, name, zone, time);
        }
    }

    updateCountdown();
    updateNowTime();

    setInterval(updateCountdown, 10);
    setInterval(updateNowTime, 1000);

    syncTime();
    setInterval(syncTime, 30 * 60 * 1000);
</script>

</body>
</html>`;

    return new Response(html, {
        headers: {
            'content-type': 'text/html;charset=UTF-8',
            'cache-control': 'no-cache'
        }
    });
}
