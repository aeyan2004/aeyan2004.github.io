/* =====================================================================
   Ian Palallos Portfolio  -  main.js  (plain JavaScript, no build step)

   Sections, in the order they appear below:

     0. Shared
     1. PAGE SETUP: footer year, seamless tools strip
     2. INTRO LOADER: orbiting sun, then aeyan > [aeyan] > [ae]
     3. NAVBAR: [ae] logo scrolls to the top
     4. NAVBAR: highlight the section in view
     5. NAVBAR: mark the current page
     6. THEME SWITCHER: solarized (dark) / light / dark
     7. HERO: headline letters pop in
     8. HERO: typing effect
     9. REVEAL ON SCROLL
     10. SCROLL PROGRESS BAR
     11. SKILLS BACKGROUND: letter-glitch canvas
     12. SKILLS ACCORDION: opens on hover
     13. CUSTOM ARROW CURSOR
     14. SOCIAL LOGOS (+ phones: email opens the mail app)
   ===================================================================== */

// ---------------------------------------------------------------------
// 0. SHARED
// ---------------------------------------------------------------------
const root = document.documentElement;   // <html>: holds data-theme and the loader state classes

// <html data-switching> is on while a big animation runs (intro loader, theme reveal).
// PrismBackground.jsx waits for the "uisettled" event before starting its WebGL work,
// so the shader compile never lands in the middle of an animation.
let pending = 0;
const busy = () => { pending++; root.setAttribute('data-switching', ''); };
const settled = () => {
  if (--pending > 0) return;
  pending = 0;
  root.removeAttribute('data-switching');
  dispatchEvent(new Event('uisettled'));
};


// ---------------------------------------------------------------------
// 1. PAGE SETUP: footer year, seamless tools strip
// ---------------------------------------------------------------------
document.getElementById('year').textContent = new Date().getFullYear();

// Duplicate the tools strip so the scrolling loop is seamless
const track = document.querySelector('.track');
if (track) track.innerHTML += track.innerHTML;


// ---------------------------------------------------------------------
// 2. INTRO LOADER: orbiting sun, then aeyan > [aeyan] > [ae]
// ---------------------------------------------------------------------
const loader = document.getElementById('loader');

