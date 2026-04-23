/**
 * animations.js — Scroll-triggered reveal
 *
 * Any element with class "reveal" fades in and slides up when it
 * enters the viewport.  The CSS handles the transition; this module
 * just toggles the "visible" class via IntersectionObserver.
 *
 * Add "reveal" to elements in HTML (or programmatically in init).
 * Wrap sibling reveals in a parent with "reveal-stagger" for
 * cascading delays defined in main.css.
 */

export function initReveal() {
  // Respect reduced-motion: skip observer, show everything immediately
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  // Auto-tag elements that should reveal on scroll
  const selectors = [
    '.section-heading',
    '.about-content',
    '.timeline-item',
    '.project-card',
    '.contact-inner',
  ];

  selectors.forEach((sel) => {
    document.querySelectorAll(sel).forEach((el) => el.classList.add('reveal'));
  });

  // Add stagger containers
  document.querySelectorAll('.timeline, .project-grid').forEach((el) => {
    el.classList.add('reveal-stagger');
  });

  // Observe
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);   // only animate once
        }
      });
    },
    { threshold: 0.15 }
  );

  document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
}