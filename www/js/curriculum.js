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
  const I24 = [12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24];
  const SUS6 = ['sus2', 'sus4', '7sus4', 'maj6', 'm6'], ADD = ['add9', 'madd9', 'add11', 'add13', 'six9'];
  const NINE = ['dom9', 'maj9', 'm9'], ELEV = ['dom11', 'm11', 'dom13', 'maj13'], ALT = ['7b9', '7s9', '7s5', '7b5', '7s11', 'mmaj7', 'maj7s11'];
  const OPEN5 = ['open-C', 'open-A', 'open-G', 'open-E', 'open-D'], OPENM = ['open-Am', 'open-Em', 'open-Dm'];
  const OPEN7 = ['open-E7', 'open-A7', 'open-D7', 'open-G7', 'open-C7', 'open-B7'], OPENJ = ['open-Cmaj7', 'open-Fmaj7', 'open-Am7', 'open-Em7', 'open-Dm7'];
  const OPENS = ['open-Asus2', 'open-Asus4', 'open-Dsus2', 'open-Dsus4', 'open-Esus4', 'open-Cadd9'], OPENB = ['open-F', 'open-Bm'];
  const OPENALL = OPEN5.concat(OPENM, OPEN7, OPENJ, OPENS, OPENB);
  const COLORS = ['five', 'sus2a13', 'sus2a11', 'madd11', 'm7add11', 'dom7add11', 'maj7a13', 'dom7b13', 'm7b13'];
  // open-string voicings by shape family; mixed pools keep one shape per chord name
  const OV = window.PTMusic.OPENV;
  const ovFam = (f) => Object.keys(OV).filter((k) => OV[k][3] === f);
  const ovUnique = (ids) => { const seen = new Set(); return ids.filter((k) => !seen.has(OV[k][0]) && seen.add(OV[k][0])); };
  const OVA5 = ovFam('a5'), OVE = ovFam('e6M'), OVEM = ovFam('e6m'), OVINV = ovFam('inv');
  const OVALL = ovUnique(OVA5.concat(OVE, OVEM, OVINV));
  const G9 = (pcs) => pcs.map((pc) => 'm9g-' + pc); // the 5th-string maj7(9) grip, by root pitch class
  const EXOTIC = ['phrygdom', 'hungmin', 'dblharm'], JAZZ = ['lyddom', 'altered', 'bebop', 'locrian'], SYM = ['wholetone', 'dimhw', 'dimwh'], WORLD = ['majblues', 'hirajoshi', 'insen'];
  const POPP = ['I-IV-vi-V', 'I-vi-ii-V', 'IV-V-iii-vi', 'I-♭VII-IV-I'], BORP = ['I-♭VI-♭VII-I', 'i-♭VII-♭VI-V', 'I7-IV7-I7-V7'], JAZP = ['ii7-V7-Imaj7', 'iiø7-V7-i', 'I-vi-ii-V'];

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
      { t: 'Deep Bass', d: 'Two octaves down: the low rumble.', nu: 1, o: { oct: [2] }, L: [
        { t: 'Bass Anchors', d: 'C, E, and G way down low.', p: [0, 4, 7] },
        { t: 'Bass White Keys', d: 'Every white key, deep bass.', p: W },
        { t: 'Bass Chromatic', d: 'All 12 notes, deep bass.', p: A12 },
        { t: 'Deep Bass', d: 'Checkpoint: the deep bass.', p: A12 }
      ] },
      { t: 'Sky High', d: 'Two octaves up: the bright top.', nu: 1, o: { oct: [6] }, L: [
        { t: 'Sky Anchors', d: 'C, E, and G way up high.', p: [0, 4, 7] },
        { t: 'Sky White Keys', d: 'Every white key, up high.', p: W },
        { t: 'Sky Chromatic', d: 'All 12 notes, up high.', p: A12 },
        { t: 'Sky High', d: 'Checkpoint: the high register.', p: A12 }
      ] },
      { t: 'Melodies', d: 'Hear a short tune and name every note.', nu: 1, o: { oct: [4] }, L: [
        { t: 'Two-Note Tunes', d: 'Name two notes in order.', p: [0, 2, 4, 5, 7], o: { seq: 2 }, slides: 'seq' },
        { t: 'White-Key Tunes', d: 'Two notes, any white key.', p: W, o: { seq: 2 } },
        { t: 'Three-Note Tunes', d: 'Name three notes in order.', p: [0, 2, 4, 5, 7], o: { seq: 3 } },
        { t: 'Chromatic Tunes', d: 'Two notes, all 12.', p: A12, o: { seq: 2 } },
        { t: 'Melodies', d: 'Checkpoint: three-note tunes.', p: W, o: { seq: 3 } }
      ] },
      { t: 'Five Octaves', d: 'Any note, from deep bass to sky high.', nu: 1, o: { oct: [2, 3, 4, 5, 6] }, L: [
        { t: 'Whites Everywhere', d: 'White keys across five octaves.', p: W },
        { t: 'Everything Everywhere', d: 'All 12 across five octaves.', p: A12 },
        { t: 'Timbre Shuffle', d: 'Five octaves, random instruments.', p: A12, o: { inst: 'random' } },
        { t: 'Five Octaves', d: 'Checkpoint: five octaves.', p: A12 }
      ] },
      { t: 'Odd One Out', d: 'Two notes match in different octaves. Find the one that doesn\'t.', nu: 1, o: { oct: [3, 4, 5], only: 'odd' }, L: [
        { t: 'Octave Twins', d: 'C, E, and G across octaves.', p: [0, 4, 7], slides: 'odd' },
        { t: 'White-Key Twins', d: 'White keys across octaves.', p: W },
        { t: 'Chromatic Twins', d: 'All 12 across octaves.', p: A12 },
        { t: 'Odd One Out', d: 'Checkpoint: spot the different note.', p: A12 }
      ] },
      { t: 'Two at Once', d: 'Two notes played together. Name both, low to high.', nu: 1, o: { oct: [4], seq: 2, together: 1 }, L: [
        { t: 'Wide Pairs', d: 'C, E, and G in pairs.', p: [0, 4, 7], slides: 'dyad' },
        { t: 'White Pairs', d: 'Any two white keys.', p: W },
        { t: 'Close Pairs', d: 'Neighbors and near neighbors.', p: [0, 1, 2, 3, 4, 5] },
        { t: 'Any Pair', d: 'Any two of the 12 notes.', p: A12 },
        { t: 'Two at Once', d: 'Checkpoint: name both notes.', p: A12 }
      ] },
      { t: 'Chord Roots', d: 'Hear a chord and name its root note.', nu: 1, o: { oct: [3, 4], chordRoot: 1 }, L: [
        { t: 'Roots in C Major', d: 'Chords built on the white keys.', p: [0, 2, 4, 5, 7, 9], slides: 'root' },
        { t: 'Black-Key Roots', d: 'Chords on the black keys.', p: [0, 1, 3, 6, 8, 10] },
        { t: 'Any Root', d: 'Chords on all 12 roots.', p: A12 },
        { t: 'Chord Roots', d: 'Checkpoint: name the root.', p: A12 }
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
      { t: 'Low & Deep', d: 'Intervals in the bass register.', nu: 1, o: { dir: 'both', low: 1 }, L: [
        { t: 'Low Perfects', d: 'P4, P5, P8 down low.', p: [5, 7, 12] },
        { t: 'Low Thirds & Sixths', d: 'm3, M3, m6, M6 down low.', p: [3, 4, 8, 9] },
        { t: 'Low Everything', d: 'All 12, down low.', p: I12, o: { dir: 'any' } },
        { t: 'Low & Deep', d: 'Checkpoint: bass intervals.', p: I12, o: { dir: 'any' } }
      ] },
      { t: 'Quick Ears', d: 'Shorter notes, faster decisions.', nu: 1, o: { fast: 1, dir: 'both' }, L: [
        { t: 'Quick Small', d: 'm2 to A4, quick.', p: [1, 2, 3, 4, 5, 6] },
        { t: 'Quick Large', d: 'A4 to P8, quick.', p: [6, 7, 8, 9, 10, 11, 12] },
        { t: 'Quick Together', d: 'All 12 at once, quick.', p: I12, o: { dir: 'harm' } },
        { t: 'Quick Ears', d: 'Checkpoint: quick intervals.', p: I12, o: { dir: 'any' } }
      ] },
      { t: 'New Voices', d: 'Every interval on every instrument.', nu: 1, o: { inst: 'random', wide: 1 }, L: [
        { t: 'New Voices Up', d: 'Ascending, random instruments.', p: I12, o: { dir: 'up' } },
        { t: 'New Voices Down', d: 'Descending, random instruments.', p: I12, o: { dir: 'down' } },
        { t: 'New Voices Together', d: 'Harmonic, random instruments.', p: I12, o: { dir: 'harm' } },
        { t: 'New Voices', d: 'Checkpoint: any interval, any instrument.', p: I12, o: { dir: 'any' } }
      ] },
      { t: 'Interval Chains', d: 'Three notes, two intervals. Name both in order.', nu: 1, o: { seq: 2, dir: 'up' }, L: [
        { t: 'Perfect Chains', d: 'P4, P5, P8 chained together.', p: [5, 7, 12], slides: 'seq' },
        { t: 'Thirds Chains', d: 'Thirds and perfects chained.', p: [3, 4, 5, 7] },
        { t: 'Chains Both Ways', d: 'Every interval, up or down.', p: I12, o: { dir: 'both' } },
        { t: 'Interval Chains', d: 'Checkpoint: interval chains.', p: I12, o: { dir: 'both' } }
      ] },
      { t: 'Odd Interval Out', d: 'Two intervals match. Find the different one.', nu: 1, o: { only: 'odd', dir: 'both' }, L: [
        { t: 'Odd Thirds', d: 'Thirds and perfects.', p: [3, 4, 5, 7], slides: 'odd' },
        { t: 'Odd Anything', d: 'Every interval.', p: I12, o: { dir: 'any' } },
        { t: 'Odd Interval Out', d: 'Checkpoint: spot the different interval.', p: I12, o: { dir: 'any', wide: 1 } }
      ] },
      { t: 'Compound Intervals', d: 'Beyond the octave: 9ths to two octaves.', nu: 1, o: { dir: 'up' }, L: [
        { t: 'Ninths', d: 'Meet the minor and major 9th.', n: [13, 14], p: [12, 13, 14] },
        { t: 'Tenths', d: 'Meet the minor and major 10th.', n: [15, 16], p: [12, 13, 14, 15, 16] },
        { t: 'Elevenths & Twelfths', d: 'Meet the 11ths and the 12th.', n: [17, 18, 19], p: [12, 14, 16, 17, 18, 19] },
        { t: 'Thirteenths & Beyond', d: 'Meet the 13ths, 14ths, and two octaves.', n: [20, 21, 22, 23, 24], p: [19, 20, 21, 22, 23, 24] },
        { t: 'Compound Mix', d: 'Every compound interval, up or down.', p: I24, o: { dir: 'both' } },
        { t: 'Compound Together', d: 'Compound intervals played at once.', p: I24, o: { dir: 'harm' } },
        { t: 'Compound Intervals', d: 'Checkpoint: compound intervals.', p: I24, o: { dir: 'any' } }
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
      { t: 'Inversion Lab', d: 'Every chord, flipped and rearranged.', nu: 1, o: { inv: 1 }, L: [
        { t: 'Inverted Triads', d: 'All four triads, inverted.', p: TRI },
        { t: 'Inverted 7ths', d: 'All five 7ths, inverted.', p: SEV },
        { t: 'All Inverted', d: 'Every chord, inverted.', p: ALLC },
        { t: 'Inversion Lab', d: 'Checkpoint: inversions.', p: ALLC }
      ] },
      { t: 'High Voicings', d: 'Chords up in the bright register.', nu: 1, o: { high: 1 }, L: [
        { t: 'High Triads', d: 'Triads up high.', p: TRI },
        { t: 'High 7ths', d: '7th chords up high.', p: SEV },
        { t: 'High Voicings', d: 'Checkpoint: every chord, up high.', p: ALLC }
      ] },
      { t: 'Color Swap', d: 'Every chord on every instrument.', nu: 1, o: { inst: 'random', wide: 1 }, L: [
        { t: 'Triads, New Voices', d: 'Triads, random instruments.', p: TRI },
        { t: '7ths, New Voices', d: '7ths, random instruments.', p: SEV },
        { t: 'Broken & Random', d: 'Arpeggios, random instruments.', p: ALLC, o: { arp: 1 } },
        { t: 'Color Swap', d: 'Checkpoint: any chord, any instrument.', p: ALLC }
      ] },
      { t: 'Odd Chord Out', d: 'Two chords match on different roots. Find the different one.', nu: 1, o: { only: 'odd', wide: 1 }, L: [
        { t: 'Odd Triads', d: 'The four triads.', p: TRI, slides: 'odd' },
        { t: 'Odd 7ths', d: 'The five 7th chords.', p: SEV },
        { t: 'Odd Chord Out', d: 'Checkpoint: spot the different chord.', p: ALLC }
      ] },
      { t: 'Chord Chains', d: 'Two chords in a row. Name both.', nu: 1, o: { seq: 2 }, L: [
        { t: 'Triad Chains', d: 'Two triads in a row.', p: TRI, slides: 'seq' },
        { t: '7th Chains', d: 'Two 7th chords in a row.', p: SEV },
        { t: 'Chord Chains', d: 'Checkpoint: any two chords.', p: ALLC, o: { inv: 1 } }
      ] },
      { t: 'Suspended & Sixths', d: 'Sus2, sus4, 7sus4, 6, m6.', nu: 1, L: [
        { t: 'Suspended', d: 'Meet sus2 and sus4.', n: ['sus2', 'sus4'], p: ['maj', 'min', 'sus2', 'sus4'] },
        { t: 'Hanging Dominant', d: 'Meet 7sus4.', n: ['7sus4'], p: ['sus4', '7sus4', 'dom7'] },
        { t: 'Sixths', d: 'Meet the major and minor 6th.', n: ['maj6', 'm6'], p: ['maj', 'min', 'maj6', 'm6', 'maj7'] },
        { t: 'Sus & Six Mix', d: 'All five, with triads.', p: SUS6.concat(['maj', 'min']) },
        { t: 'Suspended & Sixths', d: 'Checkpoint: sus and sixth chords.', p: SUS6, o: { wide: 1 } }
      ] },
      { t: 'Added Tones', d: 'Add9, m(add9), add11, add13, 6/9.', nu: 1, L: [
        { t: 'Add Nine', d: 'Meet add9 and minor add9.', n: ['add9', 'madd9'], p: ['maj', 'min', 'add9', 'madd9'] },
        { t: 'Add Eleven & Thirteen', d: 'Meet add11 and add13.', n: ['add11', 'add13'], p: ['add9', 'add11', 'add13', 'maj6'] },
        { t: 'Six-Nine', d: 'Meet the 6/9 chord.', n: ['six9'], p: ['maj6', 'add9', 'six9', 'maj7'] },
        { t: 'Added Tones', d: 'Checkpoint: added-tone chords.', p: ADD.concat(['maj6']) }
      ] },
      { t: 'Ninths', d: 'Dominant 9, major 9, minor 9.', nu: 1, L: [
        { t: 'Dominant Ninth', d: 'Meet the dominant 9th.', n: ['dom9'], p: ['dom7', 'dom9', 'add9'] },
        { t: 'Major & Minor Ninths', d: 'Meet maj9 and m9.', n: ['maj9', 'm9'], p: ['maj7', 'min7', 'maj9', 'm9', 'dom9'] },
        { t: 'Ninths Compared', d: 'All three 9ths with their 7ths.', p: NINE.concat(['maj7', 'min7', 'dom7']), o: { inv: 1 } },
        { t: 'Ninths', d: 'Checkpoint: ninth chords.', p: NINE.concat(['add9', 'madd9']) }
      ] },
      { t: 'Elevens & Thirteens', d: '11, m11, 13, maj13.', nu: 1, L: [
        { t: 'Elevenths', d: 'Meet the dominant and minor 11th.', n: ['dom11', 'm11'], p: ['dom9', 'm9', 'dom11', 'm11'] },
        { t: 'Thirteenths', d: 'Meet the dominant and major 13th.', n: ['dom13', 'maj13'], p: ['dom9', 'maj9', 'dom13', 'maj13', 'add13'] },
        { t: 'Big Chord Mix', d: 'All the extended chords so far.', p: NINE.concat(ELEV) },
        { t: 'Elevens & Thirteens', d: 'Checkpoint: extended chords.', p: ELEV.concat(NINE) }
      ] },
      { t: 'Altered Dominants', d: '7♭9, 7♯9, 7♯5, 7♭5, 7♯11 and more.', nu: 1, L: [
        { t: 'Flat & Sharp Nine', d: 'Meet 7♭9 and 7♯9.', n: ['7b9', '7s9'], p: ['dom7', 'dom9', '7b9', '7s9'] },
        { t: 'Bent Fifths', d: 'Meet 7♯5 and 7♭5.', n: ['7s5', '7b5'], p: ['dom7', 'aug', '7s5', '7b5'] },
        { t: 'Lydian Colors', d: 'Meet 7♯11 and maj7♯11.', n: ['7s11', 'maj7s11'], p: ['dom7', 'maj7', '7s11', 'maj7s11'] },
        { t: 'Minor-Major', d: 'Meet the minor-major 7th.', n: ['mmaj7'], p: ['min7', 'maj7', 'mmaj7', 'm6'] },
        { t: 'Altered Mix', d: 'Every altered chord.', p: ALT.concat(['dom7']) },
        { t: 'Altered Dominants', d: 'Checkpoint: altered chords.', p: ALT }
      ] },
      { t: 'Inversions by Ear', d: 'Root position, 1st, 2nd, and 3rd inversion.', nu: 1, o: { fam: 'inv' }, L: [
        { t: 'Root or First?', d: 'Root position or 1st inversion.', p: ['inv0', 'inv1'], slides: 'inv' },
        { t: 'Three Positions', d: 'Root, 1st, and 2nd inversion.', p: ['inv0', 'inv1', 'inv2'] },
        { t: 'Seventh Inversions', d: '7th chords add a 3rd inversion.', p: ['inv0', 'inv1', 'inv2', 'inv3'], o: { sev: 1 } },
        { t: 'Inversions by Ear', d: 'Checkpoint: name the inversion.', p: ['inv0', 'inv1', 'inv2', 'inv3'], o: { sev: 1 } }
      ] },
      { t: 'Open Guitar Chords', d: 'The open chords every guitarist knows, by ear.', nu: 1, o: { fam: 'open', inst: 'guitar' }, L: [
        { t: 'The Big Five', d: 'C, A, G, E, D.', p: OPEN5, slides: 'open' },
        { t: 'Minor Shapes', d: 'Am, Em, Dm with the big five.', p: OPEN5.concat(OPENM), slides: 'open' },
        { t: 'Open Sevenths', d: 'E7, A7, D7, G7, C7, B7.', p: OPEN7.concat(['open-E', 'open-A']), slides: 'open' },
        { t: 'Pretty Shapes', d: 'Cmaj7, Fmaj7, Am7, Em7, Dm7.', p: OPENJ.concat(['open-C', 'open-Am']), slides: 'open' },
        { t: 'Sus & Add Shapes', d: 'Asus2, Asus4, Dsus2, Dsus4, Esus4, Cadd9.', p: OPENS.concat(['open-A', 'open-D']), slides: 'open' },
        { t: 'Barre Chords', d: 'F and Bm join the open chords.', p: OPENB.concat(OPEN5, OPENM), slides: 'open' },
        { t: 'Every Open Chord', d: 'All 27 chords.', p: OPENALL },
        { t: 'Open Chords, Any Voicing', d: 'The same chords, stacked a new way every time.', p: OPEN5.concat(OPENM, ['open-E7', 'open-A7', 'open-Cmaj7', 'open-Asus2']), o: { vary: 1 }, slides: 'vary' },
        { t: 'Open Guitar Chords', d: 'Checkpoint: open chords by ear.', p: OPENALL }
      ] },
      { t: 'More Chord Colors', d: 'Power chords, sus2(add13), m7(add11), 7(♭13) and more.', nu: 1, L: [
        { t: 'Power & Open Sus', d: 'Meet the power chord, sus2(add13), and sus2(add11).', n: ['five', 'sus2a13', 'sus2a11'], p: ['five', 'sus2', 'sus2a13', 'sus2a11', 'sus4'] },
        { t: 'Added Elevenths', d: 'Meet m(add11), m7(add11), and 7(add11).', n: ['madd11', 'm7add11', 'dom7add11'], p: ['add11', 'madd11', 'm7add11', 'dom7add11', 'm11'] },
        { t: 'Thirteenth Colors', d: 'Meet maj7(add13), 7(♭13), and m7(♭13).', n: ['maj7a13', 'dom7b13', 'm7b13'], p: ['maj7a13', 'dom7b13', 'm7b13', 'dom13', 'maj6'] },
        { t: 'Color Mix', d: 'All nine colors.', p: COLORS },
        { t: 'More Chord Colors', d: 'Checkpoint: the new chord colors.', p: COLORS.concat(['add9', 'm9']) }
      ] },
      { t: 'Open-String Shapes', d: 'One left-hand shape slid along the neck, open B and E ringing.', nu: 1, o: { fam: 'openv', inst: 'guitar' }, L: [
        { t: 'Fifth-String Shape', d: 'Asus2, Cmaj7, Dsus2(add13), G6 and more.', p: OVA5, slides: 'openv' },
        { t: '6th-String Shape', d: 'The four-finger shape from the 6th string, top strings open.', p: OVE, slides: 'openv' },
        { t: '6th-String Minor Shape', d: 'The minor version of the 6th-string shape.', p: OVEM, slides: 'openv' },
        { t: 'Slash Shape', d: 'Drop the 6th string and the 5th becomes the bass.', p: OVINV, slides: 'openv' },
        { t: 'One Shape, Many Chords', d: 'Every shape, every fret.', p: OVALL },
        { t: 'Shapes, Any Voicing', d: 'The same chords, voiced a new way each time.', p: OVALL, o: { vary: 1 }, slides: 'vary' },
        { t: 'Open-String Shapes', d: 'Checkpoint: open-string shapes by ear.', p: OVALL }
      ] },
      { t: 'Voicings', d: 'The same chord, stacked many different ways.', nu: 1, L: [
        { t: 'Spread Triads', d: 'Triads spread over two octaves.', p: TRI, o: { vary: 'spread' }, slides: 'vary' },
        { t: 'Drop-2 Sevenths', d: 'Jazz-style open 7th chords.', p: SEV, o: { vary: 'drop2' } },
        { t: 'Drop-3 Sevenths', d: 'Wider still: the guitar jazz voicing.', p: SEV, o: { vary: 'drop3' } },
        { t: 'Any Voicing: Triads & 7ths', d: 'Close, inverted, drop-2, drop-3, or spread.', p: TRI.concat(SEV), o: { vary: 1 } },
        { t: 'Any Voicing: Colors', d: 'Sus, sixths, and added tones, any voicing.', p: SUS6.concat(ADD), o: { vary: 1 } },
        { t: 'Any Voicing: Extended', d: 'Ninths, elevenths, thirteenths, any voicing.', p: NINE.concat(ELEV, ['maj7', 'dom7']), o: { vary: 1 } },
        { t: 'Any Voicing: Altered', d: 'Altered dominants, any voicing.', p: ALT.concat(['dom7']), o: { vary: 1 } },
        { t: 'Voicings', d: 'Checkpoint: any chord, any voicing.', p: TRI.concat(SEV, SUS6, NINE), o: { vary: 1, wide: 1 } }
      ] },
      { t: 'Maj7(9) Shape', d: 'One maj7(9) grip on strings 5-4-3-2, moved to every root. Name the chord by ear.', nu: 1, o: { fam: 'm9g', inst: 'guitar' }, L: [
        { t: 'Three Roots', d: 'Cmaj7(9), Fmaj7(9), and Gmaj7(9).', p: G9([0, 5, 7]), slides: 'm9g' },
        { t: 'Five Roots', d: 'D and A join C, F, and G.', p: G9([0, 2, 5, 7, 9]) },
        { t: 'White-Key Roots', d: 'C, D, E, F, G, A, and B.', p: G9([0, 2, 4, 5, 7, 9, 11]) },
        { t: 'All 12 Roots', d: 'The shape on every root.', p: G9([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]) },
        { t: 'Maj7(9), Any Voicing', d: 'The same chords, stacked a new way each time.', p: G9([0, 2, 4, 5, 7, 9, 11]), o: { vary: 1 }, slides: 'vary' },
        { t: 'Maj7(9) Shape', d: 'Checkpoint: name every maj7(9).', p: G9([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]) }
      ] },
      { t: 'Final Exam: Harmonic Mastery', d: 'All chords. All octaves.', o: { wide: 1 }, L: [
        { t: 'Any Octave', d: 'Every chord, anywhere.', p: ALLC },
        { t: 'Broken Chords', d: 'Every chord, one note at a time.', p: ALLC, o: { arp: 1 } },
        { t: 'Harmonic Mastery', d: 'All chords. All octaves. Any voicing. Pass it to skip everything before it.', p: ALLC, o: { vary: 1 } }
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
      { t: 'Going Down', d: 'Every scale, played from the top.', nu: 1, o: { allDown: 1, randomRoot: 1 }, L: [
        { t: 'Foundation Down', d: 'Major and the three minors, descending.', p: ['major', 'natmin', 'harmin', 'melmin'] },
        { t: 'Modes Down', d: 'The six modes, descending.', p: ['lydian', 'major', 'mixo', 'dorian', 'natmin', 'phrygian'] },
        { t: 'All Down', d: 'All 11, descending.', p: ALLS },
        { t: 'Going Down', d: 'Checkpoint: descending scales.', p: ALLS }
      ] },
      { t: 'Quick Scales', d: 'Scales at a faster tempo.', nu: 1, o: { fast: 1, randomRoot: 1 }, L: [
        { t: 'Quick Foundation', d: 'The foundation scales, fast.', p: ['major', 'natmin', 'harmin', 'melmin'] },
        { t: 'Quick Modes', d: 'The modes, fast.', p: ['lydian', 'major', 'mixo', 'dorian', 'natmin', 'phrygian'] },
        { t: 'Quick Pentatonics', d: 'Five-note scales and blues, fast.', p: ['pentmaj', 'pentmin', 'blues', 'major', 'natmin'] },
        { t: 'Quick Scales', d: 'Checkpoint: all 11, fast.', p: ALLS }
      ] },
      { t: 'Scale Colors', d: 'Every scale on every instrument.', nu: 1, o: { inst: 'random', randomRoot: 1, desc: 1 }, L: [
        { t: 'Modes, New Voices', d: 'The modes, random instruments.', p: ['lydian', 'major', 'mixo', 'dorian', 'natmin', 'phrygian'] },
        { t: 'All 11, New Voices', d: 'Every scale, random instruments.', p: ALLS },
        { t: 'Scale Colors', d: 'Checkpoint: any scale, any instrument.', p: ALLS }
      ] },
      { t: 'Odd Scale Out', d: 'Two scales match in different keys. Find the different one.', nu: 1, o: { only: 'odd', randomRoot: 1 }, L: [
        { t: 'Odd Foundation', d: 'Major and the three minors.', p: ['major', 'natmin', 'harmin', 'melmin'], slides: 'odd' },
        { t: 'Odd Modes', d: 'The six modes.', p: ['lydian', 'major', 'mixo', 'dorian', 'natmin', 'phrygian'] },
        { t: 'Odd Scale Out', d: 'Checkpoint: spot the different scale.', p: ALLS }
      ] },
      { t: 'Exotic Minors', d: 'Phrygian dominant, Hungarian minor, double harmonic.', nu: 1, o: { randomRoot: 1 }, L: [
        { t: 'Phrygian Dominant', d: 'Meet Phrygian dominant.', n: ['phrygdom'], p: ['phrygian', 'harmin', 'phrygdom'] },
        { t: 'Hungarian Minor', d: 'Meet Hungarian minor.', n: ['hungmin'], p: ['harmin', 'phrygdom', 'hungmin'] },
        { t: 'Double Harmonic', d: 'Meet the double harmonic scale.', n: ['dblharm'], p: EXOTIC.concat(['harmin']) },
        { t: 'Exotic Minors', d: 'Checkpoint: exotic minors.', p: EXOTIC.concat(['harmin', 'phrygian']) }
      ] },
      { t: 'Jazz Scales', d: 'Lydian dominant, altered, bebop, Locrian.', nu: 1, o: { randomRoot: 1 }, L: [
        { t: 'Lydian Dominant', d: 'Meet Lydian dominant.', n: ['lyddom'], p: ['lydian', 'mixo', 'lyddom'] },
        { t: 'Locrian', d: 'Meet Locrian, the darkest mode.', n: ['locrian'], p: ['phrygian', 'locrian', 'natmin'] },
        { t: 'Altered', d: 'Meet the altered scale.', n: ['altered'], p: ['locrian', 'altered', 'lyddom'] },
        { t: 'Bebop Dominant', d: 'Meet the bebop dominant scale.', n: ['bebop'], p: ['mixo', 'bebop', 'lyddom'] },
        { t: 'Jazz Scales', d: 'Checkpoint: jazz scales.', p: JAZZ.concat(['mixo']) }
      ] },
      { t: 'Symmetric Scales', d: 'Whole tone and the two diminished scales.', nu: 1, o: { randomRoot: 1 }, L: [
        { t: 'Whole Tone', d: 'Meet the whole tone scale.', n: ['wholetone'], p: ['major', 'lydian', 'wholetone'] },
        { t: 'Diminished Scales', d: 'Meet half-whole and whole-half.', n: ['dimhw', 'dimwh'], p: SYM },
        { t: 'Symmetric Scales', d: 'Checkpoint: symmetric scales.', p: SYM.concat(['altered']) }
      ] },
      { t: 'World Scales', d: 'Major blues, Hirajoshi, In-sen.', nu: 1, o: { randomRoot: 1 }, L: [
        { t: 'Major Blues', d: 'Meet the major blues scale.', n: ['majblues'], p: ['pentmaj', 'blues', 'majblues'] },
        { t: 'Japanese Scales', d: 'Meet Hirajoshi and In-sen.', n: ['hirajoshi', 'insen'], p: ['pentmin', 'hirajoshi', 'insen'] },
        { t: 'Five-Note World', d: 'Every five- and six-note scale so far.', p: ['pentmaj', 'pentmin', 'blues', 'majblues', 'hirajoshi', 'insen'] },
        { t: 'World Scales', d: 'Checkpoint: world scales.', p: WORLD.concat(['pentmaj', 'pentmin', 'blues']) }
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
      { t: 'Random Keys', d: 'Every progression, any key.', nu: 1, o: { randomKey: 1 }, L: [
        { t: 'Major in Any Key', d: 'The five major loops, random keys.', p: MAJP },
        { t: 'Minor in Any Key', d: 'Minor loops and ii-V-I, random keys.', p: MINP.concat(['ii-V-I']) },
        { t: 'All Nine, Any Key', d: 'Every progression, random keys.', p: ALLP },
        { t: 'Random Keys', d: 'Checkpoint: any progression, any key.', p: ALLP }
      ] },
      { t: 'Up Tempo', d: 'Chord changes at a faster tempo.', nu: 1, o: { fast: 1 }, L: [
        { t: 'Quick Major', d: 'The major loops, fast.', p: MAJP },
        { t: 'Quick Minor', d: 'The minor loops, fast.', p: MINP.concat(['ii-V-I']) },
        { t: 'Quick All Nine', d: 'Every progression, fast.', p: ALLP },
        { t: 'Up Tempo', d: 'Checkpoint: fast progressions.', p: ALLP, o: { randomKey: 1 } }
      ] },
      { t: 'Low Voicings', d: 'Voice-led chords in the low register.', nu: 1, o: { voice: 1, low: 1 }, L: [
        { t: 'Low & Smooth', d: 'Every progression, low and voice-led.', p: ALLP },
        { t: 'Band Swap', d: 'Every progression, random instruments.', p: ALLP, o: { inst: 'random' } },
        { t: 'Low Voicings', d: 'Checkpoint: low voicings.', p: ALLP }
      ] },
      { t: 'Chord Functions', d: 'Hear home (I), then name the chord that follows.', nu: 1, o: { func: 1 }, L: [
        { t: 'Four or Five', d: 'IV or V after home.', p: ['IV', 'V'], slides: 'func' },
        { t: 'Add the Six', d: 'IV, V, or the minor vi.', p: ['IV', 'V', 'vi'] },
        { t: 'Add the Two', d: 'ii, IV, V, or vi.', p: ['ii', 'IV', 'V', 'vi'] },
        { t: 'All Five', d: 'ii, iii, IV, V, vi.', p: ['ii', 'iii', 'IV', 'V', 'vi'] },
        { t: 'Chord Functions', d: 'Checkpoint: every chord function, any key.', p: ['ii', 'iii', 'IV', 'V', 'vi'], o: { randomKey: 1 } }
      ] },
      { t: 'Pop & Rock Loops', d: 'Four more loops from the charts.', nu: 1, L: [
        { t: 'The Bright Loop', d: 'Meet I-IV-vi-V.', n: ['I-IV-vi-V'], p: ['I-V-vi-IV', 'I-vi-IV-V', 'I-IV-vi-V'] },
        { t: 'The Turnaround', d: 'Meet I-vi-ii-V.', n: ['I-vi-ii-V'], p: ['I-vi-IV-V', 'I-vi-ii-V', 'I-IV-vi-V'] },
        { t: 'The Royal Road', d: 'Meet IV-V-iii-vi.', n: ['IV-V-iii-vi'], p: ['IV-V-iii-vi', 'vi-IV-I-V', 'I-IV-vi-V'] },
        { t: 'Rock Flat Seven', d: 'Meet I-♭VII-IV-I.', n: ['I-♭VII-IV-I'], p: ['I-IV-V-I', 'I-♭VII-IV-I', 'I-IV-I-V'] },
        { t: 'Pop & Rock Loops', d: 'Checkpoint: the new loops.', p: POPP.concat(['I-V-vi-IV']) }
      ] },
      { t: 'Borrowed Colors', d: 'Chords borrowed from the minor key, and the blues.', nu: 1, L: [
        { t: 'The Epic Cadence', d: 'Meet I-♭VI-♭VII-I.', n: ['I-♭VI-♭VII-I'], p: ['I-♭VI-♭VII-I', 'I-♭VII-IV-I', 'I-IV-V-I'] },
        { t: 'Andalusian', d: 'Meet i-♭VII-♭VI-V.', n: ['i-♭VII-♭VI-V'], p: ['i-♭VII-♭VI-V', 'i-VI-III-VII', 'i-iv-i-V'] },
        { t: 'Blues Changes', d: 'Meet I7-IV7-I7-V7.', n: ['I7-IV7-I7-V7'], p: ['I7-IV7-I7-V7', 'I-IV-I-V', 'I-IV-V-I'] },
        { t: 'Borrowed Colors', d: 'Checkpoint: borrowed chords.', p: BORP.concat(['I-♭VII-IV-I']), o: { randomKey: 1 } }
      ] },
      { t: 'Jazz Changes', d: 'Seventh chords and the minor ii-V-i.', nu: 1, o: { voice: 1 }, L: [
        { t: 'ii-V-I with Sevenths', d: 'Meet ii7-V7-Imaj7.', n: ['ii7-V7-Imaj7'], p: ['ii-V-I', 'ii7-V7-Imaj7', 'I-vi-ii-V'] },
        { t: 'Minor ii-V-i', d: 'Meet iiø7-V7-i.', n: ['iiø7-V7-i'], p: ['ii7-V7-Imaj7', 'iiø7-V7-i', 'i-iv-i-V'] },
        { t: 'Jazz Changes', d: 'Checkpoint: jazz changes.', p: JAZP.concat(['ii-V-I']) }
      ] },
      { t: 'The Canon', d: 'An eight-chord loop.', nu: 1, L: [
        { t: 'Meet the Canon', d: 'Meet I-V-vi-iii-IV-I-IV-V.', n: ['I-V-vi-iii-IV-I-IV-V'], p: ['I-V-vi-iii-IV-I-IV-V', 'I-V-vi-IV', 'I-vi-IV-V'] },
        { t: 'Long and Short', d: 'The canon among the four-chord loops.', p: ['I-V-vi-iii-IV-I-IV-V', 'I-V-vi-IV', 'I-IV-vi-V', 'IV-V-iii-vi'] },
        { t: 'The Canon', d: 'Checkpoint: the canon.', p: ['I-V-vi-iii-IV-I-IV-V', 'I-V-vi-IV', 'I-vi-IV-V', 'I-IV-vi-V'], o: { randomKey: 1 } }
      ] },
      { t: 'Borrowed Functions', d: 'Hear home, then name iv, ♭VII, ♭VI, or V7.', nu: 1, o: { func: 1 }, L: [
        { t: 'Minor Four', d: 'IV or the borrowed iv.', p: ['IV', 'iv'], slides: 'func' },
        { t: 'Flat Seven & Flat Six', d: '♭VII and ♭VI join IV and V.', p: ['IV', 'V', '♭VII', '♭VI'] },
        { t: 'Dominant Seventh', d: 'V or V7, with IV and iv.', p: ['V', 'V7', 'IV', 'iv'] },
        { t: 'Borrowed Functions', d: 'Checkpoint: every chord function, any key.', p: ['ii', 'iii', 'IV', 'iv', 'V', 'V7', 'vi', '♭VII', '♭VI'], o: { randomKey: 1 } }
      ] },
      { t: 'Final: Any Progression, Any Key', d: 'All nine, random keys, real voicings.', o: { voice: 1, randomKey: 1 }, L: [
        { t: 'Any Progression, Any Key', d: 'All nine, random keys, real voicings. Pass it to skip everything before it.', p: ALLP }
      ] }
    ]
  };

  /* Unit order, easiest first. Units added later were appended to DATA; this puts each where it belongs.
     The original 1.0 units keep their relative order, so saved progress still maps (see legacyId). */
  const ORDER = {
    pitch: ['Middle C Major', 'Chromatic Middle', 'The Basement', 'The Attic', 'Odd One Out', 'White-Key Mastery', 'Chromatic Mastery', 'Chord Roots', 'Deep Bass', 'Sky High', 'Melodies', 'Two at Once', 'Five Octaves', 'Absolute Pitch'],
    intervals: ['Perfect Intervals', 'Thirds & Perfects', 'Small Intervals', 'Consonance', 'The Stretches', 'Full Chromatic', 'Odd Interval Out', 'Every Direction', 'Low & Deep', 'New Voices', 'Quick Ears', 'Interval Chains', 'Compound Intervals', 'Final Exam: Absolute Mastery'],
    chords: ['Basic Triads', 'All Triads', 'Common 7ths', 'Suspended & Sixths', 'All 7ths', 'Odd Chord Out', 'Chord Chains', 'Inversions by Ear', 'Inversion Lab', 'The Rumble', 'High Voicings', 'Color Swap', 'Added Tones', 'Ninths', 'Elevens & Thirteens', 'More Chord Colors', 'Altered Dominants', 'Voicings', 'Open Guitar Chords', 'Open-String Shapes', 'Maj7(9) Shape', 'Final Exam: Harmonic Mastery'],
    scales: ['The Foundation', 'Minor Modes', 'Diatonic Mastery', 'All 11 Scales', 'World Scales', 'Odd Scale Out', 'Going Down', 'Quick Scales', 'Scale Colors', 'Exotic Minors', 'Jazz Scales', 'Symmetric Scales', 'Final: Any Scale, Any Key'],
    progs: ['Major Foundations', 'Chord Functions', 'Into the Minor', 'Pop & Rock Loops', 'All Nine', 'Borrowed Functions', 'Borrowed Colors', 'The Canon', 'Random Keys', 'Real Voicings', 'Up Tempo', 'Jazz Changes', 'Low Voicings', 'Final: Any Progression, Any Key']
  };
  Object.keys(ORDER).forEach((sk) => {
    const byT = {}; DATA[sk].forEach((u) => { byT[u.t] = u; });
    const sorted = ORDER[sk].map((t) => byT[t]);
    if (sorted.some((u) => !u) || sorted.length !== DATA[sk].length) throw new Error('unit order mismatch in ' + sk);
    DATA[sk] = sorted;
  });

  const slug = (t) => t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
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
          q: l.q || (kind === 'final' ? 40 : kind === 'check' ? 28 : kind === 'learn' ? 18 : 22),
          id: sk + '/' + slug(u.t) + '/' + li, slides: l.slides || null
        };
        // ensure new items are always in pool
        lesson.n.forEach((x) => { if (!lesson.pool.includes(x)) lesson.pool.push(x); });
        lessons.push(lesson); unit.lessons.push(lesson.idx);
      });
      units.push(unit);
    });
    SKILL[sk] = { lessons, units };
  });

  /* Lesson ids for the 1.0 layout (indexes were stored before ids existed) */
  function legacyId(sk, idx) {
    const old = DATA[sk].filter((u) => !u.nu);
    for (const u of old) { if (idx < u.L.length) return sk + '/' + slug(u.t) + '/' + idx; idx -= u.L.length; }
    return null;
  }
  window.PTCurriculum = { SKILL, legacyId };
})();