if (loader && root.classList.contains('seen')) loader.remove();
else if (loader) {
  busy();
  const letters = [...loader.querySelectorAll('h2 span')];
  const sun = loader.querySelector('.sun');
  const ring = loader.querySelector('.orbit');
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const seg = (t, a, b) => clamp((t - a) / (b - a));
  const inOut = p => (p < 0.5 ? 4 * p ** 3 : 1 - (-2 * p + 2) ** 3 / 2);
  const back = p => 1 + 2.2 * (p - 1) ** 3 + 1.2 * (p - 1) ** 2;
  const loaded = new Promise(r => {
    if (document.readyState === 'complete') r(); else addEventListener('load', r);
    setTimeout(r, 8000);
  });

  const finish = () => loaded.then(() => {
    loader.classList.add('done');
    root.classList.add('ready');
    settled();
    try { sessionStorage.seen = 1; } catch (_) {}
    setTimeout(() => loader.remove(), 1000);
  });

  // after the letters land: aeyan > [aeyan] > [ae], then the screen lifts
  const bracket = () => {
    setTimeout(() => loader.classList.add('br-in'), 50);   // brackets appear
    setTimeout(() => loader.classList.add('fold'), 900);   // "yan" folds away, [ae] slides to center
    setTimeout(finish, 2050);                              // screen lifts
  };

  if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
    letters.forEach(l => l.classList.add('landed'));
    bracket();
  } else {
    const fs = parseFloat(getComputedStyle(loader.querySelector('h2')).fontSize);
    const s0 = clamp(46 / fs, 0.4, 0.85);
    const RIGHT_TO_LEFT = false;            // true: letters land n-a-y-e-a instead of a-e-y-a-n
    const FASTER = 300;                     // ms trimmed off the orbiting part (raise it for a quicker intro)
    const LAND_AT = 2000 - FASTER, GAP = 240, DUR = 650;
    const rank = i => (RIGHT_TO_LEFT ? letters.length - 1 - i : i);
    const lastEnd = LAND_AT + (letters.length - 1) * GAP + DUR;
    const t0 = performance.now();

    const frame = now => {
      const t = now - t0;
      const cx = innerWidth / 2;
      const cy = innerHeight / 2;
      const R = clamp(Math.min(innerWidth, innerHeight) * 0.24, 80, 170);
      const spin = t * Math.PI * 2 / 2800;
      const out = inOut(seg(t, 1200 - FASTER, LAND_AT));
      const inn = seg(t, 0, 600);

      loader.style.setProperty('--R', R + 'px');
      sun.style.opacity = inn * (1 - out);
      sun.style.transform = `scale(${(0.6 + 0.4 * (1 - (1 - inn) ** 3)) * (1 - 0.7 * out)})`;  // zooms OUT as it fades
      ring.style.opacity = 0.55 * seg(t, 200, 800) * (1 - out);

      letters.forEach((el, i) => {
        const from = LAND_AT + rank(i) * GAP;
        const k = seg(t, from, from + DUR);
        const p = inOut(k);
        const s = s0 + (1 - s0) * back(k);
        const a = -Math.PI / 2 + (i * 2 * Math.PI) / letters.length + spin;
        const ox = cx + R * Math.cos(a);
        const oy = cy + R * Math.sin(a);
        const fx = el.offsetLeft + el.offsetWidth / 2;
        const fy = el.offsetTop + el.offsetHeight / 2;
        el.style.opacity = seg(t, 250 + i * 110, 700 + i * 110);
        el.style.transform = `translate(${ox + (fx - ox) * p - fx}px,${oy + (fy - oy) * p - fy}px) scale(${s})`;
        if (k > 0) el.classList.add('landed');
      });

      if (t < lastEnd) requestAnimationFrame(frame);
      else {
        letters.forEach(el => { el.style.opacity = ''; el.style.transform = ''; });
        bracket();
      }
    };
    requestAnimationFrame(frame);
  }
}


// ---------------------------------------------------------------------
// 3. NAVBAR: [ae] logo scrolls to the top
// ---------------------------------------------------------------------
const logo = document.querySelector('.logo');
if (logo) logo.addEventListener('click', e => { e.preventDefault(); scrollTo({ top: 0, behavior: 'smooth' }); });


// ---------------------------------------------------------------------
// 4. NAVBAR: highlight the section in view
// ---------------------------------------------------------------------
const links = document.querySelectorAll('.nav a');

const so = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id));
    }
  });
}, { rootMargin: '-45% 0px -50% 0px' });

document.querySelectorAll('section[id]').forEach(s => so.observe(s));


// ---------------------------------------------------------------------
// 5. NAVBAR: mark the current page
// ---------------------------------------------------------------------
const cleanPath = s => s.replace(/index\.html$/, '').replace(/\.html$/, '').replace(/\/+$/, '') || '/';
links.forEach(a => {
  if (a.getAttribute('href').startsWith('#')) return;
  if (cleanPath(a.pathname) === cleanPath(location.pathname)) a.classList.add('page');
});


// ---------------------------------------------------------------------
// 6. THEME SWITCHER: solarized (dark) / light / dark
// ---------------------------------------------------------------------
const ORDER = ['solarized', 'light', 'dark'];
if (!ORDER.includes(root.dataset.theme)) root.dataset.theme = 'solarized';
const tbox = document.querySelector('.themes');
const tbtns = document.querySelectorAll('.themes button');
const mark = () => {
  tbox.style.setProperty('--i', ORDER.indexOf(root.dataset.theme));
  tbtns.forEach(b => b.classList.toggle('on', b.dataset.t === root.dataset.theme));
};
mark();

