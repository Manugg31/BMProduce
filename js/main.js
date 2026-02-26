/* ==========================================================================
   Best Mex Produce - Main Application Logic
   Version: 2.0 - Performance Optimized
   ========================================================================== */

/* --------------------------------------------------------------------------
   Configuration
   -------------------------------------------------------------------------- */
const CONFIG = Object.freeze({
  // WhatsApp number: 52 (Mexico) + 1 (mobile) + 6673908663
  waNumber: "5216673908663",
  
  // Default WhatsApp messages by language
  waMessages: Object.freeze({
    es: "Hola, me interesa conocer disponibilidad y condiciones para programa. ¿Podemos platicar?",
    en: "Hi, I'm interested in availability and program terms. Can we connect?"
  }),
  
  // Storage key for language preference
  langStorageKey: "bmp_lang",
  
  // Default language
  defaultLang: "es"
});

/* --------------------------------------------------------------------------
   Utility Functions
   -------------------------------------------------------------------------- */

/**
 * Safely get item from localStorage
 */
function getStorageItem(key) {
  try {
    return localStorage.getItem(key);
  } catch (e) {
    return null;
  }
}

/**
 * Safely set item in localStorage
 */
function setStorageItem(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch (e) {
    // localStorage not available, fail silently
  }
}

/**
 * Debounce function for performance
 */
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/* --------------------------------------------------------------------------
   WhatsApp Links
   -------------------------------------------------------------------------- */
function setWhatsAppLinks(lang) {
  const msg = encodeURIComponent(CONFIG.waMessages[lang] || CONFIG.waMessages.es);
  const href = `https://wa.me/${CONFIG.waNumber}?text=${msg}`;
  
  const waElements = ["waFloat", "waNav", "waInline", "waFooter"];
  waElements.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.href = href;
    }
  });
}

/* --------------------------------------------------------------------------
   Language Switching
   -------------------------------------------------------------------------- */
function applyLang(lang) {
  // Validate language exists
  if (!I18N[lang]) {
    lang = CONFIG.defaultLang;
  }
  
  const dict = I18N[lang];

  // Set document language
  document.documentElement.lang = lang;

  // Update title and meta tags
  if (dict.doc_title) {
    document.title = dict.doc_title;
  }
  
  // Update meta tags
  const metaUpdates = [
    { id: "meta-description", attr: "content", key: "meta_desc" },
    { id: "og-title", attr: "content", key: "og_title" },
    { id: "og-desc", attr: "content", key: "og_desc" }
  ];
  
  metaUpdates.forEach(({ id, attr, key }) => {
    const el = document.getElementById(id);
    if (el && dict[key]) {
      el.setAttribute(attr, dict[key]);
    }
  });

  // Update text content (plain text) - using requestAnimationFrame for performance
  requestAnimationFrame(() => {
    document.querySelectorAll("[data-i18n]").forEach(el => {
      const key = el.getAttribute("data-i18n");
      if (dict[key] != null) {
        el.textContent = dict[key];
      }
    });

    // Update HTML content (allows <br>, <strong>, etc.)
    document.querySelectorAll("[data-i18n-html]").forEach(el => {
      const key = el.getAttribute("data-i18n-html");
      if (dict[key] != null) {
        el.innerHTML = dict[key];
      }
    });

    // Update placeholders
    document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
      const key = el.getAttribute("data-i18n-placeholder");
      if (dict[key] != null) {
        el.setAttribute("placeholder", dict[key]);
      }
    });
  });

  // Update language button states
  document.querySelectorAll(".lang-btn").forEach(btn => {
    const isActive = btn.dataset.lang === lang;
    btn.classList.toggle("active", isActive);
    btn.setAttribute("aria-pressed", isActive);
  });

  // Update WhatsApp links
  setWhatsAppLinks(lang);

  // Persist language preference
  setStorageItem(CONFIG.langStorageKey, lang);
}

/* --------------------------------------------------------------------------
   Smooth Scroll Enhancement (for older browsers)
   -------------------------------------------------------------------------- */
