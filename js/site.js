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

// Generic FAQ-style accordion (single-open). Use data-acc-group="<group>" on toggle button + body.
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

// Reveal-on-scroll
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

// Reusable horizontal carousel.
// Markup:
// <div class="wc-carousel" data-wc-carousel>
//   <div class="wc-carousel-viewport"><div class="wc-carousel-track"> ...cards... </div></div>
//   <div class="wc-carousel-controls">
//     <button class="carousel-btn prev" data-wc-prev>...</button>
//     <div class="carousel-dots" data-wc-dots></div>
//     <button class="carousel-btn next" data-wc-next>...</button>
//   </div>
// </div>
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
  var visibleAttr = root.getAttribute('data-wc-visible'); // e.g. "3,2,1"
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
  function startAuto() {
    if (root.hasAttribute('data-wc-noauto')) return;
    autoTimer = setInterval(next, 4000);
  }
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

// Diagonal program split (homepage Choose Your Path)
function diagOpen(which) {
  var dp = document.getElementById('diagPrograms');
  if (!dp) return;
  var key = which + '-open';
  if (dp.classList.contains(key)) {
    // Click on the active card again -> close back to default split
    dp.classList.remove('football-open', 'cheer-open');
  } else {
    dp.classList.remove('football-open', 'cheer-open');
    dp.classList.add(key);
  }
}

// Schedules / packages tab switcher: data-tab-group="<group>" on triggers and panels.
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

document.addEventListener('DOMContentLoaded', function() {
  initAnim();
  initCarousels();
});
