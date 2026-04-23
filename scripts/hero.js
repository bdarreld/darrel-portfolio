/**
 * hero.js — Particle flow field animation
 *
 * Particles drift through a 2D Perlin noise field. Each particle
 * stores a history of recent positions; the canvas is fully cleared
 * each frame and trails are redrawn with decaying opacity — so they
 * genuinely fade to nothing, no ghost artifacts.
 */

// ─── Tunable parameters ────────────────────────────────────────
const PARTICLE_COUNT = 240;
const NOISE_SCALE    = 0.00125;
const PARTICLE_SPEED = 1.25;
const CORAL_RATIO    = 0.5;
const BLUE_OPACITY   = { min: 0.30, max: 0.65 };
const CORAL_OPACITY  = { min: 0.20, max: 0.50 };
const SIZE_MIN       = 1.0;
const SIZE_MAX       = 2.5;
const TIME_STEP      = 0.001;

// TRAIL_LENGTH → number of past positions stored per particle.
//   Higher = longer visible trail before it fades out.
//   Lower  = shorter trail, particles look more like dots.
//   Sweet spot is 30–80.  Try 20 for minimal, 100 for dramatic.
const TRAIL_LENGTH   = 50;

// ─── Colours ───────────────────────────────────────────────────
const COLOR_BG  = '#09090f';
const BLUE_RGB  = '91, 156, 245';
const CORAL_RGB = '245, 114, 91';

// ─── State ─────────────────────────────────────────────────────
let canvas, ctx;
let cssW, cssH, dpr;
let particles = [];
let time = 0;
let animId = null;
let paused = false;

// ─── Noise ─────────────────────────────────────────────────────
const perm = new Uint8Array(512);
const grad = [[1,1],[-1,1],[1,-1],[-1,-1],[1,0],[-1,0],[0,1],[0,-1]];

function initNoise() {
  for (let i = 0; i < 256; i++) perm[i] = i;
  for (let i = 255; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [perm[i], perm[j]] = [perm[j], perm[i]];
  }
  for (let i = 0; i < 256; i++) perm[i + 256] = perm[i];
}

function fade(t) { return t * t * t * (t * (t * 6 - 15) + 10); }
function lerp(a, b, t) { return a + t * (b - a); }
function dot2(g, x, y) { return g[0] * x + g[1] * y; }

function noise2d(x, y) {
  const X = Math.floor(x) & 255, Y = Math.floor(y) & 255;
  x -= Math.floor(x); y -= Math.floor(y);
  const u = fade(x), v = fade(y);
  const aa = perm[perm[X]+Y], ab = perm[perm[X]+Y+1];
  const ba = perm[perm[X+1]+Y], bb = perm[perm[X+1]+Y+1];
  return lerp(
    lerp(dot2(grad[aa&7],x,y), dot2(grad[ba&7],x-1,y), u),
    lerp(dot2(grad[ab&7],x,y-1), dot2(grad[bb&7],x-1,y-1), u), v
  );
}

// ─── Canvas ────────────────────────────────────────────────────
function sizeCanvas() {
  dpr = window.devicePixelRatio || 1;
  cssW = canvas.clientWidth;
  cssH = canvas.clientHeight;
  canvas.width = cssW * dpr;
  canvas.height = cssH * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

// ─── Particles ─────────────────────────────────────────────────
function createParticle() {
  const isCoral = Math.random() < CORAL_RATIO;
  const rgb   = isCoral ? CORAL_RGB : BLUE_RGB;
  const range = isCoral ? CORAL_OPACITY : BLUE_OPACITY;
  const baseOpacity = range.min + Math.random() * (range.max - range.min);
  const x = Math.random() * cssW;
  const y = Math.random() * cssH;

  return {
    x, y,
    rgb,
    baseOpacity,
    size: SIZE_MIN + Math.random() * (SIZE_MAX - SIZE_MIN),
    trail: [{ x, y }],   // position history
  };
}

function spawnParticles() {
  particles = [];
  for (let i = 0; i < PARTICLE_COUNT; i++) particles.push(createParticle());
}

// ─── Drawing ───────────────────────────────────────────────────
function drawTrail(p) {
  const len = p.trail.length;
  if (len < 2) return;

  for (let i = 1; i < len; i++) {
    // Opacity fades from 0 (oldest) to baseOpacity (newest)
    const t = i / (len - 1);
    const opacity = t * p.baseOpacity;

    ctx.beginPath();
    ctx.moveTo(p.trail[i - 1].x, p.trail[i - 1].y);
    ctx.lineTo(p.trail[i].x, p.trail[i].y);
    ctx.strokeStyle = `rgba(${p.rgb}, ${opacity})`;
    ctx.lineWidth = p.size;
    ctx.stroke();
  }
}

// ─── Loop ──────────────────────────────────────────────────────
function frame() {
  if (paused) return;

  // Full clear each frame — no ghost artifacts
  ctx.fillStyle = COLOR_BG;
  ctx.fillRect(0, 0, cssW, cssH);

  time += TIME_STEP;

  for (let i = 0; i < particles.length; i++) {
    const p = particles[i];

    const angle = noise2d(p.x * NOISE_SCALE, p.y * NOISE_SCALE + time) * Math.PI * 4;
    p.x += Math.cos(angle) * PARTICLE_SPEED;
    p.y += Math.sin(angle) * PARTICLE_SPEED;

    // Respawn if out of bounds
    if (p.x < -10 || p.x > cssW + 10 || p.y < -10 || p.y > cssH + 10) {
      p.x = Math.random() * cssW;
      p.y = Math.random() * cssH;
      p.trail = [{ x: p.x, y: p.y }];
    }

    // Push new position, trim to TRAIL_LENGTH
    p.trail.push({ x: p.x, y: p.y });
    if (p.trail.length > TRAIL_LENGTH) p.trail.shift();

    drawTrail(p);
  }

  animId = requestAnimationFrame(frame);
}

// ─── Lifecycle ─────────────────────────────────────────────────
function start() {
  if (animId) return;
  paused = false;
  animId = requestAnimationFrame(frame);
}

function stop() {
  paused = true;
  if (animId) { cancelAnimationFrame(animId); animId = null; }
}

export function initHero() {
  canvas = document.getElementById('hero-canvas');
  if (!canvas) return;
  ctx = canvas.getContext('2d');

  initNoise();
  sizeCanvas();
  ctx.fillStyle = COLOR_BG;
  ctx.fillRect(0, 0, cssW, cssH);
  spawnParticles();

  // Reduced motion: static dots, no loop
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    for (const p of particles) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.rgb}, ${p.baseOpacity})`;
      ctx.fill();
    }
    return;
  }

  // Pause off-screen
  new IntersectionObserver(
    ([e]) => { e.isIntersecting ? start() : stop(); }, { threshold: 0.05 }
  ).observe(canvas);

  // Pause on tab hide
  document.addEventListener('visibilitychange', () => {
    document.hidden ? stop() : start();
  });

  // Resize
  let t;
  window.addEventListener('resize', () => {
    clearTimeout(t);
    t = setTimeout(() => {
      sizeCanvas();
      ctx.fillStyle = COLOR_BG;
      ctx.fillRect(0, 0, cssW, cssH);
      for (const p of particles) {
        p.x = Math.random() * cssW;
        p.y = Math.random() * cssH;
        p.trail = [{ x: p.x, y: p.y }];
      }
    }, 150);
  });

  start();
}