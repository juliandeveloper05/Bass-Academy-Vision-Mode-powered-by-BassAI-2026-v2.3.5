# CLAUDE.md — Bass Academy Vision Mode v2.3.5

Guide for AI assistants working in this codebase. Read this before making changes.

---

## Project Overview

**Bass Academy** is a production-ready, offline-first Progressive Web App (PWA) for interactive bass guitar practice. It runs entirely in the browser — no backend, no external APIs for core features.

- **Version:** 2.3.5 (BassAI Vision Mode)
- **Stack:** React 19, Vite 6, Tailwind CSS 4, Web Audio API, MediaPipe
- **Author:** Julian Javier Soto
- **Live demo:** https://bass-academy-interactive-bass-train.vercel.app/
- **Repo:** https://github.com/juliandeveloper05/Bass-Academy-Interactive-Bass-Training.git

---

## Development Commands

```bash
npm install                  # Install dependencies (requires Node >=18, npm >=9)
npm run dev                  # Dev server → http://localhost:5173
npm run build                # Production build → dist/
npm run preview              # Preview production build locally
npm run lint                 # ESLint check (no auto-fix)
npm run pwa:generate-icons   # Regenerate PWA icons from source image
npm run pwa:test             # Build + preview for PWA testing
```

---

## Architecture Overview

### Entry Points

| File | Purpose |
|------|---------|
| `src/main.jsx` | Vite entry — mounts `<App />` to `#root` |
| `src/App.jsx` | Root component with ErrorBoundary; routes between HomeScreen, BassTrainer, CustomBuilderRouter |
| `src/BassTrainer.jsx` | Main trainer view — wires all modes, hooks, and services together |
| `src/PopoutApp.jsx` | Pop-out window entry (separate `popout.html`) |
| `index.html` | Main HTML shell |
| `popout.html` | Pop-out window HTML shell |

### Data & State Flow

```
HomeScreen (artist/exercise selection)
    ↓
BassTrainer.jsx
    ├── playerReducer (useReducer) ← FSM state (IDLE → COUNTDOWN → PLAYING ↔ PAUSED)
    ├── AudioEngineContext (React Context) ← shared Web Audio engine
    ├── useAudioScheduler ← lookahead note scheduling (~100ms)
    ├── useBassAudio ← high-level playback API
    └── VisionContext (optional) ← gesture state from MediaPipe
```

### Player Finite State Machine

```
IDLE → (PLAY) → COUNTDOWN → (timer) → PLAYING → (PAUSE) → PAUSED
                                              ↑_____(RESUME)_____|
PLAYING/PAUSED → (STOP) → IDLE
```

Defined in `src/machines/playerStateMachine.js`, consumed via `src/reducers/playerReducer.js`.

---

## Directory Structure

