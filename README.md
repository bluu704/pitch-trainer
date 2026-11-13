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
| Skills | Pitch (32 lessons), Intervals (42), Chords (26), Scales (25), Progressions (24) |
| Skill path | Units, zig-zag lesson nodes, checkpoints (flag), final exam (trophy), stars, bookmarks, **Test out** to skip ahead |
| Lessons | Learn slides (meet the sound, pitch ladder, "everything you can hear" lists), quick check, then 15–40 adaptive questions |
| Question types | *Which one is this?*, *Is this X?*, *Find the X* (tap 4 sounds), piano keyboard input |
| Smart quizzes | No back-to-back repeats, no duplicate sounds, look-alike choices later in a lesson, weak items asked more, missed questions come back |
| Practice | Timed challenge per skill, best scores, transposition support |
| Progress | First-steps unlock, XP / streak / lessons stats, accuracy per skill, activity heatmap, trouble spots, bookmarks |
| Ranks | Weekly league (Bronze → Diamond), promotion & demotion zones |
| Settings | Instrument (Random, Piano, Guitar, Cello, Clarinet, Trumpet, Sine), note names (Letter/Solfège ♭/♯), transposition, keyboard, answer hints, reset-your-ear chords, notifications, theme (Auto/Light/Dark), profile, feedback board, log out, delete account |

All sounds are synthesized with the Web Audio API. Progress is stored on the device only.

## Develop

```bash
npm install
npx serve www            # or open www/index.html directly
npm run bundle           # writes pitch-trainer.html (single file)
npm run build:android    # needs JDK 21 + Android SDK
```

Every push to `main` builds the APK in GitHub Actions and publishes it as a release.
