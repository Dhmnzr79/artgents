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

/* ── PROBLEMS PANEL ────────────────────────────────────── */
const problemsSection = document.querySelector('#problems');
const problemsPanel = document.querySelector('[data-problems-panel]');

if (problemsSection && problemsPanel) {
  const problemItems = Array.from(problemsPanel.querySelectorAll('[data-problem-item]'));
  const problemSteps = Array.from(problemsPanel.querySelectorAll('[data-problem-step]'));
  const progressFill = problemsPanel.querySelector('[data-problem-progress]');
  const desktopMq = window.matchMedia('(min-width: 1121px)');
  const WHEEL_THRESHOLD = 140;
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

  let stage = 0;
  let wheelDelta = 0;
  let rafId = 0;

  const maxStage = Math.max(problemItems.length - 1, 0);

  const setStage = (nextStage) => {
    stage = clamp(nextStage, 0, maxStage);

    problemItems.forEach((item, index) => {
      item.classList.toggle('is-active', index === stage);
    });

    problemSteps.forEach((step, index) => {
      const isActive = index === stage;
      step.classList.toggle('is-active', isActive);
      step.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });

    if (progressFill) {
      progressFill.style.width = `${((stage + 1) / (maxStage + 1)) * 100}%`;
    }
  };

  const isSectionLocked = () => {
    const rect = problemsSection.getBoundingClientRect();
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
    return rect.top <= viewportHeight * 0.16 && rect.bottom >= viewportHeight * 0.84;
  };

  const syncStageToViewport = () => {
    if (!desktopMq.matches) {
      wheelDelta = 0;
      setStage(0);
      return;
    }

    const rect = problemsSection.getBoundingClientRect();
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;

    if (rect.top >= viewportHeight * 0.55) {
      setStage(0);
      wheelDelta = 0;
      return;
    }

    if (rect.bottom <= viewportHeight * 0.45) {
      setStage(maxStage);
      wheelDelta = 0;
    }
  };

  const scheduleSync = () => {
    if (rafId) return;
    rafId = window.requestAnimationFrame(() => {
      rafId = 0;
      syncStageToViewport();
    });
  };

  const stepStage = (direction) => {
    const nextStage = clamp(stage + direction, 0, maxStage);
    if (nextStage === stage) {
      return false;
    }

    wheelDelta = 0;
    setStage(nextStage);
    return true;
  };

  const handleWheel = (event) => {
    if (!desktopMq.matches || event.deltaY === 0) {
      wheelDelta = 0;
      return;
    }

    if (!isSectionLocked()) {
      wheelDelta = 0;
      return;
    }

    const direction = event.deltaY > 0 ? 1 : -1;
    const canHold = (direction > 0 && stage < maxStage) || (direction < 0 && stage > 0);

    if (!canHold) {
      wheelDelta = 0;
      return;
    }

    event.preventDefault();

    if (wheelDelta !== 0 && Math.sign(wheelDelta) !== direction) {
      wheelDelta = 0;
    }

    wheelDelta += event.deltaY;

    if (Math.abs(wheelDelta) >= WHEEL_THRESHOLD) {
      stepStage(direction);
    }
  };

  const handleKeydown = (event) => {
    if (!desktopMq.matches || !isSectionLocked()) {
      return;
    }

    const keyDirection = {
      ArrowDown: 1,
      PageDown: 1,
      Space: event.shiftKey ? -1 : 1,
      ArrowUp: -1,
      PageUp: -1,
    };

    const direction = keyDirection[event.code];
    if (!direction) {
      return;
    }

    const canHold = (direction > 0 && stage < maxStage) || (direction < 0 && stage > 0);
    if (!canHold) {
      return;
    }

    event.preventDefault();
    stepStage(direction);
  };

  problemSteps.forEach((step, index) => {
    step.addEventListener('click', () => {
      wheelDelta = 0;
      setStage(index);
    });
  });

  window.addEventListener('wheel', handleWheel, { passive: false });
  window.addEventListener('keydown', handleKeydown);
  window.addEventListener('scroll', scheduleSync, { passive: true });
  window.addEventListener('resize', scheduleSync);
  desktopMq.addEventListener('change', scheduleSync);

  setStage(0);
  syncStageToViewport();
}
