# FitPlay Agent Notes

This file is the handoff document for future Codex/agent sessions. Read this first before changing code. It explains the current project state, why the structure exists, what has already been fixed, and what should come next.

## Project Location

- Main working folder: `C:\Users\Asus\OneDrive\Desktop\FitPlay`
- Local dev URL currently used: `http://localhost:3001`
- Package manager: `npm`
- Important: this project used to also exist under `C:\Users\Asus\Documents\Codex\2026-04-25\files-mentioned-by-the-user-fitplay`, but the user wants all real work inside Desktop `FitPlay`. Do not treat the Codex Documents folder as the source of truth.

## Current Goal

FitPlay is a TV-first fitness game platform. The current MVP is a local solo `Subway Runner` demo built with:

- `Next.js`
- `React`
- `TypeScript`
- `Three.js`
- `MediaPipe Pose Landmarker`
- Browser Speech Recognition for hands-free voice commands

The first game is intentionally local only. There is no auth, no database, no leaderboard, no Socket.io room pairing, and no real coupon/reward system yet.

## How To Run

Use the Desktop FitPlay folder:

```powershell
cd C:\Users\Asus\OneDrive\Desktop\FitPlay
npm install
npm run dev -- -p 3001
```

Verification commands:

```powershell
npm test
npm run build
```

Current expected verification:

- `npm test` should pass 19 tests.
- `npm run build` should complete successfully.
- `http://localhost:3001` should respond with status `200`.

If port `3001` is occupied, stop the process:

```powershell
$portPids = netstat -ano | Select-String ':3001' | ForEach-Object { ($_ -split '\s+')[-1] } | Sort-Object -Unique
foreach ($processId in $portPids) {
  if ($processId -match '^\d+$') {
    Stop-Process -Id ([int]$processId) -Force -ErrorAction SilentlyContinue
  }
}
```

Then restart:

```powershell
Start-Process -WindowStyle Hidden -FilePath 'npm.cmd' -ArgumentList 'run','dev','--','-p','3001' -WorkingDirectory 'C:\Users\Asus\OneDrive\Desktop\FitPlay' -RedirectStandardOutput 'C:\Users\Asus\OneDrive\Desktop\FitPlay\dev-server.log' -RedirectStandardError 'C:\Users\Asus\OneDrive\Desktop\FitPlay\dev-server.err.log'
```

## Repository Structure

```text
src/
  app/
    page.tsx
    layout.tsx
    globals.css
  components/
    game-select/
      GameSelect.tsx
      games.ts
  features/
    balloon-pop/
      BalloonPop.tsx
      engine/
        balloon-engine.ts
    boxing-pvp/
      BoxingPvP.tsx
      engine/
        boxing-engine.ts
    penalty/
      Penalty.tsx
      engine/
        penalty-engine.ts
    pilates-flow/
      PilatesFlow.tsx
      engine/
        pilates-engine.ts
    subway-runner/
      SubwayRunner.tsx
      engine/
        runner-engine.ts
        runner-engine.test.ts
      input/
        runner-input.ts
        use-keyboard-runner-input.ts
        pose-gesture.ts
        pose-gesture.test.ts
        use-pose-runner-input.ts
        use-voice-runner-control.ts
        PoseCameraPanel.tsx
      render/
        RunnerScene.tsx
    zumba-dance/
      ZumbaDance.tsx
      engine/
        zumba-engine.ts
  shared/
    components/
      GameHUD.tsx
      GameOverModal.tsx
      GameTopbar.tsx
      PrototypeGameShell.tsx
    game-engine/
      prototype-engine.ts
      prototype-engine.test.ts
    hooks/
      useGameLoop.ts
      useHighScore.ts
```

## Main Files

### `src/app/page.tsx`

Top-level app screen state:

- `select`: shows game selection.
- `runner`: shows Subway Runner.
- `zumba`, `boxing`, `balloon`, `penalty`, `pilates`: show playable first versions of the new games.

It passes `onBackToGames` into `SubwayRunner`, so voice command `oyunlara qayit` can return to the game selection screen.

### `src/components/game-select/*`

Game selection UI. All six games are active. Each card calls its own start callback. The game catalog includes emoji, category, difficulty, duration, players, tags, and active status.

### `src/shared/*`

Shared platform layer added after the first MVP:

