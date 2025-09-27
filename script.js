const baseYear = 2025;
const currentYear = new Date().getFullYear();
const yearRange = baseYear === currentYear ? `${baseYear}` : `${baseYear}–${currentYear}`;
document.getElementById('year-range').textContent = yearRange;