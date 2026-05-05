document.addEventListener('DOMContentLoaded', () => {
  const meta = document.querySelector('.football-theme .ch-hero-meta');
  if (meta) {
    meta.innerHTML = '<span class="sep"></span><span><strong>JUN 15</strong> &ndash; JUL 24, 2026</span><span class="sep"></span><span><strong>$275</strong> ALL INCLUSIVE</span>';
  }

  const trainingPlanButton = document.querySelector('.football-theme .ch-hero-cta.fb-secondary-cta');
  if (trainingPlanButton) {
    trainingPlanButton.style.setProperty('border-color', 'var(--black)', 'important');
  }

  const detailStrip = document.querySelector('.football-theme .ch-value-strip');
  if (detailStrip) {
    const detailSection = detailStrip.closest('section');
    if (detailSection) {
      detailSection.remove();
    }
  }
});
