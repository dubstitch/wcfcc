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

  // The testing timeline is one interactive story, not a row of static cards.
  // Pointer capture keeps dragging reliable even when the finger moves off the rail.
  const timeline = document.getElementById('fb-timeline-track');
  const rail = document.getElementById('fb-timeline-rail');
  const output = document.getElementById('fb-timeline-output');
  if (timeline && rail && output) {
    const weeks = [...timeline.querySelectorAll('.fb-timeline-item')];
    const markers = [...rail.querySelectorAll('.fb-timeline-marker')];
    const experience = rail.closest('.fb-timeline-experience');
    const names = weeks.map((week,index) => {
      const label=week.querySelector('.fb-timeline-label')?.textContent || '';
      const description=label.split('·')[1]?.trim() || 'Week '+(index+1);
      return 'Week '+(index+1)+': '+description;
    });
    let selected = 0;
    let dragging = null;
    const selectWeek = index => {
      const next = Math.max(0,Math.min(weeks.length-1,index));
      selected = next;
      const progress = weeks.length > 1 ? next/(weeks.length-1) : 0;
      experience.style.setProperty('--timeline-progress',String(progress));
      rail.setAttribute('aria-valuenow',String(next+1));
      rail.setAttribute('aria-valuemax',String(weeks.length));
      rail.setAttribute('aria-valuetext',names[next]);
      output.textContent = 'WEEK '+(next+1)+' OF '+weeks.length;
      weeks.forEach((week,i) => {
        const active = i===next;
        week.classList.toggle('is-selected',active);
        week.setAttribute('aria-hidden',String(!active));
        week.inert=!active;
      });
      markers.forEach((marker,i)=>marker.classList.toggle('is-passed',i<=next));
    };
    const updateFromPoint = clientY => {
      const bounds = rail.getBoundingClientRect();
      const inset = parseFloat(getComputedStyle(rail).getPropertyValue('--rail-inset')) || 24;
      const travel = Math.max(1,bounds.height - 2*inset);
      const fraction = Math.max(0,Math.min(1,(clientY - bounds.top - inset)/travel));
      selectWeek(Math.round(fraction*(weeks.length-1)));
    };
    rail.addEventListener('pointerdown',event=>{
      if (event.button!==0 || !event.isPrimary) return;
      event.preventDefault();
      rail.focus({preventScroll:true});
      dragging=event.pointerId;
      rail.classList.add('is-dragging');
      try {rail.setPointerCapture(event.pointerId);} catch (_) {}
      updateFromPoint(event.clientY);
    });
    rail.addEventListener('pointermove',event=>{
      if (dragging!==event.pointerId) return;
      event.preventDefault();
      updateFromPoint(event.clientY);
    });
    const endDrag=event=>{
      if (dragging!==event.pointerId) return;
      dragging=null;
      rail.classList.remove('is-dragging');
      try {
        if(rail.hasPointerCapture(event.pointerId))rail.releasePointerCapture(event.pointerId);
      } catch (_) {}
    };
    rail.addEventListener('pointerup',endDrag);
    rail.addEventListener('pointercancel',endDrag);
    rail.addEventListener('lostpointercapture',event=>{
      if(dragging===event.pointerId){dragging=null;rail.classList.remove('is-dragging');}
    });
    rail.addEventListener('keydown',event=>{
      let next=selected;
      switch(event.key){
        case 'ArrowDown':
        case 'ArrowRight':
        case 'PageDown': next+=1; break;
        case 'ArrowUp':
        case 'ArrowLeft':
        case 'PageUp': next-=1; break;
        case 'Home': next=0; break;
        case 'End': next=weeks.length-1; break;
        default:return;
      }
      event.preventDefault();
      event.stopPropagation();
      selectWeek(next);
    });
    selectWeek(0);
  }
});