tbtns.forEach(b => b.addEventListener('click', () => {
  if (b.dataset.t === root.dataset.theme) return;

  const apply = () => {
    root.dataset.theme = b.dataset.t;
    try { localStorage.setItem('aeyan-theme', b.dataset.t); } catch (_) {}
    mark();
    init();
  };

  if (!document.startViewTransition || matchMedia('(prefers-reduced-motion: reduce)').matches) return apply();

  const k = b.getBoundingClientRect();
  const x = k.left + k.width / 2;
  const y = k.top + k.height / 2;
  const rad = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));

  busy();
  const vt = document.startViewTransition(apply);
  vt.finished.then(settled, settled);
  vt.ready.then(() => root.animate(
    { clipPath: [`circle(0 at ${x}px ${y}px)`, `circle(${rad}px at ${x}px ${y}px)`] },
    { duration: 800, easing: 'ease-in-out', pseudoElement: '::view-transition-new(root)' }
  )).catch(() => {});
}));


// ---------------------------------------------------------------------
// 7. HERO: headline letters pop in
// ---------------------------------------------------------------------
let n = 0;
const h1 = document.querySelector('h1');

Array.from(h1.childNodes).forEach(node => {
  if (node.nodeType !== 3) return;

  const frag = document.createDocumentFragment();
  let word = null;   // each word gets its own no-wrap box, so a line can only break between words

  [...node.textContent].forEach(ch => {
    if (ch === ' ') {
      word = null;
      frag.appendChild(document.createTextNode(' '));
      n++;
      return;
    }

    if (!word) {
      word = document.createElement('span');
      word.className = 'w';
      frag.appendChild(word);
    }

    const s = document.createElement('span');
    s.className = 'ch';
    s.textContent = ch;
    s.style.animationDelay = (n++ * 45) + 'ms';
    word.appendChild(s);
  });

  node.replaceWith(frag);
});


// ---------------------------------------------------------------------
// 8. HERO: typing effect
// ---------------------------------------------------------------------
const WORDS = ['IT support', 'system administration', 'networking', 'hardware troubleshooting', 'software troubleshooting']; // EDIT
const out = document.getElementById('typed') || document.createElement('span');

let w = 0;
let i = 0;
let del = false;

if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
  out.textContent = WORDS[0];
} else {
  (function type() {
    const word = WORDS[w];
    out.textContent = word.slice(0, i);

    if (!del && i === word.length) {
      del = true;
      return setTimeout(type, 1400);
    }

    if (del && i === 0) {
      del = false;
      w = (w + 1) % WORDS.length;
    }

    i += del ? -1 : 1;
    setTimeout(type, del ? 35 : 70);
  })();
}


// ---------------------------------------------------------------------
// 9. REVEAL ON SCROLL
// ---------------------------------------------------------------------
const reveals = document.querySelectorAll(
  '.lead, .portrait, .typed, .tools, details, #glitch, .eyebrow, .big, article, #contact p, .socials a, footer p'
);

const io = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('in');
      io.unobserve(e.target);
    }
  });
}, { threshold: 0.15 });

reveals.forEach(el => {
  el.classList.add('reveal');
  el.style.transitionDelay = Math.min([...el.parentElement.children].indexOf(el), 4) * 90 + 'ms';
  io.observe(el);
});


// ---------------------------------------------------------------------
// 10. SCROLL PROGRESS BAR
// ---------------------------------------------------------------------
const bar = document.querySelector('.progress');

addEventListener('scroll', () => {
  bar.style.transform = `scaleX(${scrollY / (document.documentElement.scrollHeight - innerHeight)})`;
}, { passive: true });


// ---------------------------------------------------------------------
// 11. SKILLS BACKGROUND: letter-glitch canvas
// ---------------------------------------------------------------------
const c = document.getElementById('glitch');
const g = c && c.getContext('2d');

let COLORS = [];
const loadColors = () => {
  const s = getComputedStyle(root);
  COLORS = ['--g1', '--g2', '--g3'].map(v => s.getPropertyValue(v).trim());
};
const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$&*()-_+=/[]{};:<>,';
const pick = a => a[Math.floor(Math.random() * a.length)];
const SIZE = 14;