function initSmoothScroll() {
  // Only add if native smooth scroll is not supported
  if (!('scrollBehavior' in document.documentElement.style)) {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        const target = document.querySelector(targetId);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }
}

/* --------------------------------------------------------------------------
   Navbar Scroll Effect
   -------------------------------------------------------------------------- */
function initNavbarScroll() {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;
  
  const handleScroll = debounce(() => {
    if (window.scrollY > 50) {
      navbar.classList.add('navbar-scrolled');
    } else {
      navbar.classList.remove('navbar-scrolled');
    }
  }, 10);
  
  window.addEventListener('scroll', handleScroll, { passive: true });
}

/* --------------------------------------------------------------------------
   Form Enhancement
   -------------------------------------------------------------------------- */
function initFormEnhancements() {
  const form = document.getElementById('contactForm');
  if (!form) return;
  
  form.addEventListener('submit', function(e) {
    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Enviando...';
      
      // Re-enable after 5 seconds in case of error
      setTimeout(() => {
        submitBtn.disabled = false;
        submitBtn.textContent = submitBtn.getAttribute('data-i18n') === 'form_submit' ? 'Enviar' : 'Send';
      }, 5000);
    }
  });
}

/* --------------------------------------------------------------------------
   Lazy Loading Enhancement
   -------------------------------------------------------------------------- */
function initLazyLoading() {
  // Native lazy loading is already set via HTML attributes
  // This adds Intersection Observer for additional optimizations
  
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
          }
          observer.unobserve(img);
        }
      });
    }, {
      rootMargin: '50px 0px',
      threshold: 0.01
    });
    
    document.querySelectorAll('img[data-src]').forEach(img => {
      imageObserver.observe(img);
    });
  }
}

/* --------------------------------------------------------------------------
   Availability Calendar Filters
   -------------------------------------------------------------------------- */
function initAvailabilityCalendar() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const calRows = document.querySelectorAll('.cal-row[data-product]');
  
  if (filterBtns.length === 0) return;
  
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.dataset.filter;
      
      // Update active button
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      // Show/hide rows
      calRows.forEach(row => {
        const product = row.dataset.product;
        if (filter === 'all' || product === filter) {
          row.classList.remove('hidden');
        } else {
          row.classList.add('hidden');
        }
      });
    });
  });
}

/* --------------------------------------------------------------------------
   Accessibility Enhancements
   -------------------------------------------------------------------------- */
function initAccessibility() {
  // Skip link for keyboard users
  const skipLink = document.querySelector('.skip-link');
  if (skipLink) {
    skipLink.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.querySelector(skipLink.getAttribute('href'));
      if (target) {
        target.tabIndex = -1;
        target.focus();
      }
    });
  }
  
  // Reduce motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (prefersReducedMotion.matches) {
    document.documentElement.classList.add('reduce-motion');
  }
}

/* --------------------------------------------------------------------------
   Performance Monitoring (optional)
   -------------------------------------------------------------------------- */
function logPerformance() {
  if ('performance' in window && process?.env?.NODE_ENV === 'development') {
    window.addEventListener('load', () => {
      setTimeout(() => {
        const perfData = performance.getEntriesByType('navigation')[0];
        console.log('Page Load Time:', perfData.loadEventEnd - perfData.startTime, 'ms');
      }, 0);
    });
  }
}

/* --------------------------------------------------------------------------
   Initialization
   -------------------------------------------------------------------------- */
function init() {
  // Determine initial language
  let lang = CONFIG.defaultLang;
  const saved = getStorageItem(CONFIG.langStorageKey);
  if (saved && I18N[saved]) {
    lang = saved;
  }

  // Apply initial language
  applyLang(lang);

  // Set up language button listeners
  document.querySelectorAll(".lang-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      applyLang(btn.dataset.lang);
    });
  });
  
  // Initialize enhancements
  initSmoothScroll();
  initNavbarScroll();
  initFormEnhancements();
  initLazyLoading();
  initAccessibility();
  initAvailabilityCalendar();
}

// Run on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
