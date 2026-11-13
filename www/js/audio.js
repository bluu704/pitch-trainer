/* Pitch Trainer — audio engine.
   Real recorded instrument samples (FluidR3 GM soundfont, CC BY 3.0) sampled every 3 semitones
   and pitch-shifted in between, through a soft room reverb. Sine wave is synthesized. */
(function () {
  'use strict';
  let ctx = null, master = null, analyser = null, bus = null, comp = null, wet = null;
  let playId = 0;
  const pending = new Set();

  const SAMPLE_INST = ['piano', 'guitar', 'cello', 'clarinet', 'trumpet'];
  const POINTS = []; for (let m = 24; m <= 96; m += 3) POINTS.push(m);
  // loudness matching (samples are peak-normalized per instrument)
  const TRIM = { piano: 1.0, guitar: 1.05, cello: 0.5, clarinet: 0.36, trumpet: 0.62, sine: 0.42 };
  // how long the note rings after its nominal end
  const REL = { piano: 0.35, guitar: 0.3, cello: 0.22, clarinet: 0.14, trumpet: 0.14 };
  const buffers = {}; // inst -> {midi: AudioBuffer}
  const loading = {}; // inst -> Promise

  const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);

  function makeCtx() {
    if (ctx) return ctx;
    const AC = window.AudioContext || window.webkitAudioContext;
    ctx = new AC({ latencyHint: 'interactive' });
    comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -12; comp.knee.value = 12; comp.ratio.value = 3; comp.attack.value = 0.004; comp.release.value = 0.2;
    master = ctx.createGain(); master.gain.value = 0.85;
    // gentle tone shaping: tame harsh highs a little
    const shelf = ctx.createBiquadFilter(); shelf.type = 'highshelf'; shelf.frequency.value = 6500; shelf.gain.value = -3;
    // room reverb
    const conv = ctx.createConvolver(); conv.buffer = impulse(1.8, 2.6);
    wet = ctx.createGain(); wet.gain.value = 0.16;
    analyser = ctx.createAnalyser(); analyser.fftSize = 1024;
    master.connect(shelf); shelf.connect(comp);
    master.connect(conv); conv.connect(wet); wet.connect(comp);
    comp.connect(analyser); analyser.connect(ctx.destination);
    newBus();
    return ctx;
  }
  function init() {
    makeCtx();
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }
  function newBus() { bus = ctx.createGain(); bus.gain.value = 1; bus.connect(master); }

  function impulse(sec, decay) {
    const rate = ctx.sampleRate, len = Math.floor(rate * sec);
    const buf = ctx.createBuffer(2, len, rate);
    for (let c = 0; c < 2; c++) {
      const d = buf.getChannelData(c); let lp = 0;
      for (let i = 0; i < len; i++) {
        const t = i / len;
        lp = lp * 0.55 + (Math.random() * 2 - 1) * 0.45; // darker tail
        d[i] = lp * Math.pow(1 - t, decay) * (i < rate * 0.01 ? i / (rate * 0.01) : 1);
      }
    }
    return buf;
  }

  /* ---------- sample loading ---------- */
  function b64ToBuf(b64) {
    const bin = atob(b64), n = bin.length, u = new Uint8Array(n);
    for (let i = 0; i < n; i++) u[i] = bin.charCodeAt(i);
    return u.buffer;
  }
  function decode(ab) {
    return new Promise((res, rej) => {
      const p = ctx.decodeAudioData(ab, res, rej);
      if (p && p.then) p.then(res, rej);
    });
  }
  function loadInstrument(inst) {
    if (!SAMPLE_INST.includes(inst)) return Promise.resolve(true);
    if (loading[inst]) return loading[inst];
    makeCtx();
    buffers[inst] = buffers[inst] || {};
    const embedded = window.PT_SAMPLES && window.PT_SAMPLES[inst];
    loading[inst] = Promise.all(POINTS.map((m) => {
      const src = embedded ? Promise.resolve(b64ToBuf(embedded[m]))
        : fetch('samples/' + inst + '/' + m + '.mp3').then((r) => { if (!r.ok) throw new Error('404'); return r.arrayBuffer(); });
      return src.then(decode).then((b) => { buffers[inst][m] = b; }).catch(() => {});
    })).then(() => Object.keys(buffers[inst]).length > 0);
    return loading[inst];
  }
  const ready = (inst) => !SAMPLE_INST.includes(inst) || (buffers[inst] && Object.keys(buffers[inst]).length >= POINTS.length - 2);
  function preload(list) {
    makeCtx();
    return Promise.all((list || SAMPLE_INST).map(loadInstrument));
  }

  /* ---------- voices ---------- */
  function sampleVoice(inst, m, t, d, vel, out) {
    const set = buffers[inst];
    let best = null, bd = 99;
    for (const p of POINTS) { if (set[p] && Math.abs(p - m) < bd) { bd = Math.abs(p - m); best = p; } }
    if (best == null) return synthVoice(m, t, d, vel, out);
    const src = ctx.createBufferSource();
    src.buffer = set[best];
    src.playbackRate.value = Math.pow(2, (m - best) / 12);
    const g = ctx.createGain();
    const peak = vel * TRIM[inst];
    const rel = REL[inst];
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(peak, t + (inst === 'cello' ? 0.03 : 0.006));
    g.gain.setValueAtTime(peak, t + d);
    g.gain.setTargetAtTime(0, t + d, rel / 3);
    src.connect(g); g.connect(out);
    src.start(t);
    src.stop(Math.min(t + d + rel * 2 + 0.05, t + src.buffer.duration / src.playbackRate.value + 0.05));
  }
  // soft electric-piano-like synth used for the Sine setting and while samples load
  function synthVoice(m, t, d, vel, out, pure) {
    const f = mtof(m), g = ctx.createGain(), lp = ctx.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.value = Math.min(4000, f * 6);
    const peak = vel * TRIM.sine;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(peak, t + 0.02);
    g.gain.setTargetAtTime(peak * 0.7, t + 0.05, 0.4);
    g.gain.setValueAtTime(peak * 0.7, t + d);
    g.gain.setTargetAtTime(0, t + d, 0.09);
    const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = f;
    o.connect(lp);
    let o2 = null;
    if (!pure) {
      o2 = ctx.createOscillator(); o2.type = 'sine'; o2.frequency.value = f * 2;
      const g2 = ctx.createGain(); g2.gain.value = 0.12; o2.connect(g2); g2.connect(lp);
      o2.start(t); o2.stop(t + d + 0.5);
    }
    lp.connect(g); g.connect(out);
    o.start(t); o.stop(t + d + 0.5);
  }

  function stopAll() {
    playId++;
    pending.forEach((t) => { clearTimeout(t.timer); t.resolve(false); });
    pending.clear();
    if (!ctx || !bus) return;
    const b = bus, now = ctx.currentTime;
    b.gain.cancelScheduledValues(now);
    b.gain.setValueAtTime(b.gain.value, now);
    b.gain.linearRampToValueAtTime(0, now + 0.06);
    setTimeout(() => { try { b.disconnect(); } catch (e) { /* gone */ } }, 300);
    newBus();
  }

  function resolveInstrument(name) {
    if (!name || name === 'random') return SAMPLE_INST[Math.floor(Math.random() * SAMPLE_INST.length)];
    return name === 'sine' || SAMPLE_INST.includes(name) ? name : 'piano';
  }

  // keep each instrument in a natural register
  const RANGE = { piano: [21, 108], guitar: [40, 88], cello: [36, 76], clarinet: [50, 91], trumpet: [52, 84], sine: [0, 127] };
  function octaveShift(inst, steps) {
    const [lo, hi] = RANGE[inst];
    let mn = 999, mx = -999;
    steps.forEach((s) => s.notes.forEach((n) => { mn = Math.min(mn, n); mx = Math.max(mx, n); }));
    let sh = 0;
    while (mn + sh < lo && mx + sh + 12 <= hi + 7) sh += 12;
    while (mx + sh > hi && mn + sh - 12 >= lo - 7) sh -= 12;
    return sh;
  }

  /* steps: [{t, notes:[midi], d, v}] -> Promise<boolean finished> */
  async function play(steps, instrument, opts) {
    init();
    opts = opts || {};
    if (!opts.keep) stopAll();
    const id = playId;
    const inst = resolveInstrument(instrument);
    if (!ready(inst)) {
      await Promise.race([loadInstrument(inst), new Promise((r) => setTimeout(r, 2500))]);
      if (id !== playId) return false;
    }
    const useSamples = SAMPLE_INST.includes(inst) && ready(inst);
    const t0 = ctx.currentTime + 0.03;
    let end = 0;
    const sh = opts.noFit ? 0 : octaveShift(inst, steps);
    for (const s of steps) {
      const v = s.v || 0.85;
      const chordScale = s.notes.length > 1 ? 1 / Math.sqrt(s.notes.length) * 1.2 : 1;
      for (const n of s.notes) {
        const m = n + sh;
        if (useSamples) sampleVoice(inst, m, t0 + s.t, s.d, v * chordScale, bus);
        else synthVoice(m, t0 + s.t, s.d, v * chordScale, bus, inst === 'sine');
      }
      end = Math.max(end, s.t + s.d);
    }
    return new Promise((resolve) => {
      const tok = { resolve };
      tok.timer = setTimeout(() => { pending.delete(tok); resolve(id === playId); }, (end + 0.08) * 1000);
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
      g.gain.linearRampToValueAtTime(vol, t + at + 0.012);
      g.gain.exponentialRampToValueAtTime(0.0001, t + at + d);
      o.connect(g); g.connect(comp); o.start(t + at); o.stop(t + at + d + 0.02);
    };
    if (kind === 'good') { blip(880, 0, 0.18, 'sine', 0.07); blip(1318.5, 0.07, 0.3, 'sine', 0.07); }
    else if (kind === 'bad') { blip(311, 0, 0.22, 'sine', 0.08); blip(233, 0.09, 0.32, 'sine', 0.08); }
    else if (kind === 'done') { [523.3, 659.3, 784, 1046.5].forEach((f, i) => blip(f, i * 0.09, 0.4, 'sine', 0.06)); }
    else if (kind === 'tap') { blip(660, 0, 0.05, 'sine', 0.03); }
  }

  const tbuf = new Uint8Array(1024);
  function level() {
    if (!analyser) return 0;
    analyser.getByteTimeDomainData(tbuf);
    let s = 0; for (let i = 0; i < tbuf.length; i++) { const v = (tbuf[i] - 128) / 128; s += v * v; }
    return Math.min(1, Math.sqrt(s / tbuf.length) * 5);
  }

  window.PTAudio = { init, play, stopAll, sfx, level, resolveInstrument, preload, loadInstrument, INSTRUMENTS: SAMPLE_INST, POINTS };
})();
