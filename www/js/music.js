/* Pitch Trainer — music theory + per-skill sound generation */
(function () {
  'use strict';
  const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

  const NAMES = {
    flat: ['C', 'D♭', 'D', 'E♭', 'E', 'F', 'G♭', 'G', 'A♭', 'A', 'B♭', 'B'],
    sharp: ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'],
    solFlat: ['Do', 'Re♭', 'Re', 'Mi♭', 'Mi', 'Fa', 'Sol♭', 'Sol', 'La♭', 'La', 'Ti♭', 'Ti'],
    solSharp: ['Do', 'Do♯', 'Re', 'Re♯', 'Mi', 'Fa', 'Fa♯', 'Sol', 'Sol♯', 'La', 'La♯', 'Ti']
  };
  const NAME_OPTIONS = [['flat', 'Letter ( ♭ )'], ['sharp', 'Letter ( ♯ )'], ['solFlat', 'Solfège ( ♭ )'], ['solSharp', 'Solfège ( ♯ )']];
  const TRANSPOSE_OPTIONS = ['Do', 'Re ♭', 'Re', 'Mi ♭', 'Mi', 'Fa', 'Sol ♭', 'Sol', 'La ♭', 'La', 'Ti ♭', 'Ti'];
  const WHITE = [0, 2, 4, 5, 7, 9, 11], BLACK = [1, 3, 6, 8, 10], ALL12 = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

  const INTERVALS = {
    1: ['m2', 'Minor 2nd'], 2: ['M2', 'Major 2nd'], 3: ['m3', 'Minor 3rd'], 4: ['M3', 'Major 3rd'],
    5: ['P4', 'Perfect 4th'], 6: ['A4', 'Augmented 4th'], 7: ['P5', 'Perfect 5th'], 8: ['m6', 'Minor 6th'],
    9: ['M6', 'Major 6th'], 10: ['m7', 'Minor 7th'], 11: ['M7', 'Major 7th'], 12: ['P8', 'Octave']
  };

  const CHORDS = {
    maj: { name: 'Major', kind: 'triad', iv: [0, 4, 7] },
    min: { name: 'Minor', kind: 'triad', iv: [0, 3, 7] },
    dim: { name: 'Diminished', kind: 'triad', iv: [0, 3, 6] },
    aug: { name: 'Augmented', kind: 'triad', iv: [0, 4, 8] },
    maj7: { name: 'Major 7th', kind: 'seventh chord', iv: [0, 4, 7, 11] },
    min7: { name: 'Minor 7th', kind: 'seventh chord', iv: [0, 3, 7, 10] },
    dom7: { name: 'Dominant 7th', kind: 'seventh chord', iv: [0, 4, 7, 10] },
    hdim7: { name: 'Half-Diminished 7th', kind: 'seventh chord', iv: [0, 3, 6, 10] },
    dim7: { name: 'Diminished 7th', kind: 'seventh chord', iv: [0, 3, 6, 9] }
  };
  const CHORD_SHORT = { maj: 'Maj', min: 'Min', dim: 'Dim', aug: 'Aug', maj7: 'Maj7', min7: 'm7', dom7: 'Dom7', hdim7: 'ø7', dim7: 'Dim7' };

  const SCALES = {
    lydian: { name: 'Lydian', iv: [0, 2, 4, 6, 7, 9, 11, 12], ch: 6 },
    major: { name: 'Major', iv: [0, 2, 4, 5, 7, 9, 11, 12], ch: 4 },
    mixo: { name: 'Mixolydian', iv: [0, 2, 4, 5, 7, 9, 10, 12], ch: 10 },
    pentmaj: { name: 'Pentatonic Major', iv: [0, 2, 4, 7, 9, 12], ch: null },
    dorian: { name: 'Dorian', iv: [0, 2, 3, 5, 7, 9, 10, 12], ch: 9 },
    melmin: { name: 'Melodic Minor', iv: [0, 2, 3, 5, 7, 9, 11, 12], ch: 9 },
    harmin: { name: 'Harmonic Minor', iv: [0, 2, 3, 5, 7, 8, 11, 12], ch: 11 },
    natmin: { name: 'Natural Minor', iv: [0, 2, 3, 5, 7, 8, 10, 12], ch: 3 },
    pentmin: { name: 'Pentatonic Minor', iv: [0, 3, 5, 7, 10, 12], ch: null },
    blues: { name: 'Blues', iv: [0, 3, 5, 6, 7, 10, 12], ch: 6 },
    phrygian: { name: 'Phrygian', iv: [0, 1, 3, 5, 7, 8, 10, 12], ch: 1 }
  };

  const ROMAN = {
    I: [0, 'maj'], ii: [2, 'min'], iii: [4, 'min'], IV: [5, 'maj'], V: [7, 'maj'], vi: [9, 'min'],
    i: [0, 'min'], iv: [5, 'min'], III: [3, 'maj'], VI: [8, 'maj'], VII: [10, 'maj']
  };
  const PROGS = {
    'I-IV-V-I': { mark: 2 }, 'I-IV-I-V': { mark: 3 }, 'I-V-vi-IV': { mark: 2 }, 'I-vi-IV-V': { mark: 1 },
    'I-iii-IV-V': { mark: 1 }, 'vi-IV-I-V': { mark: 0 }, 'i-VI-III-VII': { mark: 0 }, 'i-iv-i-V': { mark: 3 }, 'ii-V-I': { mark: 0 }
  };
  Object.keys(PROGS).forEach((k) => { PROGS[k].chords = k.split('-'); });

  /* ---------- descriptions shown in "Meet" slides ---------- */
  const DESC = {
    pitch: {
      0: ['The home base. Neutral, stable, and grounded.', ['Every note you learn is measured against {C}.', 'It sounds {warm and settled}, never tense.', 'Tap it, hum it, let it sink in.']],
      7: ['Open and bright, the fifth above home.', ['{G} sits seven half steps above C.', 'It sounds {open and confident}, like a fanfare.', 'Close to home, but lifted.']],
      4: ['Sweet and sunny, the major third.', ['{E} is the color of a happy major chord.', 'It sounds {sweet and bright}.', 'Sing C, then glide up to E.']],
      5: ['Soft and leaning, it wants to fall to E.', ['{F} sits just above E.', 'It feels {restless}, like a held breath.', 'Listen for the pull downward.']],
      2: ['Hopeful, one step up from home.', ['{D} is a single step above C.', 'It sounds {curious}, like a question.', 'It wants to move on.']],
      9: ['Warm and a little wistful.', ['{A} is the tuning note of the orchestra.', 'It sounds {warm and tender}.', 'Above G, below the top.']],
      11: ['Tense and bright, it leans up to C.', ['{B} is one half step below home.', 'It sounds {tense}, like an unfinished sentence.', 'Hear it begging to resolve up.']],
      6: ['Edgy and floating, the farthest from home.', ['{F♯ / G♭} is exactly halfway around the octave.', 'It sounds {unstable and mysterious}.', 'Nothing else sounds this far from C.']],
      10: ['Bluesy and mellow.', ['{B♭ / A♯} is the classic blues note.', 'It sounds {relaxed and soulful}.', 'It sits a whole step below home.']],
      3: ['Dark and moody, the minor third.', ['{E♭ / D♯} gives minor chords their color.', 'It sounds {dark and serious}.', 'Compare it with bright E.']],
      1: ['Tight and crunchy, right next to home.', ['{D♭ / C♯} is a half step above C.', 'It sounds {pinched and tense}.', 'It rubs against home.']],
      8: ['Dreamy and dark.', ['{A♭ / G♯} sits between G and A.', 'It sounds {dreamy and heavy}.', 'Think of a film-score sigh.']]
    },
    intervals: {
      1: ['Tense and crunchy, the smallest step.', ['A {minor 2nd} is one half step.', 'It sounds {tense}, like a shark warning.', 'The two notes rub hard.']],
      2: ['A plain step, like walking up a scale.', ['A {major 2nd} is two half steps.', 'It sounds {neutral}, like do to re.', 'The building block of melodies.']],
      3: ['Sad and tender.', ['A {minor 3rd} is three half steps.', 'It sounds {wistful}, like a lullaby.', 'The sound of a minor chord.']],
      4: ['Happy and bright.', ['A {major 3rd} is four half steps.', 'It sounds {sunny}, like a doorbell.', 'The sound of a major chord.']],
      5: ['Solid, like the start of a hymn.', ['A {perfect 4th} is five half steps.', 'It sounds {stable but expectant}.', 'Think "Here comes the bride".']],
      6: ['The devil\'s interval: eerie and unstable.', ['The {tritone} splits the octave in half.', 'It sounds {spooky}, like a siren.', 'It always wants to resolve.']],
      7: ['Open and strong, like a power chord.', ['A {perfect 5th} is seven half steps.', 'It sounds {open and heroic}.', 'Think of a sci-fi fanfare.']],
      8: ['Bittersweet and dramatic.', ['A {minor 6th} is eight half steps.', 'It sounds {yearning}.', 'A wide, emotional leap.']],
      9: ['Warm and welcoming.', ['A {major 6th} is nine half steps.', 'It sounds {sweet and open}.', 'Think of a friendly greeting call.']],
      10: ['Bluesy and unresolved.', ['A {minor 7th} is ten half steps.', 'It sounds {bluesy}, a stretch.', 'Just short of the octave, with attitude.']],
      11: ['Dreamy and tense.', ['A {major 7th} is eleven half steps.', 'It sounds {shimmering but tense}.', 'Almost an octave, but not quite.']],
      12: ['The same note, higher.', ['An {octave} is twelve half steps.', 'It sounds {pure and hollow}.', 'Both notes share a name.']]
    },
    chords: {
      maj: ['Bright, happy, and stable.', ['A {major triad} stacks a major 3rd and a minor 3rd.', 'It sounds {bright and resolved}.', 'Most songs start and end here.']],
      min: ['Sad, soft, and serious.', ['A {minor triad} stacks a minor 3rd and a major 3rd.', 'It sounds {dark and emotional}.', 'Same 5th as major, different middle.']],
      dim: ['Tense and anxious.', ['A {diminished triad} stacks two minor 3rds.', 'It sounds {nervous and squeezed}.', 'It wants to move somewhere else.']],
      aug: ['Dreamy and suspended.', ['An {augmented triad} stacks two major 3rds.', 'It sounds {floating and strange}.', 'Like a question that never ends.']],
      maj7: ['Smooth and jazzy.', ['A {major 7th} adds a major 7th to a major triad.', 'It sounds {lush and relaxed}.', 'The sound of a sunset.']],
      min7: ['Mellow and soulful.', ['A {minor 7th} adds a minor 7th to a minor triad.', 'It sounds {soft and groovy}.', 'Common in soul and R&B.']],
      dom7: ['Bluesy and restless.', ['A {dominant 7th} adds a minor 7th to a major triad.', 'It sounds {bluesy}, pulling home.', 'The engine of the blues.']],
      hdim7: ['Dark and yearning.', ['A {half-diminished 7th} adds a minor 7th to a diminished triad.', 'It sounds {moody and unresolved}.', 'Often leads into a minor key.']],
      dim7: ['Spooky and symmetrical.', ['A {diminished 7th} stacks three minor 3rds.', 'It sounds {dramatic, like a silent film}.', 'Every note is equally far apart.']]
    },
    scales: {
      major: ['Bright and familiar: do, re, mi.', ['The {major} scale is the sound of most pop songs.', 'It sounds {bright and complete}.', 'Listen for the sweet major 3rd.']],
      natmin: ['Dark and natural.', ['The {natural minor} lowers the 3rd, 6th, and 7th.', 'It sounds {sad and grounded}.', 'Listen for the dark minor 3rd.']],
      harmin: ['Exotic, with a big leap at the top.', ['{Harmonic minor} raises the 7th of natural minor.', 'It sounds {dramatic and exotic}.', 'Hear the wide gap near the top.']],
      melmin: ['Minor below, major above.', ['{Melodic minor} raises the 6th and 7th.', 'It sounds {smooth and jazzy}.', 'It starts sad and ends bright.']],
      dorian: ['Minor with a bright twist.', ['{Dorian} is minor with a raised 6th.', 'It sounds {cool and soulful}.', 'Funk and folk love it.']],
      phrygian: ['Dark and Spanish.', ['{Phrygian} has a lowered 2nd.', 'It sounds {dark and fiery}.', 'Listen for the first tiny step.']],
      lydian: ['Bright and magical.', ['{Lydian} is major with a raised 4th.', 'It sounds {dreamy, like a film score}.', 'The brightest mode of all.']],
      mixo: ['Major with a bluesy top.', ['{Mixolydian} is major with a lowered 7th.', 'It sounds {rock and roll}.', 'Listen for the flat 7th.']],
      pentmaj: ['Five notes, no tension.', ['{Pentatonic major} drops the 4th and 7th.', 'It sounds {open and folky}.', 'Every note fits.']],
      pentmin: ['Five notes, pure groove.', ['{Pentatonic minor} is the rock solo scale.', 'It sounds {bluesy and simple}.', 'Five notes, big attitude.']],
      blues: ['Pentatonic minor plus the blue note.', ['The {blues} scale adds a flat 5th.', 'It sounds {gritty and expressive}.', 'Hear the extra chromatic step.']]
    },
    progs: {
      'I-IV-V-I': ['The classic cadence.', ['{I-IV-V-I} goes home, away, tension, home.', 'It sounds {complete and resolved}.', 'Hymns, folk, and rock all use it.']],
      'I-IV-I-V': ['Ends on a question.', ['{I-IV-I-V} stops on the V chord.', 'It sounds {open-ended}.', 'It begs to loop back to I.']],
      'I-V-vi-IV': ['The pop loop.', ['{I-V-vi-IV} is in countless hit songs.', 'It sounds {uplifting with a touch of sadness}.', 'Listen for the minor vi.']],
      'I-vi-IV-V': ['The fifties doo-wop.', ['{I-vi-IV-V} drops straight to the minor vi.', 'It sounds {nostalgic and sweet}.', 'A slow-dance classic.']],
      'I-iii-IV-V': ['A gentle climb.', ['{I-iii-IV-V} steps through the minor iii.', 'It sounds {hopeful and rising}.', 'Each chord lifts higher.']],
      'vi-IV-I-V': ['The sad loop.', ['{vi-IV-I-V} starts on the minor vi.', 'It sounds {emotional and anthemic}.', 'Same chords as the pop loop, sadder start.']],
      'i-VI-III-VII': ['The minor epic.', ['{i-VI-III-VII} marches through big major chords.', 'It sounds {heroic and dark}.', 'Common in film and rock ballads.']],
      'i-iv-i-V': ['A minor cadence with a sharp turn.', ['{i-iv-i-V} ends on a major V.', 'It sounds {dramatic and classical}.', 'Hear the bright V at the end.']],
      'ii-V-I': ['The jazz turnaround.', ['{ii-V-I} is the heart of jazz.', 'It sounds {smooth and inevitable}.', 'Minor, tension, home.']]
    }
  };

  /* ---------- skill metadata ---------- */
  const SKILLS = {
    pitch: { id: 'pitch', name: 'Pitch', full: 'Pitch Trainer', sub: 'Name a note', color: 'orange', ask: 'Which note is this?', practiceTime: 60 },
    intervals: { id: 'intervals', name: 'Intervals', full: 'Interval Trainer', sub: 'Note distance', color: 'blue', ask: 'Which interval is this?', practiceTime: 90 },
    chords: { id: 'chords', name: 'Chords', full: 'Chord Recognition', sub: 'Identify quality', color: 'purple', ask: 'Which chord is this?', practiceTime: 90 },
    scales: { id: 'scales', name: 'Scales', full: 'Scale Detection', sub: 'Find the key', color: 'gold', ask: 'Which scale is this?', practiceTime: 120 },
    progs: { id: 'progs', name: 'Progressions', full: 'Chord Progressions', sub: 'Song patterns by ear', color: 'teal', ask: 'Which progression is this?', practiceTime: 150 }
  };
  const SKILL_ORDER = ['pitch', 'intervals', 'chords', 'scales', 'progs'];
  const ALL_ITEMS = {
    pitch: ALL12.slice(),
    intervals: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    chords: Object.keys(CHORDS),
    scales: Object.keys(SCALES),
    progs: Object.keys(PROGS)
  };

  /* ---------- labels ---------- */
  function label(skill, item, st) {
    st = st || {};
    switch (skill) {
      case 'pitch': return NAMES[st.names || 'flat'][(((item + (st.transpose || 0)) % 12) + 12) % 12];
      case 'intervals': return INTERVALS[item][0];
      case 'chords': return CHORDS[item].name;
      case 'scales': return SCALES[item].name;
      case 'progs': return item;
    }
  }
  function shortLabel(skill, item, st) {
    if (skill === 'chords') return CHORD_SHORT[item];
    return label(skill, item, st);
  }
  function subLabel(skill, item) {
    switch (skill) {
      case 'intervals': return INTERVALS[item][1];
      case 'chords': return CHORDS[item].kind;
      default: return '';
    }
  }

  /* ---------- sound instances ---------- */
  function closeVoicing(root, quality) {
    const iv = CHORDS[quality].iv;
    return iv.map((x) => root + x);
  }
  function invert(notes, n) {
    const out = notes.slice();
    for (let i = 0; i < n; i++) { out.push(out.shift() + 12); }
    return out;
  }

  /* register ranges per option */
  function intRange(o) { return o.low ? [40, 52] : o.wide ? [45, 72] : [55, 67]; }
  function chordRange(o) { return o.low ? [40, 50] : o.high ? [64, 74] : o.wide ? [43, 67] : [55, 64]; }
  function scaleRoot(o) { return o.low ? rnd(43, 52) : o.randomRoot ? rnd(o.wide ? 48 : 55, o.wide ? 66 : 64) : 60; }
  function progKey(o) { return o.low ? rnd(48, 55) : o.randomKey ? rnd(55, 66) : 60; }

  /* opts per lesson; returns {steps} */
  function instance(skill, item, o) {
    o = o || {};
    const fast = o.fast ? 0.62 : 1;
    switch (skill) {
      case 'pitch': {
        const oct = pick(o.oct || [4]);
        const m = 12 * (oct + 1) + item;
        return { steps: [{ t: 0, notes: [m], d: 1.5 }], meta: { midi: m } };
      }
      case 'intervals': {
        const [lo, hi] = intRange(o);
        let dir = o.dir || 'up';
        if (dir === 'both') dir = pick(['up', 'down']);
        if (dir === 'any') dir = pick(['up', 'down', 'harm']);
        const a = o.root != null ? o.root : (dir === 'down' ? rnd(lo + 12, hi + 5) : rnd(lo, hi));
        const b = dir === 'down' ? a - item : a + item;
        const steps = dir === 'harm'
          ? [{ t: 0, notes: [a, b], d: 1.8 * fast }]
          : [{ t: 0, notes: [a], d: 0.85 * fast }, { t: 0.9 * fast, notes: [b], d: 1.2 * fast }];
        return { steps, meta: { dir } };
      }
      case 'chords': {
        const [lo, hi] = chordRange(o);
        const root = o.root != null ? o.root : rnd(lo, hi);
        let notes = closeVoicing(root, item);
        if (o.inv) notes = invert(notes, o.invN != null ? o.invN % notes.length : rnd(0, notes.length - 1));
        if (o.low) notes = [root - 12].concat(notes);
        if (o.arp) return { steps: notes.map((n, i) => ({ t: i * 0.32, notes: [n], d: 2.0 - i * 0.32 })) };
        return { steps: [{ t: 0, notes, d: 2.0 }] };
      }
      case 'scales': {
        const sc = SCALES[item];
        const root = o.root != null ? o.root : scaleRoot(o);
        let seq = sc.iv.map((x) => root + x);
        const down = o.down != null ? o.down : (o.allDown || (o.desc && Math.random() < 0.5));
        if (down) seq = seq.slice().reverse();
        const step = 0.3 * (o.fast ? 0.6 : 1);
        return { steps: seq.map((n, i) => ({ t: i * step, notes: [n], d: i === seq.length - 1 ? 0.9 : step + 0.05 })) };
      }
      case 'progs': {
        const key = o.key != null ? o.key : progKey(o);
        const pr = PROGS[item].chords;
        const steps = [];
        let prev = null;
        const dur = 0.95 * (o.fast ? 0.65 : 1);
        pr.forEach((r, i) => {
          const [off, q] = ROMAN[r];
          let root = key + off;
          if (root > key + 6) root -= 12;
          let upper;
          if (o.voice) {
            const base = closeVoicing(root + 12, q);
            const cands = [0, 1, 2].map((k) => invert(base, k)).concat([0, 1, 2].map((k) => invert(base, k).map((n) => n - 12)));
            if (!prev) upper = cands.reduce((best, c) => (Math.abs(c[0] - (key + 4)) < Math.abs(best[0] - (key + 4)) ? c : best));
            else upper = cands.reduce((best, c) => (dist(c, prev) < dist(best, prev) ? c : best));
            prev = upper;
          } else {
            upper = closeVoicing(root, q);
          }
          steps.push({ t: i * dur, notes: [root - 12].concat(upper), d: dur + (i === pr.length - 1 ? 0.6 : 0.02) });
        });
        return { steps };
      }
    }
  }
  function dist(a, b) { let s = 0; for (let i = 0; i < Math.min(a.length, b.length); i++) s += Math.abs(a[i] - b[i]); return s; }

  /* a melody of pitch classes (for "name the notes" questions) */
  function seqInstance(items, o) {
    const oct = pick(o.oct || [4]);
    return { steps: items.map((pc, i) => ({ t: i * 0.85, notes: [12 * (oct + 1) + pc], d: i === items.length - 1 ? 1.3 : 0.8 })) };
  }

  /* Fix the random parts of a sound so alternates can be played in the same register */
  function concrete(skill, o) {
    o = Object.assign({}, o || {});
    switch (skill) {
      case 'pitch': o.oct = [pick(o.oct || [4])]; break;
      case 'intervals': {
        let dir = o.dir || 'up';
        if (dir === 'both') dir = pick(['up', 'down']);
        if (dir === 'any') dir = pick(['up', 'down', 'harm']);
        const [lo, hi] = intRange(o);
        o.dir = dir; o.root = dir === 'down' ? rnd(lo + 12, hi + 5) : rnd(lo, hi); break;
      }
      case 'chords': {
        const [lo, hi] = chordRange(o);
        o.root = rnd(lo, hi); if (o.inv) o.invN = rnd(0, 3); break;
      }
      case 'scales':
        o.root = scaleRoot(o);
        o.down = !!(o.allDown || (o.desc && Math.random() < 0.5)); break;
      case 'progs': o.key = progKey(o); break;
    }
    return o;
  }

  /* Short chords between questions so the last sound doesn't anchor the next answer.
     style: 'harmonic' (pleasant diatonic chords), 'mixed' (consonant chords, unrelated keys), 'dissonant' (clusters) */
  const DIATONIC = [[0, 'maj'], [2, 'min'], [4, 'min'], [5, 'maj'], [7, 'maj'], [9, 'min']];
  function voiceNear(root, q, center) {
    const base = closeVoicing(root, q);
    const cands = [0, 1, 2].map((k) => invert(base, k)).concat([0, 1, 2].map((k) => invert(base, k).map((n) => n - 12)));
    return cands.reduce((b, c) => (Math.abs(c[1] - center) < Math.abs(b[1] - center) ? c : b));
  }
  function resetEarSteps(style) {
    const steps = [];
    if (style === 'dissonant') {
      for (let i = 0; i < 3; i++) {
        const root = rnd(48, 64), q = pick(['maj', 'min', 'dim', 'aug']);
        steps.push({ t: i * 0.2, notes: closeVoicing(root, q).concat([root + rnd(13, 20)]), d: 0.18, v: 0.5 });
      }
      return { steps, len: 0.75 };
    }
    if (style === 'mixed') {
      for (let i = 0; i < 3; i++) {
        const root = rnd(50, 62), q = pick(['maj', 'min']);
        steps.push({ t: i * 0.3, notes: voiceNear(root, q, 62).concat([root - 12]), d: 0.32, v: 0.45 });
      }
      return { steps, len: 1.0 };
    }
    // harmonic: a short, pleasant cadence in a random key
    const key = rnd(53, 64);
    const order = shuffleArr(DIATONIC.slice(1)).slice(0, 2);
    const chords = [DIATONIC[0]].concat(order);
    chords.forEach(([off, q], i) => {
      let root = key + off; if (root > key + 6) root -= 12;
      steps.push({ t: i * 0.34, notes: voiceNear(root, q, 64).concat([root - 12]), d: 0.4, v: 0.42 });
    });
    return { steps, len: 1.1 };
  }
  function shuffleArr(a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }

  window.PTMusic = {
    NAMES, NAME_OPTIONS, TRANSPOSE_OPTIONS, WHITE, BLACK, ALL12, INTERVALS, CHORDS, SCALES, ROMAN, PROGS, DESC,
    SKILLS, SKILL_ORDER, ALL_ITEMS, concrete, seqInstance, label, shortLabel, subLabel, instance, resetEarSteps, rnd, pick
  };
})();
