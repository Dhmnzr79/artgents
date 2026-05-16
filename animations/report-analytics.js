/* ── REPORT ANALYTICS ANIMATION ────────────────────────────
   Self-contained IIFE. Expects #reportStage in the DOM.
   Auto-plays on scroll into view, loops every ~14 s.
   ─────────────────────────────────────────────────────────── */
(function () {
  const stage = document.getElementById('reportStage');
  if (!stage) return;

  const chips       = Array.from(stage.querySelectorAll('.rpt-chip'));
  const rows        = Array.from(stage.querySelectorAll('.rpt-q-row'));
  const gaps        = Array.from(stage.querySelectorAll('.rpt-gap-row'));
  const countEl     = stage.querySelector('#rptDialogueCount');
  const badge       = stage.querySelector('#rptDialogueBadge');
  const scanLine    = stage.querySelector('#rptScanLine');

  let timers = [];
  let loopId = null;

  /* ── Helpers ──────────────────────────────────────────── */
  function wait(ms) {
    return new Promise(resolve => {
      const id = setTimeout(resolve, ms);
      timers.push(id);
    });
  }

  function clearTimers() {
    timers.forEach(clearTimeout);
    timers = [];
    if (loopId) { clearInterval(loopId); loopId = null; }
  }

  function animateNumber(el, to, duration) {
    const start = performance.now();
    const from  = Number(el.textContent) || 0;

    function tick(now) {
      const p = Math.min((now - start) / duration, 1);
      const e = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(from + (to - from) * e);
      if (p < 1) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  }

  /* ── Reset ────────────────────────────────────────────── */
  function resetScene() {
    chips.forEach(c => c.classList.remove('is-visible', 'is-collected'));
    rows.forEach(row => {
      row.classList.remove('is-visible');
      row.querySelector('.rpt-bar-fill').style.width = '0%';
      row.querySelector('.rpt-q-num').textContent = '0';
    });
    gaps.forEach(g => g.classList.remove('is-visible'));
    if (countEl) countEl.textContent = '0';
    if (badge)   badge.classList.remove('is-hot');
    if (scanLine) {
      scanLine.classList.remove('is-active');
      void scanLine.offsetWidth; /* force reflow to reset animation */
    }
  }

  /* ── Scene ────────────────────────────────────────────── */
  async function runScene() {
    clearTimers();
    resetScene();
    await wait(420);

    /* Chips fly in */
    for (const chip of chips) {
      chip.classList.add('is-visible');
      await wait(230);
    }

    await wait(620);

    /* Scan + collect chips */
    if (scanLine) scanLine.classList.add('is-active');
    chips.forEach((chip, i) => {
      const id = setTimeout(() => chip.classList.add('is-collected'), i * 90);
      timers.push(id);
    });

    await wait(380);

    /* Badge count */
    if (badge)   badge.classList.add('is-hot');
    if (countEl) animateNumber(countEl, 47, 1150);

    await wait(720);

    /* Question rows */
    for (const row of rows) {
      row.classList.add('is-visible');
      await wait(170);
      row.querySelector('.rpt-bar-fill').style.width = row.dataset.fill + '%';
      animateNumber(row.querySelector('.rpt-q-num'), Number(row.dataset.value), 720);
      await wait(360);
    }

    await wait(420);

    /* Gap rows */
    for (const gap of gaps) {
      gap.classList.add('is-visible');
      await wait(420);
    }

    /* Auto-restart after pause */
    loopId = setTimeout(runScene, 4500);
  }

  /* ── Trigger on scroll into view ─────────────────────── */
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          runScene();
          observer.unobserve(stage);
        }
      });
    },
    { threshold: 0.25 }
  );

  observer.observe(stage);
}());
