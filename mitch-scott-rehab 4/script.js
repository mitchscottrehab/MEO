// ============================================================
// MEO - shared site behaviour
// ============================================================

document.getElementById('year') && (document.getElementById('year').textContent = new Date().getFullYear());

/* Cliniko booking modal - opens the booking flow in an embedded popup so
   visitors never leave the site, and listens for Cliniko's booking-completed
   signal to redirect to a confirmation page afterward.

   IMPORTANT CAVEAT: the redirect-on-completion part relies on a
   `clinikoBookingCompleted` postMessage event that Cliniko's embed does
   fire, but which Cliniko's own support documentation explicitly describes
   as undocumented and unsupported for this kind of external use - they
   note they can't help troubleshoot it if it breaks. The popup itself
   (Cliniko's official embed method) is solid and fully supported; only the
   auto-redirect-after-booking piece carries this risk. If Cliniko changes
   their embed internals, the popup will keep working but the redirect may
   silently stop firing - worth testing on the live site after deploying,
   and periodically afterward. */
(function () {
  const overlay = document.createElement('div');
  overlay.className = 'cliniko-modal-overlay';
  overlay.innerHTML = `
    <div class="cliniko-modal">
      <button class="cliniko-modal-close" aria-label="Close booking">&times;</button>
      <div class="cliniko-modal-loading">Loading booking...</div>
      <iframe title="Book an appointment"></iframe>
    </div>
  `;
  document.body.appendChild(overlay);

  const modal = overlay.querySelector('.cliniko-modal');
  const iframe = overlay.querySelector('iframe');
  const loading = overlay.querySelector('.cliniko-modal-loading');
  const closeBtn = overlay.querySelector('.cliniko-modal-close');

  function openClinikoBooking(url) {
    loading.style.display = 'flex';
    iframe.src = url;
    overlay.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(() => overlay.classList.add('is-visible'));
  }

  function closeClinikoBooking() {
    overlay.classList.remove('is-visible');
    document.body.style.overflow = '';
    setTimeout(() => {
      overlay.classList.remove('is-open');
      iframe.src = 'about:blank';
    }, 250);
  }

  iframe.addEventListener('load', () => { loading.style.display = 'none'; });
  closeBtn.addEventListener('click', closeClinikoBooking);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) closeClinikoBooking(); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('is-open')) closeClinikoBooking();
  });

  // Cliniko's iframe posts a `clinikoBookingCompleted` message on successful
  // booking - see caveat above about this being an unsupported signal.
  window.addEventListener('message', (event) => {
    if (!event.data) return;
    const isCompleted =
      event.data === 'clinikoBookingCompleted' ||
      event.data.event === 'clinikoBookingCompleted' ||
      event.data.type === 'clinikoBookingCompleted';
    if (isCompleted) {
      window.location.href = 'booking-confirmed.html';
    }
  });

  window.openClinikoBooking = openClinikoBooking;
})();


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
const isTouchDevice = window.matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window;

// On mobile, some pages have a grid of cards/tiles positioned far enough
// down (below a tall header) that a mobile visitor would see an apparently
// empty page until they scrolled. Any .reveal element inside a container
// marked .cascade-immediate-mobile reveals right away on page load instead
// of waiting for scroll - same stagger cascade, just triggered immediately.
// Desktop is unaffected; those containers still wait for scroll there.
//
// .cascade-immediate does the same thing but on every device, regardless
// of touch/pointer type - used on long single-column pages (like the legal
// pages) where a percentage-based scroll threshold basically never fires
// for a very tall block of content, making the page look empty either way.
const immediateEls = new Set();
if (isTouchDevice) {
  document.querySelectorAll('.cascade-immediate-mobile .reveal').forEach(el => immediateEls.add(el));
}
document.querySelectorAll('.cascade-immediate .reveal').forEach(el => immediateEls.add(el));

if ('IntersectionObserver' in window && revealEls.length) {
  const io = new IntersectionObserver((entries) => {
    // Entries that cross the threshold in the same scroll tick (e.g. a row
    // of cards appearing together) get a small incremental delay each, so
    // they cascade in one after another instead of all popping in at once.
    // Elements that arrive on their own (like a lone heading) just get 0.
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        entry.target.style.transitionDelay = (Math.min(i, 5) * 200) + 'ms';
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -20% 0px' });
  revealEls.forEach(el => { if (!immediateEls.has(el)) io.observe(el); });
} else {
  // IntersectionObserver isn't supported at all in this browser - show
  // everything immediately rather than leaving real content invisible.
  revealEls.forEach(el => el.classList.add('in'));
}

// Trigger the immediate-cascade elements right away (still staggered).
Array.from(immediateEls).forEach((el, i) => {
  el.style.transitionDelay = (Math.min(i, 5) * 200) + 'ms';
  el.classList.add('in');
});

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

/* Hero "stuck cycle" circular trace - desktop only (hidden via CSS on
   touch devices, see .cycle-visual media query). The page is held in place
   (scroll is intercepted) while the user scrolls down, and that scroll
   input drives the circle instead: Rest -> Feel better -> Come back ->
   Flare again, with the whole loop turning red once the flare stage begins
   (75% of the way round). Once the circle finishes, normal page scrolling
   resumes and never locks again. */
(function () {
  const isTouchDevice = window.matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window;
  if (isTouchDevice) return; // hidden on mobile, nothing to wire up

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

  // Hold the page in place while the wheel drives the circle, then release
  // once it's fully complete. No permanent "done" flag - re-checks hero
  // visibility on every event, so it works correctly however the page was
  // loaded (fresh load, anchor jump, or navigating back), and reverses
  // correctly if the user scrolls back up into view after scrolling past it.
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

  render();
})();

