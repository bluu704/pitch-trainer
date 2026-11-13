/* Pitch Trainer — curriculum: units & lessons for each skill.
   Lesson fields: t title, d desc, n new items, p explicit pool, o sound options.
   The last lesson of each unit is a checkpoint (flag); the very last is the final exam (trophy). */
(function () {
  'use strict';
  const W = [0, 2, 4, 5, 7, 9, 11], B = [1, 3, 6, 8, 10], A12 = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  const I12 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  const TRI = ['maj', 'min', 'dim', 'aug'], SEV = ['maj7', 'min7', 'dom7', 'hdim7', 'dim7'];
  const ALLC = TRI.concat(SEV);
  const ALLS = ['major', 'natmin', 'harmin', 'melmin', 'dorian', 'phrygian', 'lydian', 'mixo', 'pentmaj', 'pentmin', 'blues'];
  const MAJP = ['I-IV-V-I', 'I-IV-I-V', 'I-V-vi-IV', 'I-vi-IV-V', 'I-iii-IV-V'];
  const MINP = ['vi-IV-I-V', 'i-VI-III-VII', 'i-iv-i-V'];
  const ALLP = MAJP.concat(MINP, ['ii-V-I']);

  const DATA = {
    pitch: [
      { t: 'Middle C Major', d: 'All white keys, middle octave.', o: { oct: [4] }, L: [
        { t: 'Intro: Pitch Trainer', d: 'What pitch training is and how it works.', n: [0], intro: 1 },
        { t: 'Home & the Fifth', d: 'Meet G, the open fifth above home.', n: [7] },
        { t: 'The Sweet Third', d: 'Meet E, the bright major third.', n: [4] },
        { t: 'The Leaning Fourth', d: 'Meet F, the note that wants to fall.', n: [5] },
        { t: 'One Step Up', d: 'Meet D, the hopeful step.', n: [2] },
        { t: 'Top of the Scale', d: 'Meet A and B to finish the white keys.', n: [9, 11] },
        { t: 'Middle C Major', d: 'Checkpoint: every white key in the middle octave.' }
      ] },
      { t: 'Chromatic Middle', d: 'All 12 notes, middle octave.', o: { oct: [4] }, L: [
        { t: 'The Far Note', d: 'Meet F♯, the farthest note from home.', n: [6] },
        { t: 'Blue Notes', d: 'Meet B♭, mellow and bluesy.', n: [10] },
        { t: 'The Dark Third', d: 'Meet E♭, the minor third.', n: [3] },
        { t: 'Neighbors', d: 'Meet D♭ and A♭ to complete all 12.', n: [1, 8] },
        { t: 'Chromatic Middle', d: 'Checkpoint: all 12 notes, middle octave.' }
      ] },
      { t: 'The Basement', d: 'Low octave mastery.', o: { oct: [3] }, L: [
        { t: 'Low Home', d: 'C, E, and G one octave down.', p: [0, 4, 7] },
        { t: 'Low White Keys', d: 'Every white key, low octave.', p: W },
        { t: 'Low Black Keys', d: 'All 12 notes, low octave.', p: A12 },
        { t: 'The Basement', d: 'Checkpoint: low octave.', p: A12 }
      ] },
      { t: 'The Attic', d: 'High octave mastery.', o: { oct: [5] }, L: [
        { t: 'High Home', d: 'C, E, and G one octave up.', p: [0, 4, 7] },
        { t: 'High White Keys', d: 'Every white key, high octave.', p: W },
        { t: 'High Black Keys', d: 'All 12 notes, high octave.', p: A12 },
        { t: 'The Attic', d: 'Checkpoint: high octave.', p: A12 }
      ] },
      { t: 'White-Key Mastery', d: 'All white keys, any octave.', o: { oct: [3, 4, 5] }, L: [
        { t: 'Anchors Anywhere', d: 'C, E, and G in any octave.', p: [0, 4, 7] },
        { t: 'Steps Anywhere', d: 'C, D, E, F, G in any octave.', p: [0, 2, 4, 5, 7] },
        { t: 'White Keys Anywhere', d: 'Every white key, any octave.', p: W },
        { t: 'New Voices', d: 'White keys on random instruments.', p: W, o: { inst: 'random' } },
        { t: 'White-Key Mastery', d: 'Checkpoint: white keys, any octave.', p: W }
      ] },
      { t: 'Chromatic Mastery', d: 'All black keys, any octave.', o: { oct: [3, 4, 5] }, L: [
        { t: 'Black Keys Anywhere', d: 'The five black keys in any octave.', p: B },
        { t: 'All 12 Anywhere', d: 'Every note, any octave.', p: A12 },
        { t: 'Chromatic Mastery', d: 'Checkpoint: all 12, any octave.', p: A12 }
      ] },
      { t: 'Absolute Pitch', d: '12 Notes. 3 Octaves. Random. No Mercy.', o: { oct: [3, 4, 5], inst: 'random' }, L: [
        { t: 'Random Timbres', d: 'Every note on every instrument.', p: A12 },
        { t: 'No Warm-up', d: 'Ear resets before every note.', p: A12, o: { reset: 1 } },
        { t: 'Speed Round', d: 'A longer run, all 12 notes.', p: A12, q: 30 },
        { t: 'Absolute Pitch', d: '12 Notes. 3 Octaves. Random. No Mercy. Pass it to skip everything before it.', p: A12 }
      ] }
    ],
    intervals: [
      { t: 'Perfect Intervals', d: 'P4, P5, P8, up or down.', o: { dir: 'up' }, L: [
        { t: 'Intro: Interval Trainer', d: 'What intervals are and how to hear them.', n: [7], intro: 1 },
        { t: 'The Octave', d: 'Meet P8, the same note higher.', n: [12] },
        { t: 'The Fourth', d: 'Meet P4, solid and expectant.', n: [5] },
        { t: 'Perfects Up', d: 'P4, P5, and P8 going up.' },
        { t: 'Going Down', d: 'The same intervals, downward.', o: { dir: 'down' } },
        { t: 'Perfects Together', d: 'P4, P5, P8 played at once.', o: { dir: 'harm' } },
        { t: 'Up or Down', d: 'Either direction.', o: { dir: 'both' } },
        { t: 'Perfect Intervals', d: 'Checkpoint: perfect intervals, up or down.', o: { dir: 'both' } }
      ] },
      { t: 'Thirds & Perfects', d: 'm3, M3, P4, P5, P8, up or down.', o: { dir: 'up' }, L: [
        { t: 'The Major Third', d: 'Meet M3, happy and bright.', n: [4] },
        { t: 'The Minor Third', d: 'Meet m3, sad and tender.', n: [3] },
        { t: 'Thirds Compared', d: 'Major vs minor thirds.', p: [3, 4, 7] },
        { t: 'Thirds Going Down', d: 'Thirds and perfects, downward.', o: { dir: 'down' } },
        { t: 'Mixed Directions', d: 'Up or down, all five.', o: { dir: 'both' } },
        { t: 'Together', d: 'Both notes at once.', o: { dir: 'harm' } },
        { t: 'Thirds & Perfects', d: 'Checkpoint: thirds and perfects.', o: { dir: 'both' } }
      ] },
      { t: 'Small Intervals', d: 'Up to the 4th, both directions.', o: { dir: 'up' }, L: [
        { t: 'The Whole Step', d: 'Meet M2, a plain step.', n: [2], p: [2, 3, 4, 5] },
        { t: 'The Half Step', d: 'Meet m2, the smallest step.', n: [1], p: [1, 2, 3, 4, 5] },
        { t: 'Seconds Compared', d: 'Half steps vs whole steps.', p: [1, 2, 3] },
        { t: 'Small Steps Down', d: 'Small intervals going down.', p: [1, 2, 3, 4, 5], o: { dir: 'down' } },
        { t: 'Small Mix', d: 'Small intervals, either way.', p: [1, 2, 3, 4, 5], o: { dir: 'both' } },
        { t: 'Small Intervals', d: 'Checkpoint: up to the 4th.', p: [1, 2, 3, 4, 5], o: { dir: 'both' } }
      ] },
      { t: 'Consonance', d: 'All pleasant intervals.', o: { dir: 'up' }, L: [
        { t: 'The Major Sixth', d: 'Meet M6, warm and welcoming.', n: [9], p: [3, 4, 5, 7, 9, 12] },
        { t: 'The Minor Sixth', d: 'Meet m6, bittersweet.', n: [8], p: [3, 4, 5, 7, 8, 9, 12] },
        { t: 'Sweet Sounds', d: 'Every consonant interval.', p: [3, 4, 5, 7, 8, 9, 12], o: { dir: 'both' } },
        { t: 'Consonance', d: 'Checkpoint: pleasant intervals.', p: [3, 4, 5, 7, 8, 9, 12], o: { dir: 'both' } }
      ] },
      { t: 'The Stretches', d: 'm2, M6, m7, M7, P8.', o: { dir: 'up' }, L: [
        { t: 'The Minor Seventh', d: 'Meet m7, bluesy and unresolved.', n: [10], p: [1, 9, 10, 12] },
        { t: 'The Major Seventh', d: 'Meet M7, almost an octave.', n: [11], p: [1, 9, 10, 11, 12] },
        { t: 'Sevenths Compared', d: 'm7 vs M7 vs P8.', p: [9, 10, 11, 12] },
        { t: 'Stretch Mix', d: 'The stretches, either way.', p: [1, 9, 10, 11, 12], o: { dir: 'both' } },
        { t: 'The Stretches', d: 'Checkpoint: the stretches.', p: [1, 9, 10, 11, 12], o: { dir: 'both' } }
      ] },
      { t: 'Full Chromatic', d: 'All 12 intervals, controlled.', o: { dir: 'up' }, L: [
        { t: 'The Tritone', d: 'Meet A4, the devil\'s interval.', n: [6], p: [5, 6, 7] },
        { t: 'All Twelve Up', d: 'Every interval, ascending.', p: I12 },
        { t: 'All Twelve Together', d: 'Every interval, both notes at once.', p: I12, o: { dir: 'harm' } },
        { t: 'Full Chromatic', d: 'Checkpoint: all 12 intervals.', p: I12 }
      ] },
      { t: 'Every Direction', d: 'All 12 intervals, up or down.', o: { dir: 'any' }, L: [
        { t: 'All Down', d: 'Every interval, descending.', p: I12, o: { dir: 'down' } },
        { t: 'Small, Any Way', d: 'm2 to A4, any direction.', p: [1, 2, 3, 4, 5, 6] },
        { t: 'Large, Any Way', d: 'A4 to P8, any direction.', p: [6, 7, 8, 9, 10, 11, 12] },
        { t: 'Harmonic All', d: 'All 12 played together.', p: I12, o: { dir: 'harm' } },
        { t: 'Wide Register', d: 'Low and high, any direction.', p: I12, o: { wide: 1 } },
        { t: 'Speed Round', d: 'A longer run, everything.', p: I12, q: 30 },
        { t: 'Every Direction', d: 'Checkpoint: all intervals, any direction.', p: I12 }
      ] },
      { t: 'Final Exam: Absolute Mastery', d: 'Any interval. Any octave. Either direction.', o: { dir: 'any', wide: 1 }, L: [
        { t: 'Absolute Mastery', d: 'Any interval. Any octave. Either direction. Pass it to skip everything before it.', p: I12 }
      ] }
    ],
    chords: [
      { t: 'Basic Triads', d: 'Major and Minor mastery.', L: [
        { t: 'Intro: Chord Recognition', d: 'What chord quality is and how to hear it.', n: ['maj'], intro: 1 },
        { t: 'Minor Triads', d: 'Meet the minor triad.', n: ['min'] },
        { t: 'Major vs Minor', d: 'Bright or dark?' },
        { t: 'Any Root', d: 'Major and minor on any root.', o: { wide: 1 } },
        { t: 'Basic Triads', d: 'Checkpoint: major and minor.' }
      ] },
      { t: 'All Triads', d: 'Maj, Min, Dim, Aug.', L: [
        { t: 'Diminished', d: 'Meet the diminished triad.', n: ['dim'] },
        { t: 'Augmented', d: 'Meet the augmented triad.', n: ['aug'] },
        { t: 'Triad Mix', d: 'All four triads.' },
        { t: 'All Triads', d: 'Checkpoint: all triads.' }
      ] },
      { t: 'Common 7ths', d: 'Maj7, Dom7, Min7.', L: [
        { t: 'Major 7th', d: 'Meet the major 7th chord.', n: ['maj7'], p: ['maj', 'min', 'maj7'] },
        { t: 'Dominant 7th', d: 'Meet the dominant 7th chord.', n: ['dom7'], p: ['maj', 'min', 'maj7', 'dom7'] },
        { t: 'Minor 7th', d: 'Meet the minor 7th chord.', n: ['min7'], p: ['maj', 'min', 'maj7', 'dom7', 'min7'] },
        { t: 'Sevenths Compared', d: 'Maj7, Dom7, and m7.', p: ['maj7', 'dom7', 'min7'] },
        { t: 'Triads & Sevenths', d: 'Triads and common 7ths.', p: TRI.concat(['maj7', 'dom7', 'min7']) },
        { t: 'Common 7ths', d: 'Checkpoint: common 7ths.', p: TRI.concat(['maj7', 'dom7', 'min7']) }
      ] },
      { t: 'All 7ths', d: 'Maj7, m7, Dom7, hDim7, Dim7.', L: [
        { t: 'Half-Diminished', d: 'Meet the half-diminished 7th.', n: ['hdim7'], p: ['maj7', 'dom7', 'min7', 'hdim7'] },
        { t: 'Diminished 7th', d: 'Meet the diminished 7th.', n: ['dim7'], p: SEV },
        { t: 'All Sevenths', d: 'All five 7th chords.', p: SEV },
        { t: 'All 7ths', d: 'Checkpoint: all 7th chords.', p: SEV }
      ] },
      { t: 'The Rumble', d: 'All chords, low octave.', o: { low: 1 }, L: [
        { t: 'Low Triads', d: 'Triads down low.', p: TRI },
        { t: 'Low Sevenths', d: '7th chords down low.', p: SEV },
        { t: 'Inversions', d: 'Every chord, inverted.', p: ALLC, o: { low: 0, inv: 1 } },
        { t: 'The Rumble', d: 'Checkpoint: all chords, low octave.', p: ALLC }
      ] },
      { t: 'Final Exam: Harmonic Mastery', d: 'All chords. All octaves.', o: { wide: 1 }, L: [
        { t: 'Any Octave', d: 'Every chord, anywhere.', p: ALLC },
        { t: 'Broken Chords', d: 'Every chord, one note at a time.', p: ALLC, o: { arp: 1 } },
        { t: 'Harmonic Mastery', d: 'All chords. All octaves. Pass it to skip everything before it.', p: ALLC, o: { inv: 1 } }
      ] }
    ],
    scales: [
      { t: 'The Foundation', d: 'Major, Natural Minor, Harmonic Minor, Melodic Minor.', L: [
        { t: 'Intro: Scale Detection', d: 'What scales are and how to tell them apart.', n: ['major'], intro: 1 },
        { t: 'Natural Minor', d: 'Meet the natural minor scale.', n: ['natmin'] },
        { t: 'Major vs Minor', d: 'Bright or dark?' },
        { t: 'Harmonic Minor', d: 'Meet harmonic minor.', n: ['harmin'] },
        { t: 'Melodic Minor', d: 'Meet melodic minor.', n: ['melmin'] },
        { t: 'Foundation Mix', d: 'All four foundation scales.' },
        { t: 'The Foundation', d: 'Checkpoint: the foundation scales.' }
      ] },
      { t: 'Minor Modes', d: 'Major, three minor variants, Dorian, Phrygian.', L: [
        { t: 'Dorian', d: 'Meet Dorian, minor with a bright 6th.', n: ['dorian'] },
        { t: 'Phrygian', d: 'Meet Phrygian, dark and Spanish.', n: ['phrygian'] },
        { t: 'Minor Shades', d: 'Every minor flavor.', p: ['natmin', 'harmin', 'melmin', 'dorian', 'phrygian'] },
        { t: 'Mode Mix', d: 'All six scales so far.' },
        { t: 'Minor Modes', d: 'Checkpoint: minor modes.' }
      ] },
      { t: 'Diatonic Mastery', d: 'All eight diatonic scales, any root.', L: [
        { t: 'Lydian', d: 'Meet Lydian, the brightest mode.', n: ['lydian'] },
        { t: 'Mixolydian', d: 'Meet Mixolydian, major with a flat 7th.', n: ['mixo'] },
        { t: 'Bright to Dark', d: 'Modes from brightest to darkest.', p: ['lydian', 'major', 'mixo', 'dorian', 'natmin', 'phrygian'] },
        { t: 'Any Root', d: 'Diatonic scales on any root.', o: { randomRoot: 1 } },
        { t: 'Diatonic Mastery', d: 'Checkpoint: diatonic scales, any root.', o: { randomRoot: 1 } }
      ] },
      { t: 'All 11 Scales', d: 'Every scale, any root.', o: { randomRoot: 1 }, L: [
        { t: 'Pentatonic Major', d: 'Meet the five-note major scale.', n: ['pentmaj'] },
        { t: 'Pentatonic Minor', d: 'Meet the five-note minor scale.', n: ['pentmin'] },
        { t: 'Blues', d: 'Meet the blues scale.', n: ['blues'] },
        { t: 'All Eleven', d: 'Every scale you know.', p: ALLS },
        { t: 'All 11 Scales', d: 'Checkpoint: all 11 scales.', p: ALLS }
      ] },
      { t: 'Final: Any Scale, Any Key', d: 'All 11 scales, random keys and octaves.', o: { randomRoot: 1, wide: 1 }, L: [
        { t: 'Random Keys', d: 'Every scale in random keys.', p: ALLS },
        { t: 'Up and Down', d: 'Ascending or descending.', p: ALLS, o: { desc: 1 } },
        { t: 'Any Scale, Any Key', d: 'All 11 scales, random keys and octaves. Pass it to skip everything before it.', p: ALLS, o: { desc: 1 } }
      ] }
    ],
    progs: [
      { t: 'Major Foundations', d: 'All five major-key progressions.', L: [
        { t: 'Intro: Chord Progressions', d: 'How chord patterns shape songs.', n: ['I-IV-V-I'], intro: 1 },
        { t: 'Back to Five', d: 'Meet I-IV-I-V.', n: ['I-IV-I-V'] },
        { t: 'The Pop Loop', d: 'Meet I-V-vi-IV.', n: ['I-V-vi-IV'] },
        { t: 'The Fifties', d: 'Meet I-vi-IV-V.', n: ['I-vi-IV-V'] },
        { t: 'The Third Way', d: 'Meet I-iii-IV-V.', n: ['I-iii-IV-V'] },
        { t: 'Major Mix', d: 'All five major progressions.' },
        { t: 'Major Foundations', d: 'Checkpoint: major progressions.' }
      ] },
      { t: 'Into the Minor', d: 'All minor progressions plus the sad loop.', L: [
        { t: 'The Sad Loop', d: 'Meet vi-IV-I-V.', n: ['vi-IV-I-V'] },
        { t: 'Minor Epic', d: 'Meet i-VI-III-VII.', n: ['i-VI-III-VII'] },
        { t: 'Minor Cadence', d: 'Meet i-iv-i-V.', n: ['i-iv-i-V'] },
        { t: 'Minor Compared', d: 'The three minor-flavored loops.', p: MINP },
        { t: 'The Jazz Turn', d: 'Meet ii-V-I.', n: ['ii-V-I'] },
        { t: 'Light and Dark', d: 'Major and minor progressions.' },
        { t: 'Into the Minor', d: 'Checkpoint: minor progressions.' }
      ] },
      { t: 'All Nine', d: 'Every progression in a fixed key.', p: ALLP, L: [
        { t: 'All Nine', d: 'Every progression you know.', p: ALLP },
        { t: 'Similar Pairs', d: 'The look-alikes, side by side.', p: ['I-V-vi-IV', 'vi-IV-I-V', 'I-vi-IV-V', 'I-iii-IV-V', 'I-IV-V-I', 'I-IV-I-V'] },
        { t: 'Speed Round', d: 'A longer run, all nine.', p: ALLP, q: 30 },
        { t: 'All Nine', d: 'Checkpoint: all nine progressions.', p: ALLP }
      ] },
      { t: 'Real Voicings', d: 'All nine, inverted, fixed key.', o: { voice: 1 }, L: [
        { t: 'Smooth Voicings', d: 'Major progressions, voice-led.', p: MAJP },
        { t: 'Minor Voicings', d: 'Minor progressions, voice-led.', p: MINP.concat(['ii-V-I']) },
        { t: 'All Nine Voiced', d: 'Every progression, voice-led.', p: ALLP },
        { t: 'Close Listening', d: 'Focus on the bass line.', p: ALLP },
        { t: 'Real Voicings', d: 'Checkpoint: real voicings.', p: ALLP }
      ] },
      { t: 'Final: Any Progression, Any Key', d: 'All nine, random keys, real voicings.', o: { voice: 1, randomKey: 1 }, L: [
        { t: 'Any Progression, Any Key', d: 'All nine, random keys, real voicings. Pass it to skip everything before it.', p: ALLP }
      ] }
    ]
  };

  /* Flatten into lessons with resolved pools/options */
  const SKILL = {};
  Object.keys(DATA).forEach((sk) => {
    const lessons = [], units = [];
    const learned = [];
    DATA[sk].forEach((u, ui) => {
      const unit = { idx: ui, t: u.t, d: u.d, start: lessons.length, lessons: [] };
      u.L.forEach((l, li) => {
        (l.n || []).forEach((x) => { if (!learned.includes(x)) learned.push(x); });
        const isLast = li === u.L.length - 1;
        const kind = isLast ? (ui === DATA[sk].length - 1 ? 'final' : 'check') : (l.n && l.n.length ? 'learn' : 'review');
        const lesson = {
          skill: sk, idx: lessons.length, unit: ui, t: l.t, d: l.d,
          n: l.n || [], pool: (l.p || learned).slice(), kind, intro: !!l.intro,
          o: Object.assign({}, u.o || {}, l.o || {}),
          q: l.q || (kind === 'final' ? 40 : kind === 'check' ? 24 : kind === 'learn' ? 15 : 18)
        };
        // ensure new items are always in pool
        lesson.n.forEach((x) => { if (!lesson.pool.includes(x)) lesson.pool.push(x); });
        lessons.push(lesson); unit.lessons.push(lesson.idx);
      });
      units.push(unit);
    });
    SKILL[sk] = { lessons, units };
  });

  window.PTCurriculum = { SKILL };
})();
