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
    9: ['M6', 'Major 6th'], 10: ['m7', 'Minor 7th'], 11: ['M7', 'Major 7th'], 12: ['P8', 'Octave'],
    13: ['m9', 'Minor 9th'], 14: ['M9', 'Major 9th'], 15: ['m10', 'Minor 10th'], 16: ['M10', 'Major 10th'],
    17: ['P11', 'Perfect 11th'], 18: ['A11', 'Augmented 11th'], 19: ['P12', 'Perfect 12th'], 20: ['m13', 'Minor 13th'],
    21: ['M13', 'Major 13th'], 22: ['m14', 'Minor 14th'], 23: ['M14', 'Major 14th'], 24: ['P15', 'Two octaves']
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
    dim7: { name: 'Diminished 7th', kind: 'seventh chord', iv: [0, 3, 6, 9] },
    sus2: { name: 'Sus2', kind: 'suspended', iv: [0, 2, 7] },
    sus4: { name: 'Sus4', kind: 'suspended', iv: [0, 5, 7] },
    '7sus4': { name: '7sus4', kind: 'suspended', iv: [0, 5, 7, 10] },
    maj6: { name: 'Major 6th', kind: 'sixth chord', iv: [0, 4, 7, 9] },
    m6: { name: 'Minor 6th', kind: 'sixth chord', iv: [0, 3, 7, 9] },
    six9: { name: '6/9', kind: 'added tone', iv: [0, 4, 7, 9, 14] },
    add9: { name: 'Add 9', kind: 'added tone', iv: [0, 4, 7, 14] },
    madd9: { name: 'Minor add 9', kind: 'added tone', iv: [0, 3, 7, 14] },
    add11: { name: 'Add 11', kind: 'added tone', iv: [0, 4, 7, 17] },
    add13: { name: 'Add 13', kind: 'added tone', iv: [0, 4, 7, 21] },
    mmaj7: { name: 'Minor-major 7th', kind: 'seventh chord', iv: [0, 3, 7, 11] },
    dom9: { name: 'Dominant 9th', kind: 'ninth chord', iv: [0, 4, 7, 10, 14] },
    maj9: { name: 'Major 9th', kind: 'ninth chord', iv: [0, 4, 7, 11, 14] },
    m9: { name: 'Minor 9th', kind: 'ninth chord', iv: [0, 3, 7, 10, 14] },
    dom11: { name: 'Dominant 11th', kind: 'eleventh chord', iv: [0, 7, 10, 14, 17] },
    m11: { name: 'Minor 11th', kind: 'eleventh chord', iv: [0, 3, 7, 10, 14, 17] },
    dom13: { name: 'Dominant 13th', kind: 'thirteenth chord', iv: [0, 4, 10, 14, 21] },
    maj13: { name: 'Major 13th', kind: 'thirteenth chord', iv: [0, 4, 11, 14, 21] },
    '7b9': { name: '7♭9', kind: 'altered dominant', iv: [0, 4, 7, 10, 13] },
    '7s9': { name: '7♯9', kind: 'altered dominant', iv: [0, 4, 7, 10, 15] },
    '7s5': { name: '7♯5', kind: 'altered dominant', iv: [0, 4, 8, 10] },
    '7b5': { name: '7♭5', kind: 'altered dominant', iv: [0, 4, 6, 10] },
    '7s11': { name: '7♯11', kind: 'altered dominant', iv: [0, 4, 7, 10, 18] },
    maj7s11: { name: 'Major 7♯11', kind: 'seventh chord', iv: [0, 4, 7, 11, 18] },
    five: { name: 'Power chord', kind: 'power chord', iv: [0, 7] },
    sus2a13: { name: 'Sus2 add13', kind: 'suspended', iv: [0, 2, 7, 9] },
    sus2a11: { name: 'Sus2 add11', kind: 'suspended', iv: [0, 2, 5, 7] },
    madd11: { name: 'Minor add 11', kind: 'added tone', iv: [0, 3, 7, 17] },
    m7add11: { name: 'Minor 7 add 11', kind: 'added tone', iv: [0, 3, 7, 10, 17] },
    dom7add11: { name: '7 add 11', kind: 'added tone', iv: [0, 4, 7, 10, 17] },
    maj7a13: { name: 'Major 7 add 13', kind: 'added tone', iv: [0, 4, 7, 9, 11] },
    dom7b13: { name: '7♭13', kind: 'altered dominant', iv: [0, 4, 10, 14, 20] },
    m7b13: { name: 'Minor 7♭13', kind: 'altered dominant', iv: [0, 3, 7, 10, 20] }
  };
  const CHORD_SHORT = { maj: 'Maj', min: 'Min', dim: 'Dim', aug: 'Aug', maj7: 'Maj7', min7: 'm7', dom7: 'Dom7', hdim7: 'ø7', dim7: 'Dim7',
    sus2: 'sus2', sus4: 'sus4', '7sus4': '7sus4', maj6: '6', m6: 'm6', six9: '6/9', add9: 'add9', madd9: 'm(add9)', add11: 'add11', add13: 'add13',
    mmaj7: 'm(maj7)', dom9: '9', maj9: 'maj9', m9: 'm9', dom11: '11', m11: 'm11', dom13: '13', maj13: 'maj13',
    '7b9': '7♭9', '7s9': '7♯9', '7s5': '7♯5', '7b5': '7♭5', '7s11': '7♯11', maj7s11: 'maj7♯11',
    five: '5', sus2a13: 'sus2(add13)', sus2a11: 'sus2(add11)', madd11: 'm(add11)', m7add11: 'm7(add11)', dom7add11: '7(add11)', maj7a13: 'maj7(add13)', dom7b13: '7(♭13)', m7b13: 'm7(♭13)' };
  const CHORD_TAG = { triad: 'triad', 'seventh chord': '7th', suspended: 'sus', 'sixth chord': '6th', 'added tone': 'add', 'ninth chord': '9th', 'eleventh chord': '11th', 'thirteenth chord': '13th', 'altered dominant': 'altered', 'power chord': 'power' };

  /* open-position guitar chords: name and shape (low E to high E, x = not played) */
  const OPEN = {
    'open-C': ['C', 'x32010'], 'open-A': ['A', 'x02220'], 'open-G': ['G', '320003'], 'open-E': ['E', '022100'], 'open-D': ['D', 'xx0232'],
    'open-Am': ['Am', 'x02210'], 'open-Em': ['Em', '022000'], 'open-Dm': ['Dm', 'xx0231'],
    'open-E7': ['E7', '020100'], 'open-A7': ['A7', 'x02020'], 'open-D7': ['D7', 'xx0212'], 'open-G7': ['G7', '320001'], 'open-C7': ['C7', 'x32310'], 'open-B7': ['B7', 'x21202'],
    'open-Cmaj7': ['Cmaj7', 'x32000'], 'open-Fmaj7': ['Fmaj7', 'xx3210'], 'open-Am7': ['Am7', 'x02010'], 'open-Em7': ['Em7', '022030'], 'open-Dm7': ['Dm7', 'xx0211'],
    'open-Asus2': ['Asus2', 'x02200'], 'open-Asus4': ['Asus4', 'x02230'], 'open-Dsus2': ['Dsus2', 'xx0230'], 'open-Dsus4': ['Dsus4', 'xx0233'], 'open-Esus4': ['Esus4', '022200'], 'open-Cadd9': ['Cadd9', 'x32030'],
    'open-F': ['F', '133211'], 'open-Bm': ['Bm', 'x24432']
  };

  /* open-string voicings: one shape slid along the neck while the open B and E strings ring
     (shape families from the user's Harmony Trainer). [name, frets low→high, midi notes, family] */
  const OPENV = {
    'ov-a5-0': ["Asus2", 'x-0-2-2-0-0', [45, 52, 57, 59, 64], 'a5'],
    'ov-a5-2': ["Bsus4", 'x-2-4-4-0-0', [47, 54, 59, 59, 64], 'a5'],
    'ov-a5-3': ["Cmaj7", 'x-3-5-5-0-0', [48, 55, 60, 59, 64], 'a5'],
    'ov-a5-4': ["C♯m7", 'x-4-6-6-0-0', [49, 56, 61, 59, 64], 'a5'],
    'ov-a5-5': ["Dsus2(add13)", 'x-5-7-7-0-0', [50, 57, 62, 59, 64], 'a5'],
    'ov-a5-7': ["E5", 'x-7-9-9-0-0', [52, 59, 64, 59, 64], 'a5'],
    'ov-a5-9': ["F♯7sus4", 'x-9-11-11-0-0', [54, 61, 66, 59, 64], 'a5'],
    'ov-a5-10': ["G6", 'x-10-12-12-0-0', [55, 62, 67, 59, 64], 'a5'],
    'ov-a5-11': ["Emaj7/G♯", 'x-11-13-13-0-0', [56, 63, 68, 59, 64], 'a5'],
    'ov-e6M-0': ["E", '0-2-2-1-0-0', [40, 47, 52, 56, 59, 64], 'e6M'],
    'ov-e6M-1': ["Fmaj7(♯11)", '1-3-3-2-0-0', [41, 48, 53, 57, 59, 64], 'e6M'],
    'ov-e6M-2': ["F♯7(add11)", '2-4-4-3-0-0', [42, 49, 54, 58, 59, 64], 'e6M'],
    'ov-e6M-3': ["G6", '3-5-5-4-0-0', [43, 50, 55, 59, 59, 64], 'e6M'],
    'ov-e6M-5': ["Aadd9", '5-7-7-6-0-0', [45, 52, 57, 61, 59, 64], 'e6M'],
    'ov-e6M-7': ["Badd11", '7-9-9-8-0-0', [47, 54, 59, 63, 59, 64], 'e6M'],
    'ov-e6M-8': ["Cmaj7", '8-10-10-9-0-0', [48, 55, 60, 64, 59, 64], 'e6M'],
    'ov-e6M-9': ["C♯7(♯9)", '9-11-11-10-0-0', [49, 56, 61, 65, 59, 64], 'e6M'],
    'ov-e6M-10': ["D6/9", '10-12-12-11-0-0', [50, 57, 62, 66, 59, 64], 'e6M'],
    'ov-e6m-0': ["Em", '0-2-2-0-0-0', [40, 47, 52, 55, 59, 64], 'e6m'],
    'ov-e6m-2': ["F♯m7(add11)", '2-4-4-2-0-0', [42, 49, 54, 57, 59, 64], 'e6m'],
    'ov-e6m-4': ["Emaj7/G♯", '4-6-6-4-0-0', [44, 51, 56, 59, 59, 64], 'e6m'],
    'ov-e6m-5': ["Am(add9)", '5-7-7-5-0-0', [45, 52, 57, 60, 59, 64], 'e6m'],
    'ov-e6m-7': ["Bm(add11)", '7-9-9-7-0-0', [47, 54, 59, 62, 59, 64], 'e6m'],
    'ov-e6m-9': ["C♯m7", '9-11-11-9-0-0', [49, 56, 61, 64, 59, 64], 'e6m'],
    'ov-inv-0': ["E/B", 'x-2-2-1-0-0', [47, 52, 56, 59, 64], 'inv'],
    'ov-inv-1': ["Fmaj7(♯11)/C", 'x-3-3-2-0-0', [48, 53, 57, 59, 64], 'inv'],
    'ov-inv-2': ["F♯7(add11)/C♯", 'x-4-4-3-0-0', [49, 54, 58, 59, 64], 'inv'],
    'ov-inv-3': ["G6/D", 'x-5-5-4-0-0', [50, 55, 59, 59, 64], 'inv'],
    'ov-inv-5': ["Aadd9/E", 'x-7-7-6-0-0', [52, 57, 61, 59, 64], 'inv'],
    'ov-inv-7': ["Badd11/F♯", 'x-9-9-8-0-0', [54, 59, 63, 59, 64], 'inv'],
    'ov-inv-8': ["Cmaj7/G", 'x-10-10-9-0-0', [55, 60, 64, 59, 64], 'inv'],
    'ov-inv-9': ["C♯7(♯9)/G♯", 'x-11-11-10-0-0', [56, 61, 65, 59, 64], 'inv'],
    'ov-inv-10': ["D6/9 (bass A)", 'x-12-12-11-0-0', [57, 62, 66, 59, 64], 'inv']
  };
  const OPENV_FAM = {"a5": "5th-string root", "e6M": "6th-string major (diamond)", "e6m": "6th-string minor", "inv": "5th-string bass"};
  const STRINGS = [40, 45, 50, 55, 59, 64];
  const openNotes = (id) => OPEN[id][1].split('').map((f, i) => (f === 'x' ? null : STRINGS[i] + +f)).filter((n) => n != null);
  const INV = { inv0: ['Root position', 'Root'], inv1: ['1st inversion', '1st'], inv2: ['2nd inversion', '2nd'], inv3: ['3rd inversion', '3rd'] };

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
    phrygian: { name: 'Phrygian', iv: [0, 1, 3, 5, 7, 8, 10, 12], ch: 1 },
    locrian: { name: 'Locrian', iv: [0, 1, 3, 5, 6, 8, 10, 12], ch: 6 },
    phrygdom: { name: 'Phrygian Dominant', iv: [0, 1, 4, 5, 7, 8, 10, 12], ch: 4 },
    lyddom: { name: 'Lydian Dominant', iv: [0, 2, 4, 6, 7, 9, 10, 12], ch: 6 },
    altered: { name: 'Altered', iv: [0, 1, 3, 4, 6, 8, 10, 12], ch: 1 },
    wholetone: { name: 'Whole Tone', iv: [0, 2, 4, 6, 8, 10, 12], ch: 8 },
    dimhw: { name: 'Diminished (half-whole)', iv: [0, 1, 3, 4, 6, 7, 9, 10, 12], ch: 1 },
    dimwh: { name: 'Diminished (whole-half)', iv: [0, 2, 3, 5, 6, 8, 9, 11, 12], ch: 6 },
    hungmin: { name: 'Hungarian Minor', iv: [0, 2, 3, 6, 7, 8, 11, 12], ch: 6 },
    dblharm: { name: 'Double Harmonic', iv: [0, 1, 4, 5, 7, 8, 11, 12], ch: 1 },
    majblues: { name: 'Major Blues', iv: [0, 2, 3, 4, 7, 9, 12], ch: 3 },
    bebop: { name: 'Bebop Dominant', iv: [0, 2, 4, 5, 7, 9, 10, 11, 12], ch: 11 },
    hirajoshi: { name: 'Hirajoshi', iv: [0, 2, 3, 7, 8, 12], ch: 8 },
    insen: { name: 'In-sen', iv: [0, 1, 5, 7, 10, 12], ch: 1 }
  };

  const ROMAN = {
    I: [0, 'maj'], ii: [2, 'min'], iii: [4, 'min'], IV: [5, 'maj'], V: [7, 'maj'], vi: [9, 'min'],
    i: [0, 'min'], iv: [5, 'min'], III: [3, 'maj'], VI: [8, 'maj'], VII: [10, 'maj'],
    '♭VII': [10, 'maj'], '♭VI': [8, 'maj'], '♭III': [3, 'maj'],
    I7: [0, 'dom7'], IV7: [5, 'dom7'], V7: [7, 'dom7'], ii7: [2, 'min7'], Imaj7: [0, 'maj7'], 'iiø7': [2, 'hdim7'], vi7: [9, 'min7']
  };
  const PROGS = {
    'I-IV-V-I': { mark: 2 }, 'I-IV-I-V': { mark: 3 }, 'I-V-vi-IV': { mark: 2 }, 'I-vi-IV-V': { mark: 1 },
    'I-iii-IV-V': { mark: 1 }, 'vi-IV-I-V': { mark: 0 }, 'i-VI-III-VII': { mark: 0 }, 'i-iv-i-V': { mark: 3 }, 'ii-V-I': { mark: 0 },
    'I-IV-vi-V': { mark: 2 }, 'I-vi-ii-V': { mark: 2 }, 'IV-V-iii-vi': { mark: 2 }, 'I-♭VII-IV-I': { mark: 1 },
    'I-♭VI-♭VII-I': { mark: 1 }, 'i-♭VII-♭VI-V': { mark: 3 }, 'I7-IV7-I7-V7': { mark: 3 },
    'ii7-V7-Imaj7': { mark: 2 }, 'iiø7-V7-i': { mark: 0 }, 'I-V-vi-iii-IV-I-IV-V': { mark: 3 }
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
      12: ['The same note, higher.', ['An {octave} is twelve half steps.', 'It sounds {pure and hollow}.', 'Both notes share a name.']],
      13: ['A minor 2nd, an octave wider.', ['A {minor 9th} is an octave plus a half step.', 'It sounds {sharp and dissonant}, but spread out.', 'The color of a 7♭9 chord.']],
      14: ['A whole step, an octave wider.', ['A {major 9th} is an octave plus a whole step.', 'It sounds {open and modern}.', 'The sparkle in add9 and 9th chords.']],
      15: ['A minor 3rd, stretched out.', ['A {minor 10th} is an octave plus a minor 3rd.', 'It sounds {dark but spacious}.', 'Pianists love it in the left hand.']],
      16: ['A major 3rd, stretched out.', ['A {major 10th} is an octave plus a major 3rd.', 'It sounds {warm and full}.', 'A classic bass-and-melody spacing.']],
      17: ['A 4th above the octave.', ['A {perfect 11th} is an octave plus a 4th.', 'It sounds {hollow and suspended}.', 'The top of an 11th chord.']],
      18: ['The tritone, an octave higher.', ['An {augmented 11th} is an octave plus a tritone.', 'It sounds {bright and floating}.', 'The ♯11 of Lydian jazz chords.']],
      19: ['A 5th above the octave.', ['A {perfect 12th} is an octave plus a 5th.', 'It sounds {pure, like a single big note}.', 'It is the third harmonic of a string.']],
      20: ['A minor 6th, stretched out.', ['A {minor 13th} is an octave plus a minor 6th.', 'It sounds {wide and moody}.', 'The ♭13 of altered chords.']],
      21: ['A major 6th, stretched out.', ['A {major 13th} is an octave plus a major 6th.', 'It sounds {sweet and wide}.', 'The 13 in a 13th chord.']],
      22: ['A minor 7th, stretched out.', ['A {minor 14th} is an octave plus a minor 7th.', 'It sounds {bluesy and very wide}.', 'Rare, but easy to hear once you know it.']],
      23: ['A major 7th, stretched out.', ['A {major 14th} is an octave plus a major 7th.', 'It sounds {tense, just under two octaves}.', 'Listen for the near miss.']],
      24: ['The same note, two octaves up.', ['{Two octaves} span twenty-four half steps.', 'It sounds {pure and very wide}.', 'Both notes share a name.']]
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
      dim7: ['Spooky and symmetrical.', ['A {diminished 7th} stacks three minor 3rds.', 'It sounds {dramatic, like a silent film}.', 'Every note is equally far apart.']],
      sus2: ['Open and airy, no 3rd at all.', ['A {sus2} swaps the 3rd for the 2nd.', 'It sounds {open and undecided}.', 'Neither happy nor sad.']],
      sus4: ['Hanging, waiting to land.', ['A {sus4} swaps the 3rd for the 4th.', 'It sounds {suspended}, wanting to resolve.', 'Hear it lean toward the major chord.']],
      '7sus4': ['A dominant that holds its breath.', ['A {7sus4} adds a minor 7th to a sus4.', 'It sounds {soft and floating}.', 'Common in soul and gospel.']],
      maj6: ['Sweet and old-fashioned.', ['A {major 6th} adds a 6th to a major triad.', 'It sounds {sweet, like a swing band ending}.', 'Brighter than a 7th, softer than a triad.']],
      m6: ['Minor with a mysterious lift.', ['A {minor 6th} adds a major 6th to a minor triad.', 'It sounds {dark and cinematic}.', 'A spy-movie favorite.']],
      six9: ['Lush and resolved.', ['A {6/9} adds both a 6th and a 9th.', 'It sounds {rich and settled}.', 'A favorite final chord in jazz.']],
      add9: ['Major with a sparkle on top.', ['An {add9} puts a 9th on a major triad.', 'It sounds {bright and shimmering}.', 'Everywhere in pop guitar.']],
      madd9: ['Minor with a bittersweet shimmer.', ['A {minor add9} puts a 9th on a minor triad.', 'It sounds {wistful and pretty}.', 'Listen for the rub near the root.']],
      add11: ['Major with a hanging 4th above.', ['An {add11} puts an 11th on a major triad.', 'It sounds {open and a little tense}.', 'The 4th rubs against the 3rd.']],
      add13: ['Major with a sweet 6th up high.', ['An {add13} puts a 13th on a major triad.', 'It sounds {sweet and wide}.', 'Like a major 6th, spread out.']],
      mmaj7: ['Dark and suspenseful.', ['A {minor-major 7th} is a minor triad with a major 7th.', 'It sounds {mysterious, like a thriller}.', 'Sad below, tense above.']],
      dom9: ['Funky and full.', ['A {dominant 9th} adds a 9th to a dominant 7th.', 'It sounds {funky and soulful}.', 'A staple of funk guitar.']],
      maj9: ['Dreamy and lush.', ['A {major 9th} adds a 9th to a major 7th.', 'It sounds {soft and luxurious}.', 'Neo-soul in one chord.']],
      m9: ['Smooth and moody.', ['A {minor 9th} adds a 9th to a minor 7th.', 'It sounds {mellow and deep}.', 'Late-night jazz.']],
      dom11: ['Big and suspended.', ['A {dominant 11th} stacks 7th, 9th, and 11th, usually without the 3rd.', 'It sounds {open and powerful}.', 'Hear the 4th on top.']],
      m11: ['Wide and modal.', ['A {minor 11th} stacks a minor 7th, 9th, and 11th.', 'It sounds {spacious and cool}.', 'Modal jazz loves it.']],
      dom13: ['Brassy and full.', ['A {dominant 13th} adds a 13th to a dominant 9th.', 'It sounds {big-band bright}.', 'The 13th sings on top.']],
      maj13: ['Glowing and wide.', ['A {major 13th} stacks a major 7th, 9th, and 13th.', 'It sounds {warm and glowing}.', 'A sunset in one chord.']],
      '7b9': ['Dark and urgent.', ['A {7♭9} adds a minor 9th to a dominant 7th.', 'It sounds {tense and Spanish}.', 'It pulls hard toward a minor chord.']],
      '7s9': ['Gritty and bluesy.', ['A {7♯9} has both a major and a minor 3rd.', 'It sounds {raw and rock}.', 'The famous rock-guitar crunch chord.']],
      '7s5': ['Stretched and restless.', ['A {7♯5} raises the 5th of a dominant 7th.', 'It sounds {unstable and whole-tone}.', 'It wants to move up.']],
      '7b5': ['Tense and slippery.', ['A {7♭5} lowers the 5th of a dominant 7th.', 'It sounds {tense and French}.', 'It contains two tritones.']],
      '7s11': ['Bright and floating.', ['A {7♯11} adds a raised 11th to a dominant 7th.', 'It sounds {shimmering, Lydian}.', 'Hear the bright note on top.']],
      maj7s11: ['Glassy and modern.', ['A {major 7♯11} adds a raised 11th to a major 7th.', 'It sounds {glassy and cinematic}.', 'The Lydian chord.']],
      five: ['Root and 5th, nothing else.', ['A {power chord} is just the root and the 5th.', 'It sounds {hollow and heavy}.', 'No 3rd, so it is neither major nor minor.']],
      sus2a13: ['Open, airy, and sweet.', ['A {sus2(add13)} has no 3rd, plus a 2nd and a 6th.', 'It sounds {wide open and dreamy}.', 'A favorite of open-string guitar shapes.']],
      sus2a11: ['Two suspensions at once.', ['A {sus2(add11)} holds both the 2nd and the 4th.', 'It sounds {hollow and modal}.', 'Clusters of steps around the root.']],
      madd11: ['Minor with a soft 4th above.', ['A {minor add 11} puts an 11th on a minor triad.', 'It sounds {moody and open}.', 'The 4th floats over the minor 3rd.']],
      m7add11: ['Mellow and wide.', ['A {minor 7 add 11} adds an 11th to a minor 7th.', 'It sounds {cool and spacious}.', 'Very common in J-pop and neo-soul.']],
      dom7add11: ['A dominant with a hanging 4th.', ['A {7 add 11} adds an 11th to a dominant 7th.', 'It sounds {bluesy with a rub}.', 'The 4th leans on the 3rd.']],
      maj7a13: ['Lush and sweet.', ['A {major 7 add 13} combines the 6th and the major 7th.', 'It sounds {warm and full}.', 'Two sweet colors stacked together.']],
      dom7b13: ['Dark and pulling.', ['A {7♭13} adds a flat 13th to a dominant 7th.', 'It sounds {dark and yearning}.', 'It pulls toward a minor chord.']],
      m7b13: ['Minor with a dark top.', ['A {minor 7♭13} adds a flat 13th to a minor 7th.', 'It sounds {somber and rich}.', 'The color of Aeolian harmony.']]
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
      blues: ['Pentatonic minor plus the blue note.', ['The {blues} scale adds a flat 5th.', 'It sounds {gritty and expressive}.', 'Hear the extra chromatic step.']],
      locrian: ['The darkest mode.', ['{Locrian} has a lowered 2nd and 5th.', 'It sounds {unstable and eerie}.', 'Its home chord is diminished.']],
      phrygdom: ['Flamenco and Middle Eastern fire.', ['{Phrygian dominant} is Phrygian with a major 3rd.', 'It sounds {exotic and dramatic}.', 'Listen for the step and a half after the flat 2nd.']],
      lyddom: ['Bright with a bluesy edge.', ['{Lydian dominant} has a raised 4th and a flat 7th.', 'It sounds {bright and quirky}.', 'Jazz and cartoon music love it.']],
      altered: ['Maximum tension.', ['The {altered} scale bends every note it can.', 'It sounds {tense and jazzy}.', 'Made for dominant chords about to resolve.']],
      wholetone: ['Dreamy and weightless.', ['The {whole tone} scale moves only in whole steps.', 'It sounds {floating, like a dream sequence}.', 'There is no clear home note.']],
      dimhw: ['Symmetrical tension, half step first.', ['The {half-whole diminished} scale alternates half and whole steps.', 'It sounds {tense and jazzy}.', 'Played over dominant 7♭9 chords.']],
      dimwh: ['Symmetrical tension, whole step first.', ['The {whole-half diminished} scale alternates whole and half steps.', 'It sounds {dark and suspenseful}.', 'Played over diminished chords.']],
      hungmin: ['Dark and gypsy.', ['{Hungarian minor} raises the 4th and 7th of minor.', 'It sounds {dramatic and exotic}.', 'Two big leaps give it its color.']],
      dblharm: ['Two exotic gaps.', ['The {double harmonic} scale has two step-and-a-half leaps.', 'It sounds {Middle Eastern and grand}.', 'Hear the flat 2nd and the major 7th.']],
      majblues: ['Country and gospel blues.', ['The {major blues} scale adds a minor 3rd to pentatonic major.', 'It sounds {happy with a bluesy slide}.', 'Listen for the slide into the major 3rd.']],
      bebop: ['Mixolydian plus a passing note.', ['The {bebop dominant} scale adds a major 7th to Mixolydian.', 'It sounds {swinging and jazzy}.', 'Eight notes, so the beats line up.']],
      hirajoshi: ['Japanese and haunting.', ['{Hirajoshi} is a five-note scale with two half steps.', 'It sounds {spare and haunting}.', 'Think koto strings.']],
      insen: ['Japanese and mysterious.', ['{In-sen} is a five-note scale starting with a half step.', 'It sounds {dark and meditative}.', 'Listen for the flat 2nd right away.']]
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
      'ii-V-I': ['The jazz turnaround.', ['{ii-V-I} is the heart of jazz.', 'It sounds {smooth and inevitable}.', 'Minor, tension, home.']],
      'I-IV-vi-V': ['A bright, hopeful loop.', ['{I-IV-vi-V} lifts to IV before dipping to vi.', 'It sounds {open and optimistic}.', 'A modern pop favorite.']],
      'I-vi-ii-V': ['The classic turnaround.', ['{I-vi-ii-V} circles back to home.', 'It sounds {smooth and swinging}.', 'Every chord falls a 5th to the next.']],
      'IV-V-iii-vi': ['The royal road.', ['{IV-V-iii-vi} starts away from home.', 'It sounds {yearning and emotional}.', 'A favorite in Japanese pop.']],
      'I-♭VII-IV-I': ['Rock with a borrowed chord.', ['{I-♭VII-IV-I} uses a chord from Mixolydian.', 'It sounds {big and anthemic}.', 'Classic rock in four chords.']],
      'I-♭VI-♭VII-I': ['The epic cadence.', ['{I-♭VI-♭VII-I} climbs through two borrowed chords.', 'It sounds {heroic, like a level-up}.', 'Film and game music love it.']],
      'i-♭VII-♭VI-V': ['The Andalusian cadence.', ['{i-♭VII-♭VI-V} walks down to a major V.', 'It sounds {Spanish and dramatic}.', 'Flamenco in four chords.']],
      'I7-IV7-I7-V7': ['The blues in miniature.', ['{I7-IV7-I7-V7} uses dominant 7ths everywhere.', 'It sounds {bluesy and loose}.', 'The skeleton of a 12-bar blues.']],
      'ii7-V7-Imaj7': ['The jazz ii-V-I with 7ths.', ['{ii7-V7-Imaj7} is the most common jazz move.', 'It sounds {smooth and sophisticated}.', 'Listen for the voices moving by half steps.']],
      'iiø7-V7-i': ['The minor ii-V-i.', ['{iiø7-V7-i} lands on a minor home.', 'It sounds {dark and noir}.', 'Half-diminished, dominant, minor.']],
      'I-V-vi-iii-IV-I-IV-V': ['The canon.', ['{I-V-vi-iii-IV-I-IV-V} is an eight-chord loop.', 'It sounds {graceful and endless}.', 'Wedding music in one pattern.']]
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
    intervals: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24],
    chords: Object.keys(CHORDS),
    scales: Object.keys(SCALES),
    progs: Object.keys(PROGS)
  };

  /* item families: some lessons ask about something other than the skill's main items */
  const FUNC_ITEMS = ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'iv', '♭VII', '♭VI', 'V7'];
  const FAMILIES = { chords: { open: Object.keys(OPEN), inv: Object.keys(INV), openv: Object.keys(OPENV) }, progs: { func: FUNC_ITEMS } };
  function famOf(skill, item) {
    const f = FAMILIES[skill]; if (!f) return null;
    if (skill === 'progs' && PROGS[item]) return null;
    for (const k of Object.keys(f)) if (f[k].includes(item)) return k;
    return null;
  }
  function familyItems(skill, o, item) {
    const fam = o ? (o.fam || (o.func ? 'func' : null)) : famOf(skill, item);
    return fam ? FAMILIES[skill][fam] : ALL_ITEMS[skill];
  }

  /* ---------- labels ---------- */
  function label(skill, item, st) {
    st = st || {};
    switch (skill) {
      case 'pitch': return NAMES[st.names || 'flat'][(((item + (st.transpose || 0)) % 12) + 12) % 12];
      case 'intervals': return INTERVALS[item][0];
      case 'chords': return CHORDS[item] ? CHORDS[item].name : OPEN[item] ? OPEN[item][0] : OPENV[item] ? OPENV[item][0] : INV[item][0];
      case 'scales': return SCALES[item].name;
      case 'progs': return item;
    }
  }
  function shortLabel(skill, item, st) {
    if (skill === 'chords') return CHORD_SHORT[item] || (OPEN[item] ? OPEN[item][0] : OPENV[item] ? OPENV[item][0] : INV[item][1]);
    return label(skill, item, st);
  }
  function subLabel(skill, item) {
    switch (skill) {
      case 'intervals': return INTERVALS[item][1];
      case 'chords': return CHORDS[item] ? CHORDS[item].kind : OPEN[item] ? OPEN[item][1] : OPENV[item] ? OPENV[item][1] : '';
      default: return '';
    }
  }

  function chordTag(item) { return CHORDS[item] ? CHORD_TAG[CHORDS[item].kind] : ''; }
  function chordPcs(item) { return CHORDS[item] ? CHORDS[item].iv.map((x) => x % 12) : OPEN[item] ? openNotes(item).map((n) => n % 12) : OPENV[item] ? OPENV[item][2].map((n) => n % 12) : []; }
  function shapeOf(item) { return OPEN[item] ? OPEN[item][1].split('').join('-') : OPENV[item] ? OPENV[item][1] : null; }

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

  /* ---------- varied voicings: the same chord stacked different ways ---------- */
  const VOICINGS = ['close', 'inv', 'drop2', 'drop3', 'spread'];
  function voiceChord(root, ivs, style) {
    const close = ivs.map((x) => root + x);
    if (close.length < 3 && (style === 'drop2' || style === 'drop3')) style = Math.random() < 0.5 ? 'inv' : 'spread';
    switch (style) {
      case 'inv': return invert(close, rnd(1, Math.max(1, close.length - 1)));
      case 'drop2': { if (close.length < 4) return [close[1] - 12].concat([close[0], close[2]]).sort((a, b) => a - b); const c = close.slice(0, 4); const top2 = c[2]; return [top2 - 12, c[0], c[1], c[3]].concat(close.slice(4)).sort((a, b) => a - b); }
      case 'drop3': { if (close.length < 4) return [close[0] - 12, close[1], close[2] + 12].sort((a, b) => a - b); const c = close.slice(0, 4); return [c[1] - 12, c[0], c[2], c[3]].concat(close.slice(4)).sort((a, b) => a - b); }
      case 'spread': return spreadVoicing(ivs.map((x) => (root + x) % 12), root % 12, root);
      default: return close;
    }
  }
  /* root (or given bass) low, every other pitch class placed somewhere above, at least a 3rd apart where possible */
  function spreadVoicing(pcs, bassPc, near) {
    let bass = 36 + ((bassPc - 36) % 12 + 12) % 12; if (bass < 40) bass += 12;
    const upper = [...new Set(pcs)].filter((pc) => pc !== bassPc || pcs.filter((x) => x === bassPc).length > 1);
    const out = [bass];
    let floor = bass + 7;
    shuffleArr(upper.slice()).forEach((pc) => {
      let n = floor + ((pc - floor) % 12 + 12) % 12;
      if (Math.random() < 0.35) n += 12;
      while (n > 81) n -= 12;
      out.push(n); floor = Math.min(n + 3, 72);
    });
    if (!out.slice(1).some((n) => n % 12 === bassPc) && Math.random() < 0.6) out.push(bass + 12 * rnd(1, 2)); // double the bass note above, like a guitarist would
    return [...new Set(out)].sort((a, b) => a - b);
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
        if (o.chordRoot) { // a triad with this note as its root, root in the bass
          const q = o.crq || pick(['maj', 'min']);
          return { steps: [{ t: 0, notes: [m - 12].concat(closeVoicing(m, q)), d: 1.8 }], meta: { midi: m } };
        }
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
        if (OPEN[item] || OPENV[item]) {
          const notes = OPEN[item] ? openNotes(item) : OPENV[item][2].slice();
          // vary: the same chord (same notes, same bass) stacked a different way each time
          if (o.vary) return { steps: [{ t: 0, notes: o.voicing || spreadVoicing(notes.map((n) => n % 12), notes[0] % 12), d: 2.3 }] };
          return { steps: [{ t: 0, notes, d: 2.3 }] };
        }
        if (INV[item]) {
          const q = o.invQ || (o.sev ? pick(['maj7', 'min7', 'dom7']) : pick(['maj', 'min']));
          const r = o.root != null ? o.root : rnd(52, 60);
          const n = Math.min(+item.slice(3), CHORDS[q].iv.length - 1);
          return { steps: [{ t: 0, notes: invert(closeVoicing(r, q), n), d: 2.0 }] };
        }
        const [lo, hi] = chordRange(o);
        const root = o.root != null ? o.root : rnd(lo, hi);
        if (o.vary) {
          const style = o.vstyle || (o.vary === 1 || o.vary === true ? pick(VOICINGS) : o.vary);
          return { steps: [{ t: 0, notes: voiceChord(root, CHORDS[item].iv, style), d: 2.1 }], meta: { style } };
        }
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
        if (!PROGS[item] && ROMAN[item]) return funcInstance(item, o);
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
  /* a chain of items played one after another (for "name them in order" questions) */
  function seqInstance(sk, items, o) {
    if (Array.isArray(sk)) { o = items; items = sk; sk = 'pitch'; }
    o = o || {};
    if (sk === 'pitch' && o.together) { // all notes at once, low to high inside one octave
      const oct = pick(o.oct || [4]);
      return { steps: [{ t: 0, notes: items.map((pc) => 12 * (oct + 1) + pc), d: 1.8 }] };
    }
    if (sk === 'intervals') {
      // 3 notes, 2 intervals; direction per step follows o.dir
      let cur = o.root != null ? o.root : rnd(52, 64);
      const notes = [cur];
      items.forEach((iv) => {
        let dir = o.dir === 'down' ? -1 : o.dir === 'both' || o.dir === 'any' ? pick([1, -1]) : 1;
        if (cur + dir * iv > 81 || cur + dir * iv < 43) dir = -dir;
        cur += dir * iv; notes.push(cur);
      });
      return { steps: notes.map((n, i) => ({ t: i * 0.8, notes: [n], d: i === notes.length - 1 ? 1.2 : 0.75 })) };
    }
    if (sk === 'chords') {
      return { steps: items.map((q, i) => {
        const root = rnd(52, 62);
        let notes = closeVoicing(root, q);
        if (o.inv) notes = invert(notes, rnd(0, notes.length - 1));
        return { t: i * 1.5, notes, d: 1.4 };
      }) };
    }
    const oct = pick(o.oct || [4]);
    return { steps: items.map((pc, i) => ({ t: i * 0.85, notes: [12 * (oct + 1) + pc], d: i === items.length - 1 ? 1.3 : 0.8 })) };
  }

  /* chord function: home chord (I) then the target chord */
  function funcInstance(roman, o) {
    const key = o.key != null ? o.key : (o.randomKey ? rnd(55, 66) : 60);
    const chord = (r) => { const [off, q] = ROMAN[r]; let root = key + off; if (root > key + 6) root -= 12; return [root - 12].concat(closeVoicing(root, q)); };
    return { steps: [{ t: 0, notes: chord('I'), d: 1.0, v: 0.7 }, { t: 1.25, notes: chord(roman), d: 1.6 }] };
  }

  /* Fix the random parts of a sound so alternates can be played in the same register */
  function concrete(skill, o) {
    o = Object.assign({}, o || {});
    switch (skill) {
      case 'pitch': o.oct = [pick(o.oct || [4])]; if (o.chordRoot) o.crq = pick(['maj', 'min']); break;
      case 'intervals': {
        let dir = o.dir || 'up';
        if (dir === 'both') dir = pick(['up', 'down']);
        if (dir === 'any') dir = pick(['up', 'down', 'harm']);
        const [lo, hi] = intRange(o);
        o.dir = dir; o.root = dir === 'down' ? rnd(lo + 12, hi + 5) : rnd(lo, hi); break;
      }
      case 'chords': {
        const [lo, hi] = chordRange(o);
        o.root = rnd(lo, hi); if (o.inv) o.invN = rnd(0, 3);
        if (o.vary && !o.fam) o.vstyle = o.vary === 1 || o.vary === true ? pick(VOICINGS) : o.vary;
        if (o.fam === 'inv') { o.root = rnd(52, 60); o.invQ = o.sev ? pick(['maj7', 'min7', 'dom7']) : pick(['maj', 'min']); }
        break;
      }
      case 'scales':
        if (o.fixRoot != null) { o.root = o.fixRoot; o.down = false; break; }
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


  /* ---------- scale spelling with key signatures ---------- */
  const LETTERS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
  const SOLF = ['Do', 'Re', 'Mi', 'Fa', 'Sol', 'La', 'Ti'];
  const LPC = [0, 2, 4, 5, 7, 9, 11];
  const ACC = { '-2': '𝄫', '-1': '♭', 0: '', 1: '♯', 2: '𝄪' };
  // which letter step each scale degree uses (pentatonics/blues borrow their parent scale's letters)
  const DEG_LETTERS = { pentmaj: [0, 1, 2, 4, 5, 7], pentmin: [0, 2, 3, 4, 6, 7], blues: [0, 2, 3, 4, 4, 6, 7],
    wholetone: [0, 1, 2, 3, 4, 5, 7], dimhw: [0, 1, 2, 2, 3, 4, 5, 6, 7], dimwh: [0, 1, 2, 3, 4, 5, 5, 6, 7],
    majblues: [0, 1, 2, 2, 4, 5, 7], bebop: [0, 1, 2, 3, 4, 5, 6, 6, 7], hirajoshi: [0, 1, 2, 4, 5, 7], insen: [0, 1, 3, 4, 6, 7] };
  const PARENT = { harmin: 'natmin', melmin: 'natmin', pentmin: 'natmin', blues: 'natmin', pentmaj: 'major',
    phrygdom: 'phrygian', lyddom: 'mixo', altered: 'locrian', wholetone: 'lydian', dimhw: 'mixo', dimwh: 'natmin',
    hungmin: 'harmin', dblharm: 'phrygian', majblues: 'major', bebop: 'mixo', hirajoshi: 'natmin', insen: 'phrygian' };
  // position of the relative major's tonic inside each 7-note parent scale
  const MAJOR_AT = { major: 0, natmin: 2, dorian: 6, phrygian: 5, lydian: 4, mixo: 3, locrian: 1 };
  const FLAT_ORDER = 'BEADGCF', SHARP_ORDER = 'FCGDAEB';

  function spell(item, letter, acc) {
    const iv = SCALES[item].iv;
    const degs = DEG_LETTERS[item] || iv.map((_, i) => i);
    const rootPc = (LPC[letter] + acc + 12) % 12;
    return iv.map((x, i) => {
      const li = (letter + degs[i]) % 7;
      const a = ((rootPc + x - LPC[li]) % 12 + 18) % 12 - 6;
      return { letter: li, acc: a };
    });
  }
  function keySig(item, letter, acc) {
    let parent = PARENT[item] || item;
    while (PARENT[parent]) parent = PARENT[parent];
    const notes = spell(parent, letter, acc).slice(0, 7);
    const signed = notes.filter((n) => n.acc !== 0);
    const sharps = signed.filter((n) => n.acc > 0).length;
    const list = signed.slice().sort((a, b) => (a.acc < 0 ? FLAT_ORDER : SHARP_ORDER).indexOf(LETTERS[a.letter]) - (b.acc < 0 ? FLAT_ORDER : SHARP_ORDER).indexOf(LETTERS[b.letter]));
    const major = notes[MAJOR_AT[parent]];
    return { count: signed.length, type: !signed.length ? '' : sharps ? '♯' : '♭', list, major, accOf: (li) => (notes.find((n) => n.letter === li) || { acc: 0 }).acc };
  }
  // best way to write a root pitch class for this scale: no double accidentals, fewest sharps/flats
  function rootSpelling(item, pc) {
    let best = null;
    for (let l = 0; l < 7; l++) for (const a of [-1, 0, 1]) {
      if ((LPC[l] + a + 12) % 12 !== pc) continue;
      let parent = PARENT[item] || item;
      while (PARENT[parent]) parent = PARENT[parent];
      const doubles = spell(item, l, a).concat(spell(parent, l, a)).some((n) => Math.abs(n.acc) > 1);
      const score = (doubles ? 100 : 0) + keySig(item, l, a).count + (a ? 0.5 : 0) + (a > 0 ? 0.01 : 0); // ties go to flats
      if (!best || score < best.score) best = { letter: l, acc: a, score };
    }
    return best;
  }
  /* everything a slide needs: spelled notes, which ones are outside the key signature, and the signature */
  function scaleSpelling(item, pc, names) {
    const r = rootSpelling(item, ((pc % 12) + 12) % 12);
    const sig = keySig(item, r.letter, r.acc);
    const sol = names === 'solFlat' || names === 'solSharp';
    const nm = (n) => (sol ? SOLF : LETTERS)[n.letter] + ACC[n.acc];
    return {
      root: nm(r),
      notes: spell(item, r.letter, r.acc).map((n) => ({ name: nm(n), out: n.acc !== sig.accOf(n.letter) })),
      sigCount: sig.count, sigType: sig.type, sigList: sig.list.map(nm), sigMajor: nm(sig.major)
    };
  }

  window.PTMusic = {
    NAMES, NAME_OPTIONS, TRANSPOSE_OPTIONS, WHITE, BLACK, ALL12, INTERVALS, CHORDS, SCALES, ROMAN, PROGS, DESC,
    SKILLS, SKILL_ORDER, ALL_ITEMS, concrete, seqInstance, FUNC_ITEMS, FAMILIES, OPEN, OPENV, OPENV_FAM, INV, shapeOf, famOf, familyItems, chordTag, chordPcs, voiceChord, VOICINGS, scaleSpelling, label, shortLabel, subLabel, instance, resetEarSteps, rnd, pick
  };
})();
