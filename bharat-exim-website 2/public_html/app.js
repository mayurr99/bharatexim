/**
 * Bharat Exim Traders — Core Interactive Application
 * Scroll Trigger Animations, Symmetrical Hero Slider, Form Builder & Mobile Navigation
 */

'use strict';

document.addEventListener('DOMContentLoaded', () => {
  // 1. Scroll Progress Indicator & Sticky Header & Back-to-Top
  const scrollProgress = document.getElementById('scroll-progress');
  const header = document.querySelector('header');
  const floatingBackToTop = document.getElementById('floating-back-to-top');

  const onScroll = () => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    
    // Progress bar width
    if (scrollProgress && scrollHeight > 0) {
      const progressPercent = (scrollTop / scrollHeight) * 100;
      scrollProgress.style.width = `${progressPercent}%`;
    }

    // Dynamic header shrink & glassmorphism
    if (header) {
      if (scrollTop > 30) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }

    // Floating Back-to-Top Button
    if (floatingBackToTop) {
      if (scrollTop > 350) {
        floatingBackToTop.classList.add('visible');
      } else {
        floatingBackToTop.classList.remove('visible');
      }
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // initial trigger

  if (floatingBackToTop) {
    floatingBackToTop.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // 2. IntersectionObserver Scroll Reveal Animations
  const revealElements = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealElements.length > 0) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          observer.unobserve(entry.target);
        }
      });
    }, {
      root: null,
      threshold: 0.1,
      rootMargin: '0px 0px -40px 0px'
    });

    revealElements.forEach(el => revealObserver.observe(el));
  } else {
    // Fallback for older browsers
    revealElements.forEach(el => el.classList.add('is-revealed'));
  }

  // 3. Desktop Sub-Menu & Mobile Navigation Drawer
  const menuToggle = document.querySelector('.menu-toggle');
  const menuCloseBtn = document.querySelector('.menu-close-btn');
  const mainNav = document.getElementById('main-nav');
  const subToggle = document.querySelector('.sub-toggle');
  const subMenu = document.getElementById('product-menu');
  const navGroup = document.querySelector('.nav-group');
  let subCloseTimer = null;

  const closeMobileNav = () => {
    if (mainNav && menuToggle) {
      mainNav.classList.remove('open');
      menuToggle.setAttribute('aria-expanded', 'false');
      menuToggle.setAttribute('aria-label', 'Open navigation menu');
      document.body.style.overflow = '';
    }
  };

  const openMobileNav = () => {
    if (mainNav && menuToggle) {
      mainNav.classList.add('open');
      menuToggle.setAttribute('aria-expanded', 'true');
      menuToggle.setAttribute('aria-label', 'Close navigation menu');
      document.body.style.overflow = 'hidden';
    }
  };

  if (menuToggle) {
    menuToggle.addEventListener('click', () => {
      const isOpen = mainNav.classList.contains('open');
      if (isOpen) {
        closeMobileNav();
      } else {
        openMobileNav();
      }
    });
  }

  if (menuCloseBtn) {
    menuCloseBtn.addEventListener('click', closeMobileNav);
  }

  // Close mobile drawer when clicking regular page links
  if (mainNav) {
    mainNav.querySelectorAll('.mobile-nav-links > a, .nav-cta a').forEach(link => {
      link.addEventListener('click', () => {
        if (window.matchMedia('(max-width: 900px)').matches) {
          closeMobileNav();
        }
      });
    });
  }

  const setSubmenuState = (open) => {
    if (!subMenu || !subToggle) return;
    clearTimeout(subCloseTimer);
    if (open) {
      subMenu.removeAttribute('hidden');
      subToggle.setAttribute('aria-expanded', 'true');
    } else {
      subMenu.setAttribute('hidden', '');
      subToggle.setAttribute('aria-expanded', 'false');
    }
  };

  if (navGroup && subToggle && subMenu) {
    // Pointer hover for desktop
    navGroup.addEventListener('pointerenter', () => {
      if (window.matchMedia('(min-width: 901px)').matches) {
        setSubmenuState(true);
      }
    });

    navGroup.addEventListener('pointerleave', () => {
      if (window.matchMedia('(min-width: 901px)').matches) {
        clearTimeout(subCloseTimer);
        subCloseTimer = setTimeout(() => {
          if (!navGroup.contains(document.activeElement)) {
            setSubmenuState(false);
          }
        }, 220);
      }
    });

    // Click toggle for mobile/keyboard
    subToggle.addEventListener('click', (e) => {
      e.preventDefault();
      const isExpanded = subToggle.getAttribute('aria-expanded') === 'true';
      setSubmenuState(!isExpanded);
    });

    // Keyboard support
    subToggle.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        e.preventDefault();
        setSubmenuState(true);
        const firstLink = subMenu.querySelector('a');
        if (firstLink) firstLink.focus();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        setSubmenuState(false);
        closeMobileNav();
      }
    });
  }

  // 4. Hero Carousel & Category Selector Tabs
  const heroTabs = document.querySelectorAll('.hero-tab-btn');
  const heroSlides = document.querySelectorAll('.hero-slide');
  let currentSlideIndex = 0;
  let heroAutoPlayTimer = null;

  const showHeroSlide = (index) => {
    if (heroTabs.length === 0 || heroSlides.length === 0) return;
    currentSlideIndex = index;

    heroTabs.forEach((tab, i) => {
      const isCurrent = i === index;
      tab.setAttribute('aria-selected', String(isCurrent));
      tab.tabIndex = isCurrent ? 0 : -1;
    });

    heroSlides.forEach((slide, i) => {
      const isCurrent = i === index;
      slide.classList.toggle('active', isCurrent);
      if (isCurrent) {
        slide.removeAttribute('hidden');
      } else {
        slide.setAttribute('hidden', '');
      }
    });
  };

  const startHeroAutoPlay = () => {
    stopHeroAutoPlay();
    heroAutoPlayTimer = setInterval(() => {
      const nextIndex = (currentSlideIndex + 1) % heroTabs.length;
      showHeroSlide(nextIndex);
    }, 5500);
  };

  const stopHeroAutoPlay = () => {
    if (heroAutoPlayTimer) {
      clearInterval(heroAutoPlayTimer);
      heroAutoPlayTimer = null;
    }
  };

  if (heroTabs.length > 0) {
    heroTabs.forEach((tab, index) => {
      tab.addEventListener('click', () => {
        showHeroSlide(index);
        stopHeroAutoPlay();
      });

      tab.addEventListener('keydown', (e) => {
        if (['ArrowRight', 'ArrowLeft'].includes(e.key)) {
          e.preventDefault();
          const next = e.key === 'ArrowRight' 
            ? (index + 1) % heroTabs.length 
            : (index - 1 + heroTabs.length) % heroTabs.length;
          showHeroSlide(next);
          heroTabs[next].focus();
        }
      });
    });

    const heroSection = document.querySelector('.home-hero');
    if (heroSection) {
      heroSection.addEventListener('mouseenter', stopHeroAutoPlay);
      heroSection.addEventListener('mouseleave', startHeroAutoPlay);
    }

    startHeroAutoPlay();
  }

  // 5. FAQ Interactive Search & Category Filter Pills
  const faqSearch = document.getElementById('faq-search');
  const faqFilterBtns = document.querySelectorAll('.faq-filter-btn');
  const faqItems = document.querySelectorAll('.faq-item');
  const faqCountEl = document.getElementById('faq-count');
  const faqEmptyEl = document.getElementById('faq-empty');

  if (faqItems.length > 0) {
    let currentFilter = 'all';

    const filterFAQs = () => {
      const searchTerm = faqSearch ? faqSearch.value.trim().toLowerCase() : '';
      let visibleCount = 0;

      faqItems.forEach(item => {
        const itemCategory = (item.getAttribute('data-category') || '').toLowerCase();
        const itemText = item.textContent.toLowerCase();

        const matchesCategory = currentFilter === 'all' || itemCategory === currentFilter;
        const matchesSearch = !searchTerm || itemText.includes(searchTerm);

        if (matchesCategory && matchesSearch) {
          item.removeAttribute('hidden');
          visibleCount++;
        } else {
          item.setAttribute('hidden', '');
        }
      });

      if (faqCountEl) {
        faqCountEl.textContent = `${visibleCount} question${visibleCount === 1 ? '' : 's'}`;
      }
      if (faqEmptyEl) {
        faqEmptyEl.hidden = visibleCount > 0;
      }
    };

    if (faqSearch) {
      faqSearch.addEventListener('input', filterFAQs);
    }

    faqFilterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        faqFilterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = (btn.getAttribute('data-filter') || 'all').toLowerCase();
        filterFAQs();
      });
    });
  }

  // 6. Contact Form Validation, Mailto Generation & One-Click Copy
  const enquiryForm = document.getElementById('enquiry');
  if (enquiryForm) {
    // Pre-select category from URL query parameters
    const urlParams = new URLSearchParams(window.location.search);
    const categoryParam = urlParams.get('category');
    const topicParam = urlParams.get('topic');

    if (categoryParam && enquiryForm.elements.category) {
      enquiryForm.elements.category.value = categoryParam;
    } else if (topicParam === 'documentation' && enquiryForm.elements.category) {
      enquiryForm.elements.category.value = 'documentation';
    }

    const draftPanel = document.getElementById('draft-panel');
    const draftTextarea = document.getElementById('enquiry-draft');
    const sendEmailBtn = document.getElementById('send-email');
    const copyEnquiryBtn = document.getElementById('copy-enquiry');
    const formStatus = document.getElementById('form-status');
    const copyStatus = document.getElementById('copy-status');

    const updateEmailLink = () => {
      if (!sendEmailBtn || !draftTextarea) return;
      const categoryName = enquiryForm.elements.category 
        ? enquiryForm.elements.category.selectedOptions[0]?.textContent || 'Trade Enquiry'
        : 'Trade Enquiry';
      const subject = encodeURIComponent(`Trade Enquiry — ${categoryName}`);
      const body = encodeURIComponent(draftTextarea.value);
      sendEmailBtn.href = `mailto:bharateximtraders@gmail.com?subject=${subject}&body=${body}`;
    };

    if (draftTextarea) {
      draftTextarea.addEventListener('input', updateEmailLink);
    }

    enquiryForm.addEventListener('submit', (e) => {
      // Forms marked data-api are handled by contact-form.js
      if (enquiryForm.dataset.api === 'true') return;
      e.preventDefault();

      let hasError = false;
      const requiredInputs = enquiryForm.querySelectorAll('[required]');

      requiredInputs.forEach(input => {
        const errorEl = input.parentElement.querySelector('.field-error');
        if (errorEl) errorEl.remove();
        input.removeAttribute('aria-invalid');

        if (!input.value.trim()) {
          hasError = true;
          input.setAttribute('aria-invalid', 'true');
          const errorMsg = document.createElement('span');
          errorMsg.className = 'field-error';
          errorMsg.textContent = input.tagName === 'SELECT' ? 'Please choose an option.' : 'This field is required.';
          input.parentElement.appendChild(errorMsg);
        }
      });

      if (hasError) {
        if (formStatus) formStatus.textContent = 'Please check the required fields highlighted above.';
        return;
      }

      const formData = new FormData(enquiryForm);
      const categoryLabel = enquiryForm.elements.category.selectedOptions[0]?.textContent || 'General';

      const formattedDraft = 
`Dear Bharat Exim Traders,

I would like to initiate an enquiry regarding Indian export sourcing.

Contact Details:
- Name: ${formData.get('name') || ''}
- Company: ${formData.get('company') || 'N/A'}
- Email: ${formData.get('email') || ''}
- Phone: ${formData.get('phone') || 'N/A'}
- Destination Country: ${formData.get('destination') || 'Worldwide'}
- Product Category: ${categoryLabel}

Sourcing Specifications & Requirements:
${formData.get('message') || ''}

Looking forward to your quotation and documentation details.

Best regards,
${formData.get('name') || ''}`;

      if (draftTextarea) {
        draftTextarea.value = formattedDraft;
      }

      updateEmailLink();

      if (draftPanel) {
        draftPanel.removeAttribute('hidden');
        draftPanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }

      if (formStatus) {
        formStatus.textContent = 'Your enquiry draft is generated below. Click "Open Email App" or "Copy Enquiry" to send.';
      }
    });

    if (copyEnquiryBtn && draftTextarea) {
      copyEnquiryBtn.addEventListener('click', async () => {
        try {
          await navigator.clipboard.writeText(draftTextarea.value);
          if (copyStatus) {
            copyStatus.innerHTML = '<span style="color: #10b981; font-weight: 700;">✓ Enquiry copied to clipboard! Paste it into your email.</span>';
          }
        } catch (err) {
          draftTextarea.focus();
          draftTextarea.select();
          if (copyStatus) {
            copyStatus.textContent = 'Please press Ctrl+C / Cmd+C to copy your draft.';
          }
        }
      });
    }
  }

  // 7. Lazy image load — add 'loaded' class for smooth fade-in
  document.querySelectorAll('img[loading="lazy"]').forEach(img => {
    if (img.complete) {
      img.classList.add('loaded');
    } else {
      img.addEventListener('load', () => img.classList.add('loaded'));
      img.addEventListener('error', () => img.classList.add('loaded'));
    }
  });

  // 8. Active anchor link highlight in product sub-pages
  const anchorLinks = document.querySelectorAll('.anchor-links a');
  if (anchorLinks.length > 0) {
    const sections = Array.from(anchorLinks).map(a => document.querySelector(a.getAttribute('href')));
    const anchorObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          anchorLinks.forEach(a => {
            a.style.color = a.getAttribute('href') === '#' + entry.target.id
              ? 'var(--navy-900)' : '';
            a.style.fontWeight = a.getAttribute('href') === '#' + entry.target.id ? '700' : '';
          });
        }
      });
    }, { rootMargin: '-30% 0px -60% 0px', threshold: 0 });
    sections.forEach(s => s && anchorObserver.observe(s));
  }
});

/* Mobile drawer: Escape closes, focus returns to the toggle */
document.addEventListener('DOMContentLoaded', () => {
  const nav = document.getElementById('main-nav');
  const toggle = document.querySelector('.menu-toggle');
  if (!nav || !toggle) return;
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && nav.classList.contains('open')) {
      nav.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Open navigation menu');
      document.body.style.overflow = '';
      toggle.focus();
    }
  });
});
