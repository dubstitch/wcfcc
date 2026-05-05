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

  const style = document.createElement('style');
  style.textContent = `
    .football-theme .hero-actions {
      display: flex !important;
      flex-wrap: nowrap !important;
      gap: 10px !important;
      max-width: 100% !important;
    }

    .football-theme .hero .age-chip {
      display: inline-flex !important;
      align-items: center !important;
      justify-content: center !important;
      min-height: 38px !important;
      padding: 8px 16px !important;
      border: 2px solid var(--black) !important;
      border-radius: 999px !important;
      background: var(--yellow) !important;
      color: var(--black) !important;
      font-family: 'Barlow Condensed', sans-serif !important;
      font-size: clamp(11px, 1.4vw, 14px) !important;
      font-weight: 900 !important;
      letter-spacing: 1.8px !important;
      text-transform: uppercase !important;
      line-height: 1 !important;
      white-space: nowrap !important;
    }

    @media (max-width: 720px) {
      .football-theme .hero-actions {
        flex-wrap: wrap !important;
      }
    }
  `;
  document.head.appendChild(style);
});
