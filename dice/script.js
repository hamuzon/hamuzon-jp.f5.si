const apiCandidates = [
    "https://api.hamusata.f5.si/api/dice",
    "https://dice-api.hamusata.f5.si/api/dice"
];

const rollBtn = document.getElementById("rollBtn");
const resultDiv = document.getElementById("result");
let canRoll = true;

const params = new URLSearchParams(location.search);
const showStats = params.get("mode") === "stats";

function clampAndSet(id, value, min, max) {
    const clamped = Math.min(Math.max(value, min), max);
    const input = document.getElementById(id);
    if (input.value != clamped) input.value = clamped;
    return clamped;
}

async function fetchFromApis(urls) {
    for (const url of urls) {
        try {
            const res = await fetch(url);
            if (!res.ok) throw new Error();
            return await res.json();
        } catch (error) {
            continue;
        }
    }
    throw new Error("すべてのAPIが応答しませんでした。");
}

rollBtn.addEventListener('click', async () => {
    if (!canRoll) return;
    canRoll = false;
    rollBtn.disabled = true;
    resultDiv.textContent = '処理中です。しばらくお待ちください。';

    const sides = clampAndSet('sides', Number(document.getElementById('sides').value), 2, 1000);
    const count = clampAndSet('count', Number(document.getElementById('count').value), 1, 1000);

    const query = `?sides=${sides}&count=${count}`;
    const urlsWithParams = apiCandidates.map(base => base + query);

    try {
        const data = await fetchFromApis(urlsWithParams);

        let html = "";

        if (data.emoji) {
            html += `<div class="emoji">${data.emoji}</div>`;
        }

        if (data.message) {
            const formattedMessage = data.message.replace('、', '、<br>');
            html += `<div>${formattedMessage}</div>`;
        }

        if (data.rolls && data.rolls.length > 1) {
            html += `<div class="details">出目: ${data.rolls.join(", ")}</div>`;
        }

        if (showStats && data.stats) {
            html += `
                <div class="details">
                    平均: ${data.stats.average}<br>
                    最小: ${data.stats.min}<br>
                    最大: ${data.stats.max}
                </div>
            `;

            const counts = Object.entries(data.stats.counts)
                .map(([k, v]) => `${k}:${v}`)
                .join(" ");

            html += `<div class="details">${counts}</div>`;
        }

        if (data.timestamp_jst) {
            html += `<div class="timestamp">${data.timestamp_jst}</div>`;
        }

        resultDiv.innerHTML = html || "結果が空でした";

    } catch (e) {
        resultDiv.textContent = 'エラーが発生しました。' + e.message;
    } finally {
        setTimeout(() => {
            canRoll = true;
            rollBtn.disabled = false;
        }, 1500);
    }
});

(function() {
    const baseYear = 2025;
    const currentYear = new Date().getFullYear();
    const hostname = location.hostname;
    const footer = document.getElementById("footer-copy");

    let copyrightYear = baseYear + (currentYear > baseYear ? "~" + currentYear : "");
    let footerContent = "";

    if (hostname.includes("hamuzon-jp.f5.si")) {
        footerContent = `<a href="https://hamuzon-jp.f5.si" target="_blank">@hamuzon</a>`;
    } else if (hostname.includes("hamuzon.web.fc2.com")) {
        footerContent = `<a href="https://hamuzon.web.fc2.com" target="_blank">@hamuzon</a>`;
    } else if (hostname.includes("hamuzon.github.io")) {
        footerContent = `<a href="https://hamuzon.github.io" target="_blank">@hamuzon</a>`;
    } else if (hostname.includes("hamusata.f5.si")) {
        footerContent = `<a href="https://hamusata.f5.si" target="_blank">@hamusata</a>`;
    }

    const appName = "サイコロアプリ / dice app";
    const footerHTML = `&copy; ${copyrightYear} ${footerContent ? `${footerContent}<br>${appName}` : appName}`;

    if (footer) footer.innerHTML = footerHTML;
})();
