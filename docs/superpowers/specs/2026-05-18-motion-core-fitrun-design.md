# FitPlay Shared Motion Core + Subway Runner Enhancement Design

Date: 2026-05-18
Status: Approved
Scope: Phase 1 (Shared Motion Architecture) + Phase 2 (Subway Runner Enhancement)

---

## Summary

Transform FitPlay from keyboard-first prototypes into a camera-first motion game platform. Build a shared `MotionCommand`-based input layer by refactoring the existing Subway Runner pose/voice hooks, then enhance the 3D Subway Runner scene with world themes, power-ups, and polish.

Approach: Bottom-Up — shared core first, then Subway Runner integration, then 3D scene enhancement.

Constraints:
- Subway Runner name stays unchanged in code and UI
- Only Subway Runner gets motion support in this phase; 5 prototype games remain keyboard-only
- Existing 19 tests must continue passing (relocated where needed)
- Keyboard remains debug fallback

---

## 1. Shared Motion Architecture

### 1.1 Directory Structure

```
src/shared/motion/
  motion-types.ts          # MotionCommand, MotionEvent, CameraStatus
  gesture-classifier.ts    # Pure: landmarks -> MotionCommand
  gesture-cooldowns.ts     # Per-command cooldown config
  use-motion-input.ts      # Hook: MediaPipe + camera -> MotionEvent stream
  camera-status.ts         # Pure: landmarks -> CameraStatus
  calibration-screen.tsx   # UI: calibration flow

src/shared/voice/
  voice-commands.ts        # VoiceCommand types + AZ/TR/EN command maps
  use-voice-commands.ts    # Hook: SpeechRecognition -> VoiceCommand

src/shared/render/
  particle-system.ts       # Reusable particle pool + burst/spawn helpers
  camera-shake.ts          # Reusable camera shake effect
  scene-lights.ts          # Standard Three.js lighting setup
```

### 1.2 Core Types

```ts
type MotionCommand =
  | "stepLeft" | "stepRight"
  | "leanLeft" | "leanRight"
  | "jump" | "squat" | "slide"
  | "reachLeft" | "reachRight"
  | "bothHandsUp"
  | "punchLeft" | "punchRight"
  | "block" | "clap";
```

Extensible for future games (hula hoop hip detection, kick detection, etc.).

```ts
type MotionEvent = {
  command: MotionCommand;
  confidence: number;
  velocity?: number;
  heldMs?: number;
  at: number;
};
```

```ts
type CameraStatus = {
  ready: boolean;
  fullBodyVisible: boolean;
  missing: Array<"head" | "hands" | "hips" | "knees" | "feet">;
  distance: "tooClose" | "good" | "tooFar";
  fps: number;
};
```

### 1.3 Voice Commands

```ts
type VoiceCommand = "start" | "pause" | "resume" | "restart" | "backToGames" | "openCalibration";

const AZ_VOICE_COMMANDS: Record<VoiceCommand, string[]> = {
  start: ["basla", "oyuna basla", "start", "oyna"],
  pause: ["dayan", "pauza", "saxla", "pause"],
  resume: ["davam et", "devam et", "resume", "davam"],
  restart: ["yeniden", "tekrar", "restart"],
  backToGames: ["oyunlara qayit", "geri", "menyu"],
  openCalibration: ["kalibrasiya", "kalibre", "kamera ayarlari"],
};
```

### 1.4 Refactoring Strategy

The existing `pose-gesture.ts` (8.2KB, 12 tests) is the foundation:

1. `classifyPoseGesture()` currently returns `RunnerCommand` -> change to return `MotionCommand`
2. Extract pure classification logic into `gesture-classifier.ts`
3. `pose-gesture.ts` becomes a thin compatibility layer: `MotionCommand -> RunnerCommand` mapping
4. `shouldEmitPoseCommand()` generalizes into `gesture-cooldowns.ts` with per-command cooldown values from x.md
5. Side-step latch logic (same-direction lean prevention) moves to the generic cooldown system

### 1.5 `use-motion-input` Hook

```ts
type UseMotionInputOptions = {
  sensitivity: "fast" | "normal";
  bodyMode: "fullBody" | "laptop";
  commands: MotionCommand[];
  onMotionEvent: (e: MotionEvent) => void;
  onCameraStatus: (s: CameraStatus) => void;
};
```

Each game specifies only the commands it needs via the `commands` filter. Subway Runner uses:
`["stepLeft", "stepRight", "leanLeft", "leanRight", "jump", "squat", "slide", "reachLeft", "reachRight", "bothHandsUp"]`

