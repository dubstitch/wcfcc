document.addEventListener('DOMContentLoaded', () => {
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


/* Drill carousel arrows and native, keyboard-accessible Week selector. */
document.addEventListener('DOMContentLoaded', () => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const behavior = () => reduce ? 'auto' : 'smooth';
  const skillTrack = document.getElementById('fb-skill-track');
  const prev = document.querySelector('[data-skill-prev]');
  const next = document.querySelector('[data-skill-next]');
  if (skillTrack && prev && next) {
    const cards = [...skillTrack.querySelectorAll('.fb-guided-card')];
    let selected = 0;
    const syncButtons = () => {
      prev.disabled = selected <= 0 || skillTrack.scrollWidth <= skillTrack.clientWidth + 3;
      next.disabled = selected >= cards.length - 1 || skillTrack.scrollWidth <= skillTrack.clientWidth + 3;
    };
    const select = (index, move = true) => {
      selected = Math.max(0, Math.min(cards.length - 1, index));
      if (move && skillTrack.scrollWidth > skillTrack.clientWidth + 3) {
        const card = cards[selected];
        const left = skillTrack.scrollLeft + card.getBoundingClientRect().left - skillTrack.getBoundingClientRect().left - 5;
        skillTrack.scrollTo({left, behavior: behavior()});
      }
      syncButtons();
    };
    prev.addEventListener('click', () => select(selected - 1));
    next.addEventListener('click', () => select(selected + 1));
    cards.forEach((card,index) => card.addEventListener('focus', () => select(index)));
    skillTrack.addEventListener('scroll', () => {
      const left = skillTrack.getBoundingClientRect().left;
      let distance = Infinity;
      cards.forEach((card,index) => {
        const delta = Math.abs(card.getBoundingClientRect().left - left - 5);
        if (delta < distance) {distance = delta;selected = index;}
      });
      syncButtons();
    }, {passive:true});
    window.addEventListener('resize',syncButtons,{passive:true});
    syncButtons();
  }

  const timeline = document.getElementById('fb-timeline-track');
  const slider = document.getElementById('fb-timeline-range');
  const output = document.getElementById('fb-timeline-output');
  if (timeline && slider && output) {
    const weeks = [...timeline.querySelectorAll('.fb-timeline-item')];
    const selectWeek = (index, move = true) => {
      const chosen = Math.max(0, Math.min(weeks.length - 1, index));
      slider.value = String(chosen + 1);
      slider.style.setProperty('--week-progress', chosen * 100 / Math.max(1,weeks.length - 1) + '%');
      output.textContent = 'WEEK ' + (chosen + 1) + ' OF ' + weeks.length;
      weeks.forEach((week,i) => week.classList.toggle('is-selected',i === chosen));
      if (move && timeline.scrollWidth > timeline.clientWidth + 3) {
        const week = weeks[chosen];
        const left = timeline.scrollLeft + week.getBoundingClientRect().left - timeline.getBoundingClientRect().left - 5;
        timeline.scrollTo({left,behavior:behavior()});
      }
    };
    slider.addEventListener('input', () => selectWeek(Number(slider.value) - 1));
    weeks.forEach((week,index) => week.addEventListener('focus',() => selectWeek(index)));
    timeline.addEventListener('scroll', () => {
      if (timeline.scrollWidth <= timeline.clientWidth + 3) return;
      const left = timeline.getBoundingClientRect().left;
      let closest = 0, distance = Infinity;
      weeks.forEach((week,i) => {
        const delta = Math.abs(week.getBoundingClientRect().left - left - 5);
        if (delta < distance) {distance=delta;closest=i;}
      });
      selectWeek(closest,false);
    }, {passive:true});
    selectWeek(0,false);
  }
});
