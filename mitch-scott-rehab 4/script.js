// ============================================================
// MEO - shared site behaviour
// ============================================================

document.getElementById('year') && (document.getElementById('year').textContent = new Date().getFullYear());

/* Mobile nav toggle */
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');
if (navToggle && navLinks) {
  navToggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', isOpen);
  });
  navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    navLinks.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  }));
}

/* Scroll reveal */
const revealEls = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window && revealEls.length) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  revealEls.forEach(el => io.observe(el));

  // Safety net: if anything is still hidden after a couple of seconds
  // (slow render, observer edge case, etc.), reveal it anyway rather
  // than leaving real content invisible.
  setTimeout(() => revealEls.forEach(el => el.classList.add('in')), 2500);
} else {
  revealEls.forEach(el => el.classList.add('in'));
}

/* FAQ accordion */
document.querySelectorAll('.faq-item').forEach(item => {
  const q = item.querySelector('.faq-q');
  const a = item.querySelector('.faq-a');
  if (!q || !a) return;
  const setState = (open) => {
    a.style.maxHeight = open ? a.scrollHeight + 'px' : '0px';
    item.classList.toggle('open', open);
  };
  setState(item.classList.contains('open'));
  q.addEventListener('click', () => setState(!item.classList.contains('open')));
  q.setAttribute('tabindex', '0');
  q.setAttribute('role', 'button');
  q.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setState(!item.classList.contains('open')); }
  });
});

/* Hero "stuck cycle" circular trace - progresses as the page scrolls.
   Rest -> Feel better -> Try to come back -> Flare again, with the whole
   loop turning red once the flare stage begins (75% of the way round). */
(function () {
  const arc = document.getElementById('cycleArc');
  if (!arc) return;

  const r = 86;
  const circumference = 2 * Math.PI * r;
  arc.style.strokeDasharray = circumference;

  const dots = [0, 1, 2, 3].map(i => document.getElementById('cycleDot' + i));
  const labels = [0, 1, 2, 3].map(i => document.getElementById('cycleLabel' + i));
  const center = document.getElementById('cycleCenter');
  const names = ['Rest', 'Feel better', 'Try to come back', 'Flare again'];

  // How much scrolling (in px) it takes to complete the full cycle.
  const SCROLL_RANGE = 650;
  let ticking = false;

  function update() {
    ticking = false;
    const p = Math.min(1, Math.max(0, window.scrollY / SCROLL_RANGE));
    arc.style.strokeDashoffset = circumference * (1 - p);

    const idx = Math.min(3, Math.floor(p * 4 + 0.0001));
    center.textContent = p > 0 ? names[idx] : '';

    const flareStarted = p >= 0.75;

    dots.forEach((d, i) => {
      const threshold = i / 4;
      const reached = p >= threshold - 0.001;
      labels[i].style.opacity = reached ? '1' : '0';
      if (flareStarted) {
        d.setAttribute('fill', 'var(--danger)');
      } else {
        d.setAttribute('fill', reached ? 'var(--forest)' : 'var(--line)');
      }
      if (i < 3) {
        labels[i].setAttribute('fill', flareStarted ? 'var(--danger)' : 'var(--moss)');
      }
    });

    center.setAttribute('fill', flareStarted ? 'var(--danger)' : 'var(--ink)');
    arc.setAttribute('stroke', flareStarted ? 'var(--danger)' : 'var(--forest)');
  }

  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(update);
      ticking = true;
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  update();
})();

