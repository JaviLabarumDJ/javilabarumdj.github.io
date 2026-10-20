/**
 * JAVILABARUMDJ HUB — SHOWCASE SCRIPTS
 * Author: JaviLabarumDJ (@javilabarumdj)
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Audio Visualizer Canvas
  initAudioVisualizer();

  // 2. Mixxx Mockup Mode Switcher
  initMixxxMockupSwitcher();

  // 3. TiDownloader Mockup Switcher
  initTidownloaderMockupSwitcher();

  // 4. Share & Clipboard Buttons
  initActionButtons();

  // 5. Navbar Scroll & Mobile Drawer
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
      
      const wave1 = Math.sin(normalizedPos * 10 + time * 2);
      const wave2 = Math.cos(normalizedPos * 18 - time * 1.5);
      const wave3 = Math.sin(normalizedPos * 30 + time * 3.5);
      
      const distFromMouse = Math.abs(normalizedPos - centerFactor);
      const proximityBoost = Math.max(0, 1 - distFromMouse * 2.5);

      const amplitude = Math.abs(wave1 * 0.5 + wave2 * 0.3 + wave3 * 0.2 + proximityBoost * 0.4);
      const barHeight = amplitude * 120 + 8;
      
      const x = i * (barWidth + 4);
      const y = height - barHeight - 40;

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
   2. MIXXX MOCKUP SWITCHER
   ========================================================================== */
function initMixxxMockupSwitcher() {
  const tabs = document.querySelectorAll('.mockup-tab');
  const showcaseImg = document.getElementById('showcaseImage');
  const mockupTitle = document.getElementById('mockupTitle');
  const viewportTag = document.getElementById('viewportTag');

  if (!tabs.length || !showcaseImg) return;

  const modeData = {
    'tablet-wave': {
      src: 'assets/tablet_wave_mode.png',
      alt: 'Mixxx Android en tablet modo WAVE de cabina profesional',
      title: 'Tablet Widescreen • Modo WAVE (Cabina Pro)',
      tagTitle: 'WAVE Dashboard de Cabina',
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
      src: 'assets/phone_wave_mode.png',
      alt: 'Mixxx Android en móvil modo WAVE apilado',
      title: 'Smartphone • Modo WAVE de Cabina en Acción',
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

      tabs.forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');

      showcaseImg.classList.add('fade-out');

      setTimeout(() => {
        showcaseImg.src = data.src;
        showcaseImg.alt = data.alt;
        if (mockupTitle) mockupTitle.textContent = data.title;
        if (viewportTag) {
          viewportTag.innerHTML = `<strong>${data.tagTitle}</strong><span>${data.tagSubtitle}</span>`;
        }
        showcaseImg.classList.remove('fade-out');
      }, 180);
    });
  });
}

/* ==========================================================================
   3. TIDOWNLOADER MOCKUP SWITCHER
   ========================================================================== */
function initTidownloaderMockupSwitcher() {
  const tabs = document.querySelectorAll('.mockup-tab-tid');
  const showcaseImg = document.getElementById('tidShowcaseImage');
  const mockupTitle = document.getElementById('tidMockupTitle');

  if (!tabs.length || !showcaseImg) return;

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      if (tab.classList.contains('active')) return;

      const img = tab.getAttribute('data-img');
      const title = tab.getAttribute('data-title');
      if (!img) return;

      tabs.forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');

      showcaseImg.classList.add('fade-out');

      setTimeout(() => {
        showcaseImg.src = img;
        if (mockupTitle) mockupTitle.textContent = `TiDownloader Web • ${title}`;
        showcaseImg.classList.remove('fade-out');
      }, 180);
    });
  });
}

/* ==========================================================================
   4. ACTION BUTTONS & TOAST
   ========================================================================== */
