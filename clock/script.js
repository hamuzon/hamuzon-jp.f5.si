
let baseUtc = null;
let startTime = null;

function initClock() {
  baseUtc = new Date(new Date().toISOString());
  startTime = new Date();
  const now = new Date();
  const msToNextSecond = 1000 - now.getMilliseconds();

  setTimeout(() => {
    updateZones();
    setInterval(updateZones, 1000);
  }, msToNextSecond);
}

function updateZones() {
  const now = new Date();
  const elapsed = now - startTime;
  const currentUtc = new Date(baseUtc.getTime() + elapsed);

  document.querySelectorAll('.zone-card').forEach(card => {
    const tz = card.dataset.timezone;

    try {
      const formatterTime = new Intl.DateTimeFormat('ja-JP', {
        timeZone: tz,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
        timeZoneName: 'short'
      });

      const formatterDate = new Intl.DateTimeFormat('ja-JP', {
        timeZone: tz,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        weekday: 'short'
      });

      const parts = formatterTime.formatToParts(currentUtc);
      const timeParts = parts.filter(p => p.type !== 'timeZoneName');
      const timeStr = timeParts.map(p => p.value).join('');
      const tzAbbr = parts.find(p => p.type === 'timeZoneName')?.value || '';

      card.querySelector('.time').textContent = timeStr;
      card.querySelector('.date').textContent = formatterDate.format(currentUtc);
      card.querySelector('.zone-offset').textContent = tzAbbr;
    } catch (e) {
      card.querySelector('.time').textContent = '不明なタイムゾーン';
      card.querySelector('.date').textContent = '';
      card.querySelector('.zone-offset').textContent = '';
    }
  });
}

initClock();
