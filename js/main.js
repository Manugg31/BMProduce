/* ==========================================================================
   Best Mex Produce - Main Application Logic
   ========================================================================== */

/* --------------------------------------------------------------------------
   Configuration
   -------------------------------------------------------------------------- */
const CONFIG = {
  // WhatsApp number: 52 (Mexico) + 1 (mobile) + 6673908663
  waNumber: "5216673908663",
  
  // Default WhatsApp messages by language
  waMessages: {
    es: "Hola, me interesa conocer disponibilidad y condiciones para programa. ¿Podemos platicar?",
    en: "Hi, I'm interested in availability and program terms. Can we connect?"
  }
};

/* --------------------------------------------------------------------------
   WhatsApp Links
   -------------------------------------------------------------------------- */
function setWhatsAppLinks(lang) {
  const msg = encodeURIComponent(CONFIG.waMessages[lang] || CONFIG.waMessages.es);
  const href = `https://wa.me/${CONFIG.waNumber}?text=${msg}`;
  
  const waElements = ["waFloat", "waNav", "waInline", "waFooter"];
  waElements.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.href = href;
  });
}

/* --------------------------------------------------------------------------
   Language Switching
   -------------------------------------------------------------------------- */
function applyLang(lang) {
  const dict = I18N[lang] || I18N.es;

  // Set document language
  document.documentElement.lang = lang;

  // Update title and meta tags
  document.title = dict.doc_title || document.title;
  
  const metaDesc = document.getElementById("meta-description");
  if (metaDesc && dict.meta_desc) {
    metaDesc.setAttribute("content", dict.meta_desc);
  }

  const ogTitle = document.getElementById("og-title");
  if (ogTitle && dict.og_title) {
    ogTitle.setAttribute("content", dict.og_title);
  }

  const ogDesc = document.getElementById("og-desc");
  if (ogDesc && dict.og_desc) {
    ogDesc.setAttribute("content", dict.og_desc);
  }

  // Update text content (plain text)
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

  // Update language button states
  document.querySelectorAll(".lang-btn").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.lang === lang);
  });

  // Update WhatsApp links
  setWhatsAppLinks(lang);

  // Persist language preference
  try {
    localStorage.setItem("bmp_lang", lang);
  } catch (e) {
    // localStorage not available, fail silently
  }
}

/* --------------------------------------------------------------------------
   Initialization
   -------------------------------------------------------------------------- */
function init() {
  // Determine initial language
  let lang = "es";
  try {
    const saved = localStorage.getItem("bmp_lang");
    if (saved && I18N[saved]) {
      lang = saved;
    }
  } catch (e) {
    // localStorage not available, use default
  }

  // Apply initial language
  applyLang(lang);

  // Set up language button listeners
  document.querySelectorAll(".lang-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      applyLang(btn.dataset.lang);
    });
  });
}

// Run on DOM ready
document.addEventListener("DOMContentLoaded", init);
