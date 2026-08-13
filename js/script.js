// NEXUS — shared interactions. Mounted on every page; each feature
// guards its own elements so a page that lacks them is unaffected.

// Mark the document as JS-enabled (so `.js .reveal` hides content pre-animation).
document.documentElement.classList.add('js');

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

// ---- Sticky header ---------------------------------------------
const stickyHeader = () => {
  const header = $('.site-header');
  if (!header) return;
  const update = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
  update();
  window.addEventListener('scroll', update, { passive: true });
};

// ---- Mobile nav ------------------------------------------------
const mobileNav = () => {
  const toggle = $('.nav__toggle');
  const menu = $('.mobile-nav');
  if (!toggle || !menu) return;
  const links = $$('.mobile-nav__link');
  const close = $('.mobile-nav__close');
  const open = () => { menu.classList.add('is-open'); document.body.style.overflow = 'hidden'; };
  const shut = () => { menu.classList.remove('is-open'); document.body.style.overflow = ''; };
  toggle.addEventListener('click', open);
  close && close.addEventListener('click', shut);
  links.forEach((l) => l.addEventListener('click', shut));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menu.classList.contains('is-open')) shut();
  });
};

// ---- Reveal on scroll ------------------------------------------
const revealOnScroll = () => {
  const items = $$('.reveal');
  if (!items.length) return;
  if (!('IntersectionObserver' in window)) { items.forEach((el) => el.classList.add('is-in')); return; }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) { entry.target.classList.add('is-in'); io.unobserve(entry.target); }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  items.forEach((el) => io.observe(el));
};

// ---- Stat counter ----------------------------------------------
// <span class="stat" data-prefix="+" data-count="2" data-suffix="M+"></span>
const statCounter = () => {
  const stats = $$('.stat[data-count]');
  if (!stats.length) return;
  const render = (el, v) => {
    const dec = parseInt(el.dataset.decimals || '0', 10);
    const num = dec > 0 ? v.toFixed(dec) : Math.round(v).toLocaleString('en-US');
    el.textContent = `${el.dataset.prefix || ''}${num}${el.dataset.suffix || ''}`;
  };
  const animate = (el) => {
    const target = parseFloat(el.dataset.count, 10);
    const dur = 1400; const t0 = performance.now();
    const tick = (now) => {
      const p = Math.min((now - t0) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      render(el, target * eased);
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  if (!('IntersectionObserver' in window)) { stats.forEach((s) => render(s, parseFloat(s.dataset.count))); return; }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { animate(e.target); io.unobserve(e.target); } });
  }, { threshold: 0.5 });
  stats.forEach((s) => io.observe(s));
};

