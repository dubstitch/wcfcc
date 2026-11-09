// ============ WCFCC SITE JS ============

function scrollToWcfccSection(target) {
  if (!target) return;
  var ticker = document.getElementById('stickyTicker');
  var offset = 64 + (ticker ? ticker.offsetHeight : 0) + 4;
  var html = document.documentElement;
  var previous = html.style.scrollBehavior;
  var top = Math.max(0,target.getBoundingClientRect().top+window.scrollY-offset);
  // Exact and immediate: do not let the page's global smooth scroll
  // position the reviews heading midway underneath the sticky ticker.
  html.style.scrollBehavior = 'auto';
  window.scrollTo(0,top);
  requestAnimationFrame(function(){html.style.scrollBehavior=previous;});
}


// Mobile menu toggle
function toggleMobileMenu() {
  var m = document.getElementById('navMobileMenu');
  var h = document.getElementById('navHamburger');
  if (m) m.classList.toggle('is-open');
  if (h) {
    h.classList.toggle('is-open');
    h.setAttribute('aria-expanded', String(m && m.classList.contains('is-open')));
    if (m && !m.id) m.id='navMobileMenu';
    if (m) h.setAttribute('aria-controls', m.id);
  }
}

// Game-day accordion toggle
function toggleGDA(id) {
  var card = document.getElementById(id);
  if (!card) return;
  var isOpen = card.classList.contains('is-open');
  var group = card.closest('.gameday-accordion') || card.parentElement;
  group.querySelectorAll('.gda-card').forEach(function(c) {
    c.classList.remove('is-open');
    var trigger = c.querySelector('.gda-trigger');
    if (trigger) trigger.setAttribute('aria-expanded', 'false');
  });
  if (!isOpen) card.classList.add('is-open');
  var btn = card.querySelector('.gda-trigger');
  if (btn) btn.setAttribute('aria-expanded', String(!isOpen));
}

function toggleAcc(btn) {
  var item = btn.closest('[data-acc-item]');
  if (!item) return;
  var wasOpen = item.classList.contains('is-open');
  var group = item.getAttribute('data-acc-group') || '';
  if (group) {
    document.querySelectorAll('[data-acc-item][data-acc-group="' + group + '"]').forEach(function(el) {
      if (el !== item) {
        el.classList.remove('is-open');
        el.querySelector('.wc-acc-trigger')?.setAttribute('aria-expanded', 'false');
      }
    });
  }
  item.classList.toggle('is-open', !wasOpen);
  btn.setAttribute('aria-expanded', String(!wasOpen));
}

function initAnim() {
  var els = document.querySelectorAll('.anim');
  if (!els.length || !('IntersectionObserver' in window)) {
    els.forEach(function(el) { el.classList.add('visible'); });
    return;
  }
  var io = new IntersectionObserver(function(entries) {
    entries.forEach(function(e) { if (e.isIntersecting) e.target.classList.add('visible'); });
  }, { threshold: 0.15 });
  els.forEach(function(el) { io.observe(el); });
}

