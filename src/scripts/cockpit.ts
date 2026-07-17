// Scroll-driven "racing cockpit" animation controller.
// Ported from the Claude Design mockup's `DCLogic` component class — same math,
// same scroll-segment boundaries — with the design-tool's props/state plumbing
// replaced by plain constants (content.ts) and instance fields.
//
// Styling contract: this controller never decides appearance directly. Continuous,
// per-frame values (opacity/translate/width) are written as CSS custom properties
// (--op, --ty, --w, --tx, --scale, --skew) that each component's .scss consumes via
// var(...); discrete on/off state (nav active dot, cleared process step, hot cursor)
// is toggled via BEM modifier classes. The `.is-reduced-motion` class on <body> lets
// SCSS disable transforms globally instead of branching on every write.

import { ACCENT, LAP_LENGTH, TRACK_VH, GRAIN_ENABLED, NAV_CHECKPOINTS } from '../data/content';

type ElId =
  | 'ab-track' | 'ab-stage' | 'ab-canvas' | 'ab-grain' | 'ab-hud' | 'ab-rail'
  | 'ab-prog' | 'ab-pct' | 'ab-spd' | 'ab-gear' | 'ab-lap' | 'sc-boot' | 'sc-hero'
  | 'sc-driver' | 'sc-mod' | 'sc-runs' | 'sc-proc' | 'sc-report' | 'sc-contact'
  | 'ab-ctl' | 'ab-hint' | 'ab-name' | 'ab-role' | 'ab-stmt' | 'ab-runidx'
  | 'ab-cur' | 'ab-dot' | 'ab-curlbl' | 'ab-hud-mid' | 'ab-hud-lapw';

const ELEMENT_IDS: ElId[] = [
  'ab-track', 'ab-stage', 'ab-canvas', 'ab-grain', 'ab-hud', 'ab-rail',
  'ab-prog', 'ab-pct', 'ab-spd', 'ab-gear', 'ab-lap', 'sc-boot', 'sc-hero',
  'sc-driver', 'sc-mod', 'sc-runs', 'sc-proc', 'sc-report', 'sc-contact',
  'ab-ctl', 'ab-hint', 'ab-name', 'ab-role', 'ab-stmt', 'ab-runidx',
  'ab-cur', 'ab-dot', 'ab-curlbl', 'ab-hud-mid', 'ab-hud-lapw',
];

const qsa = (s: string) => Array.from(document.querySelectorAll<HTMLElement>(s));

class Cockpit {
  E: Record<string, HTMLElement> = {};
  Q!: {
    boot: HTMLElement[]; letters: HTMLElement[]; drows: HTMLElement[];
    mods: HTMLElement[]; modbars: HTMLElement[]; runs: HTMLElement[];
    rungrids: HTMLElement[]; steps: HTMLElement[]; navbtns: HTMLElement[];
    navdots: HTMLElement[]; navlbls: HTMLElement[];
  };

  navFs = NAV_CHECKPOINTS.map((n) => n.f);
  sound = false;
  forceReduce = false;

  mq!: MediaQueryList;
  ctx: CanvasRenderingContext2D | null = null;
  ac: AudioContext | null = null;

  p = 0;
  spd = 0;
  lastY = 0;
  bootT = 0;
  t0 = 0;
  raf = 0;
  onResize = () => this.resize();

  W = 0;
  H = 0;
  mob = false;
  tab = false;
  shortV = false;
  mAmp = 1;
  trk: [number, number][] = [];

  lastRun: number | undefined;
  lastNav: number | undefined;
  spdSkew = 0;
  lastY3: number | undefined;

  // cursor state
  tx: number | undefined;
  ty: number | undefined;
  cx = 0;
  cy = 0;
  curHot = false;

  get reduced() {
    return this.forceReduce || (this.mq && this.mq.matches);
  }

