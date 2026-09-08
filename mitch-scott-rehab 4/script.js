// ============================================================
// MEO - shared site behaviour
// ============================================================

document.getElementById('year') && (document.getElementById('year').textContent = new Date().getFullYear());

/* Parallax hero - moves the background photo at a fraction of scroll speed
   using JS + transform, not CSS background-attachment:fixed (which iOS
   Safari has historically handled inconsistently). */
(function () {
  const bg = document.querySelector('.parallax-hero .parallax-bg');
  if (!bg) return;
  const speed = 0.4;

  function update() {
    bg.style.transform = `translate3d(0, ${window.scrollY * speed}px, 0)`;
  }

  window.addEventListener('scroll', () => requestAnimationFrame(update), { passive: true });
  update();
})();

/* Hide the sticky Book Now bar while "The Solution" section or the
   parallax hero is in view - the Solution section already has three
   booking CTAs of its own, and the hero has its own CTA further down too,
   so the sticky bar is redundant (and visually competes) in both places. */
(function () {
  const stickyBar = document.querySelector('.sticky-book');
  const hideTriggers = [
    document.getElementById('solution'),
    document.querySelector('.parallax-hero')
  ].filter(Boolean);
  if (!stickyBar || !hideTriggers.length || !('IntersectionObserver' in window)) return;

  const intersecting = new Set();

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        intersecting.add(entry.target);
      } else {
        intersecting.delete(entry.target);
      }
    });
    stickyBar.classList.toggle('is-hidden', intersecting.size > 0);
  }, { threshold: 0.15 });

  hideTriggers.forEach(el => io.observe(el));
})();

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


