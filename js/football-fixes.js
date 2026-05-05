document.addEventListener('DOMContentLoaded', () => {
  const meta = document.querySelector('.football-theme .ch-hero-meta');
  if (meta) {
    meta.innerHTML = '<span class="sep"></span><span><strong>JUN 15</strong> &ndash; JUL 10, 2026</span><span class="sep"></span><span><strong>$175</strong> ALL INCLUSIVE</span>';
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

  const heroActions = document.querySelector('.football-theme .hero-actions');
  if (heroActions) {
    heroActions.style.setProperty('display', 'flex', 'important');
    heroActions.style.setProperty('flex-wrap', 'nowrap', 'important');
    heroActions.style.setProperty('gap', '10px', 'important');
    heroActions.style.setProperty('max-width', '100%', 'important');
  }

  document.querySelectorAll('.football-theme .hero .age-chip').forEach((pill) => {
    pill.style.setProperty('display', 'inline-flex', 'important');
    pill.style.setProperty('align-items', 'center', 'important');
    pill.style.setProperty('justify-content', 'center', 'important');
    pill.style.setProperty('min-height', '38px', 'important');
    pill.style.setProperty('padding', '8px 16px', 'important');
    pill.style.setProperty('border', '2px solid var(--black)', 'important');
    pill.style.setProperty('border-radius', '999px', 'important');
    pill.style.setProperty('background', 'var(--yellow)', 'important');
    pill.style.setProperty('color', 'var(--black)', 'important');
    pill.style.setProperty('font-family', 'Barlow Condensed, sans-serif', 'important');
    pill.style.setProperty('font-size', 'clamp(11px, 1.4vw, 14px)', 'important');
    pill.style.setProperty('font-weight', '900', 'important');
    pill.style.setProperty('letter-spacing', '1.8px', 'important');
    pill.style.setProperty('text-transform', 'uppercase', 'important');
    pill.style.setProperty('line-height', '1', 'important');
    pill.style.setProperty('white-space', 'nowrap', 'important');
  });
});