```
src/
├── App.jsx                       # Root with routing
├── BassTrainer.jsx               # Main trainer UI (~30KB — most wiring lives here)
├── PopoutApp.jsx                 # Pop-out window app
├── main.jsx                      # Vite entry point
│
├── components/                   # React UI components (grouped by feature)
│   ├── builder/                  # Custom Exercise Builder (hub, fretboard editor, router)
│   ├── exercise/                 # EducationalInfoPanel
│   ├── layout/                   # Header, CountdownOverlay
│   ├── loop/                     # Loop Mode (grid, playhead, analysis, controls) — v2.3.4
│   ├── player/                   # ControlPanel, BeatIndicator, TempoControl, VolumeControl
│   ├── popout/                   # PopoutTrainer
│   ├── recording/                # RecordingButton, RecordingIndicator, RecordingModal
│   ├── stats/                    # StatsModal
│   ├── tablature/                # Tab views (desktop, mobile, fullscreen, note cells)
│   ├── ui/                       # LatencyCalibrationModal
│   ├── HomeScreen.jsx            # Artist selection landing page
│   ├── ExerciseSelector.jsx      # Exercise dropdown
│   ├── FretboardView.jsx         # 4-string bass fretboard visualization
│   ├── Footer.jsx
│   ├── OfflineIndicator.jsx
│   ├── PWAInstallBanner.jsx
│   └── UpdateNotification.jsx
│
├── config/                       # Centralized constants — ALL magic numbers go here
│   ├── audioConfig.js            # Tempo range, synthesis params, audio constants
│   ├── uiConfig.js               # View modes, themes, countdown duration
│   └── featureFlags.js           # Runtime feature toggles (VITE_* env vars)
│
├── contexts/
│   └── AudioEngineContext.jsx    # Shared audio engine provider
│
├── data/
│   ├── exerciseLibrary.js        # 16+ built-in artist patterns
│   └── customExerciseLibrary.js  # Custom exercise helpers
│
├── features/                     # Self-contained feature modules
│   ├── recording/                # Audio recording system
│   │   ├── hooks/                # useMediaRecorder, useRecordingStorage
│   │   └── services/             # RecordingService (IndexedDB CRUD)
│   └── vision/                   # BassAI Vision Mode (MediaPipe hand tracking)
│       ├── VISION_DOCS.md        # ← READ THIS before modifying anything in vision/
│       ├── components/           # VisionStudio, GestureIndicator, VisionContext UI
│       ├── config/               # visionConfig.js (thresholds), gesturePresets.js
│       ├── context/              # VisionContext.jsx
│       ├── hooks/                # useHandTracking, useGestureRecognizer
│       ├── utils/                # gestureCalculations, smoothingFilters, drawingUtils, visionLogger
│       └── workers/              # vision.worker.js (DISABLED — main thread fallback active)
│
├── hooks/                        # 14 custom React hooks
│   ├── useBassAudio.js           # High-level audio playback API
│   ├── useAudioEngine.js         # Audio context initialization
│   ├── useAudioScheduler.js      # Lookahead note scheduling
│   ├── usePlayerState.js         # Player state management
│   ├── usePlayerStateMachine.js  # FSM transition dispatcher
│   ├── useFullscreen.js          # Cross-browser Fullscreen API
│   ├── usePWA.js                 # PWA install/update lifecycle
│   ├── usePopoutWindow.js        # Pop-out window lifecycle
│   ├── useWindowSync.js          # postMessage IPC (main ↔ popout)
│   ├── useLoopMode.js            # Loop Mode RAF animation loop
│   ├── useLatencyCalibration.js  # Tap-to-calibrate audio latency
│   ├── useHapticFeedback.js      # Navigator.vibrate wrapper
│   ├── usePowerSaving.js         # Battery API integration
│   └── usePracticeStats.js       # Session statistics tracking
│
├── lib/
│   └── utils.js                  # cn() — clsx + tailwind-merge helper
│
├── machines/
│   └── playerStateMachine.js     # FSM states, events, transitions
│
├── reducers/
│   └── playerReducer.js          # useReducer actions (TRANSITION, SET_TEMPO, etc.)
│
└── services/                     # Pure JS business logic (no React dependencies)
    ├── AudioService.js           # Web Audio API singleton
    ├── CustomExerciseManager.js  # localStorage CRUD for custom exercises
    ├── LoopAnalyticsService.js   # Loop session metrics
    └── VisionAudioBridge.js      # Gesture command → audio handler dispatch
```

---

## Key Conventions

### Naming

| Type | Convention | Example |
|------|-----------|---------|
| React components | PascalCase `.jsx` | `LoopModeWrapper.jsx` |
| Custom hooks | `use` prefix, camelCase `.js` | `useLoopMode.js` |
| Services | PascalCase `.js` | `AudioService.js` |
| Constants & reducer actions | `UPPER_SNAKE_CASE` | `TOGGLE_LOOP`, `SET_TEMPO` |
| Feature flag env vars | `VITE_` prefix | `VITE_VISION_ENABLED` |

### Code Style