// ---- Homepage money-movement module -----------------------------
// The hero's product felt alive through three coupled behaviours, all
// driven by real math, none of it decorative:
//   1. Balance "ticks" while you watch (idle, live-feeling).
//   2. A working "send money" calculator (GBP -> USD, Wise-style).
//   3. A single-series balance chart whose projection reacts to the
//      send amount — the hero re-proves the product as you type.
const moneyLedger = () => {
  const root = $('[data-ledger]');
  if (!root) return;
  const balance = $('[data-balance]', root);
  const send = $('[data-tsend]', root);
  const feeEl = $('[data-tfee]', root);
  const getsEl = $('[data-tgets]', root);
  const deductEl = $('[data-deduct]', root);
  const chartEl = $('[data-chart]', root);

  const RATE = 0.7885;    // GBP -> USD mid-market (illustrative)
  const PCT = 0.0041;     // 0.41%
  const MIN_FEE = 0.31;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* ---- formatting ---- */
  const usd = (n) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 });
  const gbp = (n) => n.toLocaleString('en-GB', { style: 'currency', currency: 'GBP' });

  /* ---- deterministic balance series (60 days) ---- */
  const BASE = 18420.35;
  const series = (() => {
    let seed = 1337; const n = 60;
    const rnd = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
    const arr = new Array(n); let v = BASE * 0.958;
    for (let i = 0; i < n; i++) {
      v *= 1 + (rnd() - 0.43) * 0.0065;
      if (rnd() < 0.09) v -= rnd() * 380 + 70;
      arr[i] = v;
    }
    return arr;
  })();
  const finalHist = series[series.length - 1];

  /* ---- balance tick behaviour (idle) ---- */
  if (balance) {
    const set = (v) => { balance.textContent = usd(v); };
    set(BASE);
    let timer = null;
    const stop = () => { if (timer) { clearInterval(timer); timer = null; } };
    const start = () => {
      stop();
      if (reduceMotion.matches) { set(finalHist); return; }
      let drift = 10;
      timer = setInterval(() => {
        drift = drift * 0.85 + (rndDrift() - 0.5) * 13;
        set(finalHist + drift);
      }, 2400);
    };
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([e]) => (e.isIntersecting ? start() : stop()), { threshold: 0.1 }).observe(root);
    } else { start(); }
  }
  function rndDrift() { return Math.random(); }

  /* ---- transfer calculator + chart projection ---- */
  const buildChart = () => {
    const ns = 'http://www.w3.org/2000/svg';
    const W = 560, H = 200, padL = 46, padR = 12, padT = 12, padB = 22;
    const pw = W - padL - padR, ph = H - padT - padB;
    chartEl.textContent = '';

    const svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-labelledby', 'ch-t ch-d');
    const title = document.createElementNS(ns, 'title'); title.id = 'ch-t';
    title.textContent = 'Your balance over the last 60 days';
    const desc = document.createElementNS(ns, 'desc'); desc.id = 'ch-d';
    desc.textContent = 'Daily USD balance. Editing the send amount shows the projected effect on your balance.';
    svg.append(title, desc);

    // scales
    let vmin = series[0], vmax = series[0];
    series.forEach((v) => { if (v < vmin) vmin = v; if (v > vmax) vmax = v; });
    const span = Math.max(vmax - vmin, BASE * 0.004);
    const y0 = vmin - span * 0.28, y1 = vmax + span * 0.32;
    const x = (i) => padL + (i / (series.length - 1)) * pw;
    const y = (v) => padT + (1 - (v - y0) / (y1 - y0)) * ph;

    const monoTick = (v) => (v >= 1000 ? `$${(v / 1000).toFixed(1)}k` : `$${Math.round(v)}`);
    const niceTicks = (min, max, count) => {
      const step = Math.pow(10, Math.floor(Math.log10((max - min) / count)));
      const err = (max - min) / count / step;
      const f = err <= 0.15 ? 1 : err <= 0.35 ? 2 : err <= 0.75 ? 5 : 10;
      const s = step * f, out = [];
      for (let v = Math.ceil(min / s) * s; v <= max + s * 0.5; v += s) out.push(v);
      return out;
    };
    const daysAgo = (i) => { const d = series.length - 1 - i; return d === 0 ? 'Today' : d === 1 ? 'Yesterday' : `${d} days ago`; };

    // recessive hairline grid + mono ticks
    const grid = document.createElementNS(ns, 'g');
    niceTicks(y0, y1, 4).forEach((tv) => {
      const yy = y(tv);
      const ln = document.createElementNS(ns, 'line');
      ln.setAttribute('x1', padL); ln.setAttribute('x2', W - padR); ln.setAttribute('y1', yy); ln.setAttribute('y2', yy);
      ln.setAttribute('stroke', 'var(--grid)'); ln.setAttribute('stroke-width', '1');
      const t = document.createElementNS(ns, 'text');
      t.setAttribute('x', padL - 8); t.setAttribute('y', yy + 3.5);
      t.setAttribute('text-anchor', 'end'); t.setAttribute('font-family', 'var(--font-mono)');
      t.setAttribute('font-size', '10'); t.setAttribute('fill', 'var(--muted)');
      t.textContent = monoTick(tv);
      grid.append(ln, t);
    });
    svg.appendChild(grid);

    // area wash (accent @ low alpha) closed to the data baseline
    const baseY = padT + ph;
    let d = `M${x(0)},${y(series[0])}`;
    for (let i = 1; i < series.length; i++) d += ` L${x(i)},${y(series[i])}`;
    d += ` L${x(series.length - 1)},${baseY} L${x(0)},${baseY} Z`;
    const area = document.createElementNS(ns, 'path');
    area.setAttribute('d', d); area.setAttribute('fill', 'var(--area)');
    svg.appendChild(area);

    // the line (2px, round)
    const line = document.createElementNS(ns, 'path');
    line.setAttribute('fill', 'none'); line.setAttribute('stroke', 'var(--accent)');
    line.setAttribute('stroke-width', '2'); line.setAttribute('stroke-linejoin', 'round'); line.setAttribute('stroke-linecap', 'round');
    const ld = [`M${x(0)},${y(series[0])}`];
    for (let i = 1; i < series.length; i++) ld.push(`L${x(i)},${y(series[i])}`);
    line.setAttribute('d', ld.join(' '));
    svg.appendChild(line);

    // end dot (>=8px, surface ring)
    const dot = document.createElementNS(ns, 'circle');
    dot.setAttribute('cx', x(series.length - 1)); dot.setAttribute('cy', y(finalHist));
    dot.setAttribute('r', 4.5); dot.setAttribute('fill', 'var(--accent)');
    dot.setAttribute('stroke', 'var(--surface)'); dot.setAttribute('stroke-width', '2.5');
    svg.appendChild(dot);

    // projection group (shown when a send amount is entered)
    const proj = document.createElementNS(ns, 'g');
    proj.setAttribute('opacity', '0'); proj.style.transition = 'opacity .3s ease';
    const pLine = document.createElementNS(ns, 'line');
    pLine.setAttribute('y1', y(finalHist)); pLine.setAttribute('y2', y(finalHist));
    pLine.setAttribute('stroke', 'var(--muted)'); pLine.setAttribute('stroke-width', '2'); pLine.setAttribute('stroke-linecap', 'round');
    pLine.setAttribute('x1', x(series.length - 1)); pLine.setAttribute('x2', x(series.length - 1));
    const pDot = document.createElementNS(ns, 'circle');
    pDot.setAttribute('r', 4); pDot.setAttribute('fill', 'var(--muted)'); pDot.setAttribute('stroke', 'var(--surface)'); pDot.setAttribute('stroke-width', '2.5');
    const pLabel = document.createElementNS(ns, 'text');
    pLabel.setAttribute('text-anchor', 'end'); pLabel.setAttribute('font-family', 'var(--font-mono)'); pLabel.setAttribute('font-size', '10'); pLabel.setAttribute('fill', 'var(--muted)');
    const pRect = document.createElementNS(ns, 'rect'); pRect.setAttribute('fill', 'var(--surface)'); pRect.setAttribute('rx', '4');
    proj.append(pLine, pDot, pRect, pLabel);
    svg.appendChild(proj);

    // hover crosshair + tooltip (enhances; the balance figure stays visible at all times)
    const hit = document.createElementNS(ns, 'rect');
    hit.setAttribute('x', padL); hit.setAttribute('y', padT); hit.setAttribute('width', pw); hit.setAttribute('height', ph);
    hit.setAttribute('fill', 'transparent');
    const cursor = document.createElementNS(ns, 'line');
    cursor.setAttribute('y1', padT + 2); cursor.setAttribute('y2', padT + ph - 2);
    cursor.setAttribute('stroke', 'var(--hairline)'); cursor.setAttribute('stroke-width', '1'); cursor.setAttribute('opacity', '0'); cursor.setAttribute('pointer-events', 'none');
    const tip = document.createElementNS(ns, 'text');
    tip.setAttribute('text-anchor', 'middle'); tip.setAttribute('font-family', 'var(--font-mono)'); tip.setAttribute('font-size', '10.5'); tip.setAttribute('fill', 'var(--ink)'); tip.setAttribute('pointer-events', 'none');
    const tipBack = document.createElementNS(ns, 'rect');
    tipBack.setAttribute('fill', 'var(--surface)'); tipBack.setAttribute('rx', '4'); tipBack.setAttribute('stroke', 'var(--hairline)'); tipBack.setAttribute('pointer-events', 'none');
    tip.setAttribute('opacity', '0'); tipBack.setAttribute('opacity', '0');
    svg.append(hit, cursor, tipBack, tip);
    chartEl.appendChild(svg);

    const measure = (t) => t.getBBox().width;
    const setProj = (amountUSD) => {
      if (!amountUSD) { proj.setAttribute('opacity', '0'); return; }
      const pval = finalHist - amountUSD;
      const px = x(series.length - 1), py = y(pval);
      pLine.setAttribute('x2', px); pLine.setAttribute('y2', py);
      pDot.setAttribute('cx', px); pDot.setAttribute('cy', py);
      pLabel.setAttribute('x', px - 2); pLabel.setAttribute('y', py - 9);
      pLabel.textContent = 'after this send';
      pRect.setAttribute('x', px - 2 - measure(pLabel) - 8);
      pRect.setAttribute('y', py - 20);
      pRect.setAttribute('width', measure(pLabel) + 12);
      pRect.setAttribute('height', 15);
      proj.setAttribute('opacity', '1');
    };
    const showTip = (i) => {
      const cx = x(i), cv = series[i];
      tip.textContent = `${daysAgo(i)}    ${monoTick(cv)}`;
      tip.setAttribute('x', cx); tip.setAttribute('y', padT - 5);
      tipBack.setAttribute('x', cx - measure(tip) / 2 - 6);
      tipBack.setAttribute('y', padT - 19);
      tipBack.setAttribute('width', measure(tip) + 12);
      tipBack.setAttribute('height', 16);
      cursor.setAttribute('x1', cx); cursor.setAttribute('x2', cx);
      cursor.setAttribute('opacity', '1'); tipBack.setAttribute('opacity', '1'); tip.setAttribute('opacity', '1');
    };
    const hideTip = () => { cursor.setAttribute('opacity', '0'); tipBack.setAttribute('opacity', '0'); tip.setAttribute('opacity', '0'); };
    hit.addEventListener('mousemove', (e) => {
      const svgRect = svg.getBoundingClientRect();
      const sx = ((e.clientX - svgRect.left) / svgRect.width) * W;
      if (sx < padL || sx > padL + pw) { hideTip(); return; }
      const idx = Math.round(((sx - padL) / pw) * (series.length - 1));
      showTip(Math.max(0, Math.min(series.length - 1, idx)));
    });
    hit.addEventListener('mouseleave', hideTip);

    return { setProj };
  };

  const chart = chartEl ? buildChart() : { setProj: () => {} };

  // wire the calculator + projection
  const calc = () => {
    const n = Math.max(0, parseFloat(send.value) || 0);
    const feeGBP = Math.max(n * PCT, n ? MIN_FEE : 0);
    const gets = n ? (n - feeGBP) * RATE : 0;
    const deduct = n * RATE; // USD value leaving the balance
    if (feeEl) feeEl.textContent = n ? gbp(feeGBP) : '—';
    if (getsEl) getsEl.textContent = n ? usd(gets) : '—';
    if (deductEl) deductEl.textContent = n ? `≈ ${usd(deduct)}` : '—';
    chart.setProj(n ? deduct : 0);
  };
  send.addEventListener('input', calc);
  calc();
};

