// Print and paper: the paper themes are printed matter, seen by one warm lamp from the upper left.
//
// - The ink is not set in clean pixels: it takes unevenly (a worn grain with the odd void where a
//   fibre of the paper didn't take it). The type also spreads a touch at its edges (a text-shadow
//   in tokens.css; the canvas music skips it, as it would cost a copy of the canvas). Parchment's ink sinks into
//   the skin (multiplied: the paper shows through it); night paper's ink is an opaque body colour
//   lying on the dark card (where it didn't take, the card shows).
// - Colour that is paint (the covers' voice lines) is gouache with a body: lit along the edges that
//   face the lamp, in shade on the others, casting a small shadow on the paper.
// - The cards are handmade sheets with a deckle edge; gold is foil (night) or leaf (parchment)
//   that catches the light as it moves.
//
// This module generates the textures once per material input and publishes them as live CSS
// inputs (`--ds-print-*-live`, consumed by roles in tokens.css), and supplies the canvas helpers
// (printInPlace, InkLayer, gouache) to the sheet view and the covers. Strengths and colours come from each
// theme's `print-*` roles; a theme without paper (Velvet) publishes nothing.

import { readTheme, subscribeTheme, type ThemeSnapshot } from './design-system/theme';

const TILE = 256; // device pixels; repeats unnoticed at this size
// The wear's statistics: on average, how blotchy, how grainy; voids and fibres per tile.
const WEAR_MEAN = 0.06;
const WEAR_BLOTCH = 0.3;
const WEAR_GRAIN = 0.24;
const VOIDS = 300;
const FIBRES = 60;

