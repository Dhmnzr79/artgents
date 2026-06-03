/* ── HOW PAGE ─────────────────────────────────────────────
   Interactive components for how.html
   ─────────────────────────────────────────────────────────── */
(function () {
  'use strict';

  /* ── LAUNCH TIMELINE ────────────────────────────────────── */
  const launchSection = document.getElementById('launchSection');

  if (launchSection) {
    const steps    = Array.from(launchSection.querySelectorAll('.process-step'));
    const panels   = Array.from(launchSection.querySelectorAll('.stage-panel'));
    const fill     = document.getElementById('timelineFill');
    const title    = document.getElementById('stageTitle');
    const status   = document.getElementById('stageStatus');
    const progress = document.getElementById('stageProgress');
    const timeline = document.getElementById('launchTimeline');

    const stageTexts = [
      'Материалы отправляются в обработку',
      'Собирается спокойная база подсказок',
      'Ответы проходят обычную проверку',
      'Виджет готовится к размещению',
      'Первые диалоги уточняют текст'
    ];

    function setLaunchStep(index) {
      steps.forEach((step, i) => step.classList.toggle('is-active', i === index));
      panels.forEach((panel, i) => panel.classList.toggle('is-active', i === index));

      if (title)    title.textContent = stageTexts[index];
      if (status)   status.textContent = `Этап ${String(index + 1).padStart(2, '0')} / 05`;
      if (progress) progress.style.width = `${(index + 1) * 20}%`;

      if (fill && timeline) {
        const firstDot   = steps[0].querySelector('.step-dot');
        const currentDot = steps[index].querySelector('.step-dot');
        const fRect = firstDot.getBoundingClientRect();
        const cRect = currentDot.getBoundingClientRect();
        const height = cRect.top + cRect.height / 2 - (fRect.top + fRect.height / 2);
        fill.style.height = `${Math.max(0, height)}px`;
      }
    }

    steps.forEach((step, i) => {
      step.addEventListener('click', () => setLaunchStep(i));
    });

    // Целевая линия держится примерно на 40% от верха viewport.
    // Ищем шаг, чей центр ближе всего к этой линии и уже вошёл в зону.
    function findActiveStep() {
      const targetY = window.innerHeight * 0.40;
      let bestIndex = 0;
      let bestDist = Infinity;

      steps.forEach((step, i) => {
        const rect = step.getBoundingClientRect();
        const center = rect.top + rect.height / 2;
        // Учитываем только шаги, которые уже прошли верхнюю треть viewport.
        if (rect.top > window.innerHeight * 0.72) return;
        const dist = Math.abs(center - targetY);
        if (dist < bestDist) {
          bestDist = dist;
          bestIndex = i;
        }
      });

      return bestIndex;
    }

    let rafId = null;
    window.addEventListener('scroll', () => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;
        setLaunchStep(findActiveStep());
      });
    }, { passive: true });

    setLaunchStep(0);
  }

  /* ── FAQ ACCORDION ──────────────────────────────────────── */
  const accordion = document.querySelector('[data-accordion]');

  if (accordion) {
    const items = Array.from(accordion.children);

    function closeItem(item) {
      item.classList.remove('is-open');
      const trigger = item.querySelector('button');
      const content = item.querySelector('.faq-content');
      if (trigger) trigger.setAttribute('aria-expanded', 'false');
      if (content) content.style.maxHeight = '0px';
    }

    function openItem(item) {
      item.classList.add('is-open');
      const trigger = item.querySelector('button');
      const content = item.querySelector('.faq-content');
      if (trigger) trigger.setAttribute('aria-expanded', 'true');
      if (content) content.style.maxHeight = `${content.scrollHeight}px`;
    }

    items.forEach(item => {
      const content = item.querySelector('.faq-content');
      if (content) {
        content.style.maxHeight = item.classList.contains('is-open')
          ? `${content.scrollHeight}px`
          : '0px';
      }

      const trigger = item.querySelector('button');
      if (trigger) {
        trigger.addEventListener('click', () => {
          const isOpen = item.classList.contains('is-open');
          items.forEach(closeItem);
          if (!isOpen) openItem(item);
        });
      }
    });

    window.addEventListener('resize', () => {
      items.forEach(item => {
        const content = item.querySelector('.faq-content');
        if (item.classList.contains('is-open') && content) {
          content.style.maxHeight = `${content.scrollHeight}px`;
        }
      });
    });
  }

}());
