/* ╔══════════════════════════════════════════════════════════════╗
   ║  EVENTIAL — Script v2                                      ║
   ║  Preloader · Slider · Gallery · Lightbox · Chatbot          ║
   ╚══════════════════════════════════════════════════════════════╝ */

document.addEventListener('DOMContentLoaded', () => {

  /* ════════════════════════════════════════════════════════════
     PRELOADER
     ════════════════════════════════════════════════════════════ */
  const preloader = document.getElementById('preloader');
  window.addEventListener('load', () => {
    setTimeout(() => preloader.classList.add('hidden'), 2000);
  });
  // Safety fallback: hide preloader after 4s no matter what
  setTimeout(() => preloader.classList.add('hidden'), 4000);

  /* ════════════════════════════════════════════════════════════
     HEADER — Scroll Effect
     ════════════════════════════════════════════════════════════ */
  const header = document.getElementById('header');

  window.addEventListener('scroll', () => {
    header.classList.toggle('header--scrolled', window.scrollY > 60);
  }, { passive: true });

  /* ════════════════════════════════════════════════════════════
     MOBILE MENU
     ════════════════════════════════════════════════════════════ */
  const hamburger = document.getElementById('hamburger');
  const nav = document.getElementById('nav');

  hamburger.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    hamburger.classList.toggle('active');
    hamburger.setAttribute('aria-expanded', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  // Close on link click
  nav.querySelectorAll('.nav__link').forEach(link => {
    link.addEventListener('click', () => {
      nav.classList.remove('open');
      hamburger.classList.remove('active');
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });

  /* ════════════════════════════════════════════════════════════
     ACTIVE NAV LINK ON SCROLL
     ════════════════════════════════════════════════════════════ */
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav__link');

  const navObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(l => l.classList.remove('active'));
        const link = document.querySelector(`.nav__link[href="#${entry.target.id}"]`);
        if (link) link.classList.add('active');
      }
    });
  }, { threshold: 0.25 });

  sections.forEach(s => navObserver.observe(s));

  /* ════════════════════════════════════════════════════════════
     HERO — Image Slider (layered over video)
     ════════════════════════════════════════════════════════════ */
  const slides = document.querySelectorAll('.hero__slide');
  let currentSlide = 0;
  let slideTimer;

  function goToSlide(index) {
    slides[currentSlide].classList.remove('active');
    currentSlide = index % slides.length;
    slides[currentSlide].classList.add('active');
  }

  function nextSlide() {
    goToSlide(currentSlide + 1);
  }

  function startSlider() {
    slideTimer = setInterval(nextSlide, 5000);
  }

  if (slides.length > 1) {
    startSlider();
    const hero = document.getElementById('hero');
    hero.addEventListener('mouseenter', () => clearInterval(slideTimer));
    hero.addEventListener('mouseleave', startSlider);
  }

  /* ════════════════════════════════════════════════════════════
     GALLERY — Filter
     ════════════════════════════════════════════════════════════ */
  const filterBtns = document.querySelectorAll('.filter-btn');
  const galleryItems = document.querySelectorAll('.gallery-item');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Update active state
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filter;

      galleryItems.forEach((item, i) => {
        const match = filter === 'all' || item.dataset.event === filter;
        if (match) {
          item.classList.remove('hidden');
          item.style.animationDelay = `${i * 40}ms`;
          item.style.animation = 'none';
          // Force reflow for animation restart
          void item.offsetHeight;
          item.style.animation = 'msg-pop .4s ease forwards';
        } else {
          item.classList.add('hidden');
        }
      });
    });
  });

  /* ════════════════════════════════════════════════════════════
     GALLERY — Video hover play
     ════════════════════════════════════════════════════════════ */
  document.querySelectorAll('.gallery-item--video').forEach(item => {
    const video = item.querySelector('video');
    if (!video) return;

    item.addEventListener('mouseenter', () => {
      video.play().catch(() => {});
    });
    item.addEventListener('mouseleave', () => {
      video.pause();
      video.currentTime = 0;
    });
  });

  /* ════════════════════════════════════════════════════════════
     LIGHTBOX — Image + Video viewer
     ════════════════════════════════════════════════════════════ */
  const lightbox = document.getElementById('lightbox');
  const lightboxMedia = document.getElementById('lightboxMedia');
  const lightboxClose = document.getElementById('lightboxClose');
  const lightboxPrev = document.getElementById('lightboxPrev');
  const lightboxNext = document.getElementById('lightboxNext');
  const lightboxCounter = document.getElementById('lightboxCounter');
  let lbIndex = 0;
  let lbItems = [];

  function getVisibleGalleryItems() {
    return Array.from(document.querySelectorAll('.gallery-item:not(.hidden)'));
  }

  function openLightbox(index) {
    lbItems = getVisibleGalleryItems();
    lbIndex = index;
    showLightboxItem();
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function showLightboxItem() {
    const item = lbItems[lbIndex];
    if (!item) return;

    lightboxMedia.innerHTML = '';

    const video = item.querySelector('video');
    const img = item.querySelector('img');

    if (video) {
      const v = document.createElement('video');
      v.src = video.src;
      v.controls = true;
      v.autoplay = true;
      v.style.maxWidth = '92vw';
      v.style.maxHeight = '88vh';
      v.style.borderRadius = '12px';
      lightboxMedia.appendChild(v);
    } else if (img) {
      const i = document.createElement('img');
      i.src = img.src;
      i.alt = img.alt || 'EVENTIAL';
      lightboxMedia.appendChild(i);
    }

    lightboxCounter.textContent = `${lbIndex + 1} / ${lbItems.length}`;
  }

  function closeLightbox() {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
    // Pause any playing video
    const v = lightboxMedia.querySelector('video');
    if (v) v.pause();
    lightboxMedia.innerHTML = '';
  }

  // Click handlers
  galleryItems.forEach(item => {
    item.addEventListener('click', () => {
      const visible = getVisibleGalleryItems();
      const idx = visible.indexOf(item);
      openLightbox(idx >= 0 ? idx : 0);
    });
  });

  lightboxClose.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  lightboxPrev.addEventListener('click', (e) => {
    e.stopPropagation();
    const v = lightboxMedia.querySelector('video');
    if (v) v.pause();
    lbIndex = (lbIndex - 1 + lbItems.length) % lbItems.length;
    showLightboxItem();
  });

  lightboxNext.addEventListener('click', (e) => {
    e.stopPropagation();
    const v = lightboxMedia.querySelector('video');
    if (v) v.pause();
    lbIndex = (lbIndex + 1) % lbItems.length;
    showLightboxItem();
  });

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') lightboxPrev.click();
    if (e.key === 'ArrowRight') lightboxNext.click();
  });

  // Touch swipe support for lightbox
  let touchStartX = 0;
  lightbox.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });
  lightbox.addEventListener('touchend', (e) => {
    const diff = e.changedTouches[0].screenX - touchStartX;
    if (Math.abs(diff) > 60) {
      if (diff < 0) lightboxNext.click();
      else lightboxPrev.click();
    }
  }, { passive: true });

  /* ════════════════════════════════════════════════════════════
     FAQ ACCORDION
     ════════════════════════════════════════════════════════════ */
  const accordionItems = document.querySelectorAll('.accordion__item');

  accordionItems.forEach(item => {
    const trigger = item.querySelector('.accordion__trigger');
    trigger.addEventListener('click', () => {
      const wasOpen = item.classList.contains('open');

      // Close all
      accordionItems.forEach(i => {
        i.classList.remove('open');
        i.querySelector('.accordion__trigger').setAttribute('aria-expanded', 'false');
      });

      // Toggle current
      if (!wasOpen) {
        item.classList.add('open');
        trigger.setAttribute('aria-expanded', 'true');
      }
    });
  });

  /* ════════════════════════════════════════════════════════════
     SCROLL REVEAL ANIMATIONS
     ════════════════════════════════════════════════════════════ */
  const revealTargets = document.querySelectorAll(
    '.event-card, .gallery-item, .contact-card, .accordion__item, ' +
    '.contact-hours, .gallery-downloads, .gallery-filters, .drive-btn'
  );

  revealTargets.forEach(el => el.classList.add('reveal'));

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        // Stagger the reveals slightly
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, i * 60);
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });

  revealTargets.forEach(el => revealObserver.observe(el));

  /* ════════════════════════════════════════════════════════════
     SMOOTH SCROLL
     ════════════════════════════════════════════════════════════ */
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.querySelector(link.getAttribute('href'));
      if (target) {
        const offset = header.offsetHeight + 16;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  /* ════════════════════════════════════════════════════════════
     CHATBOT
     ════════════════════════════════════════════════════════════ */
  const chatbot = document.getElementById('chatbot');
  const chatbotToggle = document.getElementById('chatbotToggle');
  const chatbotClose = document.getElementById('chatbotClose');
  const chatbotBody = document.getElementById('chatbotBody');
  const chatbotInput = document.getElementById('chatbotInput');
  const chatbotSend = document.getElementById('chatbotSend');
  const quickBtns = document.querySelectorAll('.quick-btn');

  // Toggle chatbot
  function toggleChat() {
    chatbot.classList.toggle('open');
    if (chatbot.classList.contains('open')) {
      setTimeout(() => chatbotInput.focus(), 350);
    }
  }

  chatbotToggle.addEventListener('click', toggleChat);
  chatbotClose.addEventListener('click', toggleChat);

  // FAQ responses
  const botResponses = {
    precios: {
      q: '¿Cuánto cuestan las entradas?',
      a: 'Los precios varían por evento:<br><br>🟢 <strong>Early Bird:</strong> desde $8<br>🟡 <strong>Preventa:</strong> desde $10<br>🔴 <strong>En puerta:</strong> desde $15<br><br>Precios exactos se publican en <a href="https://instagram.com/eventialmcbo" target="_blank" style="color:#00FF66">@eventialmcbo</a>.'
    },
    metodos: {
      q: '¿Qué métodos de pago aceptan?',
      a: 'Aceptamos:<br><br>📱 Pago Móvil<br>💵 Zelle (USD)<br>💰 Efectivo (USD / Bs)<br>🏦 Transferencia bancaria<br>🪙 Binance (USDT)<br><br>Al escribirnos por WhatsApp te damos los datos.'
    },
    dresscode: {
      q: '¿Cuál es el dress code?',
      a: 'Generalmente: <strong>casual-elegante / urbano</strong> 👗👔<br><br>Eventos temáticos como PSYCHO HOUSE o GYAL pueden tener un dress code especial anunciado en el flyer. ¡Revisa nuestro Instagram!'
    },
    ubicacion: {
      q: '¿Dónde se hacen los eventos?',
      a: 'Nuestro venue principal es <strong>Mi Ternerita House</strong> 📍 en Maracaibo.<br><br>La ubicación exacta con Google Maps se comparte el día del evento en nuestras redes.'
    },
    horarios: {
      q: '¿Cuál es el horario?',
      a: '🚪 <strong>Puertas:</strong> 10:00 PM<br>🎵 <strong>Cierre:</strong> 4:00 AM — 5:00 AM<br><br>La hora exacta puede variar. ¡Llega temprano para la mejor vibra! 🔥'
    },
    vip: {
      q: '¿Cómo reservo una mesa VIP?',
      a: 'Las reservaciones VIP van por WhatsApp 🥂<br><br>Escríbenos al <strong>+58 424-6366555</strong> con:<br>• Evento<br>• # de personas<br>• Tu nombre<br><br>⚠️ Disponibilidad limitada.<br><br><a href="https://wa.me/584246366555?text=Hola%20EVENTIAL%20🎉%20Quiero%20reservar%20VIP" target="_blank" style="color:#00FF66;text-decoration:underline;font-weight:bold">→ Reservar por WhatsApp</a>'
    },
    edad: {
      q: '¿Edad mínima de acceso?',
      a: 'La edad mínima es <strong>18 años</strong> 🔞<br><br>Debes presentar <strong>cédula de identidad o pasaporte</strong> vigente en la entrada.<br><br>❌ Sin identificación = sin acceso.'
    },
    whatsapp: {
      q: 'Quiero hablar con alguien del equipo',
      a: '¡Claro! Comunícate directamente:<br><br>📲 <strong>WhatsApp:</strong> +58 424-6366555<br><br><a href="https://wa.me/584246366555?text=Hola%20EVENTIAL%20🎉%20Necesito%20info" target="_blank" style="color:#00FF66;text-decoration:underline;font-weight:bold">→ Abrir WhatsApp</a><br><br>🕐 <strong>Atención:</strong><br>Lun-Vie: 10AM — 6PM<br>Sáb: 10AM — 2PM'
    }
  };

  function addMsg(html, type = 'bot') {
    const msg = document.createElement('div');
    msg.classList.add('chat-msg', `chat-msg--${type}`);
    msg.innerHTML = `<p>${html}</p>`;
    chatbotBody.appendChild(msg);
    chatbotBody.scrollTop = chatbotBody.scrollHeight;
  }

  function showTyping() {
    const el = document.createElement('div');
    el.classList.add('chat-msg', 'chat-msg--bot', 'chat-msg--typing');
    el.innerHTML = '<p><span class="typing-anim">●●●</span></p>';
    el.id = 'typingIndicator';
    chatbotBody.appendChild(el);
    chatbotBody.scrollTop = chatbotBody.scrollHeight;
    return el;
  }

  function answerQuestion(key) {
    const faq = botResponses[key];
    if (!faq) return;

    addMsg(faq.q, 'user');
    const typing = showTyping();

    setTimeout(() => {
      typing.remove();
      addMsg(faq.a, 'bot');
    }, 700 + Math.random() * 500);
  }

  // Quick reply buttons
  quickBtns.forEach(btn => {
    btn.addEventListener('click', () => answerQuestion(btn.dataset.q));
  });

  // Free text input
  function handleUserInput() {
    const text = chatbotInput.value.trim();
    if (!text) return;

    addMsg(text, 'user');
    chatbotInput.value = '';

    const lower = text.toLowerCase();
    let matched = null;

    if (/precio|cuest|entrada|ticket|cuanto|cuesta/i.test(lower)) matched = 'precios';
    else if (/pago|pagar|zelle|binance|transferencia|método|metodo|pagomovil/i.test(lower)) matched = 'metodos';
    else if (/dress|vestim|ropa|código|codigo|vestir/i.test(lower)) matched = 'dresscode';
    else if (/ubica|donde|dónde|lugar|dirección|direccion|llegar|venue|ternerita/i.test(lower)) matched = 'ubicacion';
    else if (/hora|horario|empieza|termina|abre|cierra|cuando|cuándo/i.test(lower)) matched = 'horarios';
    else if (/vip|mesa|reserv|botella/i.test(lower)) matched = 'vip';
    else if (/edad|año|menor|18|cédula|cedula|identificación/i.test(lower)) matched = 'edad';
    else if (/whatsapp|humano|persona|hablar|contacto|teléfono|telefono|llamar/i.test(lower)) matched = 'whatsapp';

    const typing = showTyping();

    setTimeout(() => {
      typing.remove();

      if (matched) {
        addMsg(botResponses[matched].a, 'bot');
      } else {
        addMsg(
          'No estoy seguro de poder responder eso 🤔<br><br>Nuestro equipo puede ayudarte:<br><br>' +
          '<a href="https://wa.me/584246366555?text=Hola%20EVENTIAL%20🎉%20' +
          encodeURIComponent(text) +
          '" target="_blank" style="color:#00FF66;text-decoration:underline;font-weight:bold">→ Escribir por WhatsApp</a>',
          'bot'
        );
      }
    }, 800 + Math.random() * 500);
  }

  chatbotSend.addEventListener('click', handleUserInput);
  chatbotInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleUserInput();
  });

});