The hook internally handles:
- MediaPipe Pose Landmarker loading (GPU delegate)
- Camera stream at sensitivity-appropriate resolution
- Calibration storage in ref
- Cooldown enforcement
- Side-step latch reset on neutral pose
- UI update throttling

### 1.6 Calibration Screen

- Red frame overlay when body parts missing: "Ayaqlarin kamerada gorunmur. Bir az geri cekil."
- Green frame + "Hazirdir!" when all required body parts visible
- Voice command "kalibrasiya" triggers recalibration

---

## 2. Subway Runner Integration

### 2.1 Input Adapter Layer

```
src/features/subway-runner/input/
  motion-map.ts              # MotionCommand -> RunnerCommand mapping
  use-runner-motion.ts       # Wrapper: use-motion-input configured for runner
  use-runner-voice.ts        # Wrapper: use-voice-commands configured for runner
  runner-input.ts            # Existing types (unchanged)
  use-keyboard-runner-input.ts  # Existing (unchanged, debug fallback)
  PoseCameraPanel.tsx        # Existing UI panel (updated to use new hooks)
```

**`motion-map.ts`**:

```ts
const RUNNER_MOTION_MAP: Partial<Record<MotionCommand, RunnerCommand>> = {
  stepLeft: "moveLeft",
  leanLeft: "moveLeft",
  stepRight: "moveRight",
  leanRight: "moveRight",
  jump: "jump",
  squat: "slide",
  slide: "slide",
};
```

Unmapped commands (reachLeft, reachRight, bothHandsUp) will be handled by new engine features (collecting bonus crates, activating power-ups).

### 2.2 Engine Changes

The existing `runner-engine.ts` stays structurally the same. New additions:

- **Power-up state**: `powerUp: "none" | "magnet" | "shield" | "boost"` with duration timer
- **Power-up commands**: `reachLeft`, `reachRight` collect bonus crates; `bothHandsUp` activates current power-up
- **Theme tracking**: `themeIndex: number` advances every 300m distance

These are additive changes; existing commands (moveLeft, moveRight, jump, slide, pause, resume, restart) and their behavior remain unchanged.

### 2.3 SubwayRunner.tsx Changes

- Replace `use-pose-runner-input` with `use-runner-motion`
- Replace `use-voice-runner-control` with `use-runner-voice`
- Pass new power-up and theme state to RunnerScene
- Keep keyboard input as debug fallback alongside motion input

---

## 3. 3D Scene Enhancement (RunnerScene.tsx)

### 3.1 Current State

The existing RunnerScene.tsx (15.5KB) already has:
- Shadow map, neon lane lines, star field
- Procedural moving buildings with glowing windows
- Humanoid player mesh
- Particle dust/trail, coin glow/pulse
- Obstacle edge glow, collision burst, camera shake
- Speed-reactive fog/neon intensity

### 3.2 New Additions

**World Themes** (`RunnerWorldTheme`):

| Theme | Road | Buildings | Fog Color | Accent |
|-------|------|-----------|-----------|--------|
| `bakuMetro` | Dark gray | Metro tiles, carpet patterns | `0x06111f` | `0x38bdf8` blue |
| `icherisheher` | Sandstone | Stone walls, arches | `0x1a0f05` | `0xd4a017` gold |
| `bulvar` | Boardwalk | Trees, lamps, sea | `0x0a1520` | `0x34d399` green |
| `neonNight` | Dark mirror | Neon signs, glass | `0x0a0015` | `0xf472b6` pink |

Theme transitions smoothly over 2 seconds when `themeIndex` changes (every ~300m).

**Power-Ups:**

- **Magnet** (10s): Coins auto-attract to player position with trail effect
- **Shield** (1 hit): Blue bubble around player; on hit, bubble bursts instead of game over
- **Boost** (5s): 2x speed, 2x score, motion blur effect

Power-up capsules are distinct glowing meshes on the road, collected by running over them.

**Polish:**

- Collision slow-motion: 0.25s timescale reduction before game over
- Lane change: ease-out animation (150ms) instead of instant teleport
- Bonus crate: glowing box on left/right edges, collected by `reachLeft`/`reachRight`

### 3.3 Shared Render Modules

Extract reusable patterns from current RunnerScene into `src/shared/render/`:

- `particle-system.ts`: `FxParticle` pool + `spawnBurst()` function (from x.md Section 4.3)
- `camera-shake.ts`: Configurable shake with decay
- `scene-lights.ts`: Standard ambient + directional + rim light setup (from x.md Section 4.2)

RunnerScene imports these instead of implementing them inline.

---

## 4. Testing Strategy

### 4.1 Preserved Tests

