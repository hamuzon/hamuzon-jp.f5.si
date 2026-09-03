const baseYear = 2025;
const currentYear = new Date().getFullYear();
const yearRange = baseYear === currentYear
  ? `${baseYear}`
  : `${baseYear} ~ ${currentYear}`;

document.getElementById('year-range').textContent = yearRange;

// リンクリストの読み込み・表示
fetch('links.json')
  .then(res => res.json())
  .then(links => {
    document.getElementById('links').innerHTML = links.map(link =>
      `<li><a href="${link.url}" ${
        link.target ? `target="${link.target}" rel="noopener"` : ''
      }>${link.title}</a></li>`
    ).join('');
  });

(function () {
  const params = new URLSearchParams(window.location.search);
  let changed = false;

  for (const key of Array.from(params.keys())) {
    if (key === '_gl' || key.startsWith('_ga')) {
      params.delete(key);
      changed = true;
    }
  }

  if (changed) {
    const query = params.toString();
    const url = location.pathname + (query ? `?${query}` : '') + location.hash;
    history.replaceState(null, '', url);
  }
})();
