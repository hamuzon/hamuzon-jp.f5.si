const baseYear = 2025;
const currentYear = new Date().getFullYear();
const yearRange = baseYear === currentYear ? `${baseYear}` : `${baseYear}~${currentYear}`;
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