  init() {
    this.mq = matchMedia('(prefers-reduced-motion: reduce)');
    document.body.style.setProperty('--acc', ACCENT);

    const $ = (id: string) => document.getElementById(id) as HTMLElement;
    ELEMENT_IDS.forEach((id) => (this.E[id] = $(id)));

    this.Q = {
      boot: qsa('[data-boot]'), letters: qsa('[data-l]'), drows: qsa('[data-drow]'),
      mods: qsa('[data-mod]'), modbars: qsa('[data-modbar]'), runs: qsa('[data-run]'),
      rungrids: qsa('[data-rungrid]'), steps: qsa('[data-step]'), navbtns: qsa('[data-nav]'),
      navdots: qsa('[data-navdot]'), navlbls: qsa('[data-navlbl]'),
    };

    this.E['ab-grain'].style.backgroundImage =
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)' opacity='0.6'/%3E%3C/svg%3E\")";

    this.Q.letters.forEach((l) => { l.style.setProperty('--ty', '120%'); });

    this.p = 0; this.spd = 0; this.lastY = scrollY; this.bootT = 0; this.t0 = performance.now();
    this.setLap();

    addEventListener('resize', this.onResize);
    this.resize();

    this.Q.navbtns.forEach((btn) => {
      const i = Number(btn.dataset.nav);
      btn.addEventListener('click', () => this.jump(i));
    });

    this.initControls();

    if (matchMedia('(pointer:fine)').matches) this.initCursor();

