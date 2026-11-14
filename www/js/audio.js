/* Pitch Trainer — audio engine.
   Real recorded instrument samples (FluidR3 GM soundfont, CC BY 3.0) sampled every 3 semitones
   and pitch-shifted in between, through a soft room reverb. Sine wave is synthesized. */
(function () {
  'use strict';
  let ctx = null, master = null, analyser = null, bus = null, busV = null, verbIn = null, comp = null, wet = null;
  let playId = 0;
  const pending = new Set();

  const SAMPLE_INST = ['piano', 'guitar', 'cello', 'clarinet', 'trumpet'];
  const POINTS = []; for (let m = 24; m <= 96; m += 3) POINTS.push(m);
  // clarinet is sampled on every semitone in its range, so its notes are never pitch-shifted
  const CLAR = []; for (let m = 48; m <= 96; m++) CLAR.push(m);
  const pointsOf = (inst) => (inst === 'clarinet' ? CLAR : POINTS);
  // loudness matching (samples are peak-normalized per instrument)
  const TRIM = { piano: 0.8, guitar: 0.56, cello: 0.48, clarinet: 0.34, trumpet: 0.52, sine: 0.36 };
  // how long the note rings after its nominal end
  const REL = { piano: 0.7, guitar: 0.6, cello: 0.4, clarinet: 0.32, trumpet: 0.3 };
  // softer onsets (seconds) and a gentle per-instrument low-pass (Hz) to take the edge off
  // how much of each instrument goes to the room reverb (guitar stays close and dry)
  const VERB = { piano: 0.24, guitar: 0.06, cello: 0.26, clarinet: 0.24, trumpet: 0.22, sine: 0.24 };
  const ATK = { piano: 0.028, guitar: 0.035, cello: 0.07, clarinet: 0.045, trumpet: 0.05 };
  const TONE = { piano: 2800, guitar: 5200, cello: 2600, clarinet: 2800, trumpet: 2400 };
  const buffers = {}; // inst -> {midi: AudioBuffer}
  const loading = {}; // inst -> Promise

  const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);

  function makeCtx() {
    if (ctx) return ctx;
    const AC = window.AudioContext || window.webkitAudioContext;
    ctx = new AC({ latencyHint: 'interactive' });
    comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -18; comp.knee.value = 24; comp.ratio.value = 2.2; comp.attack.value = 0.012; comp.release.value = 0.3;
    master = ctx.createGain(); master.gain.value = 0.75;
    // tone shaping: roll off harsh highs and a little boxiness
    const shelf = ctx.createBiquadFilter(); shelf.type = 'highshelf'; shelf.frequency.value = 4500; shelf.gain.value = -6;
    const mid = ctx.createBiquadFilter(); mid.type = 'peaking'; mid.frequency.value = 2800; mid.Q.value = 1.1; mid.gain.value = -2.5;
    shelf.connect(mid);
    // warm room reverb
    const conv = ctx.createConvolver(); conv.buffer = impulse(2.2, 2.4);
    wet = ctx.createGain(); wet.gain.value = 1;
    verbIn = ctx.createGain(); verbIn.gain.value = 1; verbIn.connect(conv);
    analyser = ctx.createAnalyser(); analyser.fftSize = 1024;
    master.connect(shelf); mid.connect(comp);
    conv.connect(wet); wet.connect(comp); // reverb is fed per instrument (see VERB)
    comp.connect(analyser); analyser.connect(ctx.destination);
    newBus();
    return ctx;
  }
  function init() {
    makeCtx();
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }
  function newBus() {
    bus = ctx.createGain(); bus.gain.value = 1; bus.connect(master);
    busV = ctx.createGain(); busV.gain.value = 1; busV.connect(verbIn);
  }

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
    loading[inst] = Promise.all(pointsOf(inst).map((m) => {
      const src = embedded ? Promise.resolve(b64ToBuf(embedded[m]))
        : fetch('samples/' + inst + '/' + m + '.mp3').then((r) => { if (!r.ok) throw new Error('404'); return r.arrayBuffer(); });
      return src.then(decode).then((b) => { buffers[inst][m] = b; }).catch(() => {});
    })).then(() => Object.keys(buffers[inst]).length > 0);
    return loading[inst];
  }
  const ready = (inst) => !SAMPLE_INST.includes(inst) || (buffers[inst] && Object.keys(buffers[inst]).length >= pointsOf(inst).length - 2);
  function preload(list) {
    makeCtx();
    return Promise.all((list || SAMPLE_INST).map(loadInstrument));
  }

  /* ---------- voices ---------- */
  function sampleVoice(inst, m, t, d, vel, out, cents) {
    const set = buffers[inst];
    let best = null, bd = 99;
    for (const p of pointsOf(inst)) { if (set[p] && Math.abs(p - m) < bd) { bd = Math.abs(p - m); best = p; } }
    if (best == null) return synthVoice(m, t, d, vel, out);
    const src = ctx.createBufferSource();
    src.buffer = set[best];
    src.playbackRate.value = Math.pow(2, (m - best) / 12 + (cents || 0) / 1200);
    const g = ctx.createGain(), lp = ctx.createBiquadFilter();
    lp.type = 'lowpass'; lp.Q.value = 0.5;
    const cut = Math.min(TONE[inst], Math.max(1400, mtof(m) * 8));
    if (inst === 'piano') {
      lp.frequency.setValueAtTime(cut, t);
      lp.frequency.exponentialRampToValueAtTime(Math.max(900, cut * 0.6), t + 0.6);
    } else lp.frequency.value = cut;
    const peak = vel * TRIM[inst];
    const rel = REL[inst];
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(peak, t + ATK[inst]);
    g.gain.setValueAtTime(peak, t + d);
    g.gain.setTargetAtTime(0, t + d, rel / 3);
    if (inst === 'guitar') {
      // acoustic body: air resonance (~110 Hz) and top plate (~240 Hz) for warmth,
      // a gentle lift around 1.2 kHz so the overtones ring out, and the top end left open
      const air = ctx.createBiquadFilter(); air.type = 'peaking'; air.frequency.value = 110; air.Q.value = 1.2; air.gain.value = 5.5;
      const plate = ctx.createBiquadFilter(); plate.type = 'peaking'; plate.frequency.value = 240; plate.Q.value = 0.9; plate.gain.value = 4.5;
      const bloom = ctx.createBiquadFilter(); bloom.type = 'peaking'; bloom.frequency.value = 1200; bloom.Q.value = 0.7; bloom.gain.value = 2;
      src.connect(air); air.connect(plate); plate.connect(bloom); bloom.connect(lp);
      // a second, slightly detuned and delayed string doubling thickens the overtones (like a 12-string shimmer, but subtle)
      const dbl = ctx.createBufferSource(); dbl.buffer = src.buffer; dbl.playbackRate.value = src.playbackRate.value * Math.pow(2, 6 / 1200);
      const dg = ctx.createGain(); dg.gain.value = 0.32; dbl.connect(dg); dg.connect(air);
      dbl.start(t + 0.011); dbl.stop(Math.min(t + d + rel * 2 + 0.06, t + 0.011 + dbl.buffer.duration / dbl.playbackRate.value));
    } else src.connect(lp);
    lp.connect(g); g.connect(out);
    const send = ctx.createGain(); send.gain.value = VERB[inst]; g.connect(send); send.connect(busV);
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
    const send = ctx.createGain(); send.gain.value = VERB.sine; g.connect(send); send.connect(busV);
    o.start(t); o.stop(t + d + 0.5);
  }

  function stopAll() {
    playId++;
    pending.forEach((t) => { clearTimeout(t.timer); t.resolve(false); });
    pending.clear();
    if (!ctx || !bus) return;
    const b = bus, bv = busV, now = ctx.currentTime;
    b.gain.cancelScheduledValues(now);
    b.gain.setValueAtTime(b.gain.value, now);
    b.gain.linearRampToValueAtTime(0, now + 0.06);
    bv.gain.cancelScheduledValues(now); bv.gain.setValueAtTime(bv.gain.value, now); bv.gain.linearRampToValueAtTime(0, now + 0.06);
    setTimeout(() => { try { b.disconnect(); bv.disconnect(); } catch (e) { /* gone */ } }, 300);
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
      const chord = s.notes.length > 1;
      const order = s.notes.slice().sort((a, b) => a - b);
      for (const n of s.notes) {
        const m = n + sh;
        // real players never hit a chord at exactly the same instant or perfectly in tune
        let off = 0, cents = 0, vv = v * chordScale;
        if (chord && useSamples) {
          const rank = order.indexOf(n);
          if (inst === 'guitar') off = rank * 0.016;                         // strum, low to high
          else if (inst === 'piano') off = Math.random() * 0.006;
          else { off = Math.random() * 0.028; cents = (Math.random() * 2 - 1) * 5; vv *= 0.9 + Math.random() * 0.15; } // ensemble
        }
        if (useSamples) sampleVoice(inst, m, t0 + s.t + off, Math.max(0.1, s.d - off), vv, bus, cents);
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
    if (kind === 'good') { blip(659.3, 0, 0.22, 'sine', 0.05); blip(987.8, 0.08, 0.34, 'sine', 0.05); }
    else if (kind === 'bad') { blip(293.7, 0, 0.26, 'sine', 0.055); blip(246.9, 0.1, 0.36, 'sine', 0.055); }
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
