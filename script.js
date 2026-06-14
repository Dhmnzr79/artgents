/* ── NAV SCROLL STATE ───────────────────────────────────── */
const nav = document.querySelector('.nav');

window.addEventListener('scroll', () => {
  nav.classList.toggle('nav--scrolled', window.scrollY > 40);
}, { passive: true });

/* ── FADE-UP REVEAL ─────────────────────────────────────── */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.14 });

document.querySelectorAll('.fade-up').forEach(el => revealObserver.observe(el));

/* ── WHAT VISUAL ZOOM ───────────────────────────────────── */
const whatVisualCol = document.querySelector('.what__visual-col');

if (whatVisualCol) {
  const whatVisualObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      whatVisualCol.classList.toggle('is-active', entry.isIntersecting);
    });
  }, {
    threshold: 0.35,
    rootMargin: '-8% 0px -8% 0px',
  });

  whatVisualObserver.observe(whatVisualCol);
}

/* ── RESULTS FEATURE SPOTLIGHT ─────────────────────────── */
