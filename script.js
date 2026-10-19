/**
 * MIXXX DJ ANDROID — SHOWCASE SCRIPTS
 * Author: JaviLabarumDJ
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Audio Visualizer Canvas
  initAudioVisualizer();

  // 2. Mockup Mode Switcher
  initMockupSwitcher();

  // 3. Share Button & Toast
  initShareAction();

  // 4. Navbar Scroll Effect & Mobile Drawer
  initNavigation();
});

/* ==========================================================================
   1. CANVAS AUDIO SPECTRUM VISUALIZER
   ========================================================================== */
function initAudioVisualizer() {
  const canvas = document.getElementById('audioVisualizer');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = 680);
  let animationId;
  let time = 0;
  let mouseX = width / 2;

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = Math.min(window.innerHeight * 0.8, 680);
  });

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
  });

  function draw() {
    ctx.clearRect(0, 0, width, height);

    const bars = Math.floor(width / 16);
    const barWidth = width / bars - 4;
    const centerFactor = mouseX / width;

    for (let i = 0; i < bars; i++) {
      const normalizedPos = i / bars;
      
      // Multi-harmonic synthesized audio waveforms
      const wave1 = Math.sin(normalizedPos * 10 + time * 2);
      const wave2 = Math.cos(normalizedPos * 18 - time * 1.5);
      const wave3 = Math.sin(normalizedPos * 30 + time * 3.5);
      
      const distFromMouse = Math.abs(normalizedPos - centerFactor);
      const proximityBoost = Math.max(0, 1 - distFromMouse * 2.5);

      const amplitude = Math.abs(wave1 * 0.5 + wave2 * 0.3 + wave3 * 0.2 + proximityBoost * 0.4);
      const barHeight = amplitude * 120 + 8;
      
      const x = i * (barWidth + 4);
      const y = height - barHeight - 40;

      // Pioneer DJ inspired gradient: Cyan to Neon Orange
      const gradient = ctx.createLinearGradient(0, y, 0, y + barHeight);
      if (i % 2 === 0) {
        gradient.addColorStop(0, 'rgba(0, 229, 255, 0.7)');
        gradient.addColorStop(1, 'rgba(0, 229, 255, 0.05)');
      } else {
        gradient.addColorStop(0, 'rgba(255, 87, 34, 0.65)');
        gradient.addColorStop(1, 'rgba(255, 87, 34, 0.05)');
      }

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.roundRect(x, y, barWidth, barHeight, [2, 2, 0, 0]);
      ctx.fill();
    }

    time += 0.025;
    animationId = requestAnimationFrame(draw);
  }

  draw();
}

/* ==========================================================================
   2. INTERACTIVE MOCKUP SHOWCASE
   ========================================================================== */
function initMockupSwitcher() {
  const tabs = document.querySelectorAll('.mockup-tab');
  const showcaseImg = document.getElementById('showcaseImage');
  const mockupTitle = document.getElementById('mockupTitle');
  const viewportTag = document.getElementById('viewportTag');

  if (!tabs.length || !showcaseImg) return;

  const modeData = {
    'tablet-wave': {
      src: 'assets/tablet_wave_mode.png',
      alt: 'Mixxx Android en tablet modo WAVE estilo Pioneer RX3',
      title: 'Tablet Widescreen • Modo WAVE (Pioneer XDJ-RX3)',
      tagTitle: 'Pioneer XDJ-RX3 Dashboard',
      tagSubtitle: 'Reloj Monospace + Pitch Exacto + BPM Hero'
    },
    'tablet-dj': {
      src: 'assets/tablet_dj_mode.png',
      alt: 'Mixxx Android en tablet consola táctil completa',
      title: 'Tablet Widescreen • Modo DJ (Mesa Táctil + Biblioteca)',
      tagTitle: 'Consola Táctil de 2 Decks',
      tagSubtitle: 'EQ 3-Bandas + Filtros + Faders con Recentrado'
    },
    'phone-wave': {
      src: 'assets/phone_wave_rx3.png',
      alt: 'Mixxx Android en móvil modo WAVE apilado',
      title: 'Smartphone • Modo WAVE RX3 en Acción',
      tagTitle: 'Ondas RGB Dinámicas',
      tagSubtitle: 'Seguimiento de fase visual y salto por aguja'
    },
    'phone-dj': {
      src: 'assets/phone_dj_loaded.png',
      alt: 'Mixxx Android en móvil con pistas cargadas',
      title: 'Smartphone • Decks Cargados y Mezcla en Directo',
      tagTitle: 'QuickLoad Drawers',
      tagSubtitle: 'Carga canciones al vuelo sin perder el ritmo'
    }
  };

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      if (tab.classList.contains('active')) return;

      const mode = tab.getAttribute('data-mode');
      const data = modeData[mode];
      if (!data) return;

      // Update active tab button
      tabs.forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');

      // Smooth cross-fade transition
      showcaseImg.classList.add('fade-out');

      setTimeout(() => {
        showcaseImg.src = data.src;
        showcaseImg.alt = data.alt;
        if (mockupTitle) mockupTitle.textContent = data.title;
        if (viewportTag) {
          viewportTag.innerHTML = `<strong>${data.tagTitle}</strong><span>${data.tagSubtitle}</span>`;
        }
        showcaseImg.classList.remove('fade-out');
      }, 200);
    });
  });
}