| File | Tests | Change |
|------|-------|--------|
| `runner-engine.test.ts` | 7 | None - engine API unchanged |
| `prototype-engine.test.ts` | 3 | None - prototype games untouched |

### 4.2 Relocated Tests

| Old | New | Tests |
|-----|-----|-------|
| `pose-gesture.test.ts` | `gesture-classifier.test.ts` | 12 (same scenarios, new import paths) |

### 4.3 New Tests

| File | Tests |
|------|-------|
| `gesture-cooldown.test.ts` | Cooldown enforcement per command, expiry, reset |
| `camera-status.test.ts` | Body part visibility, distance detection, TV vs laptop mode |
| `motion-map.test.ts` | MotionCommand -> RunnerCommand mapping correctness |

### 4.4 Verification

After all changes:
- `npm test` passes all tests (existing 19 + new)
- `npm run build` succeeds
- Dev server on `http://localhost:3001` responds 200
- Subway Runner playable with keyboard (debug) and camera (primary)
- Voice commands work: basla, pauza, devam et, yeniden, oyunlara qayit

---

## 5. File Change Map

### New Files

| File | Description |
|------|-------------|
| `src/shared/motion/motion-types.ts` | MotionCommand, MotionEvent, CameraStatus types |
| `src/shared/motion/gesture-classifier.ts` | Extracted from pose-gesture.ts |
| `src/shared/motion/gesture-cooldowns.ts` | Generic cooldown system |
| `src/shared/motion/use-motion-input.ts` | Extracted from use-pose-runner-input.ts |
| `src/shared/motion/camera-status.ts` | Body visibility calculations |
| `src/shared/motion/calibration-screen.tsx` | Calibration UI component |
| `src/shared/voice/voice-commands.ts` | VoiceCommand types + command maps |
| `src/shared/voice/use-voice-commands.ts` | Extracted from use-voice-runner-control.ts |
| `src/shared/render/particle-system.ts` | Reusable particle pool |
| `src/shared/render/camera-shake.ts` | Reusable shake effect |
| `src/shared/render/scene-lights.ts` | Standard lighting setup |
| `src/features/subway-runner/input/motion-map.ts` | MotionCommand -> RunnerCommand |
| `src/features/subway-runner/input/use-runner-motion.ts` | Wrapper hook |
| `src/features/subway-runner/input/use-runner-voice.ts` | Wrapper hook |

### Modified Files

| File | Change |
|------|--------|
| `src/features/subway-runner/SubwayRunner.tsx` | Use new hooks, pass power-up/theme state |
| `src/features/subway-runner/render/RunnerScene.tsx` | Themes, power-ups, shared render imports |
| `src/features/subway-runner/engine/runner-engine.ts` | Add power-up + theme state (additive) |
| `src/app/page.tsx` | Minor if needed |

### Deprecated Files

| File | Status |
|------|--------|
| `src/features/subway-runner/input/pose-gesture.ts` | Compatibility layer, thin wrapper around gesture-classifier |
| `src/features/subway-runner/input/use-pose-runner-input.ts` | Replaced by use-runner-motion + shared hook |
| `src/features/subway-runner/input/use-voice-runner-control.ts` | Replaced by use-runner-voice + shared hook |

Deprecated files are not deleted immediately. They become thin wrappers importing from shared modules. Full removal happens after all games migrate to the shared motion system in future phases.

---

## 6. Implementation Order

1. **Create shared motion types** (`motion-types.ts`)
2. **Extract gesture-classifier** from `pose-gesture.ts` + relocate tests
3. **Build gesture-cooldowns** from existing `shouldEmitPoseCommand`
4. **Build camera-status** from existing `createCalibrationFromLandmarks`
5. **Build use-motion-input** from `use-pose-runner-input.ts`
6. **Build shared voice** (`voice-commands.ts` + `use-voice-commands.ts`)
7. **Build shared render** (`particle-system`, `camera-shake`, `scene-lights`)
8. **Create Subway Runner adapters** (`motion-map`, `use-runner-motion`, `use-runner-voice`)
9. **Update SubwayRunner.tsx** to use new hooks
10. **Enhance runner-engine.ts** with power-ups + themes
11. **Enhance RunnerScene.tsx** with themes, power-ups, polish
12. **Add new tests** for cooldown, camera-status, motion-map
13. **Verify**: `npm test`, `npm run build`, manual browser test

---

## 7. Out of Scope (Future Phases)

- Motion support for the 5 prototype games
- Multiplayer (Socket.io, WebRTC)
- Leaderboard, XP, coupon system
- Backend, auth, database
- New games (Hula Hoop, Jump Rope, Animal Mimic, etc.)
- Mobile companion app
- Game routing (Next.js router)
