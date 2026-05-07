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
  var group = card.closest('.gameday-accordion') || document;
  var isOpen = card.classList.contains('is-open');
  group.querySelectorAll('.gda-card').forEach(function(c) { c.classList.remove('is-open'); });
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

function loadSeasonAccordionScript() {
  if (document.getElementById('seasonAccordionScript')) return;
  var script = document.createElement('script');
  script.id = 'seasonAccordionScript';
  script.src = 'js/season-accordion.js?v=' + Date.now();
  document.head.appendChild(script);
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

document.addEventListener('DOMContentLoaded', function() {
  loadSeasonAccordionScript();
  initAnim();
});
