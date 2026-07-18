// Cockpit sound engine — every cue here is synthesized with the Web Audio API
// (oscillators, filters, generated noise), no recorded samples, so the whole
// palette shares one cool, digital "HUD" voice instead of mixing textures.
//
// All voices route through a single master bus (gain -> compressor) so
// overlapping cues never clip. Mute state is owned here (not by the caller)
// and persisted across visits; every public method no-ops when muted.

const STORAGE_KEY = 'ab-sound';

export class CockpitAudio {
  muted = true;

  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;

  private humOscA: OscillatorNode | null = null;
  private humOscB: OscillatorNode | null = null;
  private humFilter: BiquadFilterNode | null = null;
  private humGain: GainNode | null = null;
  private humStarted = false;

  constructor() {
    if (typeof localStorage !== 'undefined') {
      this.muted = localStorage.getItem(STORAGE_KEY) !== 'on';
    }
  }

  private ensure(): AudioContext {
    if (!this.ctx) {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const compressor = ctx.createDynamicsCompressor();
      compressor.threshold.value = -18;
      compressor.knee.value = 18;
      compressor.ratio.value = 4;
      compressor.attack.value = 0.003;
      compressor.release.value = 0.25;
      const master = ctx.createGain();
      master.gain.value = 1;
      master.connect(compressor).connect(ctx.destination);
      this.ctx = ctx;
      this.master = master;
    }
    if (this.ctx.state === 'suspended') void this.ctx.resume();
    return this.ctx;
  }

