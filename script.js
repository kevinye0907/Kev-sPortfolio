// Kevin Shao — Portfolio interactions (no dependencies).
(() => {
  const root = document.documentElement;

  /* ---------- Theme toggle ---------- */
  const themeBtn = document.querySelector('[data-theme-toggle]');
  const systemDark = window.matchMedia('(prefers-color-scheme: dark)');
  const currentTheme = () => root.dataset.theme || (systemDark.matches ? 'dark' : 'light');
  const syncThemeLabel = () => {
    if (!themeBtn) return;
    const dark = currentTheme() === 'dark';
    themeBtn.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
    themeBtn.title = dark ? 'Light theme' : 'Dark theme';
  };
  themeBtn?.addEventListener('click', () => {
    const next = currentTheme() === 'dark' ? 'light' : 'dark';
    root.dataset.theme = next;
    try { localStorage.setItem('theme', next); } catch (e) { /* storage blocked: still works for this visit */ }
    syncThemeLabel();
  });
  systemDark.addEventListener?.('change', syncThemeLabel);
  syncThemeLabel();

  /* ---------- Navigation ---------- */
  const nav = document.querySelector('.nav');
  const onScroll = () => nav?.classList.toggle('scrolled', window.scrollY > 8);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  const menuBtn = document.querySelector('[data-menu-toggle]');
  const navList = document.getElementById('nav-links');
  const setMenu = (open) => {
    navList?.classList.toggle('open', open);
    menuBtn?.setAttribute('aria-expanded', String(open));
    menuBtn?.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  };
  menuBtn?.addEventListener('click', () => setMenu(!navList.classList.contains('open')));
  navList?.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });

  /* ---------- Highlight the current section in the nav ---------- */
  const navLinks = navList ? [...navList.querySelectorAll('a[href^="#"]')] : [];

  if ('IntersectionObserver' in window) {
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navLinks.forEach((a) => a.classList.toggle('active', a.getAttribute('href') === '#' + entry.target.id));
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    navLinks.forEach((a) => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) spy.observe(target);
    });
  }

  /* ---------- Carousels ---------- */
  document.querySelectorAll('[data-carousel]').forEach((carousel) => {
    const track = carousel.querySelector('.carousel-track');
    const slides = [...track.children];
    const dotsWrap = carousel.querySelector('.carousel-dots');
    let index = 0;

    const goTo = (i) => {
      index = (i + slides.length) % slides.length;
      track.scrollTo({ left: slides[index].offsetLeft, behavior: 'smooth' });
    };

    const dots = slides.map((_, i) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'dot';
      dot.setAttribute('aria-label', `Show image ${i + 1} of ${slides.length}`);
      dot.addEventListener('click', () => goTo(i));
      dotsWrap.appendChild(dot);
      return dot;
    });

    const update = () => {
      index = Math.round(track.scrollLeft / Math.max(track.clientWidth, 1));
      dots.forEach((d, i) => d.setAttribute('aria-current', i === index ? 'true' : 'false'));
    };

    let ticking = false;
    track.addEventListener('scroll', () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => { update(); ticking = false; });
    }, { passive: true });

    carousel.querySelector('[data-prev]')?.addEventListener('click', () => goTo(index - 1));
    carousel.querySelector('[data-next]')?.addEventListener('click', () => goTo(index + 1));
    track.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') { e.preventDefault(); goTo(index - 1); }
      if (e.key === 'ArrowRight') { e.preventDefault(); goTo(index + 1); }
    });
    update();
  });

  /* ---------- Lightbox ---------- */
  const lightbox = document.getElementById('lightbox');
  if (lightbox) {
    const lbImg = lightbox.querySelector('img');
    const lbCaption = lightbox.querySelector('figcaption');

    document.querySelectorAll('[data-zoom]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const img = btn.querySelector('img');
        if (!img) return;
        if (typeof lightbox.showModal !== 'function') { window.open(img.src, '_blank', 'noopener'); return; }
        lbImg.src = img.currentSrc || img.src;
        lbImg.alt = img.alt;
        lbCaption.textContent = btn.dataset.caption || img.alt;
        lightbox.showModal();
      });
    });

    lightbox.querySelector('[data-close]')?.addEventListener('click', () => lightbox.close());
    lightbox.addEventListener('click', (e) => { if (e.target === lightbox) lightbox.close(); });
  }

  /* ---------- Copy email ---------- */
  document.querySelectorAll('[data-copy]').forEach((btn) => {
    const label = btn.querySelector('.label');
    const original = label?.textContent;
    btn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(btn.dataset.copy);
        if (label) label.textContent = 'Copied!';
        setTimeout(() => { if (label) label.textContent = original; }, 1800);
      } catch (e) {
        window.location.href = 'mailto:' + btn.dataset.copy;
      }
    });
  });

  /* ---------- Footer year ---------- */
  const year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());
})();
