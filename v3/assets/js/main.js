// Mobile nav toggle
(function () {
  var toggle = document.querySelector('.nav-toggle');
  var menu = document.getElementById('nav-menu');
  if (!toggle || !menu) return;
  toggle.addEventListener('click', function () {
    var isOpen = menu.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(isOpen));
  });
  // Close mobile menu on link click (accessibility + UX)
  menu.addEventListener('click', function (e) {
    var target = e.target;
    if (target && target.tagName === 'A' && menu.classList.contains('is-open')) {
      menu.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
    }
  });
})();

// Footer year without inline script
(function(){
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setYear);
  } else {
    setYear();
  }
  function setYear(){
    var y = document.getElementById('y');
    if (y) { y.textContent = new Date().getFullYear(); }
  }
})();

// Theme forced to light: clean removal of toggle logic
// No runtime theme switching; site uses light theme styles by default.

// (gallery scripts removed)

// Basic slider
(function () {
  var root = document.getElementById('testimonial-slider');
  if (!root) return;
  var slides = root.querySelector('.slides');
  var prev = root.querySelector('.prev');
  var next = root.querySelector('.next');
  var index = 0;
  function go(dir) {
    var total = slides.children.length;
    index = (index + dir + total) % total;
    var x = index * slides.clientWidth;
    slides.scrollTo({ left: x, behavior: 'smooth' });
  }
  prev.addEventListener('click', function () { go(-1); });
  next.addEventListener('click', function () { go(1); });
  window.addEventListener('resize', function () { go(0); });
})();

// Reveal on scroll
(function () {
  var elements = [].slice.call(document.querySelectorAll('.reveal'));
  if (!('IntersectionObserver' in window) || elements.length === 0) {
    elements.forEach(function (el) { el.classList.add('is-visible'); });
    return;
  }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  elements.forEach(function (el) { io.observe(el); });
})();

// Smooth anchor scroll for same-page links
(function () {
  var links = document.querySelectorAll('a[href^="#"]');
  links.forEach(function (link) {
    link.addEventListener('click', function (e) {
      var targetId = link.getAttribute('href').slice(1);
      var target = document.getElementById(targetId);
      if (target) {
        e.preventDefault();
        window.scrollTo({ top: target.offsetTop - 60, behavior: 'smooth' });
      }
    });
  });
})();

// Count-up numbers on reveal
(function () {
  function countUp(el) {
    var text = (el.getAttribute('data-target') || el.textContent || '').replace(/[,+$%\s]/g, '');
    var target = parseFloat(text);
    if (!isFinite(target)) return;
    var duration = parseInt(el.getAttribute('data-duration') || '1200', 10);
    var start = null;
    function step(ts) {
      if (start === null) start = ts;
      var p = Math.min(1, (ts - start) / duration);
      var value = Math.floor(target * p);
      var suffix = el.getAttribute('data-suffix') || '';
      var prefix = el.getAttribute('data-prefix') || '';
      el.textContent = prefix + value.toLocaleString() + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  var nums = [].slice.call(document.querySelectorAll('.metric-num, .stat-num'));
  if (nums.length === 0) return;
  if (!('IntersectionObserver' in window)) {
    nums.forEach(countUp);
    return;
  }
  var seen = new WeakSet();
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting && !seen.has(entry.target)) {
        seen.add(entry.target);
        countUp(entry.target);
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });
  nums.forEach(function (el) { io.observe(el); });
})();