function initCarousel(root) {
  var track = root.querySelector('[data-wc-track], .wc-carousel-track');
  if (!track) return;
  var cards = track.children;
  if (!cards.length) return;
  var prevBtn = root.querySelector('[data-wc-prev]');
  var nextBtn = root.querySelector('[data-wc-next]');
  var dotsContainer = root.querySelector('[data-wc-dots]');
  var current = 0;
  var autoTimer;
  var visibleAttr = root.getAttribute('data-wc-visible');
  var visibleBreakpoints = visibleAttr ? visibleAttr.split(',').map(function(n) { return parseInt(n, 10); }) : [3, 2, 1];

  function getVisible() {
    var w = window.innerWidth;
    if (w <= 768) return visibleBreakpoints[2] || 1;
    if (w <= 1024) return visibleBreakpoints[1] || 2;
    return visibleBreakpoints[0] || 3;
  }
  function totalSlides() { return Math.max(1, cards.length - getVisible() + 1); }
  function gap() {
    var g = parseFloat(window.getComputedStyle(track).columnGap || window.getComputedStyle(track).gap || '20');
    return isNaN(g) ? 20 : g;
  }
  function getCardWidth() { return cards[0].offsetWidth + gap(); }
  function buildDots() {
    if (!dotsContainer) return;
    dotsContainer.innerHTML = '';
    for (var i = 0; i < totalSlides(); i++) {
      var dot = document.createElement('button');
      dot.className = 'carousel-dot' + (i === current ? ' active' : '');
      dot.type = 'button';
      dot.setAttribute('aria-label', 'Show carousel position ' + (i + 1) + ' of ' + totalSlides());
      (function(idx) { dot.addEventListener('click', function() { stopAuto(); goTo(idx); startAuto(); }); })(i);
      dotsContainer.appendChild(dot);
    }
  }
  function updateDots() {
    if (!dotsContainer) return;
    dotsContainer.querySelectorAll('.carousel-dot').forEach(function(d, i) {
      d.classList.toggle('active', i === current);
      if (i === current) d.setAttribute('aria-current', 'true');
      else d.removeAttribute('aria-current');
    });
    Array.from(cards).forEach(function(card, i) {
      card.classList.toggle('is-active', i === current);
    });
  }
  function setCardSizes() {
    var w = window.innerWidth;
    var viewport = track.parentElement;
    var containerW = viewport.offsetWidth;
    var v = getVisible();
    var cardW;
    if (w <= 768) cardW = Math.floor(w * 0.85);
    else cardW = Math.floor((containerW - gap() * (v - 1)) / v);
    Array.from(cards).forEach(function(c) { c.style.flex = '0 0 ' + cardW + 'px'; c.style.minWidth = cardW + 'px'; });
  }
  function goTo(idx) {
    current = Math.max(0, Math.min(idx, totalSlides() - 1));
    track.style.transform = 'translateX(-' + (current * getCardWidth()) + 'px)';
    updateDots();
  }
  function next() { goTo(current >= totalSlides() - 1 ? 0 : current + 1); }
  function prev() { goTo(current <= 0 ? totalSlides() - 1 : current - 1); }
  function startAuto() { if (!root.hasAttribute('data-wc-noauto')) autoTimer = setInterval(next, 4000); }
  function stopAuto() { clearInterval(autoTimer); }

  if (nextBtn) nextBtn.addEventListener('click', function() { stopAuto(); next(); startAuto(); });
  if (prevBtn) prevBtn.addEventListener('click', function() { stopAuto(); prev(); startAuto(); });
  track.addEventListener('mouseenter', stopAuto);
  track.addEventListener('mouseleave', startAuto);
  var touchStartX = 0;
  track.addEventListener('touchstart', function(e) { touchStartX = e.touches[0].clientX; stopAuto(); }, { passive: true });
  track.addEventListener('touchend', function(e) {
    var diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) { diff > 0 ? next() : prev(); }
    startAuto();
  });
  window.addEventListener('resize', function() { setCardSizes(); buildDots(); goTo(Math.min(current, totalSlides() - 1)); });
  setCardSizes();
  buildDots();
  goTo(0);
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) startAuto();
}

function initCarousels() {
  document.querySelectorAll('[data-wc-carousel]').forEach(initCarousel);
}

function diagOpen(which) {
  var dp = document.getElementById('diagPrograms');
  if (!dp) return;
  var key = which + '-open';
  if (dp.classList.contains(key)) dp.classList.remove('football-open', 'cheer-open');
  else {
    dp.classList.remove('football-open', 'cheer-open');
    dp.classList.add(key);
  }
}