- **No magic numbers in components.** All constants belong in `src/config/`.
- **Services are pure JS.** No React hooks or JSX in `src/services/`.
- **Use `cn()` for Tailwind.** Import from `src/lib/utils.js` for conditional class merging.
- **Import order:** React → third-party → components → hooks → services → config → data.
- **No Prettier configured** — maintain consistent formatting manually.

### CSS / Styling

- **Tailwind CSS 4 is primary.** Avoid custom CSS unless complexity demands it.
- **Component `.css` files** for complex animations/layouts (e.g., `HomeScreen.css`).
- **CSS custom properties** for theming: `--color-gold`, `--bg-dark`, etc.
- **Always support `prefers-reduced-motion`** for any animations.

### State Management Rules

- Player state → `playerReducer.js` + `usePlayerState` hook. Do **not** add ad-hoc `useState` for player logic.
- Audio engine → `AudioEngineContext`. Always consume via `useContext(AudioEngineContext)`.
- Vision state → `VisionContext`. Consume via `useVisionContext()` hook.
- Prefer `useReducer` over multiple `useState` calls for related state.

### Storage Keys

| Key | Storage | Purpose |
|-----|---------|---------|
| `bass-trainer-theme` | localStorage | UI theme preference |
| `bass-trainer-power-saving` | localStorage | Battery saving mode override |
| `bass-academy-latency-v1` | localStorage | Audio latency calibration offset |
| `bass-trainer-loop-analytics` | localStorage | Loop mode practice metrics |
| `bass-builder-draft` | localStorage | Custom exercise draft autosave |
| Audio recordings | IndexedDB | Managed by `RecordingService` |

---

## Feature Flags

Set at build time via environment variables (Vite format):

| Variable | Default | Effect |
|----------|---------|--------|
| `VITE_VISION_ENABLED` | `false` | Enable BassAI Vision Mode (MediaPipe hand tracking) |
| `VITE_VISION_WORKERS` | `false` | Use Web Workers for MediaPipe (disabled — ES module incompatibility) |
| `VITE_VISION_DEBUG` | `false` | Show FPS/latency overlay in Vision panel |

Enable Vision Mode for development:
```bash
VITE_VISION_ENABLED=true npm run dev
```

Read in code via `import.meta.env.VITE_VISION_ENABLED`.

---

## BassAI Vision Mode

> **Before modifying anything in `src/features/vision/`, read `src/features/vision/VISION_DOCS.md`.**

### Pipeline

```
Camera (WebRTC) → useHandTracking (MediaPipe landmarks)
    → useGestureRecognizer (temporal smoothing + hold validation)
    → VisionAudioBridge (cooldown enforcement + dispatch)
    → BassTrainer.jsx handlers
    → AudioService
```

### Gestures

| Gesture | Command | Hold Time |
|---------|---------|-----------|
| Open Hand ✋ | `play` | 500ms |
| Closed Fist ✊ | `stop` | 500ms |
| Peace Sign ✌️ | `togglePause` | 500ms |
| Thumbs Up 👍 | `tempoUp` (+5 BPM) | 500ms |
| Thumbs Down 👎 | `tempoDown` (-5 BPM) | 500ms |
| Pinch 🤏 | `toggleLoop` | 700ms |

### Golden Rule

**Gestures control only discrete/stepped actions — never continuous values.**
- ✅ Allowed: play/stop, tempo ±5, toggle loop
- ❌ Not allowed: volume sliders, continuous gain, fine-grained controls

### Adding a New Gesture

See `VISION_DOCS.md` §"Adding a New Gesture" for the 4-step process:
1. Add detection function in `gestureCalculations.js`
2. Register in `detectGesture()`
3. Add preset in `gesturePresets.js`
4. Add handler in `BassTrainer.jsx` vision bridge setup

---

## Audio Architecture

