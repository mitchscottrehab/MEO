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

/* Hero "stuck cycle" circular trace. The page is held in place (scroll is
   intercepted) while the user scrolls down, and that scroll input drives the
   circle instead: Rest -> Feel better -> Try to come back -> Flare again,
   with the whole loop turning red once the flare stage begins (75% of the
   way round). Once the circle finishes, normal page scrolling resumes and
   never locks again. */
(function () {
  const arc = document.getElementById('cycleArc');
  if (!arc) return;

  const r = 86;
  const circumference = 2 * Math.PI * r;
  arc.style.strokeDasharray = circumference;

  const dots = [0, 1, 2, 3].map(i => document.getElementById('cycleDot' + i));
  const labels = [0, 1, 2, 3].map(i => document.getElementById('cycleLabel' + i));
  const center = document.getElementById('cycleCenter');
  const names = ['Rest', 'Feel better', 'Come back', 'Flare again'];

  let progress = 0;      // 0 to 1

  function render() {
    const p = progress;
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

  // How much cumulative scroll input (in px-equivalent) it takes to complete
  // the full cycle. Bigger = slower/more scrolling required.
  const DRIVE_RANGE = 900;

  function isHeroInView() {
    const hero = document.querySelector('.hero');
    if (!hero) return false;
    const rect = hero.getBoundingClientRect();
    // Only lock while we're still essentially at the top of the page.
    return rect.top > -40 && window.scrollY < 40;
  }

  const isTouchDevice = window.matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window;

  if (isTouchDevice) {
    // Scroll-jacking via preventDefault on touch events is unreliable across
    // mobile browsers (iOS Safari in particular restricts it). Rather than
    // fight that, just tie progress straight to normal scroll position -
    // the page scrolls natively and the circle animates alongside it.
    const MOBILE_RANGE = 500;
    let ticking = false;

    function updateFromScroll() {
      ticking = false;
      progress = Math.min(1, Math.max(0, window.scrollY / MOBILE_RANGE));
      render();
    }

    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(updateFromScroll);
        ticking = true;
      }
    }, { passive: true });

  } else {
    // Desktop/mouse: hold the page in place while the wheel drives the
    // circle, then release once it's fully complete. No permanent "done"
    // flag - re-checks hero visibility on every event, so it works correctly
    // however the page was loaded (fresh load, anchor jump, or navigating
    // back), and reverses correctly if the user scrolls back up into view
    // after having scrolled past it.
    function handleWheel(e) {
      if (!isHeroInView()) return;

      const scrollingDown = e.deltaY > 0;
      if (scrollingDown && progress >= 1) return;   // fully done, let them continue past
      if (!scrollingDown && progress <= 0) return;  // fully reset, nothing above to reveal

      e.preventDefault();
      progress = Math.min(1, Math.max(0, progress + e.deltaY / DRIVE_RANGE));
      render();
    }

    window.addEventListener('wheel', handleWheel, { passive: false });
  }

  render();
})();