  private noiseBuffer(ctx: AudioContext, seconds: number): AudioBuffer {
    const buf = ctx.createBuffer(1, Math.max(1, Math.floor(ctx.sampleRate * seconds)), ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    return buf;
  }

  setMuted(next: boolean) {
    this.muted = next;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, next ? 'off' : 'on');
    }
    if (!next) {
      this.confirm();
    } else if (this.humGain && this.ctx) {
      this.humGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.2);
    }
  }

  toggleMuted() {
    this.setMuted(!this.muted);
  }

  private startHum() {
    if (this.humStarted) return;
    this.humStarted = true;
    const ctx = this.ensure(), master = this.master!;
    const oscA = ctx.createOscillator(), oscB = ctx.createOscillator();
    oscA.type = 'sine'; oscB.type = 'sine';
    oscA.frequency.value = 58; oscB.frequency.value = 58 * 1.01; // slight detune for width
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass'; filter.frequency.value = 200; filter.Q.value = 0.5;
    const gain = ctx.createGain();
    gain.gain.value = 0;
    oscA.connect(filter); oscB.connect(filter);
    filter.connect(gain).connect(master);
    oscA.start(); oscB.start();
    this.humOscA = oscA; this.humOscB = oscB; this.humFilter = filter; this.humGain = gain;
  }

  // Continuous scroll-reactive engine layer — call every animation frame.
  // Never allocates nodes; just ramps the persistent hum's params.
  setHum(speed: number, progress: number, reduced: boolean) {
    if (this.muted || reduced) {
      if (this.humGain && this.ctx) this.humGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.4);
      return;
    }
    this.startHum();
    const ctx = this.ctx!, t = ctx.currentTime;
    const endFade = progress > 0.94 ? Math.max(0, 1 - (progress - 0.94) / 0.05) : 1;
    const norm = Math.min(1, speed / 300);
    const targetGain = Math.min(0.05, norm * 0.05) * endFade;
    const targetFreq = 58 + norm * 70;
    const targetCutoff = 200 + norm * 900;
    this.humGain!.gain.setTargetAtTime(targetGain, t, 0.15);
    this.humOscA!.frequency.setTargetAtTime(targetFreq, t, 0.2);
    this.humOscB!.frequency.setTargetAtTime(targetFreq * 1.01, t, 0.2);
    this.humFilter!.frequency.setTargetAtTime(targetCutoff, t, 0.2);
  }

  // "Systems online" power-up: a rising sine sweep (spool-up body) layered with a
  // bandpass-filtered noise surge (energy-flow texture) resolving into a bright
  // triangle chime. Fired once, on the first scroll/wheel/touch/key input.
  ignition() {
    if (this.muted) return;
    try {
      const ctx = this.ensure(), master = this.master!, t = ctx.currentTime;

      const o1 = ctx.createOscillator(), g1 = ctx.createGain(), f1 = ctx.createBiquadFilter();
      o1.type = 'sine';
      o1.frequency.setValueAtTime(66, t); o1.frequency.exponentialRampToValueAtTime(210, t + 0.62);
      f1.type = 'lowpass';
      f1.frequency.setValueAtTime(500, t); f1.frequency.exponentialRampToValueAtTime(2200, t + 0.62);
      g1.gain.setValueAtTime(0.0001, t);
      g1.gain.exponentialRampToValueAtTime(0.1, t + 0.22);
      g1.gain.exponentialRampToValueAtTime(0.0001, t + 0.82);
      o1.connect(f1).connect(g1).connect(master);

      const noise = ctx.createBufferSource();
      noise.buffer = this.noiseBuffer(ctx, 0.75);
      const bp = ctx.createBiquadFilter();
      bp.type = 'bandpass'; bp.Q.value = 0.8;
      bp.frequency.setValueAtTime(180, t); bp.frequency.exponentialRampToValueAtTime(2600, t + 0.68);
      const gn = ctx.createGain();
      gn.gain.setValueAtTime(0.0001, t);
      gn.gain.exponentialRampToValueAtTime(0.045, t + 0.3);
      gn.gain.exponentialRampToValueAtTime(0.0001, t + 0.75);
      noise.connect(bp).connect(gn).connect(master);

      const o2 = ctx.createOscillator(), g2 = ctx.createGain();
      o2.type = 'triangle'; o2.frequency.value = 1046.5;
      g2.gain.setValueAtTime(0.0001, t + 0.6);
      g2.gain.exponentialRampToValueAtTime(0.07, t + 0.64);
      g2.gain.exponentialRampToValueAtTime(0.0001, t + 0.95);
      o2.connect(g2).connect(master);

      o1.start(t); o1.stop(t + 0.85);
      noise.start(t); noise.stop(t + 0.78);
      o2.start(t + 0.6); o2.stop(t + 1);
    } catch { /* Web Audio unavailable — silently skip */ }
  }

  // Short two-note uptick for control toggles (SND/MOTION).
  confirm() {
    if (this.muted) return;
    try {
      const ctx = this.ensure(), master = this.master!, t = ctx.currentTime;
      [820, 1180].forEach((f, i) => {
        const o = ctx.createOscillator(), g = ctx.createGain(), start = t + i * 0.05;
        o.type = 'triangle'; o.frequency.value = f;
        g.gain.setValueAtTime(0.0001, start);
        g.gain.exponentialRampToValueAtTime(0.045, start + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, start + 0.1);
        o.connect(g).connect(master); o.start(start); o.stop(start + 0.12);
      });
    } catch { /* Web Audio unavailable — silently skip */ }
  }

  // Generic short tone — used for the featured-run/project change.
  blip(freq: number) {
    if (this.muted) return;
    try {
      const ctx = this.ensure(), master = this.master!, t = ctx.currentTime;
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = 'triangle'; o.frequency.value = freq;
      g.gain.setValueAtTime(0.045, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);
      o.connect(g).connect(master); o.start(t); o.stop(t + 0.14);
    } catch { /* Web Audio unavailable — silently skip */ }
  }

  // Nav checkpoint change — a quick mechanical click, then a clean "locked in" tone.
  checkpointLock() {
    if (this.muted) return;
    try {
      const ctx = this.ensure(), master = this.master!, t = ctx.currentTime;

      const noise = ctx.createBufferSource();
      noise.buffer = this.noiseBuffer(ctx, 0.05);
      const hp = ctx.createBiquadFilter();
      hp.type = 'highpass'; hp.frequency.value = 2500;
      const gn = ctx.createGain();
      gn.gain.setValueAtTime(0.05, t); gn.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);
      noise.connect(hp).connect(gn).connect(master);
      noise.start(t); noise.stop(t + 0.06);

      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = 'triangle'; o.frequency.value = 1318.5;
      g.gain.setValueAtTime(0.0001, t + 0.04);
      g.gain.exponentialRampToValueAtTime(0.05, t + 0.06);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
      o.connect(g).connect(master); o.start(t + 0.04); o.stop(t + 0.18);
    } catch { /* Web Audio unavailable — silently skip */ }
  }

  // HUD gear digit change — a short filtered-noise "mechanical" thunk with a falling sub tone.
  gearShift() {
    if (this.muted) return;
    try {
      const ctx = this.ensure(), master = this.master!, t = ctx.currentTime;

      const noise = ctx.createBufferSource();
      noise.buffer = this.noiseBuffer(ctx, 0.08);
      const bp = ctx.createBiquadFilter();
      bp.type = 'bandpass'; bp.frequency.value = 900; bp.Q.value = 1.2;
      const gn = ctx.createGain();
      gn.gain.setValueAtTime(0.05, t); gn.gain.exponentialRampToValueAtTime(0.0001, t + 0.07);
      noise.connect(bp).connect(gn).connect(master);
      noise.start(t); noise.stop(t + 0.08);

      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = 'sine';
      o.frequency.setValueAtTime(140, t); o.frequency.exponentialRampToValueAtTime(70, t + 0.09);
      g.gain.setValueAtTime(0.035, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.1);
      o.connect(g).connect(master); o.start(t); o.stop(t + 0.11);
    } catch { /* Web Audio unavailable — silently skip */ }
  }

  // Process step clears — soft, quiet high tick so a run of them doesn't get noisy.
  stepClear() {
    if (this.muted) return;
    try {
      const ctx = this.ensure(), master = this.master!, t = ctx.currentTime;
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = 'sine'; o.frequency.value = 1568;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.03, t + 0.008);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.09);
      o.connect(g).connect(master); o.start(t); o.stop(t + 0.1);
    } catch { /* Web Audio unavailable — silently skip */ }
  }

  // Report screen arrival — a small resolving triangle arpeggio.
  lapComplete() {
    if (this.muted) return;
    try {
      const ctx = this.ensure(), master = this.master!, t = ctx.currentTime;
      [659.25, 830.6, 987.77].forEach((f, i) => {
        const o = ctx.createOscillator(), g = ctx.createGain(), start = t + i * 0.09;
        o.type = 'triangle'; o.frequency.value = f;
        g.gain.setValueAtTime(0.0001, start);
        g.gain.exponentialRampToValueAtTime(0.06, start + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, start + 0.28);
        o.connect(g).connect(master); o.start(start); o.stop(start + 0.3);
      });
    } catch { /* Web Audio unavailable — silently skip */ }
  }

  // Contact screen arrival — a descending sweep mirroring ignition(), the narrative
  // bookend for "AB-02 SHUTTING DOWN".
  shutdown() {
    if (this.muted) return;
    try {
      const ctx = this.ensure(), master = this.master!, t = ctx.currentTime;

      const o1 = ctx.createOscillator(), g1 = ctx.createGain(), f1 = ctx.createBiquadFilter();
      o1.type = 'sine';
      o1.frequency.setValueAtTime(210, t); o1.frequency.exponentialRampToValueAtTime(50, t + 0.9);
      f1.type = 'lowpass';
      f1.frequency.setValueAtTime(2000, t); f1.frequency.exponentialRampToValueAtTime(300, t + 0.9);
      g1.gain.setValueAtTime(0.0001, t);
      g1.gain.exponentialRampToValueAtTime(0.08, t + 0.12);
      g1.gain.exponentialRampToValueAtTime(0.0001, t + 1.1);
      o1.connect(f1).connect(g1).connect(master);

      const noise = ctx.createBufferSource();
      noise.buffer = this.noiseBuffer(ctx, 1.0);
      const bp = ctx.createBiquadFilter();
      bp.type = 'bandpass'; bp.Q.value = 0.7;
      bp.frequency.setValueAtTime(2200, t); bp.frequency.exponentialRampToValueAtTime(150, t + 1.0);
      const gn = ctx.createGain();
      gn.gain.setValueAtTime(0.0001, t);
      gn.gain.exponentialRampToValueAtTime(0.035, t + 0.2);
      gn.gain.exponentialRampToValueAtTime(0.0001, t + 1.0);
      noise.connect(bp).connect(gn).connect(master);

      o1.start(t); o1.stop(t + 1.1);
      noise.start(t); noise.stop(t + 1.0);
    } catch { /* Web Audio unavailable — silently skip */ }
  }
}
