export async function onRequest(context) {
    const { request } = context;
    const url = new URL(request.url);
    const hostname = url.hostname;

    const baseYear = 2025;
    const currentYear = parseInt(new Intl.DateTimeFormat('en-US', { year: 'numeric', timeZone: 'Asia/Tokyo' }).format(new Date()));
    const nextYear = currentYear + 1;
    const yearDisplay = currentYear > baseYear ? `${baseYear}–${currentYear}` : baseYear;

    let copyrightContent = "";
      if (hostname.includes("hamusata.f5.si")) {
        copyrightContent = `&copy; ${yearDisplay} <a href="https://hamusata.f5.si" target="_blank" rel="noopener noreferrer">@hamusata</a>`;
    } else if (hostname.includes("hamuzon-jp.f5.si")) {
        copyrightContent = `&copy; ${yearDisplay} <a href="https://hamusata.f5.si" target="_blank" rel="noopener noreferrer">@hamuzon</a>`;
    } else {
        copyrightContent = `&copy; ${yearDisplay} New Year Countdown`;
    }

    const html = `<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${nextYear}年カウントダウン</title>
<meta name="description" content="${nextYear}年（来年）の元旦までの残り時間をリアルタイムでカウントダウン表示します。年越しまであと何日、何時間、何分、何秒かを確認できるシンプルなタイマーサイトです。">
<meta property="og:title" content="${nextYear}年カウントダウン！">
<meta property="og:description" content="来年 (${nextYear})年の元旦までの残り時間をリアルタイムでカウントダウン！">
<meta property="og:type" content="website">
<meta name="twitter:card" content="summary">
<script>
    const theme = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    document.documentElement.className = theme;
</script>
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@100;700&family=Orbitron:wght@400;700&display=swap" rel="stylesheet">
<style>
    * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
        font-family: 'Noto Sans JP', 'Arial', sans-serif;
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
        position: fixed;
        top: 0;
        width: 100%;
        padding: 1rem 0;
        background: rgba(255, 255, 255, 0.05);
        backdrop-filter: blur(12px);
        z-index: 10;
    }

    #page_title {
        font-size: clamp(1.2rem, 4vw, 2.2rem);
        font-weight: 600;
    }

    .countText {
        font-size: clamp(2.5rem, 10vw, 5rem);
        font-weight: bold;
        background: linear-gradient(45deg, #0089ff, #0040ff, #b03bff, #f23bff, #ff4ad2, #ff2626, #fc8c1c, #f6fc47, #6cf542, #42f566, #0089ff, #0040ff, #b03bff, #f23bff, #ff4ad2, #ff2626, #fc8c1c, #f6fc47, #6cf542, #42f566);
        background-size: 1500% 1500%;
        -webkit-background-clip: text;
        background-clip: text;
        -webkit-text-fill-color: transparent;
        animation: bggradient 30s linear infinite;
        user-select: none;
        margin-bottom: 0.2em;
    }

    @keyframes bggradient {
        0% {
            background-position: 0% 100%;
        }
        100% {
            background-position: 83% 100%;
        }
    }

    .countLabel {
        font-size: clamp(1.2rem, 5vw, 2.5rem);
        font-weight: bold;
        margin-bottom: 0.5em;
        color: inherit;
    }

    .countSmall {
        font-size: 0.65em;
        font-weight: bold;
        color: inherit;
    }

    .countdown {
        font-family: 'Orbitron', 'Noto Sans JP', sans-serif;
        font-size: clamp(2.5rem, 13vw, 7rem);
        font-weight: bold;
        color: inherit;
        margin-bottom: 0.3em;
        line-height: 1;
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        align-items: center;
        gap: 0.2em 0.4em;
    }

    .nowTime {
        font-family: 'Orbitron', 'Noto Sans JP', sans-serif;
        font-size: clamp(0.9rem, 4vw, 2rem);
        font-weight: bold;
        color: inherit;
        margin-top: 0.5em;
        margin-bottom: 1em;
    }

    footer {
        position: fixed;
        bottom: 0;
        left: 0;
        width: 100%;
        text-align: center;
        padding: clamp(0.8rem, 2vw, 1.2rem) 0;
        font-size: clamp(0.8rem, 2vw, 1rem);
        color: inherit;
        background: rgba(255, 255, 255, 0.05);
        backdrop-filter: blur(12px);
        border-top: 1px solid rgba(255, 255, 255, 0.2);
    }

    footer a {
        color: inherit;
        text-decoration: none;
        font-weight: bold;
    }

    @media(max-width: 480px) {
        .countdown {
            font-size: clamp(2rem, 15vw, 4rem);
        }
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
    }
</style>
</head>
<body>
    <header>
        <h1 id="page_title">${nextYear}年カウントダウン！</h1>
    </header>

    <div class="countdownBlock">
        <span class="countText">${nextYear}年</span>
        <span class="countLabel">まで残り</span>

        <div class="countdown">
            <div class="time-unit"><span class="days">0</span><span class="countSmall">日</span></div>
            <div class="time-unit"><span class="hours">00</span> :</div>
            <div class="time-unit"><span class="minutes">00</span> :</div>
            <div class="time-unit"><span class="seconds">00</span> .</div>
            <div class="time-unit"><span class="milliseconds">00</span></div>
        </div>

        <div class="nowTime">
            <span class="nowYear">0</span>年 /
            <span class="nowMonth">0</span>月 /
            <span class="nowDay">0</span>日&nbsp;
            <span class="nowHour">00</span> :
            <span class="nowMinute">00</span> :
            <span class="nowSecond">00</span>
        </div>
    </div>

    <footer id="footer-copy">
        ${copyrightContent}
    </footer>

    <script>
        let lastYearNum = 0;

        function updateCountdown() {
            const now = new Date();
            const targetDate = new Date(now.getFullYear() + 1, 0, 1); // 翌年の1月1日
            const remaining = targetDate - now;

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

            const nextYearNum = now.getFullYear() + 1;
            if (lastYearNum !== nextYearNum) {
                lastYearNum = nextYearNum;
                document.querySelector('.countText').textContent = nextYearNum + "年";
                document.getElementById("page_title").textContent = nextYearNum + "年カウントダウン！";
                document.title = nextYearNum + "年カウントダウン！";
            }
        }

        function updateNowTime() {
            const now = new Date();
            document.querySelector('.nowYear').textContent = now.getFullYear();
            document.querySelector('.nowMonth').textContent = now.getMonth() + 1;
            document.querySelector('.nowDay').textContent = now.getDate();
            document.querySelector('.nowHour').textContent = now.getHours() < 10 ? '0' + now.getHours() : now.getHours();
            document.querySelector('.nowMinute').textContent = now.getMinutes() < 10 ? '0' + now.getMinutes() : now.getMinutes();
            document.querySelector('.nowSecond').textContent = now.getSeconds() < 10 ? '0' + now.getSeconds() : now.getSeconds();
        }


        setInterval(updateCountdown, 10);
        setInterval(updateNowTime, 1000);
        updateCountdown();
        updateNowTime();
    </script>
</body>
</html>`;

    return new Response(html, {
        headers: {
            "content-type": "text/html;charset=UTF-8",
        },
    });
}