/** A small deterministic random source, so the paper is the same on every visit. */
function seeded(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Smooth noise that wraps at the tile's edges (value noise on a `cells`-wide grid). */
function wrappingNoise(random: () => number, cells: number): (x: number, y: number) => number {
  const grid = Array.from({ length: cells * cells }, random);
  const at = (i: number, j: number) => grid[((j % cells) + cells) % cells * cells + (((i % cells) + cells) % cells)];
  const ease = (t: number) => t * t * (3 - 2 * t);
  return (x, y) => {
    const fx = (x / TILE) * cells;
    const fy = (y / TILE) * cells;
    const i = Math.floor(fx);
    const j = Math.floor(fy);
    const u = ease(fx - i);
    const v = ease(fy - j);
    const top = at(i, j) * (1 - u) + at(i + 1, j) * u;
    const bottom = at(i, j + 1) * (1 - u) + at(i + 1, j + 1) * u;
    return top * (1 - v) + bottom * v;
  };
}

/** The wear: per pixel, how much of the ink the paper takes away (alpha 0..1), in `mask` paint. */
let wearTile: HTMLCanvasElement | null = null;
let wearPaint = '';
function wear(theme: ThemeSnapshot): HTMLCanvasElement {
  const paint = theme.color('canvas-mask').css;
  const tooth = role(theme, 'print-tooth');
  if (wearTile && wearPaint === paint + tooth) return wearTile;
  const random = seeded(1905);
  const blotch = wrappingNoise(random, 9);
  const fine = wrappingNoise(random, 64);
  const patches = wrappingNoise(random, 6);
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = TILE;
  const ctx = canvas.getContext('2d')!;
  // The alpha field first, in the mask paint at full strength...
  ctx.fillStyle = paint;
  ctx.fillRect(0, 0, TILE, TILE);
  const img = ctx.getImageData(0, 0, TILE, TILE);
  for (let y = 0; y < TILE; y++) {
    for (let x = 0; x < TILE; x++) {
      let a = WEAR_MEAN + (blotch(x, y) - 0.5) * WEAR_BLOTCH + (fine(x, y) - 0.5) * WEAR_GRAIN + (random() - 0.5) * 0.05;
      // The tooth: where the card's grain lies low the ink didn't reach -- fine specks, clean through,
      // thick in some patches and nearly absent in others (the roller ran unevenly).
      const patch = Math.max(0, patches(x, y) - 0.35) / 0.65;
      if (random() < tooth * (0.03 + 0.3 * patch * patch)) a = Math.max(a, 0.7 + random() * 0.3);
      img.data[(y * TILE + x) * 4 + 3] = Math.max(0, Math.min(255, a * 255));
    }
  }
  ctx.putImageData(img, 0, 0);
  ctx.fillStyle = paint;
  ctx.strokeStyle = paint;
  // ...then the voids: small, round-ish, mostly faint, now and then clean through...
  for (let i = 0; i < VOIDS * (1 + 2 * tooth); i++) {
    const x = random() * TILE;
    const y = random() * TILE;
    const r = 0.6 + random() * random() * 1.8;
    ctx.globalAlpha = 0.35 + random() * 0.55;
    for (const [dx, dy] of [[0, 0], [TILE, 0], [-TILE, 0], [0, TILE], [0, -TILE]]) {
      ctx.beginPath();
      ctx.ellipse(x + dx, y + dy, r, r * (0.6 + random() * 0.5), random() * Math.PI, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  // ...and the fibres that didn't take it: short, thin, slightly bent, mostly along the sheet.
  ctx.lineCap = 'round';
  for (let i = 0; i < FIBRES; i++) {
    const x = random() * TILE;
    const y = random() * TILE;
    const len = 3 + random() * 8;
    const angle = (random() - 0.5) * 1.2;
    ctx.globalAlpha = 0.25 + random() * 0.35;
    ctx.lineWidth = 0.6 + random() * 0.5;
    for (const [dx, dy] of [[0, 0], [TILE, 0], [-TILE, 0], [0, TILE], [0, -TILE]]) {
      ctx.beginPath();
      ctx.moveTo(x + dx, y + dy);
      ctx.quadraticCurveTo(x + dx + Math.cos(angle) * len * 0.5, y + dy + Math.sin(angle) * len * 0.5 + (random() - 0.5) * 2, x + dx + Math.cos(angle) * len, y + dy + Math.sin(angle) * len);
      ctx.stroke();
    }
  }
  ctx.globalAlpha = 1;
  wearTile = canvas;
  wearPaint = paint + tooth;
  return canvas;
}

const mod = (a: number, n: number) => ((a % n) + n) % n;
const role = (theme: ThemeSnapshot, name: string) => Number.parseFloat(theme.roles[name] ?? '0') || 0;

const wearPatterns = new WeakMap<CanvasRenderingContext2D, { tile: HTMLCanvasElement; pattern: CanvasPattern }>();
function wearPattern(ctx: CanvasRenderingContext2D, theme: ThemeSnapshot): CanvasPattern {
  const tile = wear(theme);
  let entry = wearPatterns.get(ctx);
  if (!entry || entry.tile !== tile) {
    entry = { tile, pattern: ctx.createPattern(tile, 'repeat')! };
    wearPatterns.set(ctx, entry);
  }
  return entry.pattern;
}

// ---- the music printed (sheet view) ------------------------------------------------------------

type Area = { x: number; y: number; w: number; h: number };

/** Whether this theme prints its music (a paper theme with a wear strength). */
export function printsMusic(theme: ThemeSnapshot = readTheme()) {
  return theme.material.surface === 'paper' && role(theme, 'print-music-wear') > 0;
}

/**
 * A layer for music to be drawn into before it is pressed into the paper (press), where the paper
 * is already under it (the sheet view's cached margin). It is only as large as `area` (in the
 * canvas's current coordinates), so clearing, the wear and the copy stay with that part.
 */
export class InkLayer {
  private canvas = document.createElement('canvas');
  readonly ctx = this.canvas.getContext('2d')!;
  private area: Area = { x: 0, y: 0, w: 0, h: 0 };

  begin(onto: CanvasRenderingContext2D, area: Area): CanvasRenderingContext2D {
    const { width, height } = onto.canvas;
    const m = onto.getTransform();
    const x0 = Math.max(0, Math.floor(m.a * area.x + m.e));
    const y0 = Math.max(0, Math.floor(m.d * area.y + m.f));
    const x1 = Math.min(width, Math.ceil(m.a * (area.x + area.w) + m.e));
    const y1 = Math.min(height, Math.ceil(m.d * (area.y + area.h) + m.f));
    this.area = { x: x0, y: y0, w: Math.max(0, x1 - x0), h: Math.max(0, y1 - y0) };
    // (It only grows -- in steps, so a stretch that widens a little does not reallocate it.)
    const w = Math.ceil(this.area.w / 64) * 64;
    const h = Math.ceil(this.area.h / 64) * 64;
    if (this.canvas.width < w || this.canvas.height < h) {
      this.canvas.width = Math.max(this.canvas.width, w);
      this.canvas.height = Math.max(this.canvas.height, h);
    } else {
      this.ctx.setTransform(1, 0, 0, 1, 0, 0);
      this.ctx.clearRect(0, 0, this.area.w, this.area.h);
    }
    this.ctx.setTransform(m.a, m.b, m.c, m.d, m.e - x0, m.f - y0);
    this.ctx.globalAlpha = 1;
    this.ctx.globalCompositeOperation = 'source-over';
    return this.ctx;
  }

  /**
   * Presses what was drawn into the paper of `onto`: worn by the paper's grain (anchored at
   * `anchor`, in `onto`'s coordinates, so the wear moves with the paper), then multiplied into
   * parchment or laid opaquely on night paper (the material strategy), unless `composite` says.
   */
  press(onto: CanvasRenderingContext2D, anchor: { x: number; y: number }, theme: ThemeSnapshot = readTheme(), composite?: GlobalCompositeOperation) {
    const { x, y, w, h } = this.area;
    if (!w || !h) return;
    const at = onto.getTransform().transformPoint(new DOMPoint(anchor.x, anchor.y));
    printInPlace(this.ctx, { x: 0, y: 0, w, h }, { x: at.x - x, y: at.y - y }, theme);
    onto.save();
    onto.setTransform(1, 0, 0, 1, 0, 0);
    onto.globalCompositeOperation = composite ?? (theme.material.strategy === 'ink' ? 'multiply' : 'source-over');
    onto.drawImage(this.canvas, 0, 0, w, h, x, y, w, h);
    onto.restore();
  }
}

/**
 * Prints music already drawn alone on a canvas (nothing else under it), in place: in the device
 * rect `area`, worn by the paper's grain anchored at the device point `at` (where the paper's
 * origin is). One fill, no copy of the canvas: it runs for every slice the sheet view pre-paints.
 */
export function printInPlace(ctx: CanvasRenderingContext2D, area: Area, at: { x: number; y: number }, theme: ThemeSnapshot = readTheme()) {
  const { x, y, w, h } = area;
  if (!w || !h) return;
  const pattern = wearPattern(ctx, theme);
  pattern.setTransform(new DOMMatrix([1, 0, 0, 1, mod(at.x, TILE), mod(at.y, TILE)]));
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalCompositeOperation = 'destination-out';
  ctx.globalAlpha = role(theme, 'print-music-wear');
  ctx.fillStyle = pattern;
  ctx.fillRect(x, y, w, h);
  ctx.restore();
}

// ---- gouache (the covers) ------------------------------------------------------------------------

let paint: HTMLCanvasElement | null = null;
let edge: HTMLCanvasElement | null = null;

/** Whether this theme paints its covers in gouache (a body of paint; night paper). */
export function paintsGouache(theme: ThemeSnapshot = readTheme()) {
  return theme.material.surface === 'paper' && role(theme, 'print-gouache-rim') > 0;
}

/**
 * Paints what `draw` draws (in `onto`'s current coordinates) as gouache: worn where the brush ran
 * thin, its edges toward the lamp (upper left) lit, those away from it in shade, and a small
 * shadow of its body on the paper. For pictures painted once (the covers), not per frame.
 */
export function gouache(onto: CanvasRenderingContext2D, draw: (ctx: CanvasRenderingContext2D) => void, theme: ThemeSnapshot = readTheme()) {
  const { width, height } = onto.canvas;
  const m = onto.getTransform();
  paint ??= document.createElement('canvas');
  edge ??= document.createElement('canvas');
  for (const c of [paint, edge]) {
    c.width = width;
    c.height = height;
  }
  const p = paint.getContext('2d')!;
  p.setTransform(m);
  draw(p);
  p.setTransform(1, 0, 0, 1, 0, 0);
  // Where the brush ran thin.
  const pattern = wearPattern(p, theme);
  pattern.setTransform(new DOMMatrix([1, 0, 0, 1, mod(m.e, TILE), mod(m.f, TILE)]));
  p.globalCompositeOperation = 'destination-out';
  p.globalAlpha = role(theme, 'print-gouache-wear');
  p.fillStyle = pattern;
  p.fillRect(0, 0, width, height);
  p.globalAlpha = 1;
  p.globalCompositeOperation = 'source-over';
  const px = Math.max(1, m.a); // device px per CSS px
  const e = edge.getContext('2d')!;
  /** The body's silhouette in one paint, less itself moved by (dx, dy) CSS px: its edge on that side. */
  const rim = (fill: string, dx: number, dy: number) => {
    e.globalCompositeOperation = 'source-over';
    e.clearRect(0, 0, width, height);
    e.drawImage(paint!, 0, 0);
    e.globalCompositeOperation = 'source-in';
    e.fillStyle = fill;
    e.fillRect(0, 0, width, height);
    if (dx || dy) {
      e.globalCompositeOperation = 'destination-out';
      e.drawImage(paint!, dx * px, dy * px);
    }
  };
  const lit = theme.color('material-light-warm').css;
  const shade = theme.color('score-row-shadow').css;
  onto.save();
  onto.setTransform(1, 0, 0, 1, 0, 0);
  // Its shadow on the paper, a little below and to the right.
  rim(shade, 0, 0);
  onto.globalAlpha = role(theme, 'print-gouache-shadow');
  onto.drawImage(edge, 0.45 * px, 0.9 * px);
  onto.globalAlpha = 1;
  onto.drawImage(paint, 0, 0);
  // The edges facing the lamp, lit; those facing away, in shade.
  rim(lit, 0.6, 0.9);
  onto.globalAlpha = role(theme, 'print-gouache-rim');
  onto.drawImage(edge, 0, 0);
  rim(shade, -0.5, -0.8);
  onto.globalAlpha = role(theme, 'print-gouache-shade');
  onto.drawImage(edge, 0, 0);
  onto.restore();
}

// ---- deckle edge (cards) ------------------------------------------------------------------------
// The edge of handmade paper: wavy, a little frayed, never straight. Each side of a card is a
// half-plane with a ragged edge (an SVG path, sharp at any resolution), repeating along the side;
// the card is what all four leave (mask-composite intersect). The SVG draws in the mask paint.
const DECKLE_LEN = 256; // CSS px along the edge before it repeats
const DECKLE_REACH = 2000; // CSS px of paper behind the edge (more than any card is long)
const DECKLE_SPILL = 6; // the edge runs on past the tile, so the softening has paper there too

function deckleProfile(random: () => number): number[] {
  const periodic = (cells: number) => {
    const values = Array.from({ length: cells }, random);
    return (x: number) => {
      const f = (x / DECKLE_LEN) * cells;
      const i = Math.floor(f);
      const t = f - i;
      const e = t * t * (3 - 2 * t);
      return values[i % cells] * (1 - e) + values[(i + 1) % cells] * e - 0.5;
    };
  };
  const wave = periodic(6);
  const ripple = periodic(37);
  const fray = periodic(128);
  return Array.from({ length: DECKLE_LEN + 1 }, (_, x) => 3.2 + wave(x % DECKLE_LEN) * 2.4 + ripple(x % DECKLE_LEN) * 1.1 + fray(x % DECKLE_LEN) * 0.7);
}

/** The four half-planes of a sheet, as CSS url()s: top, bottom, left, right. */
function deckleSides(seed: number, fill: string): Record<'top' | 'bottom' | 'left' | 'right', string> {
  const random = seeded(seed);
  const svg = (w: number, h: number, d: string) =>
    `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='${w}' height='${h}'><filter id='s'><feGaussianBlur stdDeviation='0.35'/></filter><path filter='url(#s)' fill='${fill}' d='${d}'/></svg>`)}")`;
  const side = () => deckleProfile(random).map((v) => v.toFixed(2));
  const [top, bottom, left, right] = [side(), side(), side(), side()];
  const L = DECKLE_LEN;
  const R = DECKLE_REACH;
  const S = DECKLE_SPILL;
  const along = (depth: string[], at: (d: number, t: number) => string) =>
    Array.from({ length: L + 2 * S + 1 }, (_, i) => i - S)
      .map((t) => at(Number(depth[((t % L) + L) % L]), t))
      .join('L');
  return {
    top: svg(L, R, `M${-S} ${R}L${along(top, (d, x) => `${x} ${d}`)}L${L + S} ${R}Z`),
    bottom: svg(L, R, `M${-S} 0L${along(bottom, (d, x) => `${x} ${(R - d).toFixed(2)}`)}L${L + S} 0Z`),
    left: svg(R, L, `M${R} ${-S}L${along(left, (d, y) => `${d} ${y}`)}L${R} ${L + S}Z`),
    right: svg(R, L, `M0 ${-S}L${along(right, (d, y) => `${(R - d).toFixed(2)} ${y}`)}L0 ${L + S}Z`),
  };
}

// ---- the live CSS inputs ------------------------------------------------------------------------

const LIVE = ['wear-display', 'wear-fine', 'voids', 'crinkle', ...['card', 'under'].flatMap((s) => ['top', 'bottom', 'left', 'right'].map((side) => `deckle-${s}-${side}`))];
let appliedKey = '';

/** A tile of the wear at `strength` (of its alpha), as a CSS url(). */
function wearUrl(theme: ThemeSnapshot, strength: number, fill?: string) {
  const c = document.createElement('canvas');
  c.width = c.height = TILE;
  const ctx = c.getContext('2d')!;
  ctx.globalAlpha = strength;
  ctx.drawImage(wear(theme), 0, 0);
  if (fill) {
    // The same pattern in another paint (the paper showing through a solid of ink).
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-in';
    ctx.fillStyle = fill;
    ctx.fillRect(0, 0, TILE, TILE);
  }
  return `url(${c.toDataURL('image/png')})`;
}

/** A mask that keeps the ink where the paper took it: full minus the wear at `strength`. */
function keepUrl(theme: ThemeSnapshot, strength: number) {
  const c = document.createElement('canvas');
  c.width = c.height = TILE;
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = theme.color('canvas-mask').css;
  ctx.fillRect(0, 0, TILE, TILE);
  ctx.globalCompositeOperation = 'destination-out';
  ctx.globalAlpha = strength;
  ctx.drawImage(wear(theme), 0, 0);
  return `url(${c.toDataURL('image/png')})`;
}

// ---- gold pressed into the card (debossed foil) ----------------------------------------------------
// The gold is stamped in: the upper wall of each stroke lies in shade, the lower one catches the
// lamp, and the card's lip below the stroke is lit. One SVG filter, its colours from the theme;
// elements take it through the --ds-print-gold-filter role (url(#ds-print-deboss)).
const SVG_NS = 'http://www.w3.org/2000/svg';
function deboss(theme: ThemeSnapshot) {
  let svg = document.getElementById('ds-print-filters') as SVGSVGElement | null;
  if (!svg) {
    svg = document.createElementNS(SVG_NS, 'svg') as SVGSVGElement;
    svg.id = 'ds-print-filters';
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('width', '0');
    svg.setAttribute('height', '0');
    svg.style.position = 'absolute';
    svg.innerHTML = `<defs><filter id="ds-print-deboss" x="-10%" y="-25%" width="120%" height="150%" color-interpolation-filters="sRGB">
  <feComponentTransfer in="SourceAlpha" result="solid"><feFuncA type="linear" slope="3" intercept="-1"/></feComponentTransfer>
  <feComponentTransfer in="solid" result="hole"><feFuncA type="table" tableValues="1 0"/></feComponentTransfer>
  <feOffset in="hole" dx="0.35" dy="0.9" result="fromAbove"/><feGaussianBlur in="fromAbove" stdDeviation="0.45" result="fromAboveSoft"/>
  <feFlood class="deboss-shade"/><feComposite operator="in" in2="fromAboveSoft"/><feComposite operator="in" in2="solid" result="wall"/>
  <feOffset in="hole" dx="-0.2" dy="-0.7" result="fromBelow"/><feGaussianBlur in="fromBelow" stdDeviation="0.4" result="fromBelowSoft"/>
  <feFlood class="deboss-light"/><feComposite operator="in" in2="fromBelowSoft"/><feComposite operator="in" in2="solid" result="floor"/>
  <feOffset in="solid" dy="0.6" result="below"/><feComposite in="below" in2="solid" operator="out" result="lipShape"/>
  <feFlood class="deboss-lip"/><feComposite operator="in" in2="lipShape" result="lip"/>
  <feMerge><feMergeNode in="lip"/><feMergeNode in="SourceGraphic"/><feMergeNode in="wall"/><feMergeNode in="floor"/></feMerge>
</filter></defs>`;
    document.body.appendChild(svg);
  }
  const set = (cls: string, color: { css: string }, opacity: number) => {
    const flood = svg.querySelector(`.${cls}`);
    flood?.setAttribute('flood-color', color.css);
    flood?.setAttribute('flood-opacity', String(opacity));
    // (Unused by a flood, but SVG paints all the same: kept in the theme's paint like the rest.)
    flood?.setAttribute('lighting-color', color.css);
    flood?.setAttribute('stop-color', color.css);
  };
  const depth = role(theme, 'print-gold-deboss');
  set('deboss-shade', theme.color('score-row-shadow'), 0.55 * depth);
  set('deboss-light', theme.color('material-light-warm'), 0.4 * depth);
  set('deboss-lip', theme.color('material-light-warm'), 0.07 * depth);
}

function applyCss(theme: ThemeSnapshot) {
  const root = document.documentElement.style;
  const strengths = ['print-type-wear', 'print-type-wear-fine', 'print-solid-voids', 'print-foil-crinkle'].map((r) => role(theme, r));
  const extra = ['print-tooth', 'print-gold-deboss'].map((r) => role(theme, r));
  const key = JSON.stringify([theme.material.surface, strengths, extra, theme.color('canvas-mask').css, theme.color('page-background').css, theme.color('score-row-shadow').css, theme.color('material-light-warm').css]);
  if (key === appliedKey) return;
  appliedKey = key;
  if (theme.material.surface !== 'paper' || strengths.every((s) => !s)) {
    for (const name of LIVE) root.removeProperty(`--ds-print-${name}-live`);
    return;
  }
  const [display, fine, voids, crinkle] = strengths;
  deboss(theme);
  root.setProperty('--ds-print-wear-display-live', keepUrl(theme, display));
  root.setProperty('--ds-print-wear-fine-live', keepUrl(theme, fine));
  root.setProperty('--ds-print-voids-live', wearUrl(theme, voids, theme.color('page-background').css));
  root.setProperty('--ds-print-crinkle-live', wearUrl(theme, crinkle));
  // Two sheets: the card, and the one lying under it in the stack -- each with its own edge.
  for (const [name, seed] of [['card', 1907], ['under', 2213]] as const) {
    const sides = deckleSides(seed, theme.color('canvas-mask').css);
    for (const side of ['top', 'bottom', 'left', 'right'] as const) root.setProperty(`--ds-print-deckle-${name}-${side}-live`, sides[side]);
  }
}

// ---- foil and leaf that catch the light --------------------------------------------------------
// Gold is a mirror: a band of light lies on it where the lamp is reflected, moving as the light
// does -- the mouse, or a phone turning (where the browser tells without asking). The band is the
// first background layer of the foil surface; only its position moves. Still for anyone who asked
// for less motion.
const FOIL = '.wordmark[aria-label="LightScore"], .ls-s, .ded-name';
let sheenStarted = false;

function startSheen() {
  if (sheenStarted || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  sheenStarted = true;
  let target: { x: number; y: number } | null = null;
  let frame = 0;
  const shine = () => {
    frame = 0;
    if (!target) return;
    for (const el of document.querySelectorAll<HTMLElement>(FOIL)) {
      const r = el.getBoundingClientRect();
      if (!r.width) continue;
      // Where the light is, across the foil: the band lies a little ahead of it.
      const across = Math.max(0, Math.min(1, (target.x - r.left) / r.width));
      el.style.backgroundPosition = `${Math.round((1 - across) * 100)}% 0, 0 0, 0 0`;
    }
  };
  const aim = (x: number, y: number) => {
    target = { x, y };
    if (!frame) frame = requestAnimationFrame(shine);
  };
  if (matchMedia('(hover: hover) and (pointer: fine)').matches) {
    addEventListener('pointermove', (e) => aim(e.clientX, e.clientY), { passive: true });
  } else {
    addEventListener('deviceorientation', (e) => {
      if (e.gamma == null || e.beta == null) return;
      aim(((e.gamma + 30) / 60) * innerWidth, ((e.beta - 20) / 60) * innerHeight);
    });
  }
}

let initialized = false;
/** Publishes the print textures for the current theme, and keeps them current; starts the sheen. */
export function initPrintMaterial() {
  if (initialized) return;
  initialized = true;
  subscribeTheme((theme) => applyCss(theme), { immediate: true });
  startSheen();
}
