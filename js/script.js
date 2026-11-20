
/* ==========================================================================
   SCRIPT.JS — Portfolio (version consolidée, sans dépendance externe)

   SOMMAIRE
    1. Apparence : thèmes et couleurs (bouton 🎨 + bouton ☀️/🌙)
    2. Menu hamburger
    3. Scroll fluide
    4. Scroll : progression, navbar compacte, onglet actif, retour en haut
    5. Apparition des éléments au scroll
    6. Formulaire de contact
    7. Animations : texte tapé, réseau animé, cartes interactives, badges
    8. Footer
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  const root = document.documentElement;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const canHover = window.matchMedia('(hover: hover)').matches;
  const navbarEl = document.getElementById('navbar');

  /* Stockage sécurisé : ne plante pas si localStorage est bloqué */
  const store = {
    get(key) { try { return localStorage.getItem(key); } catch (e) { return null; } },
    set(key, value) { try { localStorage.setItem(key, value); } catch (e) { /* ignoré */ } }
  };


  /* ======================================================================
     1. APPARENCE : THÈMES ET COULEURS
     - Thème = fond du site (Nuit, Noir, Graphite, Clair, Crème)
     - Palette = couleurs d'accent (Indigo, Émeraude, Ambre, Rose, Océan, Rouge)
     Pour ajouter un thème ou une palette : ajoute une ligne ci-dessous
     ET le bloc de variables correspondant dans style.css.
     ====================================================================== */
  const THEMES = {
    night:    { label: 'Nuit',     mode: 'dark',  bg: '#080c18', card: '#111a30' },
    black:    { label: 'Noir',     mode: 'dark',  bg: '#000000', card: '#0f0f13' },
    graphite: { label: 'Graphite', mode: 'dark',  bg: '#131417', card: '#1f2126' },
    light:    { label: 'Clair',    mode: 'light', bg: '#f4f6fd', card: '#ffffff' },
    cream:    { label: 'Crème',    mode: 'light', bg: '#faf6ee', card: '#fffdf8' }
  };

  const PALETTES = {
    indigo:  { label: 'Indigo',   a: '#8b9cff', b: '#22d3ee' },
    emerald: { label: 'Émeraude', a: '#4ade80', b: '#2dd4bf' },
    amber:   { label: 'Ambre',    a: '#fbbf24', b: '#fb923c' },
    rose:    { label: 'Rose',     a: '#f472b6', b: '#a78bfa' },
    ocean:   { label: 'Océan',    a: '#38bdf8', b: '#34d399' },
    red:     { label: 'Rouge',    a: '#f87171', b: '#fbbf24' }
  };

  const DEFAULT_PALETTE = 'indigo';

  const systemTheme = () =>
    window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'night';

  const readTheme = (value) => {
    if (value === 'dark') return 'night';          // ancien format
    return THEMES[value] ? value : null;
  };

  let theme = readTheme(store.get('portfolio-theme')) || systemTheme();
  let palette = PALETTES[store.get('portfolio-palette')] ? store.get('portfolio-palette') : DEFAULT_PALETTE;
  let lastDark = readTheme(store.get('portfolio-last-dark'));
  let lastLight = readTheme(store.get('portfolio-last-light'));
  if (!lastDark || THEMES[lastDark].mode !== 'dark') lastDark = 'night';
  if (!lastLight || THEMES[lastLight].mode !== 'light') lastLight = 'light';

  const picker = { wrap: null, toggle: null, panel: null, paletteName: null };
  let transitionTimer;

  /* Ajoute brièvement une classe pour adoucir le changement de couleurs */
  function softTransition() {
    if (reduceMotion) return;
    root.classList.add('theme-transition');
    clearTimeout(transitionTimer);
    transitionTimer = setTimeout(() => root.classList.remove('theme-transition'), 450);
  }

  function applyTheme(name, animate = true) {
    if (!THEMES[name]) return;
    if (animate) softTransition();
    theme = name;
    root.setAttribute('data-theme', name);
    root.setAttribute('data-mode', THEMES[name].mode);
    store.set('portfolio-theme', name);
    if (THEMES[name].mode === 'dark') { lastDark = name; store.set('portfolio-last-dark', name); }
    else { lastLight = name; store.set('portfolio-last-light', name); }
    syncPicker();
    window.dispatchEvent(new Event('themechange'));
  }

  function applyPalette(name, animate = true) {
    if (!PALETTES[name]) return;
    if (animate) softTransition();
    palette = name;
    root.setAttribute('data-palette', name);
    store.set('portfolio-palette', name);
    syncPicker();
    window.dispatchEvent(new Event('themechange'));
  }

  /* Met à jour l'état visuel des boutons du panneau */
  function syncPicker() {
    if (!picker.panel) return;
    picker.panel.querySelectorAll('.theme-option').forEach((btn) => {
      btn.setAttribute('aria-pressed', String(btn.dataset.theme === theme));
    });
    picker.panel.querySelectorAll('.palette-option').forEach((btn) => {
      btn.setAttribute('aria-pressed', String(btn.dataset.palette === palette));
    });
    if (picker.paletteName) picker.paletteName.textContent = '· ' + PALETTES[palette].label;
  }

  function openPanel() {
    picker.panel.classList.add('open');
    picker.toggle.setAttribute('aria-expanded', 'true');
  }

  function closePanel(returnFocus = false) {
    if (!picker.panel || !picker.panel.classList.contains('open')) return;
    picker.panel.classList.remove('open');
    picker.toggle.setAttribute('aria-expanded', 'false');
    if (returnFocus) picker.toggle.focus();
  }

  /* Construit le bouton 🎨 et son panneau dans la barre de navigation */
  function buildPicker() {
    const actions = document.querySelector('.nav-actions');
    if (!actions) return;

    const wrap = document.createElement('div');
    wrap.className = 'theme-picker';
    wrap.innerHTML = `
      <button type="button" id="palette-toggle" class="theme-toggle"
              aria-label="Personnaliser le thème et les couleurs"
              aria-haspopup="true" aria-expanded="false" aria-controls="theme-panel">
        <span aria-hidden="true">🎨</span>
      </button>
      <div class="theme-panel" id="theme-panel" role="group" aria-label="Apparence du site">
        <div class="panel-section">
          <p class="panel-title">Thème</p>
          <div class="theme-options"></div>
        </div>
        <div class="panel-section">
          <p class="panel-title">Couleurs <span class="panel-current" id="palette-name"></span></p>
          <div class="palette-options"></div>
        </div>
        <button type="button" class="panel-reset">Réinitialiser</button>
      </div>`;

    const modeToggle = document.getElementById('theme-toggle');
    actions.insertBefore(wrap, modeToggle && modeToggle.parentNode === actions ? modeToggle : null);

    picker.wrap = wrap;
    picker.toggle = wrap.querySelector('#palette-toggle');
    picker.panel = wrap.querySelector('#theme-panel');
    picker.paletteName = wrap.querySelector('#palette-name');

    const themeBox = wrap.querySelector('.theme-options');
    Object.entries(THEMES).forEach(([key, t]) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'theme-option';
      btn.dataset.theme = key;
      btn.setAttribute('aria-pressed', 'false');
      btn.innerHTML = `<span class="theme-preview"></span><span>${t.label}</span>`;
      const preview = btn.querySelector('.theme-preview');
      preview.style.setProperty('--sw-bg', t.bg);
      preview.style.setProperty('--sw-card', t.card);
      themeBox.appendChild(btn);
    });

    const paletteBox = wrap.querySelector('.palette-options');
    Object.entries(PALETTES).forEach(([key, p]) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'palette-option';
      btn.dataset.palette = key;
      btn.title = p.label;
      btn.setAttribute('aria-label', 'Couleurs ' + p.label);
      btn.setAttribute('aria-pressed', 'false');
      btn.style.setProperty('--sw-a', p.a);
      btn.style.setProperty('--sw-b', p.b);
      paletteBox.appendChild(btn);
    });

    wrap.addEventListener('click', (e) => {
      if (e.target.closest('#palette-toggle')) {
        picker.panel.classList.contains('open') ? closePanel() : openPanel();
        return;
      }
      const themeBtn = e.target.closest('.theme-option');
      if (themeBtn) { applyTheme(themeBtn.dataset.theme); return; }
      const paletteBtn = e.target.closest('.palette-option');
      if (paletteBtn) { applyPalette(paletteBtn.dataset.palette); return; }
      if (e.target.closest('.panel-reset')) {
        applyTheme(systemTheme());
        applyPalette(DEFAULT_PALETTE);
      }
    });

    /* Fermeture : clic à l'extérieur ou touche Échap */
    document.addEventListener('click', (e) => { if (!wrap.contains(e.target)) closePanel(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closePanel(true); });
  }

  buildPicker();
  applyTheme(theme, false);
  applyPalette(palette, false);

  /* Bouton ☀️/🌙 : bascule rapide entre le dernier thème sombre et le dernier thème clair */
  const modeToggle = document.getElementById('theme-toggle');
  if (modeToggle) {
    modeToggle.addEventListener('click', () => {
      applyTheme(THEMES[theme].mode === 'dark' ? lastLight : lastDark);
    });
  }


  /* ======================================================================
     2. MENU HAMBURGER
     ====================================================================== */
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('nav-links');

  function closeMenu() {
    if (!navLinks || !hamburger) return;
    navLinks.classList.remove('open');
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
  }

  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('open');
      hamburger.classList.toggle('open', isOpen);
      hamburger.setAttribute('aria-expanded', String(isOpen));
      closePanel();
    });
    navLinks.querySelectorAll('.nav-link').forEach((link) => link.addEventListener('click', closeMenu));
  }


  /* ======================================================================
     3. SCROLL FLUIDE (avec décalage pour la navbar fixe)
     ====================================================================== */
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId.length <= 1) return;
      const target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();
      const offset = navbarEl ? navbarEl.offsetHeight : 0;
      const top = target.getBoundingClientRect().top + window.scrollY - offset - 10;
      window.scrollTo({ top, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  });


  /* ======================================================================
     4. SCROLL : progression, navbar compacte, onglet actif, retour en haut
     ====================================================================== */
  const progressBar = document.getElementById('scroll-progress');
  const backToTop = document.getElementById('back-to-top');
  const sections = document.querySelectorAll('main section[id]');
  const navLinkEls = document.querySelectorAll('.nav-link');
  let ticking = false;

  function updateOnScroll() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;

    if (progressBar && docHeight > 0) progressBar.style.width = `${(scrollTop / docHeight) * 100}%`;
    if (navbarEl) navbarEl.classList.toggle('scrolled', scrollTop > 30);
    if (backToTop) backToTop.style.display = scrollTop > 400 ? 'flex' : 'none';

    const position = scrollTop + (navbarEl ? navbarEl.offsetHeight : 0) + 40;
    let currentId = '';
    sections.forEach((section) => { if (position >= section.offsetTop) currentId = section.id; });
    navLinkEls.forEach((link) => link.classList.toggle('active', link.getAttribute('href') === `#${currentId}`));

    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) { ticking = true; requestAnimationFrame(updateOnScroll); }
  }, { passive: true });
  updateOnScroll();

  if (backToTop) {
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  }


  /* ======================================================================
     5. APPARITION DES ÉLÉMENTS AU SCROLL (effet cascade)
     ====================================================================== */
  const revealItems = document.querySelectorAll('.fade-in-up, .fade-in-left, .fade-in-right, .section-title');

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;

        const siblings = [...el.parentElement.children].filter((c) => c.classList.contains('fade-in-up'));
        const delay = Math.min(Math.max(0, siblings.indexOf(el)), 5) * 100;

        el.style.transitionDelay = `${delay}ms`;
        el.classList.add('visible');
        setTimeout(() => { el.style.transitionDelay = ''; }, 900 + delay);   // ne ralentit pas le survol

        obs.unobserve(el);
      });
    }, { threshold: 0.15 });

    revealItems.forEach((item) => observer.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add('visible'));
  }


  /* ======================================================================
     6. FORMULAIRE DE CONTACT (validation côté navigateur uniquement)
     ====================================================================== */
  const contactForm = document.getElementById('contact-form');
  const formNote = document.getElementById('form-note');

  const fieldRules = {
    name:    { minLength: 2,  message: 'Merci de renseigner votre nom (2 caractères minimum).' },
    email:   { type: 'email', message: 'Merci de renseigner une adresse email valide.' },
    subject: { minLength: 2,  message: 'Merci de renseigner un sujet.' },
    message: { minLength: 10, message: 'Votre message doit contenir au moins 10 caractères.' }
  };

  const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  function validateField(field) {
    const rule = fieldRules[field.name];
    const errorEl = document.getElementById(`error-${field.name}`);
    const group = field.closest('.form-group');
    const value = field.value.trim();
    let message = '';

    if (field.hasAttribute('required') && value === '') message = 'Ce champ est obligatoire.';
    else if (rule && rule.minLength && value.length < rule.minLength) message = rule.message;
    else if (rule && rule.type === 'email' && !isValidEmail(value)) message = rule.message;

    if (group) group.classList.toggle('invalid', message !== '');
    if (errorEl) errorEl.textContent = message;
    return message === '';
  }

  if (contactForm && formNote) {
    contactForm.querySelectorAll('input, textarea').forEach((field) => {
      field.addEventListener('blur', () => validateField(field));
      field.addEventListener('input', () => {
        if (field.closest('.form-group').classList.contains('invalid')) validateField(field);
      });
    });

    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      let allValid = true;
      contactForm.querySelectorAll('input[required], textarea[required]').forEach((field) => {
        if (!validateField(field)) allValid = false;
      });

      if (!allValid) {
        formNote.textContent = 'Merci de corriger les champs indiqués ci-dessus.';
        formNote.className = 'form-note error';
        return;
      }

      /* Aucun backend n'est connecté : on le dit honnêtement au visiteur.
         Pour un envoi réel, relie le formulaire à Formspree, EmailJS ou ta propre API. */
      formNote.textContent =
        "Ce formulaire est prêt visuellement, mais aucun service d'envoi n'est encore connecté. " +
        "Reliez-le à un backend (ex : Formspree, EmailJS ou votre propre API) pour un envoi réel.";
      formNote.className = 'form-note info';
    });
  }


  /* ======================================================================
     7. ANIMATIONS
     ====================================================================== */

  /* ---------- A. Effet machine à écrire (modifie la liste de mots) ---------- */
  const typingEl = document.getElementById('typing-text');

  if (typingEl && !reduceMotion) {
    const words = ['Administration systèmes', 'Réseaux', 'Cybersécurité', 'Virtualisation'];
    let wordIndex = 0;
    let charIndex = 0;
    let deleting = false;

    const typeLoop = () => {
      const word = words[wordIndex];
      typingEl.textContent = word.slice(0, charIndex);
      let delay = deleting ? 40 : 80;

      if (!deleting && charIndex === word.length) {
        delay = 1600;                       // pause quand le mot est complet
        deleting = true;
      } else if (deleting && charIndex === 0) {
        deleting = false;
        wordIndex = (wordIndex + 1) % words.length;
        delay = 400;                        // pause avant le mot suivant
      } else {
        charIndex += deleting ? -1 : 1;
      }
      setTimeout(typeLoop, delay);
    };
    typeLoop();
  }

  /* ---------- B. Réseau animé dans le hero (suit la couleur choisie) ---------- */
  const canvas = document.getElementById('network-canvas');
  const ctx = canvas && canvas.getContext ? canvas.getContext('2d') : null;

  if (canvas && ctx && !reduceMotion) {
    const hero = canvas.parentElement;
    const MAX_DIST = 140;                   // distance max pour relier deux nœuds
    let width = 0, height = 0, nodes = [], rafId = null, accent = '139, 156, 255';

    const readAccent = () => {
      accent = getComputedStyle(root).getPropertyValue('--accent-rgb').trim() || accent;
    };

    function resizeCanvas() {
      const dpr = window.devicePixelRatio || 1;
      width = hero.clientWidth;
      height = hero.clientHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = Math.min(70, Math.floor((width * height) / 18000));   // moins de nœuds sur petit écran
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35
      }));
    }

    function drawNetwork() {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > width) n.vx *= -1;
        if (n.y < 0 || n.y > height) n.vy *= -1;

        ctx.beginPath();
        ctx.arc(n.x, n.y, 1.8, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${accent}, 0.7)`;
        ctx.fill();

        for (let j = i + 1; j < nodes.length; j++) {
          const m = nodes[j];
          const dist = Math.hypot(n.x - m.x, n.y - m.y);
          if (dist < MAX_DIST) {
            ctx.strokeStyle = `rgba(${accent}, ${0.25 * (1 - dist / MAX_DIST)})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(n.x, n.y);
            ctx.lineTo(m.x, m.y);
            ctx.stroke();
          }
        }
      }
      rafId = requestAnimationFrame(drawNetwork);
    }

    readAccent();
    resizeCanvas();
    window.addEventListener('themechange', readAccent);

    /* Pause quand le hero n'est plus visible (économise la batterie) */
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) { if (!rafId) drawNetwork(); }
        else { cancelAnimationFrame(rafId); rafId = null; }
      }).observe(hero);
    } else {
      drawNetwork();
    }

    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resizeCanvas, 200);
    });
  }

  /* ---------- C. Cartes : halo qui suit la souris + légère inclinaison 3D ---------- */
  document.querySelectorAll('.project-card, .skill-card, .cert-card').forEach((card) => {
    card.classList.add('fx-card');
    if (reduceMotion || !canHover) return;     // pas d'effet sur écran tactile

    card.addEventListener('mouseenter', () => card.classList.add('tilt-active'));

    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;

      card.style.setProperty('--mx', `${x * 100}%`);
      card.style.setProperty('--my', `${y * 100}%`);
      // 6 = angle maximal en degrés (réduis pour un effet plus discret)
      card.style.transform =
        `perspective(900px) rotateX(${(0.5 - y) * 6}deg) rotateY(${(x - 0.5) * 6}deg) translateY(-4px)`;
    });

    card.addEventListener('mouseleave', () => { card.style.transform = ''; });
  });

  /* ---------- D. Badges de compétences en cascade ---------- */
  document.querySelectorAll('.skill-card').forEach((card) => {
    card.querySelectorAll('.badge').forEach((badge, i) => badge.style.setProperty('--d', `${300 + i * 60}ms`));
  });


  /* ======================================================================
     8. FOOTER : année automatique
     ====================================================================== */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

});