- `AudioService.js` is a **singleton** — initialize once via `useAudioEngine`, never instantiate directly.
- Note scheduling uses a **~100ms lookahead** in `useAudioScheduler` for timing precision.
- Bass and metronome volumes are separate `GainNode`s in the master audio graph.
- Sample files live in `public/audio/` (metronome clicks, bass note samples).
- Latency compensation offset stored in localStorage; read by `useLatencyCalibration`.

---

## Exercise Data Format

```javascript
// src/data/exerciseLibrary.js
{
  id: 'unique-kebab-id',
  name: 'Exercise Name',
  artist: 'Artist Name',
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced',
  tempo: 80,                  // default BPM
  timeSignature: '4/4',
  tags: ['slap', 'funk'],     // for filtering
  notes: [
    {
      string: 0,              // 0=E, 1=A, 2=D, 3=G
      fret: 5,
      technique: 'normal' | 'slap' | 'pop' | 'hammer' | 'mute'
    }
  ]
}
```

Custom exercises (built by user) use the same shape and are persisted via `CustomExerciseManager`.

---

## PWA / Service Worker

- Service Worker is **generated by `vite-plugin-pwa`** via Workbox — do **not** edit `public/sw.js` directly.
- PWA config is in `vite.config.js` under the `VitePWA()` plugin options.
- Icons are in `public/icons/` — regenerate with `npm run pwa:generate-icons` after changing source image.
- `vercel.json` configures: SPA routing rewrites, immutable cache headers for assets/icons, no-cache for `sw.js`, security headers.

---

## Multi-Window Architecture

The app supports a pop-out trainer window for DAW multi-screen setups:

- Main window → `index.html` → `src/App.jsx`
- Pop-out window → `popout.html` → `src/PopoutApp.jsx`
- IPC: `postMessage` API, abstracted in `useWindowSync.js`
- Pop-out lifecycle: `usePopoutWindow.js` (open, close, detect orphan)

---

## Linting

```bash
npm run lint    # ESLint v9 flat config (eslint.config.js)
```

- Config format: ESM flat config (not `.eslintrc`)
- Rules: `no-unused-vars` (error, ignores `UPPER_CASE` and `_underscore` vars), react-hooks plugin rules enforced, react-refresh rules enforced
- Ignored: `dist/` directory
- **No pre-commit hooks configured** — run lint manually before opening PRs

---

## Testing

No testing framework is currently configured. If adding tests, use **Vitest** (Vite-native, consistent with the build toolchain). Place test files as `*.test.js` or `*.spec.js` alongside source files or in a `__tests__/` directory.

---

## Deployment

- **Platform:** Vercel (auto-deploy on push to `main`)
- **Build command:** `npm run build`
- **Output directory:** `dist/`
- **Framework preset:** Vite
- **Production env vars:** Set in Vercel dashboard, not in committed files
- **Bundle size (production):** ~318 KB JS, ~87 KB gzipped

---

## Commit Message Convention

The project uses a prefix convention:

```
Feat(scope): description       # New feature
Fix(scope): description        # Bug fix
Refactor(scope): description   # Refactoring, no behavior change
Docs: description              # Documentation only
Chore: description             # Build, deps, tooling
```

Examples from git history:
```
Feat(vision): implement BassAI Vision Mode with MediaPipe hand tracking
Fix(vision): disable Web Worker for MediaPipe ES module compatibility
Refactor(vision): separate engine state from UI state
Feat(loop): v2.3.4 - add micro-animations, swing toggle, analysis panel
```

---

## What to Avoid

- **Do not add a backend.** This is intentionally client-only.
- **Do not add magic numbers** to components — use `src/config/`.
- **Do not edit `public/sw.js` directly** — it is Workbox-generated.
- **Do not use gesture control for continuous values** (volume, fine pitch) — see Vision Golden Rule.
- **Do not instantiate `AudioService` directly** — use `useAudioEngine` hook.
- **Do not add React dependencies to `src/services/`** — keep them pure JS.
- **Do not use `prefers-reduced-motion`-breaking animations** without a fallback.