/* ==========================================================================
   3. SHARE ACTION & TOAST NOTIFICATION
   ========================================================================== */
function initShareAction() {
  const shareBtn = document.getElementById('shareBtn');
  const toast = document.getElementById('toast');
  const shareUrl = 'https://javilabarumdj.github.io/';

  if (!shareBtn || !toast) return;

  shareBtn.addEventListener('click', async () => {
    // Try native Web Share API first (Mobile Instagram/Chrome/Safari)
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Mixxx DJ para Android 🎧',
          text: 'Descarga gratis Mixxx DJ para Android por JaviLabarumDJ. Modo Pioneer XDJ-RX3 y controladoras USB.',
          url: shareUrl
        });
        return;
      } catch (err) {
        // Fallback to clipboard if share was dismissed or unsupported
      }
    }

    // Clipboard copy fallback
    try {
      await navigator.clipboard.writeText(shareUrl);
      showToast('¡Enlace copiado al portapapeles!');
    } catch (err) {
      // Legacy fallback
      const tempInput = document.createElement('input');
      tempInput.value = shareUrl;
      document.body.appendChild(tempInput);
      tempInput.select();
      document.execCommand('copy');
      document.body.removeChild(tempInput);
      showToast('¡Enlace copiado al portapapeles!');
    }
  });

  function showToast(msg) {
    const msgEl = toast.querySelector('.toast-message');
    if (msgEl) msgEl.textContent = msg;

    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 3200);
  }
}

/* ==========================================================================
   4. NAVIGATION & MOBILE MENU
   ========================================================================== */
function initNavigation() {
  const navbar = document.getElementById('navbar');
  const mobileToggle = document.getElementById('mobileToggle');
  const navLinks = document.getElementById('navLinks');

  // Sticky header shadow on scroll
  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  // Mobile menu toggle
  if (mobileToggle && navLinks) {
    mobileToggle.addEventListener('click', () => {
      const isExpanded = mobileToggle.getAttribute('aria-expanded') === 'true';
      mobileToggle.setAttribute('aria-expanded', !isExpanded);
      
      if (!isExpanded) {
        navLinks.style.display = 'flex';
        navLinks.style.flexDirection = 'column';
        navLinks.style.position = 'absolute';
        navLinks.style.top = '72px';
        navLinks.style.left = '0';
        navLinks.style.width = '100%';
        navLinks.style.background = '#0a0d14';
        navLinks.style.padding = '1.5rem';
        navLinks.style.borderBottom = '1px solid rgba(255, 255, 255, 0.1)';
        navLinks.style.gap = '1.25rem';
      } else {
        navLinks.style.display = '';
      }
    });

    // Close menu when a link is clicked
    navLinks.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        if (window.innerWidth <= 768) {
          navLinks.style.display = '';
          mobileToggle.setAttribute('aria-expanded', 'false');
        }
      });
    });
  }
}