function switchTab(btn) {
  var group = btn.getAttribute('data-tab-group');
  var key = btn.getAttribute('data-tab');
  if (!group || !key) return;
  document.querySelectorAll('[data-tab-group="' + group + '"][data-tab]').forEach(function(t) {
    var active=t.getAttribute('data-tab')===key;
    t.classList.toggle('is-active',active);
    t.setAttribute('aria-selected',String(active));
    t.tabIndex=active?0:-1;
  });
  document.querySelectorAll('[data-tab-panel-group="' + group + '"]').forEach(function(p) {
    var active=p.getAttribute('data-tab-panel')===key;
    p.classList.toggle('is-active',active);
    p.hidden=!active;
  });
}

function loadSeasonAccordionScript() {
  if (document.getElementById('seasonAccordionScript')) return;
  if (!document.body.classList.contains('has-ticker')) return;
  var script = document.createElement('script');
  script.id = 'seasonAccordionScript';
  script.src = 'js/season-accordion.js?v=' + Date.now();
  document.head.appendChild(script);
}

document.addEventListener('DOMContentLoaded', function() {
  document.querySelectorAll('[data-acc-item]').forEach(function(item, index) {
    var btn = item.querySelector('.wc-acc-trigger');
    var panel = item.querySelector('.wc-acc-body');
    if (!btn) return;
    btn.setAttribute('aria-expanded', String(item.classList.contains('is-open')));
    if (panel) {
      var id = panel.id || 'wc-acc-panel-' + index;
      panel.id = id;
      btn.setAttribute('aria-controls', id);
    }
  });
  document.querySelectorAll('.gda-card').forEach(function(item,index) {
    var btn = item.querySelector('.gda-trigger');
    var panel = item.querySelector('.gda-body');
    if (!btn) return;
    btn.setAttribute('aria-expanded', String(item.classList.contains('is-open')));
    if (panel) {
      var id=panel.id || 'wc-gda-panel-' + index;
      panel.id=id;
      btn.setAttribute('aria-controls',id);
    }
  });
  document.querySelectorAll('.wc-tabs[role="tablist"]').forEach(function(tablist) {
    var tabs=Array.from(tablist.querySelectorAll('[data-tab-group][data-tab]'));
    if(!tabs.length)return;
    tabs.forEach(function(tab,i) {
      var group=tab.getAttribute('data-tab-group'),key=tab.getAttribute('data-tab');
      var panel=document.querySelector('[data-tab-panel-group="'+group+'"][data-tab-panel="'+key+'"]');
      tab.setAttribute('role','tab');
      tab.id=tab.id||'wc-tab-'+group+'-'+key;
      tab.setAttribute('aria-selected',String(tab.classList.contains('is-active')));
      tab.tabIndex=tab.classList.contains('is-active')?0:-1;
      if(panel) {
        panel.setAttribute('role','tabpanel');
        panel.id=panel.id||'wc-panel-'+group+'-'+key;
        panel.setAttribute('aria-labelledby',tab.id);
        panel.hidden=!panel.classList.contains('is-active');
        tab.setAttribute('aria-controls',panel.id);
      }
    });
    tablist.addEventListener('keydown',function(event){
      var index=tabs.indexOf(document.activeElement);
      if(index<0)return;
      var next=index;
      if(event.key==='ArrowRight')next=(index+1)%tabs.length;
      else if(event.key==='ArrowLeft')next=(index+tabs.length-1)%tabs.length;
      else if(event.key==='Home')next=0;
      else if(event.key==='End')next=tabs.length-1;
      else return;
      event.preventDefault();
      tabs[next].focus();
      switchTab(tabs[next]);
    });
  });
  document.querySelectorAll('a[href="#testimonials"]').forEach(function(link) {
    link.addEventListener('click',function(event) {
      var target=document.getElementById('testimonials');
      if(!target)return;
      event.preventDefault();
      if(window.location.hash!=='#testimonials') {
        history.pushState(null,'','#testimonials');
      }
      scrollToWcfccSection(target);
    });
  });
  var mobileButton=document.getElementById('navHamburger');
  if(mobileButton) {
    mobileButton.setAttribute('aria-expanded','false');
    mobileButton.setAttribute('aria-controls','navMobileMenu');
  }
  loadSeasonAccordionScript();
  initAnim();
  initCarousels();
});


