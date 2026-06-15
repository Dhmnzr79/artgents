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

/* в”Ђв”Ђ CONTACT POPUP в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ */
const initContactStylePopup = (popupId, openSelector) => {
  const popup = document.getElementById(popupId);
  if (!popup) return;

  const openButtons = document.querySelectorAll(openSelector);
  const closeButtons = popup.querySelectorAll('[data-close-contact-popup]');
  const popupForm = popup.querySelector('.contact-popup__form');
  const firstField = popup.querySelector('input, textarea, button');
  const submitButton = popupForm?.querySelector('.contact-popup__submit');
  const submitButtonText = submitButton?.querySelector('.btn__text');
  const startedAtField = popupForm?.querySelector('input[name="form_started_at"]');
  const siteFields = popupForm ? popupForm.querySelectorAll('input[name="site"], input[name="audit_site"]') : [];
  const defaultSubmitLabel = submitButtonText?.textContent || 'Отправить';
  const statusNode = popupForm ? document.createElement('p') : null;
  let lastTrigger = null;

  if (statusNode && popupForm) {
    statusNode.className = 'contact-popup__status';
    statusNode.hidden = true;
    statusNode.setAttribute('aria-live', 'polite');
    popupForm.append(statusNode);
  }

  const setStatus = (message, type = 'info') => {
    if (!statusNode) return;
    statusNode.hidden = !message;
    statusNode.textContent = message;
    statusNode.dataset.state = type;
  };

  const setLoadingState = (isLoading) => {
    if (submitButton) {
      submitButton.disabled = isLoading;
      submitButton.setAttribute('aria-busy', isLoading ? 'true' : 'false');
    }

    if (submitButtonText) {
      submitButtonText.textContent = isLoading ? 'Отправляем...' : defaultSubmitLabel;
    }
  };

  const refreshAntiSpamFields = () => {
    if (startedAtField) {
      startedAtField.value = String(Date.now());
    }
  };

  const normalizeSiteValue = (value) => {
    const trimmedValue = value.trim();
    if (!trimmedValue) return '';
    if (/^[a-z][a-z0-9+.-]*:\/\//i.test(trimmedValue)) {
      return trimmedValue;
    }
    return `https://${trimmedValue}`;
  };

  const normalizeSiteFields = () => {
    siteFields.forEach((field) => {
      field.value = normalizeSiteValue(field.value);
    });
  };

  const openPopup = (event) => {
    lastTrigger = event?.currentTarget ?? null;
    popup.classList.add('is-open');
    popup.setAttribute('aria-hidden', 'false');
    document.body.classList.add('contact-popup-open');
    setStatus('');
    refreshAntiSpamFields();

    requestAnimationFrame(() => {
      firstField?.focus();
    });
  };

  const closePopup = () => {
    if (!popup.classList.contains('is-open')) return;

    popup.classList.remove('is-open');
    popup.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('contact-popup-open');
    lastTrigger?.focus?.();
  };

  openButtons.forEach((button) => {
    button.addEventListener('click', openPopup);
  });

  closeButtons.forEach((button) => {
    button.addEventListener('click', closePopup);
  });

  popupForm?.addEventListener('submit', async (event) => {
    event.preventDefault();

    setStatus('');
    setLoadingState(true);
    normalizeSiteFields();

    try {
      if (window.location.protocol === 'file:') {
        throw new Error('На локальном файле отправка отключена. Проверьте форму на боевом хосте.');
      }

      const response = await fetch(popupForm.action || 'send.php', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
        },
        body: new FormData(popupForm),
      });

      let result = null;

      try {
        result = await response.json();
      } catch (parseError) {
        result = null;
      }

      if (!response.ok || !result?.ok) {
        throw new Error(result?.message || 'Не удалось отправить заявку.');
      }

      popupForm.reset();
      refreshAntiSpamFields();
      setStatus(result.message || 'Заявка отправлена.', 'success');

      window.setTimeout(() => {
        const redirectUrl = popupId === 'auditPopup'
          ? 'thank-you.html?source=audit'
          : 'thank-you.html?source=contact';

        window.location.href = redirectUrl;
      }, 500);
    } catch (error) {
      setStatus(error.message || 'Не удалось отправить заявку. Попробуйте ещё раз.', 'error');
    } finally {
      setLoadingState(false);
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && popup.classList.contains('is-open')) {
      closePopup();
    }
  });

  siteFields.forEach((field) => {
    field.addEventListener('blur', () => {
      field.value = normalizeSiteValue(field.value);
    });
  });

  refreshAntiSpamFields();
};

initContactStylePopup('contactPopup', '[data-open-contact-popup]');
initContactStylePopup('auditPopup', '[data-open-audit-popup]');
initContactStylePopup('detailPopup', '[data-open-detail-popup]');

const openClinicDemo = () => {
  const host = document.getElementById('clinic-widget-root');
  const root = host?.shadowRoot;
  const button =
    root?.querySelector('[data-clinic-launcher-open]') ||
    root?.querySelector('[data-clinic-launcher]');

  if (button instanceof HTMLElement) {
    button.click();
  }
};

window.openClinicDemo = openClinicDemo;

document.querySelectorAll('[data-open-clinic-demo]').forEach((button) => {
  button.addEventListener('click', openClinicDemo);
});
