function initReusableCarousel(config) {
  var carousel = document.getElementById(config.carouselId);
  var prevBtn = document.getElementById(config.prevId);
  var nextBtn = document.getElementById(config.nextId);
  var dotsContainer = document.getElementById(config.dotsId);

  if (!carousel || !prevBtn || !nextBtn || !dotsContainer) return;

  var cards = carousel.querySelectorAll(config.cardSelector || '.exp-card');
  var current = 0;
  var autoTimer;
  var gap = config.gap || 20;
  var interval = config.interval || 3500;

  function getVisible() {
    var width = window.innerWidth;
    if (width <= 768) return 1;
    if (width <= 1024) return 2;
    return config.desktopVisible || 3;
  }

  function totalSlides() {
    return Math.max(1, cards.length - getVisible() + 1);
  }

  function getCardWidth() {
    if (!cards.length) return 0;
    return cards[0].offsetWidth + gap;
  }

  function buildDots() {
    dotsContainer.innerHTML = '';
    for (var i = 0; i < totalSlides(); i++) {
      var dot = document.createElement('button');
      dot.className = 'carousel-dot' + (i === current ? ' active' : '');
      dot.type = 'button';
      dot.setAttribute('aria-label', 'Go to slide ' + (i + 1));
      (function(index) {
        dot.addEventListener('click', function() {
          stopAuto();
          goTo(index);
          startAuto();
        });
      })(i);
      dotsContainer.appendChild(dot);
    }
  }

  function updateDots() {
    dotsContainer.querySelectorAll('.carousel-dot').forEach(function(dot, index) {
      dot.classList.toggle('active', index === current);
    });
  }

  function goTo(index) {
    current = Math.max(0, Math.min(index, totalSlides() - 1));
    carousel.style.transform = 'translateX(-' + (current * getCardWidth()) + 'px)';
    updateDots();
  }

  function next() {
    goTo(current >= totalSlides() - 1 ? 0 : current + 1);
  }

  function prev() {
    goTo(current <= 0 ? totalSlides() - 1 : current - 1);
  }

  function startAuto() {
    if (config.auto === false) return;
    stopAuto();
    autoTimer = setInterval(next, interval);
  }

  function stopAuto() {
    clearInterval(autoTimer);
  }

  nextBtn.addEventListener('click', function() {
    stopAuto();
    next();
    startAuto();
  });

  prevBtn.addEventListener('click', function() {
    stopAuto();
    prev();
    startAuto();
  });

  carousel.addEventListener('mouseenter', stopAuto);
  carousel.addEventListener('mouseleave', startAuto);

  var touchStartX = 0;
  carousel.addEventListener('touchstart', function(event) {
    touchStartX = event.touches[0].clientX;
    stopAuto();
  }, { passive: true });

  carousel.addEventListener('touchend', function(event) {
    var diff = touchStartX - event.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      diff > 0 ? next() : prev();
    }
    startAuto();
  });

  window.addEventListener('resize', function() {
    buildDots();
    goTo(0);
  });

  buildDots();
  startAuto();
}
