// ============ MOBILE MENU ============
function toggleMobileMenu() {
document.getElementById(‘navMobileMenu’).classList.toggle(‘is-open’);
document.getElementById(‘navHamburger’).classList.toggle(‘is-open’);
}

// ============ SCROLL ANIMATIONS ============
function initAnimations() {
var animEls = document.querySelectorAll(’.anim’);
var observer = new IntersectionObserver(function(entries) {
entries.forEach(function(entry) {
if (entry.isIntersecting) entry.target.classList.add(‘visible’);
});
}, { threshold: 0.15 });
animEls.forEach(function(el) { observer.observe(el); });
}

// ============ TICKER INIT ============
function initTicker() {
var ticker = document.getElementById(‘stickyTicker’);
var spacer = document.getElementById(‘tickerSpacer’);
if (!ticker) return;
var navH = 64;
var tickerTop = null;
function getTickerTop() {
ticker.classList.remove(‘is-sticky’);
spacer.classList.remove(‘active’);
tickerTop = ticker.getBoundingClientRect().top + window.pageYOffset;
}
function onScroll() {
if (tickerTop === null) getTickerTop();
if (window.pageYOffset + navH >= tickerTop) {
ticker.classList.add(‘is-sticky’);
spacer.classList.add(‘active’);
} else {
ticker.classList.remove(‘is-sticky’);
spacer.classList.remove(‘active’);
}
}
window.removeEventListener(‘scroll’, window._tickerScroll);
window._tickerScroll = onScroll;
window.addEventListener(‘scroll’, onScroll, { passive: true });
getTickerTop();
onScroll();
}

// ============ CAROUSELS INIT ============
function initCarousels() {
// Experience carousel
(function() {
var carousel = document.getElementById(‘expCarousel’);
if (!carousel) return;
var prevBtn = document.getElementById(‘expPrev’);
var nextBtn = document.getElementById(‘expNext’);
var dotsContainer = document.getElementById(‘expDots’);
var cards = carousel.querySelectorAll(’.exp-card’);
var current = 0;
var autoTimer;
function getVisible() { var w = window.innerWidth; if (w <= 768) return 1; if (w <= 1024) return 2; return 3; }
function totalSlides() { return cards.length - getVisible() + 1; }
function buildDots() {
dotsContainer.innerHTML = ‘’;
for (var i = 0; i < totalSlides(); i++) {
var dot = document.createElement(‘button’);
dot.className = ‘carousel-dot’ + (i === current ? ’ active’ : ‘’);
(function(idx) { dot.addEventListener(‘click’, function() { goTo(idx); }); })(i);
dotsContainer.appendChild(dot);
}
}
function updateDots() { dotsContainer.querySelectorAll(’.carousel-dot’).forEach(function(d, i) { d.classList.toggle(‘active’, i === current); }); }
function getCardWidth() { return cards[0].offsetWidth + 20; }
function goTo(idx) { current = Math.max(0, Math.min(idx, totalSlides() - 1)); carousel.style.transform = ‘translateX(-’ + (current * getCardWidth()) + ‘px)’; updateDots(); }
function next() { goTo(current >= totalSlides() - 1 ? 0 : current + 1); }
function prev() { goTo(current <= 0 ? totalSlides() - 1 : current - 1); }
function startAuto() { autoTimer = setInterval(next, 3500); }
function stopAuto() { clearInterval(autoTimer); }
nextBtn.addEventListener(‘click’, function() { stopAuto(); next(); startAuto(); });
prevBtn.addEventListener(‘click’, function() { stopAuto(); prev(); startAuto(); });
carousel.addEventListener(‘mouseenter’, stopAuto);
carousel.addEventListener(‘mouseleave’, startAuto);
var touchStartX = 0;
carousel.addEventListener(‘touchstart’, function(e) { touchStartX = e.touches[0].clientX; stopAuto(); }, { passive: true });
carousel.addEventListener(‘touchend’, function(e) { var diff = touchStartX - e.changedTouches[0].clientX; if (Math.abs(diff) > 40) { diff > 0 ? next() : prev(); } startAuto(); });
window.addEventListener(‘resize’, function() { buildDots(); goTo(0); });
buildDots();
startAuto();
})();

// Testimonials carousel
(function() {
var carousel = document.getElementById(‘testCarousel’);
if (!carousel) return;
var prevBtn = document.getElementById(‘testPrev’);
var nextBtn = document.getElementById(‘testNext’);
var dotsContainer = document.getElementById(‘testDots’);
var cards = carousel.querySelectorAll(’.testimonial-card’);
var current = 0;
var autoTimer;
function getVisible() { var w = window.innerWidth; if (w <= 768) return 1; if (w <= 1024) return 2; return 3; }
function totalSlides() { return cards.length - getVisible() + 1; }
function buildDots() {
dotsContainer.innerHTML = ‘’;
for (var i = 0; i < totalSlides(); i++) {
var dot = document.createElement(‘button’);
dot.className = ‘carousel-dot’ + (i === current ? ’ active’ : ‘’);
(function(idx) { dot.addEventListener(‘click’, function() { goTo(idx); }); })(i);
dotsContainer.appendChild(dot);
}
}
function updateDots() { dotsContainer.querySelectorAll(’.carousel-dot’).forEach(function(d, i) { d.classList.toggle(‘active’, i === current); }); }
function getCardWidth() { return cards[0].offsetWidth + 20; }
function setCardSizes() {
var w = window.innerWidth;
var containerW = carousel.parentElement.offsetWidth;
var cardW;
if (w <= 768) { cardW = Math.floor(w * 0.85); }
else if (w <= 1024) { cardW = Math.floor((containerW - 20) / 2); }
else { cardW = Math.floor((containerW - 40) / 3); }
Array.from(cards).forEach(function(c) { c.style.flex = ’0 0 ’ + cardW + ‘px’; c.style.minWidth = cardW + ‘px’; });
}
function goTo(idx) { current = Math.max(0, Math.min(idx, totalSlides() - 1)); carousel.style.transform = ‘translateX(-’ + (current * getCardWidth()) + ‘px)’; updateDots(); }
function next() { goTo(current >= totalSlides() - 1 ? 0 : current + 1); }
function prev() { goTo(current <= 0 ? totalSlides() - 1 : current - 1); }
function startAuto() { autoTimer = setInterval(next, 4000); }
function stopAuto() { clearInterval(autoTimer); }
nextBtn.addEventListener(‘click’, function() { stopAuto(); next(); startAuto(); });
prevBtn.addEventListener(‘click’, function() { stopAuto(); prev(); startAuto(); });
carousel.addEventListener(‘mouseenter’, stopAuto);
carousel.addEventListener(‘mouseleave’, startAuto);
var touchStartX = 0;
carousel.addEventListener(‘touchstart’, function(e) { touchStartX = e.touches[0].clientX; stopAuto(); }, { passive: true });
carousel.addEventListener(‘touchend’, function(e) { var diff = touchStartX - e.changedTouches[0].clientX; if (Math.abs(diff) > 40) { diff > 0 ? next() : prev(); } startAuto(); });
window.addEventListener(‘resize’, function() { setCardSizes(); buildDots(); goTo(0); });
setCardSizes();
buildDots();
startAuto();
})();
}

// ============ ACCORDION ============
function toggleGDA(id) {
var card = document.getElementById(id);
var isOpen = card.classList.contains(‘is-open’);
document.querySelectorAll(’.gda-card’).forEach(function(c) { c.classList.remove(‘is-open’); });
if (!isOpen) card.classList.add(‘is-open’);
}
