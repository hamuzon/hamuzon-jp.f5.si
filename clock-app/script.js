const elTime = document.getElementById('time');
const elDate = document.getElementById('date');

let offset = 0;

async function syncTime() {
    try {
        const res = await fetch(
            'https://worldtimeapi.org/api/ip'
        );

        const data = await res.json();

        const serverTime = new Date(
            data.datetime
        ).getTime();

        const localTime = Date.now();

        offset = serverTime - localTime;
    } catch {
        offset = 0;
    }
}

function nowTime() {
    return new Date(
        Date.now() + offset
    );
}

function layout() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const isLandscape = w > h;

    const timeSize = isLandscape
        ? Math.min(w * 0.12, h * 0.32)
        : w * 0.17;

    const dateSize = isLandscape
        ? timeSize * 0.48
        : timeSize * 0.52;

    elTime.style.fontSize = timeSize + 'px';
    elDate.style.fontSize = dateSize + 'px';
}

function tick() {
    const now = nowTime();

    const h = now.getHours()
        .toString()
        .padStart(2, '0');

    const m = now.getMinutes()
        .toString()
        .padStart(2, '0');

    const s = now.getSeconds()
        .toString()
        .padStart(2, '0');

    elTime.textContent = `${h}:${m}:${s}`;

    const y = (now.getFullYear() % 100)
        .toString()
        .padStart(2, '0');

    const mo = (now.getMonth() + 1)
        .toString()
        .padStart(2, '0');

    const d = now.getDate()
        .toString()
        .padStart(2, '0');

    elDate.textContent = `${y}/${mo}/${d}`;

    requestAnimationFrame(tick);
}

window.addEventListener(
    'resize',
    layout
);

layout();
syncTime();

setInterval(
    syncTime,
    600000
);

requestAnimationFrame(tick);
