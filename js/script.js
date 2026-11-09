/* ==========================================================================
   SCRIPT.JS — Portfolio
   Aucune dépendance externe. Code commenté pour faciliter les modifications.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  /* ------------------------------------------------------------------ */
  /* 1. MENU HAMBURGER MOBILE                                            */
  /* ------------------------------------------------------------------ */
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('nav-links');

  function closeMenu() {
    navLinks.classList.remove('open');
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
  }

  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('open');
      hamburger.classList.toggle('open', isOpen);
      hamburger.setAttribute('aria-expanded', String(isOpen));
    });

    // Ferme le menu quand on clique sur un lien (mobile)
    navLinks.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', closeMenu);
    });
  }

  /* ------------------------------------------------------------------ */
  /* 2. SCROLL FLUIDE                                                    */
  /* ------------------------------------------------------------------ */
  // Géré nativement par `scroll-behavior: smooth` en CSS.
  // Ce bloc ajoute uniquement un décalage pour tenir compte de la navbar fixe.
  const navbarEl = document.getElementById('navbar');

  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId.length <= 1) return; // ignore "#"
      const target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();
      const navbarHeight = navbarEl ? navbarEl.offsetHeight : 0;
      const targetPosition = target.getBoundingClientRect().top + window.scrollY - navbarHeight + 1;

      window.scrollTo({ top: targetPosition, behavior: 'smooth' });
    });
  });

  /* ------------------------------------------------------------------ */
  /* 3. DARK MODE / LIGHT MODE (+ localStorage)                          */
  /* ------------------------------------------------------------------ */
  const themeToggle = document.getElementById('theme-toggle');
  const root = document.documentElement;
  const THEME_KEY = 'portfolio-theme';

  function applyTheme(theme) {
    if (theme === 'light') {
      root.setAttribute('data-theme', 'light');
    } else {
      root.removeAttribute('data-theme'); // le sombre est la valeur par défaut
    }
  }

  // 9. Conservation du thème choisi avec localStorage
  const savedTheme = localStorage.getItem(THEME_KEY);
  if (savedTheme) {
    applyTheme(savedTheme);
  } else {
    // Respecte la préférence système si aucun choix n'a été enregistré
    const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
    applyTheme(prefersLight ? 'light' : 'dark');
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const isLight = root.getAttribute('data-theme') === 'light';
      const newTheme = isLight ? 'dark' : 'light';
      applyTheme(newTheme);
      localStorage.setItem(THEME_KEY, newTheme);
    });
  }

  /* ------------------------------------------------------------------ */
  /* 4. DÉTECTION DE LA SECTION ACTIVE DANS LA NAVBAR                    */
  /* ------------------------------------------------------------------ */
  const sections = document.querySelectorAll('main section[id]');
  const navLinkEls = document.querySelectorAll('.nav-link');

  function setActiveLink() {
    let currentId = '';
    const scrollPos = window.scrollY + (navbarEl ? navbarEl.offsetHeight : 0) + 40;

    sections.forEach(section => {
      if (scrollPos >= section.offsetTop) {
        currentId = section.id;
      }
    });

    navLinkEls.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === `#${currentId}`);
    });
  }

  window.addEventListener('scroll', setActiveLink, { passive: true });
  setActiveLink();

  /* ------------------------------------------------------------------ */
  /* 5. ANIMATIONS AU SCROLL (IntersectionObserver)                      */
  /* ------------------------------------------------------------------ */
  const animatedItems = document.querySelectorAll('.fade-in-up');

  if ('IntersectionObserver' in window && animatedItems.length) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    animatedItems.forEach(item => observer.observe(item));
  } else {
    // Fallback : rend tout visible si IntersectionObserver n'est pas supporté
    animatedItems.forEach(item => item.classList.add('visible'));
  }

  /* ------------------------------------------------------------------ */
  /* 6. BOUTON RETOUR EN HAUT                                            */
  /* ------------------------------------------------------------------ */
  const backToTopBtn = document.getElementById('back-to-top');

  if (backToTopBtn) {
    window.addEventListener('scroll', () => {
      backToTopBtn.style.display = window.scrollY > 400 ? 'flex' : 'none';
    }, { passive: true });
    backToTopBtn.style.display = 'none';

    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ------------------------------------------------------------------ */
  /* 7 & 8. VALIDATION DU FORMULAIRE + MESSAGE DE CONFIRMATION           */
  /* ------------------------------------------------------------------ */
  const contactForm = document.getElementById('contact-form');
  const formNote = document.getElementById('form-note');

  const fieldRules = {
    name: { minLength: 2, message: 'Merci de renseigner votre nom (2 caractères minimum).' },
    email: { type: 'email', message: 'Merci de renseigner une adresse email valide.' },
    subject: { minLength: 2, message: 'Merci de renseigner un sujet.' },
    message: { minLength: 10, message: 'Votre message doit contenir au moins 10 caractères.' }
  };

  function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  function validateField(field) {
    const rule = fieldRules[field.name];
    const errorEl = document.getElementById(`error-${field.name}`);
    const group = field.closest('.form-group');
    let isValid = true;
    let message = '';

    if (field.hasAttribute('required') && field.value.trim() === '') {
      isValid = false;
      message = 'Ce champ est obligatoire.';
    } else if (rule && rule.minLength && field.value.trim().length < rule.minLength) {
      isValid = false;
      message = rule.message;
    } else if (rule && rule.type === 'email' && !isValidEmail(field.value.trim())) {
      isValid = false;
      message = rule.message;
    }

    if (group) group.classList.toggle('invalid', !isValid);
    if (errorEl) errorEl.textContent = isValid ? '' : message;

    return isValid;
  }

  if (contactForm) {
    // Validation en direct lors de la saisie
    contactForm.querySelectorAll('input, textarea').forEach(field => {
      field.addEventListener('blur', () => validateField(field));
      field.addEventListener('input', () => {
        if (field.closest('.form-group').classList.contains('invalid')) {
          validateField(field);
        }
      });
    });

    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const fields = contactForm.querySelectorAll('input[required], textarea[required]');
      let allValid = true;

      fields.forEach(field => {
        if (!validateField(field)) allValid = false;
      });

      if (!allValid) {
        formNote.textContent = 'Merci de corriger les champs indiqués ci-dessus.';
        formNote.className = 'form-note visible';
        formNote.style.background = 'rgba(248, 113, 113, 0.12)';
        formNote.style.color = 'var(--danger)';
        return;
      }

      // IMPORTANT : aucun backend n'est connecté ici.
      // Ce message informe honnêtement l'utilisateur que l'envoi réel
      // nécessite un service backend (ex: EmailJS, Formspree, ou une API personnelle).
      formNote.textContent =
        "Ce formulaire est prêt visuellement, mais aucun service d'envoi n'est encore connecté. " +
        "Reliez-le à un backend (ex : Formspree, EmailJS, ou votre propre API) pour un envoi réel.";
      formNote.className = 'form-note info';

      // Optionnel : réinitialiser le formulaire après affichage du message
      // contactForm.reset();
    });
  }
  /* ------------------------------------------------------------------ */
  /* ANIMATIONS JS                                                       */
  /* ------------------------------------------------------------------ */
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- A. Effet machine à écrire ---------- */
  const typingEl = document.getElementById('typing-text');

  if (typingEl && !reduceMotion) {
    // Modifie cette liste pour changer les mots affichés
    const words = ['Administration systèmes', 'Réseaux', 'Cybersécurité', 'Virtualisation'];
    let wordIndex = 0;
    let charIndex = 0;
    let deleting = false;

    function typeLoop() {
      const word = words[wordIndex];
      typingEl.textContent = word.slice(0, charIndex);
      let delay = deleting ? 40 : 80;

      if (!deleting && charIndex === word.length) {
        delay = 1600;            // pause quand le mot est complet
        deleting = true;
      } else if (deleting && charIndex === 0) {
        deleting = false;
        wordIndex = (wordIndex + 1) % words.length;
        delay = 400;             // pause avant le mot suivant
      } else {
        charIndex += deleting ? -1 : 1;
      }
      setTimeout(typeLoop, delay);
    }
    typeLoop();
  }

  /* ---------- B. Réseau animé (canvas) ---------- */
  const canvas = document.getElementById('network-canvas');

  if (canvas && !reduceMotion) {
    const ctx = canvas.getContext('2d');
    const hero = canvas.parentElement;
    const accent = getComputedStyle(root).getPropertyValue('--accent-rgb').trim() || '56, 189, 248';
    const MAX_DIST = 140;       // distance max pour relier deux nœuds
    let width, height, nodes = [], rafId = null;

    function resizeCanvas() {
      const dpr = window.devicePixelRatio || 1;
      width = hero.clientWidth;
      height = hero.clientHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Moins de nœuds sur petit écran pour rester fluide
      const count = Math.min(70, Math.floor((width * height) / 18000));
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

    resizeCanvas();

    // L'animation se met en pause quand le hero n'est plus visible (économise la batterie)
    new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        if (!rafId) drawNetwork();
      } else {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
    }).observe(hero);

    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resizeCanvas, 200);
    });
  }

  /* ---------- C. Cartes : halo + inclinaison 3D ---------- */
  const fxCards = document.querySelectorAll('.project-card, .skill-card, .cert-card');
  const canHover = window.matchMedia('(hover: hover)').matches;

  fxCards.forEach(card => {
    card.classList.add('fx-card');

    if (reduceMotion || !canHover) return;   // pas d'effet sur écran tactile

    card.addEventListener('mouseenter', () => card.classList.add('tilt-active'));

    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;

      card.style.setProperty('--mx', `${x * 100}%`);
      card.style.setProperty('--my', `${y * 100}%`);

      // 6 = angle maximal en degrés (augmente pour un effet plus marqué)
      card.style.transform =
        `perspective(900px) rotateX(${(0.5 - y) * 6}deg) rotateY(${(x - 0.5) * 6}deg) translateY(-4px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });

  /* ---------- D. Badges en cascade ---------- */
  document.querySelectorAll('.skill-card').forEach(card => {
    card.querySelectorAll('.badge').forEach((badge, i) => {
      badge.style.setProperty('--d', `${300 + i * 60}ms`);
    });
  });
  /* ------------------------------------------------------------------ */
  /* FOOTER : année automatique                                          */
  /* ------------------------------------------------------------------ */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

});
