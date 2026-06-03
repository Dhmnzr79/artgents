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

/* ── PROBLEMS STACK REVEAL ─────────────────────────────── */
const problemsSection = document.querySelector('#problems');
const problemsStack = document.querySelector('[data-problems-stack]');

if (problemsSection && problemsStack) {
  const problemCards = Array.from(problemsStack.querySelectorAll('.problem-card'));
  const [firstCard, secondCard, thirdCard] = problemCards;
  const desktopMq = window.matchMedia('(min-width: 1121px)');
  const HOLD_DISTANCE = 900;
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const lerp = (start, end, progress) => start + ((end - start) * progress);
  const getReveal = (value, start, end) => clamp((value - start) / (end - start), 0, 1);

  let progress = 0;
  let rafId = 0;

  const applyCardState = (card, reveal, options) => {
    if (!card) return;

    const visible = reveal > 0.001;
    const offset = lerp(options.offset, 0, reveal);
    const rotation = lerp(options.rotateFrom, options.rotateTo, reveal);
    const scale = lerp(options.scaleFrom, 1, reveal);
    const blur = lerp(10, 0, reveal);

    card.classList.toggle('is-visible', visible);
    card.style.opacity = String(reveal);
    card.style.filter = `blur(${blur}px)`;
    card.style.transform = `translateY(calc(-50% + ${offset}px)) rotate(${rotation}deg) scale(${scale})`;
    card.style.pointerEvents = reveal > 0.98 ? 'auto' : 'none';
  };

  const setDesktopState = () => {
    if (firstCard) {
      firstCard.classList.add('is-visible');
      firstCard.style.opacity = '1';
      firstCard.style.filter = 'blur(0px)';
      firstCard.style.transform = 'translateY(-50%) rotate(-2.75deg)';
      firstCard.style.pointerEvents = 'auto';
    }

    applyCardState(secondCard, getReveal(progress, 0.18, 0.5), {
      offset: 28,
      rotateFrom: 1.8,
      rotateTo: 1.1,
      scaleFrom: 0.985,
    });

    applyCardState(thirdCard, getReveal(progress, 0.52, 0.84), {
      offset: 32,
      rotateFrom: -1.35,
      rotateTo: -0.85,
      scaleFrom: 0.97,
    });
  };

  const setMobileState = () => {
    problemCards.forEach((card) => {
      card.classList.add('is-visible');
      card.removeAttribute('style');
    });
  };

  const updateProblems = () => {
    if (!desktopMq.matches) {
      progress = 0;
      setMobileState();
      return;
    }

    const rect = problemsSection.getBoundingClientRect();
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;

    if (rect.top >= viewportHeight) {
      progress = 0;
    } else if (rect.bottom <= 0) {
      progress = 1;
    }

    setDesktopState();
  };

  const isSectionLocked = () => {
    const rect = problemsSection.getBoundingClientRect();
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
    const sectionCenter = rect.top + (rect.height / 2);
    return sectionCenter >= viewportHeight * 0.35 && sectionCenter <= viewportHeight * 0.65;
  };

  const stepProgress = (delta) => {
    const nextProgress = clamp(progress + (delta / HOLD_DISTANCE), 0, 1);

    if (nextProgress === progress) {
      return false;
    }

    progress = nextProgress;
    setDesktopState();
    return true;
  };

  const scheduleUpdate = () => {
    if (rafId) return;
    rafId = window.requestAnimationFrame(() => {
      rafId = 0;
      updateProblems();
    });
  };

  const handleWheel = (event) => {
    if (!desktopMq.matches || !isSectionLocked() || event.deltaY === 0) {
      return;
    }

    const scrollingDown = event.deltaY > 0;
    const scrollingUp = event.deltaY < 0;
    const shouldHold = (scrollingDown && progress < 1) || (scrollingUp && progress > 0);

    if (!shouldHold) {
      return;
    }

    event.preventDefault();
    if (Math.abs(window.scrollY - problemsSection.offsetTop) > 1) {
      window.scrollTo(0, problemsSection.offsetTop);
    }
    stepProgress(event.deltaY);
  };

  const handleKeydown = (event) => {
    if (!desktopMq.matches || !isSectionLocked()) {
      return;
    }

    const keySteps = {
      ArrowDown: 120,
      ArrowUp: -120,
      PageDown: 240,
      PageUp: -240,
      Space: event.shiftKey ? -180 : 180,
    };

    const delta = keySteps[event.code];
    if (!delta) {
      return;
    }

    const scrollingDown = delta > 0;
    const scrollingUp = delta < 0;
    const shouldHold = (scrollingDown && progress < 1) || (scrollingUp && progress > 0);

    if (!shouldHold) {
      return;
    }

    event.preventDefault();
    if (Math.abs(window.scrollY - problemsSection.offsetTop) > 1) {
      window.scrollTo(0, problemsSection.offsetTop);
    }
    stepProgress(delta);
  };

  window.addEventListener('wheel', handleWheel, { passive: false });
  window.addEventListener('keydown', handleKeydown);
  window.addEventListener('scroll', scheduleUpdate, { passive: true });
  window.addEventListener('resize', scheduleUpdate);
  updateProblems();
}