// ---- Footer newsletter -----------------------------------------
const newsletter = () => {
  const form = $('.newsletter');
  if (!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const input = form.querySelector('input');
    const btn = form.querySelector('button');
    if (!input.value) { input.focus(); return; }
    const label = btn.textContent;
    btn.disabled = true; btn.textContent = 'Subscribed';
    input.value = ''; input.disabled = true;
    setTimeout(() => { btn.disabled = false; btn.textContent = label; input.disabled = false; }, 3200);
  });
};

// ---- Password strength meter (signup) --------------------------
const passwordMeter = () => {
  const pw = $('#password');
  const meter = $('.meter');
  if (!pw || !meter) return;
  const score = () => {
    let s = 0;
    if (pw.value.length >= 8) s++;
    if (/[A-Z]/.test(pw.value) && /[a-z]/.test(pw.value)) s++;
    if (/\d/.test(pw.value)) s++;
    return s;
  };
  pw.addEventListener('input', () => { meter.dataset.strength = score(); });
};

// ---- Billing toggle (pricing) ----------------------------------
const billingToggle = () => {
  const toggle = $('.toggle');
  if (!toggle) return;
  const buttons = $$('[data-billing]', toggle);
  const targets = $$('[data-monthly]'); // spans that carry monthly/yearly prices
  buttons.forEach((b) => b.addEventListener('click', () => {
    const period = b.dataset.billing; // 'monthly' | 'yearly'
    buttons.forEach((x) => x.classList.toggle('is-active', x === b));
    targets.forEach((t) => { if (period in t.dataset) t.textContent = t.dataset[period]; });
  }));
  const active = toggle.querySelector('.is-active');
  if (active) active.click();
};

// ---- Init --------------------------------------------------------
const init = () => {
  if (window.lucide) window.lucide.createIcons();
  stickyHeader();
  mobileNav();
  revealOnScroll();
  statCounter();
  moneyLedger();
  newsletter();
  passwordMeter();
  billingToggle();
};
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();