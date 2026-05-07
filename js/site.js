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

function initRegistrationFormModal() {
  var formLinks = document.querySelectorAll('a[href*="forms.gle"]');
  if (!formLinks.length) return;

  var modal = document.createElement('div');
  modal.id = 'registrationFormModal';
  modal.innerHTML = '<div class="reg-modal-backdrop" data-reg-modal-close></div><div class="reg-modal-panel" role="dialog" aria-modal="true" aria-labelledby="regModalTitle"><div class="reg-modal-header"><div><span class="reg-modal-eyebrow">WCFCC 2026 Registration</span><h2 id="regModalTitle">Registration Form</h2></div><button class="reg-modal-close" type="button" aria-label="Close registration form" data-reg-modal-close>&times;</button></div><iframe id="regModalFrame" title="WCFCC registration form"></iframe><div class="reg-modal-footer"><a id="regModalExternal" href="#" target="_blank" rel="noopener">Open in new tab</a></div></div>';
  document.body.appendChild(modal);

  var frame = document.getElementById('regModalFrame');
  var title = document.getElementById('regModalTitle');
  var external = document.getElementById('regModalExternal');

  function openModal(link) {
    var href = link.getAttribute('href');
    var label = link.textContent.trim().replace(/^Open\s+/i, '') || 'Registration Form';
    title.textContent = label;
    frame.setAttribute('src', href);
    external.setAttribute('href', href);
    modal.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    modal.classList.remove('is-open');
    frame.setAttribute('src', 'about:blank');
    document.body.style.overflow = '';
  }

  formLinks.forEach(function(link) {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      openModal(link);
    });
  });

  modal.querySelectorAll('[data-reg-modal-close]').forEach(function(btn) {
    btn.addEventListener('click', closeModal);
  });
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && modal.classList.contains('is-open')) closeModal();
  });
}

function initTermsAgreementGate() {
  var storageKey = 'wcfccTermsAcceptedSitewide';
  try {
    if (window.localStorage && localStorage.getItem(storageKey) === 'yes') return;
  } catch (err) {}

  var modal = document.createElement('div');
  modal.id = 'termsAgreementGate';
  modal.innerHTML = '<div class="terms-gate-backdrop"></div><div class="terms-gate-panel" role="dialog" aria-modal="true" aria-labelledby="termsGateTitle" aria-describedby="termsGateDesc"><div class="terms-gate-header"><span class="terms-gate-eyebrow">WCFCC 2026</span><h2 id="termsGateTitle">Terms and Conditions</h2><p id="termsGateDesc">Please review and agree before entering the site.</p></div><div class="terms-gate-scroll" tabindex="0"><h3>Registration and Payment</h3><p>Registration is not complete until all required forms and full payment have been received. The camp fee is $175 per athlete. Payment must be completed by May 31, 2026. If payment and required forms are not received by the registration deadline, the athlete will not be able to participate in camp.</p><h3>Required Forms and Documents</h3><p>Families are responsible for completing all required WCFCC forms, including registration, medical release, code of conduct, and photo or video release. A birth certificate is required for age verification. Missing forms may delay or prevent participation.</p><h3>Refund Policy</h3><p>Refunds are available according to WCFCC policy: 100% refund up to two weeks before camp starts, 50% refund up to one week before camp starts, and no refund after camp begins except medical withdrawals, which may be prorated at the director\'s discretion.</p><h3>Attendance and Participation</h3><p>Athletes are expected to attend practices, follow coach instructions, and participate respectfully. Athletes who miss more than three practices may not be eligible for Championship Day games or performances.</p><h3>Behavior and Code of Conduct</h3><p>Athletes, parents, guardians, and guests are expected to show respect toward coaches, staff, volunteers, officials, other families, and facilities. Unsafe, disruptive, aggressive, or disrespectful behavior may result in removal from camp without refund.</p><h3>Medical and Safety</h3><p>Parents and guardians must disclose relevant medical conditions, allergies, medications, and emergency contact information. Participation in football, cheer, training, conditioning, performances, and camp activities involves inherent risk. By continuing, the parent or guardian acknowledges those risks and agrees to follow WCFCC safety rules.</p><h3>Photo and Video Release</h3><p>Camp activities may be photographed or recorded for promotional, social media, website, or archival use when a release has been completed. Families should complete the photo and video release form before participation.</p><h3>Equipment and Camp Items</h3><p>Camp issued gear and shared equipment must be used responsibly. Lost, damaged, or unreturned items may be replaced at the parent or guardian\'s expense. Some items may be provided for use during camp only and are not kept by participants.</p><h3>Schedule Changes</h3><p>Dates, times, locations, activities, and schedules may change due to weather, facility needs, safety concerns, staffing, or other circumstances. WCFCC will communicate updates as soon as possible.</p><h3>Agreement</h3><p>By checking the box below, the visitor confirms they have read, understand, and agree to follow WCFCC terms, policies, and participation expectations.</p></div><label class="terms-gate-check"><input type="checkbox" id="termsGateCheckbox"> <span>I have read and agree to the WCFCC Terms and Conditions.</span></label><button class="terms-gate-button" id="termsGateAccept" type="button" disabled>Enter Site</button></div>';
  document.body.appendChild(modal);
  document.documentElement.classList.add('terms-gate-active');
  document.body.classList.add('terms-gate-active');

  var checkbox = document.getElementById('termsGateCheckbox');
  var button = document.getElementById('termsGateAccept');
  checkbox.addEventListener('change', function() {
    button.disabled = !checkbox.checked;
  });
  button.addEventListener('click', function() {
    if (!checkbox.checked) return;
    try {
      if (window.localStorage) localStorage.setItem(storageKey, 'yes');
    } catch (err) {}
    modal.remove();
    document.documentElement.classList.remove('terms-gate-active');
    document.body.classList.remove('terms-gate-active');
  });
}