let cols = 0;
let cells = [];
let gw = 0;   // canvas size in CSS pixels (the bitmap itself is scaled up for sharp text)
let gh = 0;

function draw() {
  g.clearRect(0, 0, gw, gh);
  g.font = SIZE + 'px monospace';
  g.textBaseline = 'top';

  cells.forEach((cell, i) => {
    g.fillStyle = cell.color;
    g.fillText(cell.ch, (i % cols) * SIZE * 0.75, Math.floor(i / cols) * SIZE);
  });
}

function init() {
  if (!c) return;
  loadColors();
  const r = c.getBoundingClientRect();
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  gw = r.width;
  gh = r.height;
  c.width = Math.round(gw * dpr);
  c.height = Math.round(gh * dpr);
  g.setTransform(dpr, 0, 0, dpr, 0, 0);

  cols = Math.ceil(gw / (SIZE * 0.75));
  cells = Array.from(
    { length: cols * Math.ceil(gh / SIZE) },
    () => ({ ch: pick(CHARS), color: pick(COLORS) })
  );

  draw();
}

init();

// On phones the address bar sliding in and out fires "resize" while scrolling; only rebuild if the width changed
window.addEventListener('resize', () => {
  if (c && Math.abs(c.getBoundingClientRect().width - gw) < 1) return;
  init();
});

if (c && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  // only animate while the canvas is on screen and the tab is visible
  let glitchOn = true;
  new IntersectionObserver(([e]) => { glitchOn = e.isIntersecting; }).observe(c);

  setInterval(() => {
    if (!glitchOn || document.hidden) return;
    for (let i = 0; i < cells.length * 0.04; i++) {
      cells[Math.floor(Math.random() * cells.length)] = { ch: pick(CHARS), color: pick(COLORS) };
    }
    draw();
  }, 60);
}


// ---------------------------------------------------------------------
// 12. SKILLS ACCORDION: opens while hovered, closes when the pointer leaves.
//     Keyboard focus opens it too; touch screens keep tap-to-toggle.
// ---------------------------------------------------------------------
const canHover = matchMedia('(hover: hover) and (pointer: fine)');
let lastPointer = 'mouse';
addEventListener('pointerdown', e => { lastPointer = e.pointerType; }, true);

document.querySelectorAll('details').forEach(d => {
  const mouseLike = e => e.pointerType === 'mouse' || e.pointerType === 'pen';
  d.addEventListener('pointerenter', e => { if (mouseLike(e)) d.open = true; });
  d.addEventListener('pointerleave', e => { if (mouseLike(e)) d.open = false; });
  d.addEventListener('focusin', e => { if (e.target.matches(':focus-visible')) d.open = true; });
  d.addEventListener('focusout', e => { if (!d.contains(e.relatedTarget)) d.open = false; });
  d.querySelector('summary').addEventListener('click', e => {
    if (canHover.matches && lastPointer !== 'touch') e.preventDefault();   // hover/focus drives it, not a click
  });
});