// ============ PORTFOLIO ARCHIVE MODE ============
// Preserve internal navigation and interactive components, but never open
// historical registration forms, payments, mail clients or phone dialers.
(function () {
  var sourceScript = document.currentScript;
  if (sourceScript && sourceScript.src) {
    var archiveStyles = document.createElement('link');
    archiveStyles.rel = 'stylesheet';
    archiveStyles.href = new URL('../css/archive.css', sourceScript.src).href;
    document.head.appendChild(archiveStyles);
  }

  function initPortfolioArchive() {
    if (!document.body || document.documentElement.hasAttribute('data-portfolio-archive')) return;
    document.documentElement.setAttribute('data-portfolio-archive', 'true');
    document.body.classList.add('has-portfolio-archive');

    var notice = document.createElement('aside');
    notice.className = 'portfolio-archive-notice';
    notice.setAttribute('role', 'note');
    notice.innerHTML = '<span class="archive-note-marker">PORTFOLIO ARCHIVE</span><span>Following a successful 2025 season, the planned 2026 camp was postponed until further notice. The hope is to return in 2027. This site remains a portfolio demo; registration and contact are unavailable.</span>';
    document.body.insertBefore(notice, document.body.firstChild);
    // URL fragments are evaluated before this dynamically inserted notice.
    // Re-align the reviews heading beneath the fixed nav and sticky ticker.
    if (window.location.hash) {
      window.addEventListener('load', function() {
        var target = document.getElementById(decodeURIComponent(window.location.hash.slice(1)));
        if(!target)return;
        scrollToWcfccSection(target);
      },{once:true});
    }

    var lockIcon = '<svg viewBox="0 0 24 24" width="14" height="14" focusable="false" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg>';
    document.querySelectorAll('a[href]').forEach(function (link) {
      var destination = (link.getAttribute('href') || '').trim();
      if (!/^(https?:|mailto:|tel:)/i.test(destination)) return;
      var label = (link.textContent || '').replace(/\s+/g, ' ').trim() || 'External action';
      link.removeAttribute('href');
      link.removeAttribute('target');
      link.removeAttribute('rel');
      link.classList.add('demo-locked-link');
      link.setAttribute('role', 'link');
      link.setAttribute('aria-disabled', 'true');
      link.setAttribute('aria-label', label + ', unavailable in portfolio archive');
      link.setAttribute('title', 'Unavailable in this portfolio archive');
      link.setAttribute('tabindex', '0');
      var icon = document.createElement('span');
      icon.className = 'demo-lock-icon';
      icon.setAttribute('aria-hidden', 'true');
      icon.innerHTML = lockIcon;
      link.appendChild(icon);
      link.addEventListener('click', function (event) { event.preventDefault(); event.stopPropagation(); });
      link.addEventListener('keydown', function (event) {
        if (event.key === 'Enter' || event.key === ' ') event.preventDefault();
      });
    });

    document.querySelectorAll('form').forEach(function (form) {
      form.removeAttribute('onsubmit');
      form.setAttribute('aria-label', 'Archived contact form, disabled');
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }, true);
      var message = document.createElement('p');
      message.className = 'demo-form-notice';
      message.setAttribute('role', 'note');
      message.textContent = 'This form is part of the original website design and is disabled in the portfolio archive.';
      form.insertBefore(message, form.firstChild);
      form.querySelectorAll('input, textarea, select, button').forEach(function (control) {
        control.disabled = true;
        control.setAttribute('aria-disabled', 'true');
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPortfolioArchive);
  } else {
    initPortfolioArchive();
  }
})();