function applyTargetedStyles() {
  var style = document.createElement('style');
  style.textContent = 'nav .nav-cta{display:inline-flex!important;align-items:center!important;justify-content:center!important;min-height:36px!important;line-height:1!important}.nav-reviews{height:36px!important;display:inline-flex!important;align-items:center!important}.nav-links{gap:clamp(18px,2vw,32px)!important}@media(max-width:1320px){.nav-links,.nav-cta-desktop,.nav-reviews{display:none!important}.nav-hamburger{display:flex!important}}@media(min-width:1321px){.nav-hamburger{display:none!important}.nav-mobile-menu{display:none!important}.nav-links{display:flex!important}.nav-reviews{display:inline-flex!important}.nav-cta-desktop{display:inline-flex!important}}.nav-cta-desktop::before{content:"★";margin-right:10px}.nav-cta-desktop::after{content:"★";margin-left:10px}.gameday-accordion .diag-cta{background:var(--black);color:var(--yellow);}.football-theme .hero-image-col,.cheer-theme .hero-image-col{position:relative}.football-theme .hero-img-frame,.cheer-theme .hero-img-frame{background:var(--black)}#registrationFormModal{display:none;position:fixed;inset:0;z-index:1000}#registrationFormModal.is-open{display:block}.reg-modal-backdrop{position:absolute;inset:0;background:rgba(0,0,0,.76);backdrop-filter:blur(6px)}.reg-modal-panel{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:min(1040px,94vw);height:min(860px,88vh);background:var(--white);border:3px solid var(--yellow);border-radius:18px;overflow:hidden;box-shadow:0 30px 90px rgba(0,0,0,.45);display:flex;flex-direction:column}.reg-modal-header{background:var(--black);color:var(--white);display:flex;align-items:center;justify-content:space-between;gap:18px;padding:18px 22px;border-bottom:3px solid var(--yellow)}.reg-modal-eyebrow{display:block;color:var(--yellow);font-family:"Barlow Condensed",sans-serif;font-size:11px;font-weight:900;letter-spacing:2.4px;text-transform:uppercase;margin-bottom:4px}.reg-modal-header h2{font-family:"Bebas Neue",sans-serif;font-size:34px;letter-spacing:1.5px;line-height:1;margin:0}.reg-modal-close{background:var(--yellow);color:var(--black);border:0;border-radius:999px;width:40px;height:40px;font-size:30px;line-height:36px;font-weight:900;cursor:pointer}.reg-modal-panel iframe{width:100%;height:100%;border:0;background:white}.reg-modal-footer{display:flex;justify-content:flex-end;background:var(--black);padding:10px 16px}.reg-modal-footer a{color:var(--yellow);font-family:"Barlow Condensed",sans-serif;font-size:13px;font-weight:900;letter-spacing:1.8px;text-transform:uppercase;text-decoration:none}html.terms-gate-active,body.terms-gate-active{overflow:hidden!important}#termsAgreementGate{position:fixed;inset:0;z-index:3000;display:flex;align-items:center;justify-content:center;padding:24px}.terms-gate-backdrop{position:absolute;inset:0;background:rgba(0,0,0,.76);backdrop-filter:blur(7px)}.terms-gate-panel{position:relative;width:min(620px,92vw);max-height:min(680px,84vh);background:var(--white);border:3px solid var(--yellow);border-radius:18px;box-shadow:0 28px 80px rgba(0,0,0,.5);overflow:hidden;display:flex;flex-direction:column}.terms-gate-header{background:var(--black);color:var(--white);padding:18px 22px 16px;border-bottom:3px solid var(--yellow)}.terms-gate-eyebrow{display:block;color:var(--yellow);font-family:"Barlow Condensed",sans-serif;font-size:11px;font-weight:900;letter-spacing:2.6px;text-transform:uppercase;margin-bottom:6px}.terms-gate-header h2{font-family:"Bebas Neue",sans-serif;font-size:36px;letter-spacing:1.4px;line-height:.95;margin:0 0 6px}.terms-gate-header p{color:rgba(255,255,255,.72);font-size:13px;line-height:1.45;margin:0}.terms-gate-scroll{padding:18px 22px;overflow:auto;max-height:300px;border-bottom:1px solid rgba(0,0,0,.12)}.terms-gate-scroll h3{font-family:"Barlow Condensed",sans-serif;font-size:16px;font-weight:900;letter-spacing:1.3px;text-transform:uppercase;color:var(--black);margin:0 0 6px}.terms-gate-scroll p{color:rgba(0,0,0,.74);font-size:13px;line-height:1.56;margin:0 0 15px}.terms-gate-check{display:flex;align-items:flex-start;gap:10px;padding:15px 22px 6px;color:var(--black);font-family:"Barlow",sans-serif;font-size:13px;font-weight:700;line-height:1.4}.terms-gate-check input{width:18px;height:18px;accent-color:var(--yellow);flex:0 0 auto;margin-top:1px}.terms-gate-button{margin:12px 22px 18px;background:var(--yellow);color:var(--black);border:0;border-radius:9px;padding:14px 22px;font-family:"Barlow Condensed",sans-serif;font-size:16px;font-weight:900;letter-spacing:1.8px;text-transform:uppercase;cursor:pointer}.terms-gate-button:disabled{opacity:.45;cursor:not-allowed;filter:grayscale(1)}@media(max-width:720px){.reg-modal-panel{width:100vw;height:100vh;border-radius:0;border-left:0;border-right:0}.reg-modal-header{padding:14px 16px}.reg-modal-header h2{font-size:28px}#termsAgreementGate{padding:18px}.terms-gate-panel{width:min(520px,92vw);max-height:82vh;border-radius:16px}.terms-gate-header{padding:16px 18px 14px}.terms-gate-header h2{font-size:31px}.terms-gate-scroll{max-height:280px;padding:16px 18px}.terms-gate-check{padding:14px 18px 6px}.terms-gate-button{margin:12px 18px 16px}}';
  document.head.appendChild(style);
}

document.addEventListener('DOMContentLoaded', function() {
  applyTargetedStyles();
  initTermsAgreementGate();
  replaceHomepagePrograms();
  enhanceProgramPageHero();
  initRegistrationFormModal();
  initAnim();
  initCarousels();
});