- `GameTopbar`: consistent back navigation and title.
- `GameHUD`: reusable score/time/status HUD.
- `GameOverModal`: reusable result screen.
- `PrototypeGameShell`: playable TV-friendly game shell for the five non-runner games.
- `useGameLoop`: shared `requestAnimationFrame` loop.
- `useHighScore`: localStorage highscore helper.
- `prototype-engine.ts`: pure reusable engine for action/beat games.

The prototype engine is intentionally generic. Each new game provides its own `PrototypeGameDefinition` with title, theme, duration, lives, beat timing, metric label, high score key, and action list.

Current controls for prototype games:

- `Enter`: start/resume
- `P`: pause
- `R`: restart
- `Space`: hit the currently highlighted action
- `1-4`: hit a specific action pad

### New Game Feature Folders

Current state of the five new games:

- `zumba-dance`: beat/action dance prototype with combo scoring.
- `boxing-pvp`: strike/block combo prototype.
- `balloon-pop`: timed color balloon pop prototype.
- `penalty`: shot-zone timing prototype.
- `pilates-flow`: slower pose-hold/accuracy prototype.

These are playable first versions, not final MediaPipe-specific full games yet. Their engines define the game rhythm and scoring so future pose hooks can map body gestures directly to action ids.

### `src/features/subway-runner/SubwayRunner.tsx`

Main Subway Runner feature shell:

- Holds `RunnerState`.
- Dispatches `RunnerCommand`.
- Connects keyboard input.
- Connects pose camera input through `PoseCameraPanel`.
- Connects voice actions through `PoseCameraPanel`.
- Renders HUD, Three.js scene, camera panel, controls, and overlay.

Important behavior:

- `start` starts the game.
- `pause` pauses the game.
- `resume` continues from pause.
- `restart` resets.
- Overlay appears for `ready`, `paused`, and `gameOver`.

### `src/features/subway-runner/engine/runner-engine.ts`

Pure game logic. Keep it browser-independent and testable.

Current state:

- 3 lanes: `-1`, `0`, `1`
- statuses: `ready`, `running`, `paused`, `gameOver`
- movements: `running`, `jumping`, `sliding`
- commands: `start`, `moveLeft`, `moveRight`, `jump`, `slide`, `pause`, `resume`, `restart`

Important tuning:

- `JUMP_DURATION = 2`
- `SLIDE_DURATION = 0.56`
- Jump and slide commands do not reset their own timer while already active. This prevents the camera from making jump/slide feel stuck.
- `tickRunner` does not advance distance, score, speed, movement, or obstacles while `ready`, `paused`, or `gameOver`.

### `src/features/subway-runner/input/pose-gesture.ts`

Pure pose and voice parsing helpers. This file is intentionally heavily tested.

Pose:

- `createCalibrationFromLandmarks`
- `classifyPoseGesture`
- `shouldEmitPoseCommand`
- sensitivity config

Current camera modes:

- `fullBody`: TV mode. Requires head, shoulders, hips, knees, ankles.
- `laptop`: test mode. Allows upper body only for development.

Current sensitivity modes:

- `fast`: default. Lower thresholds and faster cooldown. Uses 320x240 video.
- `normal`: more stable, slower. Uses 640x480 video.

Important pose behavior:

- Jump requires hips and shoulders to move upward. Hip jitter alone must not trigger jump.
- Right/left leaning is latched. If user leans right and stays there, it should move one lane only. The body must return neutral before another same-side lane move is emitted.

Voice:

- Voice parser normalizes Azerbaijani/Turkish characters into simpler ASCII-like forms.
- It accepts multiple variants because browser speech recognition often hears words differently.

Current voice commands:

- `kamera ac`, `kamerani ac`, `camera`, `kamera` -> `camera`
- `basla`, `bashla`, `baslat`, `baslayir`, `basliyaq`, `start`, `oyna` -> `start`
- `pauza`, `pause`, `dayan`, `saxla` -> `pause`
- `davam et`, `devam et`, `resume`, `davam` -> `resume`
- `kalibrasiya`, `kalibre`, `calibrate` -> `calibrate`
- `yeniden`, `restart`, `tekrar` -> `restart`
- `oyunlara qayit`, `oyunlara kayit`, `menyu`, `geri` -> `backToGames`
- `subway runner`, `sabvey runner`, `subway`, `qacis oyunu`, `qacis` -> `selectSubway`
- `kamerani dayandir`, `kamera dayandir`, `kamerani saxla`, `camera stop`, `stop camera` -> `stop`

Ordering matters in `parseVoiceCommand`. For example, check `kamera dayandir` before generic `kamera`, otherwise camera stop may be misread as camera start.