// ---------------------------------------------------------------------
// 13. CUSTOM ARROW CURSOR
// ---------------------------------------------------------------------
if (matchMedia('(hover: hover) and (pointer: fine)').matches) {
  const cur = document.querySelector('.cursor');
  const HOVER = 'a, summary, button, article, video';
  let pos = null;
  try { pos = JSON.parse(sessionStorage.cursorPos || 'null'); } catch (_) {}

  const hide = () => cur.classList.remove('on');
  const place = (x, y, el) => {
    if (el && el.closest('iframe')) return hide();   // can't track the mouse inside an embed
    pos = [x, y];
    cur.style.transform = `translate(${x}px,${y}px)`;
    cur.classList.toggle('hover', !!(el && el.closest(HOVER)));
    cur.classList.add('on');
  };

  addEventListener('pagehide', () => { try { if (pos) sessionStorage.cursorPos = JSON.stringify(pos); } catch (_) {} });

  // double click, right click and dragging bring up the real cursor, so the arrow
  // fades out and stays hidden until the mouse has moved a little
  let hold = null;
  const holdHidden = e => { hold = [e.clientX, e.clientY]; hide(); };
  addEventListener('mousemove', e => {
    if (hold) {
      if (Math.hypot(e.clientX - hold[0], e.clientY - hold[1]) < 12) return;
      hold = null;
    }
    // dragging to select text: the real cursor takes over, so the arrow stays hidden
    if (e.buttons & 1 && !getSelection().isCollapsed) return hide();
    place(e.clientX, e.clientY, e.target);
  });
  addEventListener('contextmenu', holdHidden);
  addEventListener('dblclick', holdHidden);
  addEventListener('dragstart', holdHidden);

  // fade out when the mouse leaves the page or the window loses focus (e.g. clicking into a video)
  document.addEventListener('mouseout', e => { if (!e.relatedTarget || e.relatedTarget.nodeName === 'IFRAME') hide(); });
  addEventListener('blur', hide);

  addEventListener('mousedown', e => {
    if (e.button === 2 || e.detail > 1) return holdHidden(e);   // right / double click: no ripple, fade out
    cur.classList.add('down');
    const r = document.createElement('div');
    r.className = 'ripple';
    r.style.left = e.clientX + 'px';
    r.style.top = e.clientY + 'px';
    document.body.appendChild(r);
    setTimeout(() => r.remove(), 600);
  });

  addEventListener('mouseup', () => cur.classList.remove('down'));
  addEventListener('dragend', () => cur.classList.remove('down'));
}


// ---------------------------------------------------------------------
// 14. SOCIAL LOGOS
// ---------------------------------------------------------------------
const ICONS = {
  gmail: "<svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path d=\"M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z\"/></svg>",
  facebook: "<svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path d=\"M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z\"/></svg>",
  linkedin: "<svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path d=\"M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z\"/></svg>",
  github: "<svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path d=\"M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12\"/></svg>",
  youtube: "<svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path d=\"M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z\"/></svg>",
  steam: "<svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path d=\"M11.979 0C5.678 0 .511 4.86.022 11.037l6.432 2.658c.545-.371 1.203-.59 1.912-.59.063 0 .125.004.188.006l2.861-4.142V8.91c0-2.495 2.028-4.524 4.524-4.524 2.494 0 4.524 2.031 4.524 4.527s-2.03 4.525-4.524 4.525h-.105l-4.076 2.911c0 .052.004.105.004.159 0 1.875-1.515 3.396-3.39 3.396-1.635 0-3.016-1.173-3.331-2.727L.436 15.27C1.862 20.307 6.486 24 11.979 24c6.627 0 11.999-5.373 11.999-12S18.605 0 11.979 0zM7.54 18.21l-1.473-.61c.262.543.714.999 1.314 1.25 1.297.539 2.793-.076 3.332-1.375.263-.63.264-1.319.005-1.949s-.75-1.121-1.377-1.383c-.624-.26-1.29-.249-1.878-.03l1.523.63c.956.4 1.409 1.5 1.009 2.455-.397.957-1.497 1.41-2.454 1.012H7.54zm11.415-9.303c0-1.662-1.353-3.015-3.015-3.015-1.665 0-3.015 1.353-3.015 3.015 0 1.665 1.35 3.015 3.015 3.015 1.663 0 3.015-1.35 3.015-3.015zm-5.273-.005c0-1.252 1.013-2.266 2.265-2.266 1.249 0 2.266 1.014 2.266 2.266 0 1.251-1.017 2.265-2.266 2.265-1.253 0-2.265-1.014-2.265-2.265z\"/></svg>"
};
document.querySelectorAll('[data-icon]').forEach(el => { el.innerHTML = ICONS[el.dataset.icon]; });

// On phones, the email card opens the mail app (mailto:) instead of the Gmail website
if (matchMedia('(pointer: coarse)').matches) {
  document.querySelectorAll('a[href*="mail.google.com"]').forEach(a => {
    const to = new URL(a.href).searchParams.get('to');
    if (!to) return;
    a.href = 'mailto:' + to;
    a.removeAttribute('target');
    a.removeAttribute('rel');
  });
}