function initActionButtons() {
  const shareBtn = document.getElementById('shareBtn');
  const copyDockerBtn = document.getElementById('copyDockerBtn');
  const toast = document.getElementById('toast');
  const shareUrl = 'https://javilabarumdj.github.io/';

  if (shareBtn) {
    shareBtn.addEventListener('click', async () => {
      if (navigator.share) {
        try {
          await navigator.share({
            title: 'JaviLabarumDJ Hub 🎧',
            text: 'Descarga Mixxx DJ para Android (Modo WAVE de Cabina) y TiDownloader por @javilabarumdj.',
            url: shareUrl
          });
          return;
        } catch (err) {}
      }

      copyToClipboard(shareUrl, '¡Enlace del Hub copiado al portapapeles!');
    });
  }

  if (copyDockerBtn) {
    copyDockerBtn.addEventListener('click', () => {
      copyToClipboard('docker compose up -d', '¡Comando "docker compose up -d" copiado!');
    });
  }

  function copyToClipboard(text, msg) {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => showToast(msg));
    } else {
      const temp = document.createElement('input');
      temp.value = text;
      document.body.appendChild(temp);
      temp.select();
      document.execCommand('copy');
      document.body.removeChild(temp);
      showToast(msg);
    }
  }

  function showToast(msg) {
    if (!toast) return;
    const msgEl = toast.querySelector('.toast-message');
    if (msgEl) msgEl.textContent = msg;

    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 3200);
  }
}

/* ==========================================================================
   5. NAVIGATION
   ========================================================================== */
function initNavigation() {
  const navbar = document.getElementById('navbar');
  const mobileToggle = document.getElementById('mobileToggle');
  const navLinks = document.getElementById('navLinks');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  if (mobileToggle && navLinks) {
    function toggleMobileMenu(forceState) {
      const isCurrentlyOpen = navLinks.classList.contains('mobile-open');
      const shouldOpen = forceState !== undefined ? forceState : !isCurrentlyOpen;

      if (shouldOpen) {
        navLinks.classList.add('mobile-open');
        mobileToggle.classList.add('is-active');
        mobileToggle.setAttribute('aria-expanded', 'true');
        document.body.classList.add('menu-locked');
      } else {
        navLinks.classList.remove('mobile-open');
        mobileToggle.classList.remove('is-active');
        mobileToggle.setAttribute('aria-expanded', 'false');
        document.body.classList.remove('menu-locked');
      }
    }

    mobileToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleMobileMenu();
    });

    // Close when clicking any menu link
    navLinks.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        if (window.innerWidth <= 768) {
          toggleMobileMenu(false);
        }
      });
    });

    // Close when clicking outside
    document.addEventListener('click', (e) => {
      if (navLinks.classList.contains('mobile-open')) {
        if (!navLinks.contains(e.target) && !mobileToggle.contains(e.target)) {
          toggleMobileMenu(false);
        }
      }
    });

    // Close on window resize to desktop
    window.addEventListener('resize', () => {
      if (window.innerWidth > 768 && navLinks.classList.contains('mobile-open')) {
        toggleMobileMenu(false);
      }
    });
  }
}

// Dropdown menu click & touch handler
document.addEventListener('DOMContentLoaded', () => {
  const dropdownBtn = document.getElementById('appsDropdownBtn');
  const dropdownMenu = document.getElementById('appsDropdownMenu');

  if (dropdownBtn && dropdownMenu) {
    dropdownBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = dropdownMenu.classList.contains('show');
      dropdownMenu.classList.toggle('show');
      dropdownBtn.setAttribute('aria-expanded', !isOpen);
    });

    document.addEventListener('click', (e) => {
      if (!dropdownBtn.contains(e.target) && !dropdownMenu.contains(e.target)) {
        dropdownMenu.classList.remove('show');
        dropdownBtn.setAttribute('aria-expanded', 'false');
      }
    });
  }
});

/* ==========================================================================
   6. CATALOG FILTER PILLS
   ========================================================================== */
function initCatalogFilter() {
  const pillsContainer = document.getElementById('appsFilterPills');
  if (!pillsContainer) return;

  const buttons = pillsContainer.querySelectorAll('.filter-btn');
  const cards = document.querySelectorAll('#appsGrid article');

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.getAttribute('data-filter');
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      cards.forEach(card => {
        const cat = card.getAttribute('data-category') || '';
        if (filter === 'all' || cat.includes(filter)) {
          card.classList.remove('hidden');
        } else {
          card.classList.add('hidden');
        }
      });
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initCatalogFilter();
});