    this.raf = requestAnimationFrame((t) => this.tick(t));
  }

  initControls() {
    const soundBtn = document.getElementById('ab-btn-sound');
    const motionBtn = document.getElementById('ab-btn-motion');
    soundBtn?.addEventListener('click', () => {
      this.sound = !this.sound;
      soundBtn.textContent = this.sound ? 'SND ● ON' : 'SND ○ OFF';
      if (this.sound) this.ignitionSound();
    });
    motionBtn?.addEventListener('click', () => {
      this.forceReduce = !this.forceReduce;
      motionBtn.textContent = this.forceReduce ? 'MOTION REDUCED' : 'MOTION FULL';
      document.body.style.setProperty('--acc', ACCENT);
      this.setLap();
    });
  }

  setLap() {
    const base = TRACK_VH[LAP_LENGTH];
    const m = this.mob ? 0.7 : this.tab ? 0.85 : 1;
    this.E['ab-track'].style.height = Math.round(base * m) + 'vh';
    this.E['ab-grain'].style.setProperty('--grain-op', String(GRAIN_ENABLED ? (this.mob ? 0.04 : 0.06) : 0));
  }

  jump(i: number) {
    const f = this.navFs[i];
    scrollTo({ top: f * (document.documentElement.scrollHeight - innerHeight), behavior: this.reduced ? 'auto' : 'smooth' });
    this.blip(660 + i * 40);
  }

  resize() {
    const c = this.E['ab-canvas'] as HTMLCanvasElement;
    const d = Math.min(2, devicePixelRatio || 1);
    this.W = innerWidth; this.H = innerHeight;
    c.width = this.W * d; c.height = this.H * d;
    this.ctx = c.getContext('2d');
    this.ctx?.setTransform(d, 0, 0, d, 0, 0);

    const W = this.W, H = this.H;
    const mob = W < 768, tab = W >= 768 && W < 1024;
    const shortV = H < 580;
    this.mob = mob; this.tab = tab; this.shortV = shortV; this.mAmp = mob ? 0.5 : 1;

    const N = 260, pts: [number, number][] = [], cx = W * 0.5, cy = H * (mob ? 0.5 : 0.53), R = Math.min(W, H) * (mob ? 0.3 : 0.36);
    for (let i = 0; i <= N; i++) {
      const th = (i / N) * Math.PI * 2;
      const r = R * (0.74 + 0.2 * Math.cos(3 * th + 1.1) + 0.05 * Math.sin(7 * th));
      pts.push([cx + r * Math.cos(th), cy + r * Math.sin(th) * 0.82]);
    }
    this.trk = pts;

    const E = this.E, Q = this.Q;
    const $ = (id: string) => document.getElementById(id);

    $('ab-hud-sys')!.style.display = mob ? 'none' : '';
    $('ab-hud-tp')!.style.display = mob ? 'none' : '';
    E['ab-hud-lapw'].style.display = mob || (tab && shortV) ? 'none' : '';
    E['ab-hud'].style.padding = mob ? '10px 14px' : '12px clamp(14px,2.5vw,26px)';
    E['ab-hud-mid'].style.gap = mob ? '16px' : '26px';

    const rail = E['ab-rail'];
    if (mob) Object.assign(rail.style, { top: 'auto', right: 'auto', left: '50%', bottom: '2px', transform: 'translateX(-50%)', flexDirection: 'row', gap: '0' });
    else Object.assign(rail.style, { top: '50%', right: 'clamp(10px,2vw,24px)', left: 'auto', bottom: 'auto', transform: 'translateY(-50%)', flexDirection: 'column', gap: '2px' });
    Q.navbtns.forEach((b) => { b.style.padding = mob ? '17px 9px' : '10px 4px'; });
    Q.navdots.forEach((dd) => { dd.style.width = dd.style.height = mob ? '8px' : '6px'; });
    Q.navlbls.forEach((l) => (l.style.display = mob || tab ? 'none' : ''));

    const ctl = E['ab-ctl'];
    if (mob) Object.assign(ctl.style, { left: 'auto', right: '10px', bottom: 'auto', top: '46px', flexDirection: 'column', alignItems: 'flex-end' });
    else Object.assign(ctl.style, { left: 'clamp(12px,2vw,22px)', right: 'auto', top: 'auto', bottom: 'clamp(12px,2vh,20px)', flexDirection: 'row', alignItems: 'stretch' });

    const padX = mob ? '18px' : tab ? '36px' : 'clamp(16px,4vw,64px)';
    const padR = mob ? padX : tab ? '58px' : 'clamp(96px,9vw,150px)';
    const padT = shortV ? '50px' : mob ? '58px' : 'clamp(60px,9vh,90px)';
    const padB = shortV ? '48px' : mob ? '66px' : 'clamp(60px,9vh,90px)';
    (['sc-driver', 'sc-mod', 'sc-proc', 'sc-report', 'sc-contact'] as ElId[]).forEach((id) => {
      const s = E[id].style;
      s.paddingLeft = padX; s.paddingRight = padR; s.paddingTop = padT; s.paddingBottom = padB;
    });
    Q.runs.forEach((r) => {
      const s = r.style;
      s.paddingLeft = padX; s.paddingRight = padR;
      s.paddingTop = mob ? '86px' : shortV ? '72px' : 'clamp(84px,12vh,110px)';
      s.paddingBottom = padB;
    });

    const rt = $('ab-roletxt');
    if (rt) { rt.style.letterSpacing = mob ? '.16em' : '.28em'; rt.style.fontSize = mob ? '11.5px' : 'clamp(12px,1.5vw,16px)'; }
    E['ab-stmt'].style.display = shortV ? 'none' : '';

    qsa('[data-drvgrid]').forEach((g) => {
      g.style.gridTemplateColumns = mob ? '1fr' : tab ? 'clamp(170px,26vw,230px) minmax(260px,1fr)' : 'clamp(200px,24vw,300px) minmax(280px,520px)';
      g.style.gap = mob ? '18px' : 'clamp(20px,3.5vw,54px)';
      g.style.maxWidth = mob ? '420px' : '1000px';
      g.style.width = mob ? '100%' : '';
    });
    qsa('[data-drvphoto]').forEach((ph) => { ph.style.width = mob ? (shortV ? '110px' : '150px') : ''; });
    Q.drows.forEach((r, i) => { r.style.padding = mob ? '7px 0' : '9px 0'; r.style.display = shortV && i > 2 ? 'none' : 'flex'; });

    qsa('[data-modgrid]').forEach((g) => {
      g.style.gridTemplateColumns = mob ? '1fr' : tab ? 'repeat(2,1fr)' : 'repeat(auto-fit,minmax(230px,1fr))';
      g.style.gap = mob ? '7px' : '10px';
    });
    qsa('[data-moddesc]').forEach((x) => (x.style.display = mob || shortV ? 'none' : ''));
    qsa('[data-modtech]').forEach((x) => (x.style.display = shortV ? 'none' : ''));
    Q.mods.forEach((m) => { m.style.padding = mob ? '10px 14px' : 'clamp(12px,1.6vw,18px)'; m.style.gap = mob ? '5px' : '8px'; });
    const md = $('ab-moddiag'); if (md) md.style.display = mob ? 'none' : '';

    Q.rungrids.forEach((g) => {
      if (mob) Object.assign(g.style, { display: 'flex', flexDirection: 'column', gap: '14px', alignItems: 'stretch', maxWidth: '480px', width: '100%', margin: '0 auto' });
      else Object.assign(g.style, { display: 'grid', flexDirection: 'row', gridTemplateColumns: tab ? 'minmax(250px,320px) minmax(280px,1fr)' : 'minmax(290px,400px) minmax(320px,1fr)', gap: tab ? '22px' : 'clamp(20px,3.5vw,50px)', alignItems: 'center', maxWidth: 'none', width: 'min(1160px,100%)', margin: '0' });
    });
    qsa('[data-rundisp]').forEach((dv) => (dv.style.order = mob ? '-1' : '0'));
    qsa('[data-runx]').forEach((x) => (x.style.display = mob || shortV ? 'none' : ''));
    qsa('a[data-cur="ENTER"]').forEach((a) => {
      a.style.padding = mob ? '13px 20px' : '11px 18px';
      a.style.alignSelf = mob ? 'stretch' : 'flex-start';
      a.style.justifyContent = mob ? 'center' : 'flex-start';
    });

    qsa('[data-stepdesc]').forEach((x) => (x.style.display = mob && shortV ? 'none' : ''));

    const cta = $('ab-cta');
    if (cta) {
      cta.style.flexDirection = mob ? 'column' : 'row';
      cta.style.alignItems = mob ? 'stretch' : 'center';
      Array.from(cta.children).forEach((a) => ((a as HTMLElement).style.justifyContent = mob ? 'center' : 'flex-start'));
    }

    this.setLap();
  }

  initCursor() {
    document.body.style.cursor = 'none';
    this.cx = this.W / 2; this.cy = this.H / 2; this.tx = this.cx; this.ty = this.cy; this.curHot = false;
    addEventListener('mousemove', (e) => {
      this.tx = e.clientX; this.ty = e.clientY;
      this.E['ab-cur'].style.setProperty('--op', '.8');
      this.E['ab-dot'].style.setProperty('--op', '1');
      const target = e.target as HTMLElement;
      const hot = !!target.closest?.('[data-cur],a,button');
      const label = (hot && (target.closest('[data-cur],a,button') as HTMLElement)?.getAttribute?.('data-cur')) || 'SELECT';
      const c = this.E['ab-cur'], l = this.E['ab-curlbl'];
      c.classList.toggle('cursor__ring--active', hot);
      l.classList.toggle('cursor__label--active', hot);
      if (hot) l.textContent = label;
      this.curHot = hot;
    });
  }

  ignitionSound() {
    try {
      this.ac = this.ac || new (window.AudioContext || (window as any).webkitAudioContext)();
      const o = this.ac.createOscillator(), g = this.ac.createGain(), t = this.ac.currentTime;
      o.type = 'sawtooth'; o.frequency.setValueAtTime(55, t); o.frequency.exponentialRampToValueAtTime(160, t + 0.7);
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.06, t + 0.15); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.9);
      o.connect(g).connect(this.ac.destination); o.start(t); o.stop(t + 1);
    } catch { /* Web Audio unavailable — silently skip */ }
  }

  blip(f: number) {
    if (!this.sound) return;
    try {
      this.ac = this.ac || new (window.AudioContext || (window as any).webkitAudioContext)();
      const o = this.ac.createOscillator(), g = this.ac.createGain(), t = this.ac.currentTime;
      o.type = 'sine'; o.frequency.value = f;
      g.gain.setValueAtTime(0.04, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);
      o.connect(g).connect(this.ac.destination); o.start(t); o.stop(t + 0.14);
    } catch { /* Web Audio unavailable — silently skip */ }
  }

  tick(t: number) {
    this.raf = requestAnimationFrame((tt) => this.tick(tt));
    const doc = document.documentElement;
    const max = Math.max(1, doc.scrollHeight - innerHeight);
    const target = Math.min(1, Math.max(0, scrollY / max));
    this.p += this.reduced ? target - this.p : (target - this.p) * 0.1;
    if (Math.abs(target - this.p) < 0.0004) this.p = target;
    const dv = scrollY - this.lastY; this.lastY = scrollY;
    this.spd += (Math.min(340, Math.abs(dv) * 2.4 + (this.p > 0.04 ? 60 + this.p * 40 : 0)) - this.spd) * 0.06;
    this.bootT = Math.min(1, (t - this.t0) / 2200);
    this.apply(t);
    this.draw(t);
  }

  seg(a: number, b: number) { return Math.min(1, Math.max(0, (this.p - a) / (b - a))); }
  ss(x: number) { return x * x * (3 - 2 * x); }

  // Sets --op/--ty custom properties consumed by each section's .scss; visibility
  // and pointer-events stay direct style writes since they're functional toggles,
  // not visual choices. `.is-reduced-motion` (toggled once per frame in apply())
  // is what actually disables the transform when reduced motion is active.
  fs(el: HTMLElement, a: number, b: number, c: number, d: number, ty = 44) {
    ty *= this.mAmp || 1;
    const i = this.ss(this.seg(a, b)), o = this.ss(this.seg(c, d)), op = i * (1 - o);
    el.style.setProperty('--op', String(op));
    el.style.setProperty('--ty', `${(1 - i) * ty - o * ty}px`);
    el.style.visibility = op < 0.02 ? 'hidden' : 'visible';
    el.style.pointerEvents = op > 0.5 ? 'auto' : 'none';
    return { i, o, op };
  }

  apply(t: number) {
    const E = this.E, Q = this.Q, p = this.p, red = this.reduced;
    document.body.classList.toggle('is-reduced-motion', red);

    const bl = Math.max(this.bootT * 0.55, this.seg(0, 0.04));
    Q.boot.forEach((el, i) => {
      const n = Q.boot.length, k = el.getAttribute('data-boot') === '99' ? n - 1 : i;
      el.style.setProperty('--op', bl * (n + 1) > k + 1 ? '1' : '0');
    });
    this.fs(E['sc-boot'], -1, -0.5, 0.038, 0.06, 0);
    E['ab-hint'].classList.toggle('boot__hint--hidden', p >= 0.01);

    const hud = this.ss(this.seg(0.045, 0.08));
    E['ab-hud'].style.setProperty('--op', String(hud));
    E['ab-rail'].style.setProperty('--op', String(hud));
    E['ab-ctl'].style.setProperty('--op', String(Math.max(0.6, hud)));
    E['ab-rail'].style.pointerEvents = hud > 0.5 ? 'auto' : 'none';
    E['ab-prog'].style.setProperty('--w', p * 100 + '%');
    E['ab-pct'].textContent = String(Math.round(p * 100)).padStart(3, '0') + '%';
    E['ab-spd'].textContent = String(Math.round(this.spd)).padStart(3, '0');
    E['ab-gear'].textContent = p < 0.045 ? 'N' : String(Math.min(8, 1 + Math.floor(p * 9)));
    const secs = p * 94.32;
    E['ab-lap'].textContent = `${Math.floor(secs / 60)}:${String(Math.floor(secs % 60)).padStart(2, '0')}.${String(Math.floor((secs % 1) * 1000)).padStart(3, '0')}`;

    this.fs(E['sc-hero'], 0.048, 0.085, 0.148, 0.175, 0);
    const rev = this.ss(this.seg(0.05, 0.1));
    Q.letters.forEach((l, i) => {
      const n = Q.letters.length, lo = (i / n) * 0.6, d = Math.min(1, Math.max(0, (rev - lo) / 0.4));
      l.style.setProperty('--ty', `${(1 - this.ss(d)) * 120}%`);
      l.style.setProperty('--op', red ? (rev > 0 ? '1' : '0') : '1');
    });
    E['ab-name'].style.setProperty('--skew', red || this.mob ? '0deg' : `${Math.max(-7, Math.min(7, -this.spdSkew || 0))}deg`);
    this.spdSkew = (this.spdSkew || 0) + ((this.lastY3 !== undefined ? (scrollY - this.lastY3) * 0.06 : 0) - (this.spdSkew || 0)) * 0.12;
    this.lastY3 = scrollY;
    const sub = this.ss(this.seg(0.075, 0.11));
    E['ab-role'].style.setProperty('--op', String(sub));
    E['ab-stmt'].style.setProperty('--op', String(sub));

    this.fs(E['sc-driver'], 0.165, 0.2, 0.258, 0.285);
    Q.drows.forEach((r, i) => {
      const d = this.ss(Math.min(1, Math.max(0, (this.seg(0.19, 0.24) - i * 0.12) / 0.5)));
      r.style.setProperty('--op', String(d));
    });

    this.fs(E['sc-mod'], 0.278, 0.31, 0.368, 0.395);
    Q.mods.forEach((m, i) => {
      const d = this.ss(Math.min(1, Math.max(0, this.seg(0.29, 0.36) * 1.6 - i * 0.09)));
      m.style.setProperty('--op', String(Math.min(1, d * 1.2)));
      m.style.setProperty('--card-ty', `${(1 - d) * (this.mob ? 12 : 22)}px`);
      if (Q.modbars[i]) Q.modbars[i].style.setProperty('--w', d * 100 + '%');
    });

    const ru = this.fs(E['sc-runs'], 0.385, 0.415, 0.752, 0.775, 0);
    const rp = this.seg(0.4, 0.755) * 4;
    const idx = Math.min(3, Math.floor(rp));
    E['ab-runidx'].textContent = `RUN 0${idx + 1} / 04`;
    if (this.lastRun !== idx && ru.op > 0.3) { this.blip(520 + idx * 90); this.lastRun = idx; }
    Q.runs.forEach((r, k) => {
      const d = Math.min(1, Math.max(0, 1 - Math.abs(rp - 0.5 - k) * 1.9));
      const o = this.ss(d) * ru.op;
      const off = rp - 0.5 - k;
      r.style.setProperty('--op', String(o));
      r.style.setProperty('--tx', `${Math.max(-1, Math.min(1, -off)) * (this.mob ? 16 : 46)}px`);
      r.style.setProperty('--scale', String(0.97 + this.ss(d) * 0.03));
      r.style.visibility = o < 0.02 ? 'hidden' : 'visible';
      r.style.pointerEvents = o > 0.5 ? 'auto' : 'none';
    });

    this.fs(E['sc-proc'], 0.765, 0.795, 0.845, 0.87);
    const sp = this.seg(0.78, 0.845);
    Q.steps.forEach((s, i) => {
      const on = sp * 7.6 > i + 0.5;
      const ok = s.querySelector<HTMLElement>('[data-stepok]')!;
      s.classList.toggle('process__step--cleared', on);
      ok.textContent = on ? 'CLEAR' : 'STANDBY';
    });

    this.fs(E['sc-report'], 0.857, 0.885, 0.915, 0.935);
    this.fs(E['sc-contact'], 0.928, 0.965, 2, 3, 30);

    let ni = 0;
    this.navFs.forEach((f, i) => { if (p >= f - 0.035) ni = i; });
    Q.navdots.forEach((d, i) => {
      const on = i === ni;
      d.classList.toggle('nav-rail__dot--active', on);
      Q.navbtns[i].classList.toggle('nav-rail__item--active', on);
    });
    if (this.lastNav !== ni) { if (this.lastNav !== undefined) this.blip(880); this.lastNav = ni; }

    if (this.tx !== undefined && this.ty !== undefined) {
      this.cx += (this.tx - this.cx) * (red ? 1 : 0.18);
      this.cy += (this.ty - this.cy) * (red ? 1 : 0.18);
      E['ab-cur'].style.transform = `translate(${this.cx}px,${this.cy}px)`;
      E['ab-dot'].style.transform = `translate(${this.tx}px,${this.ty}px)`;
      E['ab-curlbl'].style.transform = `translate(${this.cx}px,${this.cy}px)`;
    }
  }

  hexRgb(h: string): [number, number, number] {
    const x = h.replace('#', '');
    return [parseInt(x.slice(0, 2), 16), parseInt(x.slice(2, 4), 16), parseInt(x.slice(4, 6), 16)];
  }

  draw(t: number) {
    const ctx = this.ctx; if (!ctx) return;
    const W = this.W, H = this.H, p = this.p, [ar, ag, ab] = this.hexRgb(ACCENT);
    const A = (a: number) => `rgba(${ar},${ag},${ab},${a})`;
    ctx.clearRect(0, 0, W, H);

    if (!this.mob) {
      ctx.strokeStyle = 'rgba(255,255,255,.028)'; ctx.lineWidth = 1; ctx.beginPath();
      for (let x = 0.5; x < W; x += 90) { ctx.moveTo(x, 0); ctx.lineTo(x, H); }
      for (let y = 0.5; y < H; y += 90) { ctx.moveTo(0, y); ctx.lineTo(W, y); }
      ctx.stroke();
    }

    const trk = this.trk, N = trk.length - 1;
    const fade = p < 0.04 ? this.bootT * 0.5 + this.seg(0, 0.04) * 0.5 : 1;
    ctx.globalAlpha = 0.9 * fade;
    ctx.strokeStyle = 'rgba(255,255,255,.07)'; ctx.lineWidth = 1.4; ctx.beginPath();
    trk.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    ctx.stroke();
    const k = Math.max(1, Math.floor(p * N));
    ctx.strokeStyle = A(0.5); ctx.lineWidth = 2; ctx.shadowColor = A(0.8); ctx.shadowBlur = 10; ctx.beginPath();
    for (let i = 0; i <= k; i++) { const [x, y] = trk[i]; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
    ctx.stroke();
    const [dx, dy] = trk[k];
    ctx.fillStyle = A(1); ctx.shadowBlur = 14; ctx.beginPath(); ctx.arc(dx, dy, 4, 0, 7); ctx.fill();
    ctx.shadowBlur = 0; ctx.globalAlpha = 1;
    ctx.strokeStyle = A(0.35); ctx.lineWidth = 1; ctx.beginPath();
    ctx.moveTo(dx - 12, dy); ctx.lineTo(dx - 5, dy); ctx.moveTo(dx + 5, dy); ctx.lineTo(dx + 12, dy);
    ctx.moveTo(dx, dy - 12); ctx.lineTo(dx, dy - 5); ctx.moveTo(dx, dy + 5); ctx.lineTo(dx, dy + 12);
    ctx.stroke();

    const amp = 1 + this.spd / 120, ty = H - 64;
    ctx.strokeStyle = A(0.14); ctx.lineWidth = 1.2; ctx.beginPath();
    const tt = this.reduced ? 0 : t;
    for (let x = 0; x <= W; x += 6) {
      const y = ty - (Math.sin(x * 0.02 + tt * 0.0016) * 6 + Math.sin(x * 0.047 + tt * 0.003) * 4) * amp;
      x ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
    }
    ctx.stroke();

    if (p < 0.06) {
      const b = this.bootT;
      ctx.strokeStyle = A(0.18 * (1 - this.seg(0.03, 0.06))); ctx.beginPath();
      const sx = W * (b % 1); ctx.moveTo(sx, 0); ctx.lineTo(sx, H); ctx.stroke();
      const rr = 30 + Math.sin(t * 0.004) * 6;
      ctx.strokeStyle = A(0.25 * (1 - this.seg(0.02, 0.05))); ctx.beginPath(); ctx.arc(W / 2, H * 0.53, rr, 0, 7); ctx.stroke();
    }
  }
}

new Cockpit().init();