// Work slider: modern snap-center with drag/wheel and simple arrows
(function () {
  var track = document.getElementById('work-track');
  if (!track) return;

  var slides = Array.prototype.slice.call(track.querySelectorAll('.work-slide'));
  var prev = document.querySelector('.work-arrow.prev');
  var next = document.querySelector('.work-arrow.next');

  function centerOn(index) {
    if (!slides[index]) return;
    var left = slides[index].offsetLeft;
    track.scrollTo({ left: left, behavior: 'smooth' });
  }

  function findCenterIndex() {
    var mid = track.scrollLeft + track.clientWidth / 2;
    var idx = 0;
    var minDist = Infinity;
    slides.forEach(function (slide, i) {
      var slideMid = slide.offsetLeft + slide.clientWidth / 2;
      var dist = Math.abs(slideMid - mid);
      if (dist < minDist) { minDist = dist; idx = i; }
    });
    return idx;
  }

  function updateActive() {
    var idx = findCenterIndex();
    slides.forEach(function (s, i) { s.classList.toggle('is-center', i === idx); });
  }

  // Update active slide on scroll (throttled by rAF)
  var ticking = false;
  track.addEventListener('scroll', function () {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () { updateActive(); ticking = false; });
  });

  // Init
  updateActive();

  if (prev) prev.addEventListener('click', function () { centerOn(Math.max(0, findCenterIndex() - 1)); });
  if (next) next.addEventListener('click', function () { centerOn(Math.min(slides.length - 1, findCenterIndex() + 1)); });

  // Wheel: vertical wheel scrolls horizontally for this track
  track.addEventListener('wheel', function (e) {
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      e.preventDefault();
      track.scrollBy({ left: e.deltaY, behavior: 'auto' });
    }
  }, { passive: false });

  // Drag to scroll
  var isDown = false; var startX = 0; var startLeft = 0;
  function onDown(e) {
    isDown = true;
    startX = (e.touches ? e.touches[0].clientX : e.clientX);
    startLeft = track.scrollLeft;
    track.classList.add('is-dragging');
  }
  function onMove(e) {
    if (!isDown) return;
    var x = (e.touches ? e.touches[0].clientX : e.clientX);
    track.scrollLeft = startLeft - (x - startX);
  }
  function onUp() {
    if (!isDown) return;
    isDown = false;
    track.classList.remove('is-dragging');
    centerOn(findCenterIndex());
  }
  track.addEventListener('mousedown', onDown);
  track.addEventListener('touchstart', onDown, { passive: true });
  window.addEventListener('mousemove', onMove);
  window.addEventListener('touchmove', onMove, { passive: true });
  window.addEventListener('mouseup', onUp);
  window.addEventListener('touchend', onUp);

  window.addEventListener('resize', updateActive);
})();

// Choose Delta rotator (auto-rotate with pause offscreen)
(function () {
  var root = document.getElementById('choose-rotator');
  if (!root) return;
  var slides = Array.prototype.slice.call(root.querySelectorAll('.choose-slide'));
  if (slides.length <= 1) { slides.forEach(function (s) { s.classList.add('is-active'); }); return; }

  var index = 0; var timer = null; var running = false;
  function show(i) {
    slides.forEach(function (s, j) { if (j === i) s.classList.add('is-active'); else s.classList.remove('is-active'); });
    updateDots(); resetProgress();
  }
  function next() { index = (index + 1) % slides.length; show(index); }
  function start() { if (running) return; running = true; timer = setInterval(next, 3800); }
  function stop() { running = false; if (timer) { clearInterval(timer); timer = null; } }

  // Start only when visible
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) { if (entry.isIntersecting) start(); else stop(); });
    }, { threshold: 0.2 });
    io.observe(root);
  } else {
    start();
  }

  // Keyboard accessibility: advance with ArrowRight when focused
  root.setAttribute('tabindex', '0');
  root.addEventListener('keydown', function (e) { if (e.key === 'ArrowRight') next(); });

  // Dots + progress
  var container = root.parentElement;
  var dotsWrap = container.querySelector('.choose-controls');
  var dots = dotsWrap ? Array.prototype.slice.call(dotsWrap.querySelectorAll('.dot')) : [];
  var progress = dotsWrap ? dotsWrap.querySelector('.choose-progress') : null;
  function updateDots() { dots.forEach(function (d, i) { d.classList.toggle('is-active', i === index); d.setAttribute('aria-selected', String(i === index)); }); }
  function resetProgress() {
    if (!progress) return;
    var bar = progress.querySelector('::after'); // cannot select pseudo; fallback by width style on element
    // Use a CSS custom property to animate width via CSS
    progress.style.setProperty('--p', '0%');
    setTimeout(function () { progress.style.setProperty('--p', '100%'); }, 10);
  }
  if (progress) {
    // attach a style rule for ::after width using CSS var
    try {
      var sheet = document.styleSheets[0];
      if (sheet && sheet.insertRule) {
        sheet.insertRule('.choose-progress::after{width:var(--p,0%)}', sheet.cssRules.length);
      }
    } catch (e) {}
  }
  if (dots.length) {
    dots.forEach(function (d, i) { d.addEventListener('click', function () { stop(); index = i; show(index); start(); }); });
    updateDots(); resetProgress();
  }
})();

// Choose section: make visual "come to life" when visible
(function () {
  var section = document.getElementById('choose');
  if (!section) return;
  function activate() { section.classList.add('is-live'); }
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { activate(); io.unobserve(section); }
      });
    }, { threshold: 0.25 });
    io.observe(section);
  } else {
    activate();
  }
})();

