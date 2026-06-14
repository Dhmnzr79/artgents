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

/* ── PRICING FAQ ACCORDION ─────────────────────────────── */
const pricingFaqItems = document.querySelectorAll('.pricing-faq__item');

if (pricingFaqItems.length) {
  const setExpandedState = (item, expanded) => {
    const trigger = item.querySelector('.pricing-faq__trigger');
    if (trigger) {
      trigger.setAttribute('aria-expanded', expanded ? 'true' : 'false');
    }
  };

  const getFaqContent = (item) => item.querySelector('.pricing-faq__content');

  const syncFaqItem = (item, immediate = false) => {
    const content = getFaqContent(item);
    if (!content) return;

    content.style.transition = immediate ? 'none' : '';

    if (item.hasAttribute('open')) {
      content.style.maxHeight = immediate ? 'none' : `${content.scrollHeight}px`;
      content.style.opacity = '1';
      setExpandedState(item, true);
    } else {
      content.style.maxHeight = '0px';
      content.style.opacity = '0';
      setExpandedState(item, false);
    }

    if (immediate) {
      requestAnimationFrame(() => {
        content.style.transition = '';
      });
    }
  };

  const finalizeOpenState = (item) => {
    const content = getFaqContent(item);
    if (!content || !item.hasAttribute('open')) return;

    content.style.maxHeight = 'none';
    content.style.opacity = '1';
    setExpandedState(item, true);
  };

  const openFaqItem = (item) => {
    const content = getFaqContent(item);
    if (!content) return;

    item.setAttribute('open', '');
    setExpandedState(item, true);
    content.style.opacity = '1';
    content.style.maxHeight = '0px';

    requestAnimationFrame(() => {
      content.style.maxHeight = `${content.scrollHeight}px`;
    });

    const handleTransitionEnd = (event) => {
      if (event.propertyName !== 'max-height') return;

      content.removeEventListener('transitionend', handleTransitionEnd);
      finalizeOpenState(item);
    };

    content.addEventListener('transitionend', handleTransitionEnd);
  };

  const closeFaqItem = (item) => {
    const content = getFaqContent(item);
    if (!content || !item.hasAttribute('open')) return;

    content.style.maxHeight = `${content.scrollHeight}px`;
    content.style.opacity = '1';

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        content.style.maxHeight = '0px';
        content.style.opacity = '0';
      });
    });

    const handleTransitionEnd = (event) => {
      if (event.propertyName !== 'max-height') return;

      item.removeAttribute('open');
      setExpandedState(item, false);
      content.removeEventListener('transitionend', handleTransitionEnd);
    };

    content.addEventListener('transitionend', handleTransitionEnd);
  };

  pricingFaqItems.forEach((item) => {
    const trigger = item.querySelector('.pricing-faq__trigger');
    if (!trigger) return;

    syncFaqItem(item, true);

    trigger.addEventListener('click', (event) => {
      event.preventDefault();

      const isOpen = item.hasAttribute('open');

      pricingFaqItems.forEach((otherItem) => {
        if (otherItem !== item) {
          closeFaqItem(otherItem);
        }
      });

      if (isOpen) {
        closeFaqItem(item);
      } else {
        openFaqItem(item);
      }
    });
  });

  window.addEventListener('resize', () => {
    pricingFaqItems.forEach((item) => {
      if (item.hasAttribute('open')) {
        finalizeOpenState(item);
      } else {
        syncFaqItem(item, true);
      }
    });
  });

  window.addEventListener('load', () => {
    pricingFaqItems.forEach((item) => {
      if (item.hasAttribute('open')) {
        finalizeOpenState(item);
      }
    });
  });

  if (document.fonts && typeof document.fonts.ready?.then === 'function') {
    document.fonts.ready.then(() => {
      pricingFaqItems.forEach((item) => {
        if (item.hasAttribute('open')) {
          finalizeOpenState(item);
        }
      });
    });
  }
}

/* ── CTA COLLAGE PARALLAX ──────────────────────────────── */
const ctaCollage = document.querySelector('.cta-collage');
const ctaCards = document.querySelectorAll('.cta-collage__card');

if (ctaCollage && ctaCards.length) {
  let ctaTicking = false;

  const updateCtaParallax = () => {
    const rect = ctaCollage.getBoundingClientRect();
    const viewportCenter = window.innerHeight * 0.5;
    const collageCenter = rect.top + rect.height * 0.5;
    const delta = viewportCenter - collageCenter;

    ctaCards.forEach((card) => {
      const speed = Number(card.dataset.speed || 0.5);
      const shift = Math.max(-24, Math.min(24, delta * 0.08 * speed));
      card.style.setProperty('--cta-shift', `${shift.toFixed(2)}px`);
    });

    ctaTicking = false;
  };

  const requestCtaParallaxUpdate = () => {
    if (ctaTicking) return;
    ctaTicking = true;
    requestAnimationFrame(updateCtaParallax);
  };

  requestCtaParallaxUpdate();
  window.addEventListener('scroll', requestCtaParallaxUpdate, { passive: true });
  window.addEventListener('resize', requestCtaParallaxUpdate);
}
