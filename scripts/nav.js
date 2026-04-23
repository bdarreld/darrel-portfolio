/**
 * nav.js — Scroll spy, header background, mobile menu
 *
 * - Highlights the nav link matching the currently visible section
 * - Adds a translucent background to the header once scrolled past hero
 * - Toggles the mobile hamburger menu and closes it on link click
 */

export function initNav() {
  const header    = document.getElementById('site-header');
  const toggle    = document.getElementById('menu-toggle');
  const navMenu   = document.getElementById('nav-menu');
  const navLinks  = navMenu.querySelectorAll('a');
  const sections  = document.querySelectorAll('main .section, main .hero');

  // ── Scroll spy via IntersectionObserver ──────────────────────
  const observerOpts = {
    rootMargin: `-${getComputedStyle(document.documentElement)
      .getPropertyValue('--nav-height').trim() || '56px'} 0px -40% 0px`,
    threshold: 0,
  };

  const spy = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const id = entry.target.id;
      navLinks.forEach((link) => {
        link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
      });
    });
  }, observerOpts);

  sections.forEach((s) => spy.observe(s));

  // ── Header background on scroll ─────────────────────────────
  const scrollThreshold = 80;   // px

  function updateHeader() {
    header.classList.toggle('scrolled', window.scrollY > scrollThreshold);
  }

  window.addEventListener('scroll', updateHeader, { passive: true });
  updateHeader();   // in case page loads already scrolled

  // ── Mobile hamburger ────────────────────────────────────────
  function closeMenu() {
    navMenu.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  function openMenu() {
    navMenu.classList.add('open');
    toggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';   // prevent scroll behind overlay
  }

  toggle.addEventListener('click', () => {
    const isOpen = toggle.getAttribute('aria-expanded') === 'true';
    isOpen ? closeMenu() : openMenu();
  });

  // Close menu when a nav link is clicked (mobile)
  navLinks.forEach((link) => {
    link.addEventListener('click', closeMenu);
  });

  // Close menu on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenu();
  });
}