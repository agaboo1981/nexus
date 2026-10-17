// NEXUS — interactions. Mounted on every page; each feature guards its
// own elements, so a page that lacks them is unaffected.

document.documentElement.classList.add('js');

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

// ---- Mobile nav ------------------------------------------------
const mobileNav = () => {
  const toggle = $('.menu-btn');
  const menu = $('.mobile-nav');
  if (!toggle || !menu) return;
  const close = $('.mobile-nav__close');
  const open = () => { menu.classList.add('is-open'); menu.setAttribute('aria-hidden', 'false'); document.body.style.overflow = 'hidden'; };
  const shut = () => { menu.classList.remove('is-open'); menu.setAttribute('aria-hidden', 'true'); document.body.style.overflow = ''; };
  toggle.addEventListener('click', open);
  close && close.addEventListener('click', shut);
  $$('.mobile-nav__links a, .mobile-nav__actions a').forEach((l) => l.addEventListener('click', shut));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') shut(); });
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

// ---- Count-up numbers (about page) ------------------------------
const statCounter = () => {
  const stats = $$('.stat[data-count]');
  if (!stats.length) return;
  const render = (el, v) => {
    const dec = parseInt(el.dataset.decimals || '0', 10);
    const num = dec > 0 ? v.toFixed(dec) : Math.round(v).toLocaleString('en-US');
    el.textContent = `${el.dataset.prefix || ''}${num}${el.dataset.suffix || ''}`;
  };
  if (!('IntersectionObserver' in window)) { stats.forEach((s) => render(s, parseFloat(s.dataset.count))); return; }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const el = e.target;
      io.unobserve(el);
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { render(el, parseFloat(el.dataset.count)); return; }
      const target = parseFloat(el.dataset.count);
      const dur = 1200; const t0 = performance.now();
      const tick = (now) => {
        const p = Math.min((now - t0) / dur, 1);
        render(el, target * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  }, { threshold: 0.5 });
  stats.forEach((s) => io.observe(s));
};

// ---- The live thing: transfer calculator ------------------------
// The hero claim, proven with real arithmetic: type an amount and the
// fee, the rate and the arrival figure recompute before you confirm.
const moneyCalc = () => {
  const root = $('[data-calc]');
  if (!root) return;
  const send = $('[data-tsend]', root);
  const feeEl = $('[data-tfee]', root);
  const getsEl = $('[data-tgets]', root);
  const deductEl = $('[data-deduct]', root);
  const balanceEl = $('[data-balance]', root);

  const RATE = 0.7885;   // GBP -> USD mid-market (illustrative)
  const PCT = 0.0041;    // 0.41% per transfer
  const MIN_FEE = 0.31;
  const BASE = 18420.35;

  const usd = (n) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
  const gbp = (n) => n.toLocaleString('en-GB', { style: 'currency', currency: 'GBP' });

  const setBalance = (v) => { if (balanceEl) balanceEl.textContent = usd(v); };
  setBalance(BASE);

  const calc = () => {
    const n = Math.max(0, parseFloat(send.value) || 0);
    const fee = Math.max(n * PCT, n ? MIN_FEE : 0);
    const gets = n ? (n - fee) * RATE : 0;
    if (feeEl) feeEl.textContent = n ? gbp(fee) : '·';
    if (getsEl) getsEl.textContent = n ? usd(gets) : '·';
    if (deductEl) deductEl.textContent = n ? usd(BASE - n * RATE) : usd(BASE);
    if (balanceEl) balanceEl.textContent = usd(n ? BASE - n * RATE : BASE);
  };
  send.addEventListener('input', calc);
  calc();
};

// ---- Keep the display pieces pinned (masked lines, marquee, closing wordmark)
const pinDisplays = () => {
  $$('.hero__title, .band__track, .stages__clause, .faq__head h2, .f-tile--word b, .cta__sentence')
    .forEach((h) => h.setAttribute('data-pin', ''));
};

// ---- Stages: one slider drives clause and fragment --------------
const stages = () => {
  const root = $('[data-stages]');
  if (!root) return;
  const input = $('input[type="range"]', root);
  const clause = $('.stages__clause', root);
  const frags = $$('.frag', root);
  const names = $$('.stages__names span', root);
  const clauses = [
    'First, open it in minutes.',
    'Then, add money in taps.',
    'Then, spend it anywhere.',
    'Now, send it across the world.',
  ];
  let current = -1;
  const show = (i) => {
    if (i === current) return;
    current = i;
    clause.classList.add('is-fading');
    setTimeout(() => { clause.textContent = clauses[i]; clause.classList.remove('is-fading'); }, 180);
    frags.forEach((f, k) => f.classList.toggle('is-on', k === i));
    names.forEach((n, k) => {
      if (k === i) n.setAttribute('aria-current', 'true');
      else n.removeAttribute('aria-current');
    });
  };
  input.addEventListener('input', () => show(parseInt(input.value, 10)));
  show(parseInt(input.value, 10));
};

// ---- Billing toggle (pricing) -----------------------------------
const billingToggle = () => {
  const toggle = $('[data-billing]');
  if (!toggle) return;
  const buttons = $$('button', toggle);
  const targets = $$('[data-monthly]');
  buttons.forEach((b) => b.addEventListener('click', () => {
    const period = b.dataset.billing;
    buttons.forEach((x) => x.classList.toggle('is-active', x === b));
    targets.forEach((t) => { if (period in t.dataset) t.textContent = t.dataset[period]; });
  }));
};

// ---- Newsletter + auth forms (concept: nothing is sent) ---------
const demoForms = () => {
  $$('form[data-demo]').forEach((form) => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const msg = $('.form-msg', form) || form.nextElementSibling;
      const input = form.querySelector('input');
      if (input && !input.value && input.type !== 'checkbox') { input.focus(); return; }
      if (input && input.type === 'checkbox' && !input.checked) { input.focus(); return; }
      if (msg) msg.textContent = 'This is a design concept, so nothing was sent.';
    });
  });
};

// ---- Password strength meter (signup) ---------------------------
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

// ---- Footer clock (London) --------------------------------------
const footClock = () => {
  const el = $('[data-clock]');
  if (!el) return;
  const tick = () => {
    try {
      el.textContent = new Intl.DateTimeFormat('en-GB', {
        hour: '2-digit', minute: '2-digit', timeZone: 'Europe/London',
      }).format(new Date());
    } catch { el.textContent = ''; }
  };
  tick();
  setInterval(tick, 30000);
};

// ---- Init --------------------------------------------------------
const init = () => {
  mobileNav();
  revealOnScroll();
  statCounter();
  moneyCalc();
  stages();
  billingToggle();
  demoForms();
  passwordMeter();
  footClock();
  pinDisplays();
};
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();
