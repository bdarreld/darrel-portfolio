/**
 * main.js — Entry point
 *
 * Imports each module and initialises them once the DOM is ready.
 * Using type="module" in the HTML means this script is deferred
 * automatically — DOMContentLoaded has already fired or will fire
 * shortly, but we wrap in the listener for safety.
 */

import { initHero }   from './hero.js';
import { initNav }    from './nav.js';
import { initReveal } from './animations.js';

document.addEventListener('DOMContentLoaded', () => {
  initHero();
  initNav();
  initReveal();
});