document.addEventListener('DOMContentLoaded', () => {
  const meta = document.querySelector('.cheer-theme .ch-hero-meta');
  if (meta) {
    meta.innerHTML = '<span class="sep"></span><span><strong>JUN 15</strong> &ndash; JUL 11, 2026</span><span class="sep"></span><span><strong>$175</strong> ALL INCLUSIVE</span>';
  }

  const tickerSection = document.querySelector('.cheer-theme .hero + section');
  if (tickerSection) {
    const strip = tickerSection.querySelector('.ch-value-strip');
    const isTickerOverride = !strip || tickerSection.textContent.includes('SPONSOR') || tickerSection.textContent.includes('4 WEEKS OF TRAINING');
    if (isTickerOverride) {
      tickerSection.remove();
    }
  }
});
