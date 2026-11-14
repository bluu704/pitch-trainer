# Pitch Trainer

Duolingo-style ear training: learn to hear **notes, intervals, chords, scales, and chord progressions**, one bite-sized lesson at a time. Light and dark themes. Works in the browser and as an Android app.

## Download

- **Android APK:** [Latest release → PitchTrainer.apk](https://github.com/bluu704/pitch-trainer/releases/latest/download/PitchTrainer.apk)
- **Single HTML file:** [pitch-trainer.html](https://github.com/bluu704/pitch-trainer/releases/latest/download/pitch-trainer.html) — open it in any browser, works offline.
- **Web:** https://bluu704.github.io/pitch-trainer/ (once GitHub Pages is enabled: Settings → Pages → Source: *GitHub Actions*)

## Features

| Area | What's inside |
|---|---|
| Home | Greeting, streak counter, week strip, today's session card, 5 skill cards with progress |
| Skills | Pitch (53 lessons), Intervals (61), Chords (43), Scales (39), Progressions (40) — 236 in total |
| Skill path | Units, zig-zag lesson nodes, checkpoints (flag), final exam (trophy), stars, bookmarks, **Test out** to skip ahead |
| Lessons | Learn slides (meet the sound, pitch ladder, "everything you can hear" lists), quick check, then 18–40 adaptive questions |
| Question types | *Which one is this?*, *Is this X?*, *Find the X* (tap 4 sounds), *Name the melody* (2–3 notes in order), *Odd one out*, *Interval / chord chains*, *Chord functions* (I → ii/iii/IV/V/vi), piano keyboard input |
| Smart quizzes | No back-to-back repeats, no duplicate sounds, look-alike choices later in a lesson, weak items asked more, missed questions come back |
| Practice | Timed challenge per skill, best scores, transposition support |
| Progress | First-steps unlock, XP / streak / lessons stats, accuracy per skill, activity heatmap, trouble spots, bookmarks |
| Endless | Infinite Random Mix across all skills, plus an endless mode for each of the 5 skills; combo tracking and best scores |
| Settings | Instrument (Random, Piano, Guitar, Cello, Clarinet, Trumpet, Sine), note names (Letter/Solfège ♭/♯), transposition, keyboard, answer hints, reset-your-ear chords with a Harmonious / Mixed / Dissonant sound, notifications, theme (Auto/Light/Dark), feedback board, log out, delete account |
| Layouts | Phone layout for the Android app; a desktop layout (sidebar, wide grids, keyboard shortcuts 1–9 / Y / N / Space / Enter / Esc) for the web and HTML versions |

Instruments (piano, steel-string acoustic guitar, cello, clarinet, trumpet) use real recorded samples from the FluidR3 GM SoundFont (Frank Wen, CC BY 3.0, via midi-js-soundfonts), pitch-shifted between sample points and played through a soft room reverb. Progress is stored on the device only.

## Develop

```bash
npm install
npx serve www            # or open www/index.html directly
npm run bundle           # writes pitch-trainer.html (single file)
npm run build:android    # needs JDK 21 + Android SDK
```

Every push to `main` builds the APK in GitHub Actions and publishes it as a release.
