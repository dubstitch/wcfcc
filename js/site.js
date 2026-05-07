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

function addSeasonAccordionItems() {
  var accordion = document.querySelector('.gameday-banner .gameday-accordion');
  if (!accordion) return;
  if (!document.getElementById('gdaNFLDraft')) {
    var card = document.createElement('div');
    card.className = 'gda-card';
    card.id = 'gdaNFLDraft';
    card.innerHTML = '<button class="gda-trigger" onclick="toggleGDA(\'gdaNFLDraft\')"><div class="gda-trigger-left"><span class="gda-title">NFL DRAFT TRIP</span><span class="gda-subtitle">2027</span></div><div class="gda-chevron"><svg viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7"/></svg></div></button><div class="gda-body"><div class="gda-body-inner"><p class="gda-detail"><strong>Exclusive Live Experience:</strong> Attend the official NFL Draft in Washington, D.C. with your team</p><p class="gda-detail"><strong>Team Travel &amp; Group Access:</strong> Organized transportation, coordinated meet-up points, and full group experience</p><p class="gda-detail"><strong>Player Motivation &amp; Exposure:</strong> See the highest level up close and connect camp training to real NFL dreams</p><span class="gda-badge" style="margin-top:8px;">2027</span></div></div>';
    accordion.appendChild(card);
  }
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
  addSeasonAccordionItems();
  initAnim();
});
