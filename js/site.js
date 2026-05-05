// ============ WCFCC SITE JS ============

// Mobile menu toggle
function toggleMobileMenu() {
  var m = document.getElementById('navMobileMenu');
  var h = document.getElementById('navHamburger');
  if (m) m.classList.toggle('is-open');
  if (h) h.classList.toggle('is-open');
}

// Game-day accordion toggle
function toggleGDA(id) {
  var card = document.getElementById(id);
  if (!card) return;
  var isOpen = card.classList.contains('is-open');
  document.querySelectorAll('.gda-card').forEach(function(c) { c.classList.remove('is-open'); });
  if (!isOpen) card.classList.add('is-open');
}

function toggleAcc(btn) {
  var item = btn.closest('[data-acc-item]');
  if (!item) return;
  var group = item.getAttribute('data-acc-group') || '';
  if (group) {
    document.querySelectorAll('[data-acc-item][data-acc-group="' + group + '"]').forEach(function(el) {
      if (el !== item) el.classList.remove('is-open');
    });
  }
  item.classList.toggle('is-open');
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
      (function(idx) { dot.addEventListener('click', function() { stopAuto(); goTo(idx); startAuto(); }); })(i);
      dotsContainer.appendChild(dot);
    }
  }
  function updateDots() {
    if (!dotsContainer) return;
    dotsContainer.querySelectorAll('.carousel-dot').forEach(function(d, i) { d.classList.toggle('active', i === current); });
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
  startAuto();
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
    t.classList.toggle('is-active', t.getAttribute('data-tab') === key);
  });
  document.querySelectorAll('[data-tab-panel-group="' + group + '"]').forEach(function(p) {
    p.classList.toggle('is-active', p.getAttribute('data-tab-panel') === key);
  });
}

function replaceHomepagePrograms() {
  var diag = document.getElementById('diagPrograms');
  if (!diag) return;
  var helperText = diag.previousElementSibling;
  if (helperText && helperText.textContent.toLowerCase().indexOf('tap a side') !== -1) helperText.textContent = 'Tap a program to expand';
  diag.className = 'gameday-accordion anim anim-d4';
  diag.removeAttribute('id');
  diag.innerHTML = '<div class="gda-card is-open" id="homeFootball"><button class="gda-trigger" type="button" onclick="toggleGDA(\'homeFootball\')"><div class="gda-trigger-left"><span class="gda-title">FOOTBALL COMBINE CAMP</span><span class="gda-subtitle">Combine testing, position training, and weekly 7 on 7 competition</span></div><div class="gda-chevron"><svg viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7"/></svg></div></button><div class="gda-body"><div class="gda-body-inner"><p class="gda-desc">An intensive 6-week combine style training program built to develop athletic skill, game strategy, and competitive edge through structured evaluation and 7 on 7 competition.</p><p class="gda-detail"><strong>Combine testing</strong> and skill tracking</p><p class="gda-detail"><strong>Position specific training</strong> for each athlete</p><p class="gda-detail"><strong>Weekly 7 on 7 competition</strong> every Friday</p><p class="gda-detail"><strong>Championship Day</strong> with trophies</p><span class="gda-badge">Ages 9–17</span><a href="pages/football.html" class="diag-cta" style="margin-top:18px;">Learn More</a></div></div></div><div class="gda-card" id="homeCheer"><button class="gda-trigger" type="button" onclick="toggleGDA(\'homeCheer\')"><div class="gda-trigger-left"><span class="gda-title">SIDELINE CHEER CAMP</span><span class="gda-subtitle">Sideline cheers, choreography, and game day performance</span></div><div class="gda-chevron"><svg viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7"/></svg></div></button><div class="gda-body"><div class="gda-body-inner"><p class="gda-desc">A 6-week sideline cheer program designed to build confident young women through technique, teamwork, and real game-day performance experience.</p><p class="gda-detail"><strong>Sideline cheers</strong> motions and jumps</p><p class="gda-detail"><strong>Choreographed sideline dances</strong></p><p class="gda-detail"><strong>Weekly game day performances</strong></p><p class="gda-detail"><strong>Mummers Parade performance</strong></p><span class="gda-badge">Ages 8–13</span><a href="pages/cheer.html" class="diag-cta" style="margin-top:18px;">Learn More</a></div></div></div>';
}

function enhanceProgramPageHero() {
  var isProgramPage = document.body.classList.contains('football-theme') || document.body.classList.contains('cheer-theme');
  if (!isProgramPage || window.innerWidth < 980) return;
  var hero = document.querySelector('.hero');
  var inner = hero ? hero.querySelector('.hero-inner') : null;
  if (!hero || !inner || inner.querySelector('.hero-image-col')) return;
  inner.style.gridTemplateColumns = 'minmax(0,1fr) minmax(320px,440px)';
  inner.style.gap = '64px';
  inner.style.alignItems = 'center';
  inner.style.paddingTop = '40px';
  inner.style.paddingBottom = '40px';
  var photo = document.createElement('div');
  photo.className = 'hero-image-col fade-up delay-3';
  photo.innerHTML = '<div class="hero-img-frame"><div class="hero-img-placeholder"><div class="placeholder-icon"><svg viewBox="0 0 24 24"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg></div><span class="placeholder-text">Hero Photo Coming Soon</span></div></div><div class="hero-img-badge"><div class="badge-num">6</div><div class="badge-label">Week Program</div></div><div class="hero-img-tag"><span class="tag-dot"></span><span>Registration Open</span></div>';
  inner.appendChild(photo);
}

function applyTargetedStyles() {
  var style = document.createElement('style');
  style.textContent = 'nav .nav-cta{display:inline-flex!important;align-items:center!important;justify-content:center!important;min-height:36px!important;line-height:1!important}.nav-reviews{height:36px!important;display:inline-flex!important;align-items:center!important}.nav-links{gap:clamp(18px,2vw,32px)!important}@media(max-width:1320px){.nav-links,.nav-cta-desktop,.nav-reviews{display:none!important}.nav-hamburger{display:flex!important}}@media(min-width:1321px){.nav-hamburger{display:none!important}.nav-mobile-menu{display:none!important}.nav-links{display:flex!important}.nav-reviews{display:inline-flex!important}.nav-cta-desktop{display:inline-flex!important}}.nav-cta-desktop::before{content:"★";margin-right:10px}.nav-cta-desktop::after{content:"★";margin-left:10px}.gameday-accordion .diag-cta{background:var(--black);color:var(--yellow);}.football-theme .hero-image-col,.cheer-theme .hero-image-col{position:relative}.football-theme .hero-img-frame,.cheer-theme .hero-img-frame{background:var(--black)}';
  document.head.appendChild(style);
}

document.addEventListener('DOMContentLoaded', function() {
  applyTargetedStyles();
  replaceHomepagePrograms();
  enhanceProgramPageHero();
  initAnim();
  initCarousels();
});