### `src/features/subway-runner/input/use-pose-runner-input.ts`

Client hook that loads MediaPipe and camera stream.

Important details:

- Uses `@mediapipe/tasks-vision`.
- Uses Pose Landmarker lite model.
- Requests camera at settings from sensitivity config.
- Uses `delegate: "GPU"`.
- Stores calibration in a ref.
- Stores last pose command in refs.
- Clears the side-step latch when pose returns neutral.
- Updates UI less frequently than detection loop using `uiUpdateMs`.

### `src/features/subway-runner/input/use-voice-runner-control.ts`

Client hook for browser Speech Recognition and speech synthesis.

Important details:

- Uses `window.SpeechRecognition` or `window.webkitSpeechRecognition`.
- `recognition.lang = "tr-TR"` because Chromium tends to understand `basla/baslat/pauza` better than `az-AZ`.
- `maxAlternatives = 5`, then parses all alternatives and uses the first recognized command.
- Shows `lastTranscript` in the UI so we can see how the browser actually heard the user.
- Browser requires the user to click `Sesi ac` once to allow microphone access.

### `src/features/subway-runner/input/PoseCameraPanel.tsx`

Right-side camera and voice control panel:

- Camera preview.
- Pose status.
- FPS and AI latency.
- TV full-body / Laptop test toggle.
- Fast / Stabil sensitivity toggle.
- Camera buttons.
- Voice buttons.
- Last heard transcript.

### `src/features/subway-runner/render/RunnerScene.tsx`

Three.js scene and animation loop.

Keep this file responsible for rendering only. Avoid putting game rules here. Game rules belong in `runner-engine.ts`.

Current visual upgrades:

- shadow map enabled
- neon road lines and side lights
- star field
- procedural moving buildings with glowing windows
- humanoid player instead of plain capsule
- particle dust/trail
- coin glow/pulse
- obstacle edge glow
- collision particle burst and camera shake
- speed-reactive fog/neon intensity

## Important Product Decisions

### TV-first UX

This is mainly for TV or a large screen, not desktop mouse-first usage. The user may be 2-3 meters away from the screen and unable to press buttons after starting. Therefore:

- Voice commands are important.
- Camera commands are important.
- UI text should be readable from distance.
- The camera should support full-body mode for real TV play.
- Laptop mode is only for development/testing.

### Full Body Is Needed

The user explicitly said legs/feet will be needed for future games and for real jumps. Keep `fullBody` as the real default. Do not weaken TV mode to upper-body only. Use `laptop` only as a test fallback.

### Reaction Speed

Fast reaction matters because TV/browser/camera adds latency. Current fast mode uses:

- Smaller video size: 320x240
- Lower movement thresholds
- Shorter pose cooldown
- Less frequent UI updates

Do not increase cooldown blindly to fix false positives. Prefer gesture-specific latching or better classification so the game remains responsive.

## Bugs Already Fixed

### Jump stuck in air

Problem:

- User did not jump, but game seemed stuck in jump.
- Pose classifier emitted repeated `jump`, and engine reset the jump timer each time.

Fix:

- `JUMP_DURATION = 2`
- Engine ignores repeated `jump` while already jumping.
- Jump classifier requires both hip lift and shoulder lift.

### Right/left lean moves two lanes

Problem:

- User leaned right/left and the runner moved two lanes.
- Fast mode cooldown allowed repeated same direction while the body stayed leaned.

Fix:

- Same side-step command is not re-emitted while the same pose is held.
- When pose returns neutral, the latch resets and the next lean can move again.

### Voice did not understand `basla`

Problem:

- Browser speech recognition often hears `basla`, `baslat`, `bashla`, `başlayır`, etc.

Fix:

- Parser accepts multiple variants.
- Recognition language changed to `tr-TR`.
- Recognition checks up to 5 alternatives.
- UI shows `Son esitdiyim` for debugging.

### Desktop FitPlay folder lost source files

Problem:

- `C:\Users\Asus\OneDrive\Desktop\FitPlay` had `.git`, `.next`, logs, license, but missing `src` and `package.json`.
- A working older copy existed under the Codex Documents folder.

Fix:

- Restored source into Desktop `FitPlay`.
- Recreated missing camera/voice files.
- Installed dependencies with `npm`.
- Removed stale `pnpm-lock.yaml`.
- Set `outputFileTracingRoot` in `next.config.mjs` to avoid Next.js workspace-root warnings.

## Current Test Coverage

Engine tests:

- lane movement clamps left/right
- jump and slide expire
- repeated jump does not extend jump timer
- score increases while running
- pause/resume freezes and resumes runner
- collision sets game over
- restart resets state

Pose/voice tests:

- calibration works only with required landmarks
- TV mode requires lower body
- laptop mode allows upper-body fallback
- jump requires shoulders and hips
- hip jitter alone does not jump
- fast mode has lower thresholds
- slide classification
- left/right classification
- neutral classification
- cooldown behavior
- side-step latch behavior
- voice command variants

## Future Roadmap

### Near-term gameplay polish

1. Add on-screen voice command list that can collapse/expand.
2. Add pause overlay with clear commands: `davam et`, `oyunlara qayit`, `yeniden`.
3. Add calibration countdown: 3, 2, 1, ready.
4. Add better feedback when full body is not visible: which body part is missing.
5. Add more forgiving jump detection using short confirmation frames rather than raw threshold only.
6. Add optional gesture debug overlay: center line, lateral delta, hip delta, shoulder delta.
7. Tune obstacle speed and spacing for TV play.
8. Add coin collection effects and score feedback.
9. Add sound effects and background music with mute toggle.

### Voice control improvements

1. Add a central `voice-command-map.ts` so commands are easy to add without editing classifier logic.
2. Add more synonyms after testing real transcripts from `Son esitdiyim`.
3. Add command confidence/confirmation for dangerous actions like leaving a game.
4. Add language mode toggle: Azerbaijani/Turkish/English.
5. Add wake phrase later if always-listening behavior becomes too noisy.

### Game platform features

1. Add real game routing instead of simple `screen` state.
2. Add more games:
   - football keeper
   - boxing reflex
   - dance rhythm
   - squat challenge
   - balance game
3. Add shared input abstraction so all games use the same camera and voice layer.
4. Add user profiles later.
5. Add score history.
6. Add leaderboard.
7. Add coupons/rewards after the loop is fun.

### TV and multiplayer phase

1. Add QR pairing so phone can be a remote/controller.
2. Add Socket.io room pairing.
3. Add TV browser mode with bigger UI and no small controls.
4. Add mobile companion screen:
   - start game
   - select game
   - pause/resume
   - calibrate
   - show score
5. Add camera source selection if TV device has multiple cameras.

### Backend phase

Do not add backend until the local game loop feels good.

When ready:

1. Add database.
2. Add auth.
3. Add session storage.
4. Add leaderboard.
5. Add rewards/coupons.
6. Add admin dashboard.

## Engineering Guidelines

- Keep pure game logic in `engine/`.
- Keep pose and voice parsing pure where possible and test it.
- Keep MediaPipe/browser APIs inside hooks, not pure logic files.
- Do not put gameplay rules in Three.js render code.
- For every behavior change in engine or gesture parsing, update/add tests first.
- Prefer small targeted changes. Avoid broad rewrites unless needed.
- Use ASCII text in source where possible because PowerShell sometimes shows Azerbaijani characters as mojibake.
- Keep Azerbaijani UI simple and readable from a TV distance.
- Do not remove camera full-body requirements for TV mode.
- Do not increase input lag to hide false positives unless there is no better option.

## Current Known Limitations

- Browser Speech Recognition support depends on Chromium/browser and microphone permission.
- User must press `Sesi ac` once because browsers require user interaction before mic access.
- Browser speech recognition is not perfect for Azerbaijani; `tr-TR` is currently a pragmatic choice.
- MediaPipe model loads from remote URLs, so first camera start requires internet access.
- Camera performance depends on device GPU/CPU.
- Current app is local only and does not persist scores.

## Last Good State

Last verified state after restoration:

- Folder: `C:\Users\Asus\OneDrive\Desktop\FitPlay`
- `npm install` completed.
- `npm test` passed 19 tests.
- `npm run build` passed.
- Dev server started on `http://localhost:3001`.

If future work starts from this file, first run:

```powershell
cd C:\Users\Asus\OneDrive\Desktop\FitPlay
npm test
npm run build
npm run dev -- -p 3001
```

Then test manually in browser:

1. Open `http://localhost:3001`.
2. Start Subway Runner.
3. Click `Sesi ac`.
4. Try `basla`, `pauza`, `davam et`, `oyunlara qayit`.
5. Click `Kamerani ac`.
6. Use `Laptop test` for close laptop testing, `TV tam beden` for real play.
7. Calibrate while standing neutral.
8. Test left/right lean, jump, and slide.
