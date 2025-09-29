// Mobile nav toggle
(function () {
  var toggle = document.querySelector('.nav-toggle');
  var menu = document.getElementById('nav-menu');
  if (!toggle || !menu) return;
  toggle.addEventListener('click', function () {
    var isOpen = menu.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(isOpen));
  });
})();

// Theme toggle (dark/light with persistence)
(function () {
  var THEME_KEY = 'site-theme';
  var root = document.body;
  var button = document.getElementById('theme-toggle');
  if (!root || !button) return;

  function applyTheme(theme) {
    root.classList.remove('theme-light', 'theme-dark', 'theme-delta');
    root.classList.add(theme);
    button.innerHTML = theme === 'theme-dark' ? '<span aria-hidden="true">☀️</span>' : '<span aria-hidden="true">🌙</span>';
    button.setAttribute('aria-label', 'Switch to ' + (theme === 'theme-dark' ? 'light' : 'dark') + ' theme');
  }

  var stored = localStorage.getItem(THEME_KEY);
  if (stored === 'theme-light' || stored === 'theme-dark') {
    applyTheme(stored);
  } else {
    var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    applyTheme(prefersDark ? 'theme-dark' : 'theme-light');
  }

  button.addEventListener('click', function () {
    var next = root.classList.contains('theme-dark') ? 'theme-light' : 'theme-dark';
    applyTheme(next);
    try { localStorage.setItem(THEME_KEY, next); } catch (e) {}
  });
})();

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


// Work slider: arrows + drag scroll + snap
(function () {
  var track = document.getElementById('work-track');
  if (!track) return;
  var prev = document.querySelector('.work-arrow.prev');
  var next = document.querySelector('.work-arrow.next');

  function slideBy(dir) {
    var w = track.clientWidth * 0.9;
    // pause auto so the RAF loop doesn't fight smooth scroll
    if (typeof stopAuto === 'function') stopAuto();
    track.scrollBy({ left: dir * w, behavior: 'smooth' });
    // after animation, normalize position into [0, baseWidth) and resume
    setTimeout(function () {
      try {
        var bw = track.scrollWidth / 2;
        if (bw > 0) track.scrollLeft = track.scrollLeft % bw;
      } catch (e) {}
      if (typeof startAuto === 'function') startAuto();
    }, 550);
  }

  if (prev) prev.addEventListener('click', function () { slideBy(-1); });
  if (next) next.addEventListener('click', function () { slideBy(1); });

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
    var dx = x - startX;
    track.scrollLeft = startLeft - dx;
  }
  function onUp() { isDown = false; track.classList.remove('is-dragging'); }

  track.addEventListener('mousedown', onDown);
  track.addEventListener('touchstart', onDown, { passive: true });
  window.addEventListener('mousemove', onMove);
  window.addEventListener('touchmove', onMove, { passive: true });
  window.addEventListener('mouseup', onUp);
  window.addEventListener('touchend', onUp);

  // Continuous auto-scroll (seamless loop)
  var duplicated = track.getAttribute('data-duplicated');
  if (!duplicated) {
    var originals = Array.prototype.slice.call(track.children);
    originals.forEach(function (node) { track.appendChild(node.cloneNode(true)); });
    track.setAttribute('data-duplicated', 'true');
  }
  var baseWidth = track.scrollWidth / 2;

  var raf = null; 
  var sliderRoot = document.querySelector('.work-slider');
  var speedAttr = sliderRoot ? parseFloat(sliderRoot.getAttribute('data-speed') || '60') : 60; // pixels/sec
  var speedPxPerFrame = Math.max(10, Math.min(160, speedAttr)) / 60;
  function tick() {
    track.scrollLeft += speedPxPerFrame;
    if (track.scrollLeft >= baseWidth) {
      track.scrollLeft -= baseWidth;
    }
    raf = requestAnimationFrame(tick);
  }
  function startAuto() { 
    if (!raf) raf = requestAnimationFrame(tick);
    track.classList.add('is-autoplaying');
  }
  function stopAuto() { 
    if (raf) { cancelAnimationFrame(raf); raf = null; }
    track.classList.remove('is-autoplaying');
  }

  // Start by default
  startAuto();

  // Pause only during drag interactions (not on hover)
  track.addEventListener('mousedown', stopAuto);
  track.addEventListener('touchstart', stopAuto, { passive: true });
  window.addEventListener('mouseup', startAuto);
  window.addEventListener('touchend', startAuto);

  // Pause when tab not visible
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) stopAuto(); else startAuto();
  });

  // Recalculate baseWidth on resize
  window.addEventListener('resize', function () {
    baseWidth = track.scrollWidth / 2;
    // ensure position stays within range after content size change
    if (track.scrollLeft >= baseWidth) {
      track.scrollLeft = track.scrollLeft % baseWidth;
    }
  });

  // Keyboard navigation when slider is hovered or focused
  var isHover = false;
  if (sliderRoot) {
    sliderRoot.addEventListener('mouseenter', function () { isHover = true; });
    sliderRoot.addEventListener('mouseleave', function () { isHover = false; });
  }
  window.addEventListener('keydown', function (e) {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    var active = document.activeElement;
    var inContext = isHover || (sliderRoot && sliderRoot.contains(active));
    if (!inContext) return;
    e.preventDefault();
    slideBy(e.key === 'ArrowLeft' ? -1 : 1);
  });
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

