/* Pitch Trainer — audio engine (Web Audio synthesis, no samples) */
(function () {
  'use strict';
  let ctx = null, master = null, analyser = null, bus = null, comp = null;
  let playId = 0;
  const pending = new Set();
  const ksCache = new Map();
  const waves = {};

  const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);

  function init() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      ctx = new AC();
      comp = ctx.createDynamicsCompressor();
      comp.threshold.value = -14; comp.knee.value = 10; comp.ratio.value = 4;
      master = ctx.createGain(); master.gain.value = 0.9;
      analyser = ctx.createAnalyser(); analyser.fftSize = 1024;
      master.connect(comp); comp.connect(analyser); analyser.connect(ctx.destination);
      newBus();
      buildWaves();
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function newBus() { bus = ctx.createGain(); bus.gain.value = 1; bus.connect(master); }

  function buildWaves() {
    const mk = (amps) => {
      const real = new Float32Array(amps.length + 1), imag = new Float32Array(amps.length + 1);
      amps.forEach((a, i) => { imag[i + 1] = a; });
      return ctx.createPeriodicWave(real, imag);
    };
    waves.piano = mk([1, 0.55, 0.32, 0.22, 0.12, 0.09, 0.06, 0.035, 0.02, 0.012]);
    waves.clarinet = mk([1, 0.02, 0.62, 0.02, 0.42, 0.02, 0.22, 0.01, 0.16, 0.01, 0.08, 0, 0.05]);
  }

  function stopAll() {
    playId++;
    pending.forEach((t) => clearTimeout(t.timer) || t.resolve(false));
    pending.clear();
    if (!ctx || !bus) return;
    const b = bus, now = ctx.currentTime;
    b.gain.cancelScheduledValues(now);
    b.gain.setValueAtTime(b.gain.value, now);
    b.gain.linearRampToValueAtTime(0, now + 0.05);
    setTimeout(() => { try { b.disconnect(); } catch (e) {} }, 250);
    newBus();
  }

  function env(g, t, a, peak, d, rel) {
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(peak, t + a);
    g.gain.setValueAtTime(peak, t + Math.max(a, d - rel));
    g.gain.linearRampToValueAtTime(0.0001, t + d);
  }

  function vibrato(osc, t, f, depth, rate, delay) {
    const lfo = ctx.createOscillator(), lg = ctx.createGain();
    lfo.frequency.value = rate;
    lg.gain.setValueAtTime(0, t);
    lg.gain.linearRampToValueAtTime(f * depth, t + delay);
    lfo.connect(lg); lg.connect(osc.frequency);
    lfo.start(t); return lfo;
  }

  const V = {
    piano(m, t, d, vel, out) {
      const f = mtof(m);
      const decay = Math.max(0.6, Math.min(3.2, 1.6 + (72 - m) * 0.045));
      const end = t + d + 0.25;
      const g = ctx.createGain(), lp = ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.setValueAtTime(Math.min(f * 9, 9000), t);
      lp.frequency.exponentialRampToValueAtTime(Math.max(f * 2.2, 400), t + decay);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(0.32 * vel, t + 0.006);
      g.gain.exponentialRampToValueAtTime(0.11 * vel, t + 0.25);
      g.gain.exponentialRampToValueAtTime(0.0008, t + decay + 0.4);
      const rg = ctx.createGain();
      rg.gain.setValueAtTime(1, t); rg.gain.setTargetAtTime(0.0001, t + d, 0.07);
      [0, 3].forEach((det, i) => {
        const o = ctx.createOscillator();
        o.setPeriodicWave(waves.piano); o.frequency.value = f; o.detune.value = det;
        const og = ctx.createGain(); og.gain.value = i ? 0.45 : 0.7;
        o.connect(og); og.connect(lp); o.start(t); o.stop(end);
      });
      // hammer click
      const n = ctx.createBufferSource(); n.buffer = noiseBuf();
      const ng = ctx.createGain(), nf = ctx.createBiquadFilter();
      nf.type = 'bandpass'; nf.frequency.value = Math.min(f * 4, 5000); nf.Q.value = 1.2;
      ng.gain.setValueAtTime(0.05 * vel, t); ng.gain.exponentialRampToValueAtTime(0.0001, t + 0.04);
      n.connect(nf); nf.connect(ng); ng.connect(out); n.start(t); n.stop(t + 0.05);
      lp.connect(g); g.connect(rg); rg.connect(out);
    },
    guitar(m, t, d, vel, out) {
      const src = ctx.createBufferSource(); src.buffer = ksBuffer(m);
      const g = ctx.createGain(), lp = ctx.createBiquadFilter();
      lp.type = 'lowpass'; lp.frequency.value = 4200;
      g.gain.setValueAtTime(0.55 * vel, t);
      g.gain.setValueAtTime(0.55 * vel, t + d);
      g.gain.linearRampToValueAtTime(0.0001, t + d + 0.12);
      src.connect(lp); lp.connect(g); g.connect(out);
      src.start(t); src.stop(t + d + 0.15);
    },
    cello(m, t, d, vel, out) {
      const f = mtof(m), g = ctx.createGain(), lp = ctx.createBiquadFilter(), pk = ctx.createBiquadFilter();
      lp.type = 'lowpass'; lp.frequency.value = Math.min(2400, f * 9); lp.Q.value = 0.8;
      pk.type = 'peaking'; pk.frequency.value = 600; pk.gain.value = 5; pk.Q.value = 1.2;
      env(g, t, 0.09, 0.2 * vel, d, 0.22);
      [-4, 4].forEach((det) => {
        const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = f; o.detune.value = det;
        const l = vibrato(o, t, f, 0.005, 5.3, 0.35);
        o.connect(lp); o.start(t); o.stop(t + d + 0.05); l.stop(t + d + 0.05);
      });
      lp.connect(pk); pk.connect(g); g.connect(out);
    },
    clarinet(m, t, d, vel, out) {
      const f = mtof(m), g = ctx.createGain(), lp = ctx.createBiquadFilter();
      lp.type = 'lowpass'; lp.frequency.value = Math.min(3200, f * 8);
      env(g, t, 0.05, 0.3 * vel, d, 0.12);
      const o = ctx.createOscillator(); o.setPeriodicWave(waves.clarinet); o.frequency.value = f;
      const l = vibrato(o, t, f, 0.003, 4.8, 0.5);
      o.connect(lp); lp.connect(g); g.connect(out);
      o.start(t); o.stop(t + d + 0.05); l.stop(t + d + 0.05);
    },
    trumpet(m, t, d, vel, out) {
      const f = mtof(m), g = ctx.createGain(), lp = ctx.createBiquadFilter();
      lp.type = 'lowpass'; lp.Q.value = 1.5;
      lp.frequency.setValueAtTime(f * 1.2, t);
      lp.frequency.linearRampToValueAtTime(Math.min(f * 7, 6000), t + 0.07);
      lp.frequency.linearRampToValueAtTime(Math.min(f * 4.5, 4500), t + 0.25);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(0.2 * vel, t + 0.035);
      g.gain.linearRampToValueAtTime(0.15 * vel, t + 0.2);
      g.gain.setValueAtTime(0.15 * vel, t + Math.max(0.2, d - 0.1));
      g.gain.linearRampToValueAtTime(0.0001, t + d);
      const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = f;
      const l = vibrato(o, t, f, 0.004, 5.6, 0.45);
      o.connect(lp); lp.connect(g); g.connect(out);
      o.start(t); o.stop(t + d + 0.05); l.stop(t + d + 0.05);
    },
    sine(m, t, d, vel, out) {
      const f = mtof(m), g = ctx.createGain();
      env(g, t, 0.025, 0.36 * vel, d, 0.18);
      const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = f;
      o.connect(g); g.connect(out); o.start(t); o.stop(t + d + 0.05);
    }
  };

  let _noise = null;
  function noiseBuf() {
    if (_noise) return _noise;
    const len = Math.floor(ctx.sampleRate * 0.1);
    _noise = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = _noise.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    return _noise;
  }

  function ksBuffer(m) {
    if (ksCache.has(m)) return ksCache.get(m);
    const sr = ctx.sampleRate, f = mtof(m);
    const N = Math.max(2, Math.round(sr / f - 0.5));
    const len = Math.floor(sr * 3);
    const buf = ctx.createBuffer(1, len, sr), y = buf.getChannelData(0);
    // pluck: filtered noise burst
    let prev = 0;
    for (let i = 0; i < N; i++) { const r = Math.random() * 2 - 1; prev = prev * 0.45 + r * 0.55; y[i] = prev; }
    const damp = m > 76 ? 0.990 : m > 64 ? 0.994 : 0.996;
    for (let i = N; i < len; i++) y[i] = damp * 0.5 * (y[i - N] + y[i - N - 1 < 0 ? 0 : i - N - 1]);
    let peak = 0; for (let i = 0; i < N * 4; i++) peak = Math.max(peak, Math.abs(y[i]));
    const k = peak ? 0.9 / peak : 1;
    for (let i = 0; i < len; i++) y[i] *= k;
    ksCache.set(m, buf);
    return buf;
  }

  const INSTRUMENTS = ['piano', 'guitar', 'cello', 'clarinet', 'trumpet'];
  function resolveInstrument(name) {
    if (!name || name === 'random') return INSTRUMENTS[Math.floor(Math.random() * INSTRUMENTS.length)];
    return V[name] ? name : 'piano';
  }

  /* steps: [{t, notes:[midi], d, v}] ; returns Promise<boolean finished> */
  function play(steps, instrument, opts) {
    init();
    if (!opts || !opts.keep) stopAll();
    const inst = resolveInstrument(instrument);
    const t0 = ctx.currentTime + 0.04;
    let end = 0;
    for (const s of steps) {
      for (const n of s.notes) {
        let mm = n;
        // keep instruments in a playable register
        if (inst === 'cello') while (mm > 76) mm -= 12;
        V[inst](mm, t0 + s.t, s.d, s.v || 0.9, bus);
      }
      end = Math.max(end, s.t + s.d);
    }
    const id = playId;
    return new Promise((resolve) => {
      const tok = { resolve };
      tok.timer = setTimeout(() => { pending.delete(tok); resolve(id === playId); }, (end + 0.06) * 1000);
      pending.add(tok);
    });
  }

  function sfx(kind) {
    init();
    const t = ctx.currentTime + 0.01;
    const blip = (f, at, d, type, vol) => {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = type; o.frequency.value = f;
      g.gain.setValueAtTime(0.0001, t + at);
      g.gain.linearRampToValueAtTime(vol, t + at + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t + at + d);
      o.connect(g); g.connect(master); o.start(t + at); o.stop(t + at + d + 0.02);
    };
    if (kind === 'good') { blip(988, 0, 0.16, 'sine', 0.12); blip(1319, 0.08, 0.25, 'sine', 0.12); }
    else if (kind === 'bad') { blip(196, 0, 0.22, 'triangle', 0.18); blip(165, 0.1, 0.28, 'triangle', 0.16); }
    else if (kind === 'done') { [523, 659, 784, 1047].forEach((f, i) => blip(f, i * 0.09, 0.3, 'sine', 0.1)); }
    else if (kind === 'tap') { blip(660, 0, 0.05, 'sine', 0.05); }
  }

  /* level 0..1 from analyser for visuals */
  const tbuf = new Uint8Array(1024);
  function level() {
    if (!analyser) return 0;
    analyser.getByteTimeDomainData(tbuf);
    let s = 0; for (let i = 0; i < tbuf.length; i++) { const v = (tbuf[i] - 128) / 128; s += v * v; }
    return Math.min(1, Math.sqrt(s / tbuf.length) * 5);
  }

  window.PTAudio = { init, play, stopAll, sfx, level, resolveInstrument, INSTRUMENTS };
})();
