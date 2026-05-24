# FitPlay 3D Motion Games Upgrade Bible

Hazirlayan: Codex
Meqsed: FitPlay oyunlarini klaviatura/prototip hissinden cixarib kamera ile oynanan, TV ucun uygun, canli 3D fitness oyun platformasina cevirmek.
Qayda: Bu sened kod yazilanda esas istinad olacaq. Her oyun beden hereketi ile oynanmalidir; keyboard yalniz debug fallback-dir.

---

## 1. FitPlay.md-den Oxunan Esas Ideya

`fitplay (2).md` FitPlay-i "Hereketle Oyna, Saglam Qal" kimi tarif edir. Platformanin esas fikri:

- Kamera, telefon/planset/komputer ve TV ile evde interaktiv idman.
- MediaPipe ile beden tanima.
- Three.js ile 3D oyun dunyalari.
- Subway Runner, Zumba, Hula Hoop, Jump Rope, Pilates, Balloon Pop, Boxing, Football Penalty, Sumo, Reflex Target ve usaq oyunlari.
- Sonraki merhelelerde multiplayer, leaderboard, kupon, online PvP, WebRTC/Socket.io.

Problem:

- Hazirki oyunlar real camera-first oyun kimi hiss etmemelidirse, FitPlay-in ruhu itir.
- "1, 2, 3, 4 bas" tipli oyunlar meqsedimize ziddir.
- FitPlay-in uduzmayacagi yer budur: insan ekrana baxib oturmur, bedenini isledir.

Bu senedin istiqameti:

- Her oyunu 3D, arcade, effektli, hereketli ve TV-den celd anlasilan hala getirmek.
- Subway Runner-i "Subway Surfers kimi canli hiss" seviyyesine yaxinlasdirmaq, amma orijinal FitPlay/Baku/fitness kimliyi ile.
- Diger oyunlari da eyni keyfiyyet barina qaldirmaq.

---

## 2. Research: Hansi Oyunlardan Ders Goturmek Lazimdir

Bu platforma ucun arasdirilan real oyun kateqoriyalari:

### 2.1 Nex Playground

Link: https://support.nexplayground.com/en/articles/13139469-how-does-it-track-my-movements

Dersler:

- Kamera ile beden node-lari real-time track edilir.
- 4 player-a qeder aile oyunlari ucun motion tracking fikri dogrudur.
- Controller olmadan oynamaq FitPlay-in esas ustunluyu ola biler.
- Oyunlar qisa, ailevi, tez baslanan ve cox aydin olmalidir.

FitPlay-e tetbiq:

- TV qarsisinda 1-4 player hedefi saxlanilsin.
- Motion input core butun oyunlar ucun shared olsun.
- Her oyunda "tam beden gorunurmu?" statusu UI-da gosterilsin.

### 2.2 Just Dance Camera Controller

Link: https://www.ubisoft.com/en-us/game/just-dance/2026/news-updates/2UBGhF4xWMLAVVFMmTCWwn/revolutionising-motion-gaming-the-camera-controller-feature

Dersler:

- Full-body score daha motivasiyaedicidir.
- User oz bedeninin hansi hissesi sehv etdiyini gormelidir.
- Reng, ritm, combo ve aninda feedback Dance oyunlari ucun vacibdir.

FitPlay-e tetbiq:

- Zumba/Dance Quest oyununda skeleton similarity score olmalidir.
- Coach avatar user-e once hereketi gosterir.
- Duzgun hereketde floor yanir, confetti cixir, combo artir.

### 2.3 Ring Fit Adventure

Link: https://www.nintendo.com/store/products/ring-fit-adventure-switch/

Dersler:

- Real exercise in-game action-a cevrilende insanlar daha uzun oynayir.
- Fitness hereketleri hekayeye, level-e, enemy-e ve reward-a baglanmalidir.
- Difficulty user-in seviyyesine gore ayarlanmalidir.

FitPlay-e tetbiq:

- Squat sadece squat deyil: "qapi acmaq", "tunelden kecmek", "enemy attack-dan qacmaq".
- Jump sadece jump deyil: "enerji kristalini tutmaq".
- Pilates poza sadece idman deyil: "bagdaki isigi aktivlesdirmek".

### 2.4 Nintendo Switch Sports

Link: https://www.nintendo.com/au/support/articles/nintendo-switch-sports-faq/

Dersler:

- Sport oyunlari bir hareket = aydin netice mentiqi ile daha rahat oynanir.
- Aile ucun qaydalar sade, animasiya ve feedback guclu olmalidir.

FitPlay-e tetbiq:

- Football Penalty, Bowling, Tennis, Reflex kimi mini oyunlar bir stadion hub-inda ola biler.
- Her hereketin ekranda boyuk ve oxunaqli neticesi: GOAL, SAVE, PERFECT, LATE.

### 2.5 FitXR ve LES MILLS BODYCOMBAT

Links:

- https://fitxr.com/landing-page/
- https://www.lesmills.com/workouts/bodycombat-xr/

Dersler:

- Boxing, HIIT, Dance ve Combat oyunlari kalori yandirmaq ucun en uygun formalardandir.
- Sound, beat, instructor energy ve scoring workout-u oyuna cevirir.
- Punch, dodge, squat, block kimi hereketler FitPlay ucun cox uygundur.

FitPlay-e tetbiq:

- Boxing Arena sadece yumruq yox, dodge + block + combo + raund tempidir.
- Enerji ve effektler user-in beden ritmini saxlamalidir.

### 2.6 Exergame Research

Links:

- https://www.mdpi.com/1660-4601/17/12/4243
- https://pmc.ncbi.nlm.nih.gov/articles/PMC10230359/
- https://pmc.ncbi.nlm.nih.gov/articles/PMC12666624/

Dersler:

- Active video games passiv oyunlardan ferqli olaraq beden hereketi teleb edir.
- Uygun dizayn edilende fiziki aktivliyi artira biler.
- Motivasiya ucun feedback, goal, reward, progress ve social comparison lazimdir.

FitPlay-e tetbiq:

- Her oyun score + streak + XP + short goal vermelidir.
- User "men idman etdim" hissini deyil, "men oyun oynadim, amma hereket etdim" hissini almalidir.

---

## 3. Visual Quality Bar: "Subway Surfers Qeder Canli" Nedir?

Burada meqsed Subway Surfers-i kopyalamaq deyil. Meqsed onun polish seviyyesinden ders goturmekdir.

FitPlay 3D oyunlari bu hissleri vermelidir:

- Doygun reng palitrasi: qirmizi, mavi, yasil, sari accentler.
- Daim hereket eden fon: binalar, isiq xetleri, reklam panolari, partikller.
- Xarakter canli olmalidir: bas, beden, qollar, ayaqlar, idle/run/jump/slide animasiya.
- Collision, collect, combo, perfect hereketleri effekt vermelidir.
- Kamera statik olmamalidir: yavas follow, speed hissi, impact zamani shake.
- Yol/arena bos olmamalidir: foreground, midground, background layers.
- UI oyun sahesini bogmamalidir, amma TV-den rahat oxunmalidir.

Subway Surfers-den goturulecek dizayn dersleri:

- 3-lane runner oxunaqli mexanikadir.
- Obstacles formaca bir-birinden secilmelidir.
- Coin/power-up trayektoriyasi player-i hereket etdirmelidir.
- World theme tez-tez deyisdikce oyun monoton olmur.
- Character ve environment cartoon-stylized olsa, performans ve cazibe balansli olur.

FitPlay-in orijinal kimliyi:

- Baku Metro, Icherisheher, Bulvar, Gobustan, Qafqaz daglari, Xazar sahili.
- Azerbaycan rengleri accent kimi: blue, red, green.
- Sport/fitness dili: enerji, nefes, ritm, aile yarisi.

---

## 4. Global 3D Art Direction

### 4.1 Rendering

Butun Three.js oyunlarinda bu baseline olmalidir:

```ts
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;
```

### 4.2 Scene Lighting

Her oyunda minimum:

```ts
scene.fog = new THREE.Fog(0x06111f, 18, 90);

const ambient = new THREE.AmbientLight(0xbad7ff, 0.55);
scene.add(ambient);

const key = new THREE.DirectionalLight(0xffffff, 1.4);
key.position.set(-5, 10, -6);
key.castShadow = true;
scene.add(key);

const rim = new THREE.PointLight(0x38bdf8, 1.2, 24);
rim.position.set(0, 3, 5);
scene.add(rim);
```

### 4.3 Particle System

Her oyunda reusable particle sistemi olmalidir:

```ts
export type FxParticle = {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  life: number;
  maxLife: number;
  size: number;
  color: THREE.Color;
};

export function spawnBurst(
  pool: FxParticle[],
  origin: THREE.Vector3,
  color: THREE.ColorRepresentation,
  count: number,
  power = 1
) {
  for (let i = 0; i < count; i += 1) {
    const p = pool[i % pool.length];
    p.position.copy(origin);
    p.velocity.set(
      (Math.random() - 0.5) * power,
      Math.random() * power,
      (Math.random() - 0.5) * power
    );
    p.life = p.maxLife = 0.45 + Math.random() * 0.55;
    p.color.set(color);
  }
}
```

### 4.4 Visual Feedback Rules

Her hereket ekranda cavab vermelidir:

- Perfect gesture: green/gold pulse.
- Good gesture: blue pulse.
- Late/miss: red shake.
- Combo: UI scale pop + trail effect.
- Power-up: screen edge glow.
- Game over: slow motion + impact burst.

---

## 5. Shared Motion Architecture

FitPlay-in en vacib texniki hissesi budur: oyunlar keyboard event yox, motion event almalidir.

### 5.1 Motion Event Type

```ts
export type MotionCommand =
  | "stepLeft"
  | "stepRight"
  | "leanLeft"
  | "leanRight"
  | "jump"
  | "squat"
  | "slide"
  | "punchLeft"
  | "punchRight"
  | "hookLeft"
  | "hookRight"
  | "kickLeft"
  | "kickRight"
  | "reachLeft"
  | "reachRight"
  | "bothHandsUp"
  | "block"
  | "balanceHold"
  | "clap";

export type MotionEvent = {
  command: MotionCommand;
  confidence: number;
  velocity?: number;
  heldMs?: number;
  at: number;
};
```

### 5.2 Game Input Contract

```ts
export type GameInputProvider = {
  subscribe: (listener: (event: MotionEvent) => void) => () => void;
  getCameraStatus: () => CameraStatus;
};

export type CameraStatus = {
  ready: boolean;
  fullBodyVisible: boolean;
  missing: Array<"head" | "hands" | "hips" | "knees" | "feet">;
  distance: "tooClose" | "good" | "tooFar";
  fps: number;
};
```

### 5.3 Gesture Cooldown

Iki defe lane deyisme, jump-in basili qalmasi ve gec reaksiya problemleri bununla hell olunur:

```ts
const COOLDOWNS: Record<MotionCommand, number> = {
  stepLeft: 380,
  stepRight: 380,
  leanLeft: 420,
  leanRight: 420,
  jump: 900,
  squat: 700,
  slide: 700,
  punchLeft: 280,
  punchRight: 280,
  hookLeft: 420,
  hookRight: 420,
  kickLeft: 850,
  kickRight: 850,
  reachLeft: 180,
  reachRight: 180,
  bothHandsUp: 900,
  block: 250,
  balanceHold: 1000,
  clap: 500
};
```

### 5.4 Voice Commands

```ts
export type VoiceCommand =
  | "start"
  | "pause"
  | "resume"
  | "restart"
  | "backToGames"
  | "nextGame"
  | "openCalibration";

export const AZ_VOICE_COMMANDS: Record<VoiceCommand, string[]> = {
  start: ["basla", "oyuna basla", "start"],
  pause: ["dayan", "pauza", "saxla"],
  resume: ["davam et", "devam et"],
  restart: ["yeniden baslat", "tekrar basla"],
  backToGames: ["oyunlara qayit", "geri qayit"],
  nextGame: ["novbeti oyun", "basqa oyun"],
  openCalibration: ["kamera ayarlari", "kamerani yoxla"]
};
```

---

## 6. Game 1: FitRun Adventure

Kohne ad: Subway Runner.
Yeni direction: Subway Surfers kimi canli endless runner, amma FitPlay-in orijinal Baku/fitness dunyasi ile.

### 6.1 Fantasy

User Baku metrosundan, Icherisheher tunellerinden, Bulvar yollarindan ve neon seherden qacir. Oyun user-i evde kardio etdirir: step, jump, squat, lean, reach.

### 6.2 Motion Controls

- `stepLeft` veya `leanLeft`: sol lane.
- `stepRight` veya `leanRight`: sag lane.
- `jump`: ust maneeni as.
- `squat`/`slide`: asagi kecidden kec.
- `reachLeft`/`reachRight`: yan bonuslari topla.
- `bothHandsUp`: power-up aktivlesdir.

### 6.3 3D Scene

Must-have:

- 3 lane road.
- Moving road chunks.
- Procedural buildings left/right.
- Metro tunnel arches.
- Neon lane lines.
- Animated coin arcs.
- Power-up capsules.
- Character with body parts.
- Dust trail on run.
- Jump burst.
- Slide sparks.
- Collision explosion.
- Camera shake.
- Dynamic fog by speed.

### 6.4 Runner Scene Code Skeleton

```ts
type RunnerWorldTheme = "bakuMetro" | "icherisheher" | "bulvar" | "neonNight";

type RunnerVisualState = {
  theme: RunnerWorldTheme;
  speed: number;
  combo: number;
  powerUp: "none" | "magnet" | "shield" | "boost";
  lastImpactAt: number | null;
};

function createRoadChunk(z: number) {
  const group = new THREE.Group();
  const road = new THREE.Mesh(
    new THREE.BoxGeometry(9, 0.18, 36),
    new THREE.MeshStandardMaterial({
      color: 0x111827,
      roughness: 0.55,
      metalness: 0.18
    })
  );
  road.receiveShadow = true;
  road.position.z = z;
  group.add(road);

  for (const x of [-3, 0, 3]) {
    const strip = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, 0.04, 32),
      new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        emissive: 0x38bdf8,
        emissiveIntensity: 0.65
      })
    );
    strip.position.set(x, 0.08, z);
    group.add(strip);
  }

  return group;
}
```

### 6.5 Obstacle Design

Obstacle-lar oxunaqli olmalidir:

- TallBarrier: jump ile asilir.
- LowGate: squat/slide ile kecilir.
- SideBlockLeft/Right: lane deyisme teleb edir.
- MovingTrain: daha iri, daha gec gelmelidir.
- BonusCrate: reachLeft/reachRight ile acilir.

```ts
export type RunnerObstacleKind =
  | "tallBarrier"
  | "lowGate"
  | "sideBlock"
  | "movingTrain"
  | "coin"
  | "powerUp";

export type RunnerObstacle = {
  id: string;
  kind: RunnerObstacleKind;
  lane: -1 | 0 | 1;
  z: number;
  requires?: MotionCommand;
  collected?: boolean;
};
```

### 6.6 Polish Checklist

- Coins rotate and pulse.
- Lane changes have ease-out animation, instant teleport yox.
- Character jump arc 2 saniye yox, gameplay ucun 650-900ms; amma user-in istediyi "tullanmada basili qalmasin" problemi ucun visual landing guaranteed olmalidir.
- Collision slow motion 0.25s.
- Shield hit zamani game over yox, shield burst.
- Every 300m theme color changes slightly.

---

## 7. Game 2: Dance Quest

Kohne ad: Zumba Dance.
Yeni direction: Just Dance + Zumba + FitPlay family party.

### 7.1 Fantasy

User neon dance stage-de coach avatar-in hereketlerini tekrar edir. Ekranda notlar yox, beden pozalari ve beat dalgalari var.

### 7.2 Motion Controls

- leftArmUp
- rightArmUp
- bothHandsUp
- sideStepLeft
- sideStepRight
- squatPulse
- clap
- jumpBeat

### 7.3 3D Scene

- 5x5 glowing dance floor.
- Center coach silhouette.
- Player ghost outline.
- Beat rings from center outward.
- Spotlights circular motion.
- Confetti burst on perfect.
- Combo fire trail.

### 7.4 Engine Code Skeleton

```ts
export type DanceMove =
  | "leftArmUp"
  | "rightArmUp"
  | "bothHandsUp"
  | "stepLeft"
  | "stepRight"
  | "squat"
  | "clap"
  | "jump";

export type DanceBeat = {
  atMs: number;
  move: DanceMove;
  windowMs: number;
};

export type DanceState = {
  score: number;
  combo: number;
  accuracy: number;
  currentBeatIndex: number;
  lives: number;
  status: "ready" | "running" | "paused" | "complete";
};

export function judgeDanceMove(
  beat: DanceBeat,
  event: MotionEvent,
  nowMs: number
) {
  const timingDelta = Math.abs(nowMs - beat.atMs);
  const timingScore = Math.max(0, 1 - timingDelta / beat.windowMs);
  const moveScore = event.command === beat.move ? 1 : 0;
  return timingScore * moveScore * event.confidence;
}
```

### 7.5 Visual Quality

- Beat ring ekrana dogru gelir, user vaxti gore bilir.
- Coach next move-u 1 beat evvel gosterir.
- Perfect zamani floor tile-lar gold olur.
- Miss zamani sadece qirmizi error yox, "bir daha" gentle feedback.

---

## 8. Game 3: Boxing Arena

### 8.1 Fantasy

User neon ring-de AI opponent ile idman edir. Bu PvP yoxdursa bele, AI coach/opponent HIIT tempini saxlayir.

### 8.2 Motion Controls

- punchLeft
- punchRight
- hookLeft
- hookRight
- block
- dodgeLeft
- dodgeRight
- squatDodge

### 8.3 3D Scene

- Boxing ring platform.
- Rope-lar CylinderGeometry.
- Opponent humanoid mesh.
- Impact sparks.
- Crowd silhouettes.
- Round timer center top.
- HP/stamina bars.
- Fury mode red edge glow.

### 8.4 Engine Code Skeleton

```ts
export type Strike = "jab" | "cross" | "hook" | "uppercut";

export type BoxingState = {
  playerHp: number;
  opponentHp: number;
  stamina: number;
  combo: number;
  round: number;
  roundTimeLeft: number;
  furyMs: number;
  status: "ready" | "fighting" | "paused" | "knockout";
};

export function applyPlayerStrike(state: BoxingState, strike: Strike) {
  const baseDamage = {
    jab: 8,
    cross: 12,
    hook: 16,
    uppercut: 20
  }[strike];

  const furyMultiplier = state.furyMs > 0 ? 1.5 : 1;
  return {
    ...state,
    opponentHp: Math.max(0, state.opponentHp - baseDamage * furyMultiplier),
    combo: state.combo + 1,
    stamina: Math.max(0, state.stamina - 5)
  };
}
```

### 8.5 Game Feel

- Punch hit zamani 80-120ms freeze frame.
- Opponent geri cekilir.
- User block edende blue shield flash.
- Dodge duzgun zamanda edilende "DODGE + COMBO".

---

## 9. Game 4: Sports Stadium

Kohne adlar: Football Penalty, Reflex Target, future sports.

### 9.1 Fantasy

FitPlay Stadium bir hub-dur. Burada penalty, goalkeeper, bowling, tennis reflex kimi oyunlar acilir.

### 9.2 First MVP: Football Penalty

Motion:

- kickLeft/kickRight: topa vur.
- leanLeft/leanRight: istiqamet sec.
- bothHandsUp/block: qapici modu.
- sideStep: qapici tullanmagi.

3D:

- Stadium lights.
- Goal net as LineSegments.
- Ball spin.
- Goalkeeper humanoid.
- Crowd colored cards.
- Goal confetti.

Code skeleton:

```ts
export type ShotZone =
  | "leftLow"
  | "leftHigh"
  | "center"
  | "rightLow"
  | "rightHigh";

export type PenaltyState = {
  phase: "aim" | "shooting" | "result" | "complete";
  shotsTaken: number;
  goals: number;
  selectedZone: ShotZone;
  keeperZone: ShotZone;
  lastResult: "goal" | "save" | "miss" | null;
};

export function resolvePenalty(shot: ShotZone, keeper: ShotZone) {
  if (shot === keeper) return "save";
  return Math.random() < 0.12 ? "miss" : "goal";
}
```

### 9.3 Later Sports

- Bowling: arm swing velocity controls ball.
- Tennis Reflex: reach left/right hit target.
- Goalkeeper Rush: qapidan gelen toplari save et.
- Basketball Arc: both hands push controls throw.

---

## 10. Game 5: Balloon Party 3D

### 10.1 Fantasy

Usaqlar ve aile ucun rengli 3D arena. Balonlar, ulduzlar, bonuslar havada gelir. User elleri ile toxunur.

### 10.2 Motion Controls

- reachLeft
- reachRight
- clap for bomb balloon cancel
- squat for low tunnel
- jump for high star

### 10.3 3D Scene

- Pastel sky gradient.
- Floating balloons.
- Balloon strings.
- Clouds.
- Confetti particle burst.
- Floating "+25".
- Soft bounce animation.

### 10.4 Engine Code Skeleton

```ts
export type BalloonKind = "red" | "yellow" | "blue" | "gold" | "bomb";

export type Balloon = {
  id: string;
  kind: BalloonKind;
  x: number;
  y: number;
  z: number;
  speed: number;
  wobbleSeed: number;
  points: number;
};

export function tickBalloon(balloon: Balloon, delta: number, elapsed: number) {
  return {
    ...balloon,
    y: balloon.y + balloon.speed * delta,
    x: balloon.x + Math.sin(elapsed * 2 + balloon.wobbleSeed) * 0.004
  };
}
```

### 10.5 Design Notes

- Usaq oyunu oldugu ucun fail harsh olmamalidir.
- Bomb balloon sadece combo reset ede biler, can azaltmaq gerek deyil.
- Her pop-da ses, confetti, xal yazisi olmalidir.

---

## 11. Game 6: Balance Garden

Kohne ad: Pilates Flow.

### 11.1 Fantasy

Sakit 3D bag. User pozalari saxlayir, bag canlanir. Duzgun poza saxlandiqca cicekler acilir, isiq dalgalari yayilir.

### 11.2 Motion Controls

- balanceHold
- bothHandsUp
- squatHold
- lungeLeft/lungeRight
- sideStretch
- breathing rhythm

### 11.3 3D Scene

- Soft green floor.
- Trees and petals.
- Transparent ideal skeleton.
- Player skeleton overlay.
- Accuracy ring.
- Breathing circle.

### 11.4 Engine Code Skeleton

```ts
export type PoseName =
  | "mountain"
  | "warrior"
  | "tree"
  | "squatHold"
  | "sideStretch";

export type PilatesState = {
  pose: PoseName;
  accuracy: number;
  holdMs: number;
  requiredHoldMs: number;
  score: number;
  status: "ready" | "holding" | "rest" | "complete";
};

export function tickPilates(state: PilatesState, deltaMs: number) {
  const holding = state.accuracy >= 0.72;
  return {
    ...state,
    holdMs: holding ? state.holdMs + deltaMs : Math.max(0, state.holdMs - deltaMs * 0.5),
    score: holding ? state.score + Math.floor(deltaMs / 100) : state.score
  };
}
```

### 11.5 UX

- Burada arcade qirmizi error yox, sakit correction olmalidir.
- "Sol qolunu biraz yuxari qaldir" kimi guidance lazimdir.
- TV-den aydin gorsenmelidir.

---

## 12. Game 7: Reflex Reactor

### 12.1 Fantasy

Futuristic arena. Isiq target-lar yanir, user bedenle tez reaksiya verir. Bu qisa aile yarisi ucun idealdir.

### 12.2 Motion Controls

- reachLeft/right
- stepLeft/right
- squat
- jump
- clap

### 12.3 3D Scene

- Circular arena.
- Neon target panels.
- Speed lines.
- Timer pressure.
- Streak flame.

### 12.4 Engine Code Skeleton

```ts
export type ReflexTarget = {
  id: string;
  command: MotionCommand;
  expiresAt: number;
  position: [number, number, number];
  points: number;
};

export function scoreReflexTarget(target: ReflexTarget, event: MotionEvent, now: number) {
  if (event.command !== target.command) return 0;
  const timeLeft = Math.max(0, target.expiresAt - now);
  return Math.round(target.points * event.confidence * (1 + timeLeft / 1000));
}
```

---

## 13. Game 8: Hula Hoop

### 13.1 Fantasy

User bel hereketi ile virtual hula hoop-u saxlayir. Etrafinda neon circle donur, ritm artir.

### 13.2 Motion Controls

- hip circle detection.
- left/right hip sway.
- rhythm consistency.
- arms up bonus.

### 13.3 3D Scene

- Character waist around glowing hoop.
- Stage with circular lights.
- Hoop color changes by combo.
- Miss zamani hoop asagi dusur, amma user onu qaytara bilir.

### 13.4 Engine Code Skeleton

```ts
export type HulaState = {
  rhythm: number;
  combo: number;
  hoopHeight: number;
  score: number;
  status: "ready" | "spinning" | "recovering" | "complete";
};

export function tickHula(state: HulaState, hipRhythmScore: number, delta: number) {
  const stable = hipRhythmScore > 0.62;
  return {
    ...state,
    rhythm: hipRhythmScore,
    combo: stable ? state.combo + 1 : Math.max(0, state.combo - 1),
    hoopHeight: Math.max(0, Math.min(1, state.hoopHeight + (stable ? delta : -delta))),
    score: stable ? state.score + Math.round(10 * hipRhythmScore) : state.score
  };
}
```

---

## 14. Game 9: Jump Rope

### 14.1 Fantasy

Virtual ip user-in etrafinda donur. User vaxtinda tullanir. Background ritm ve music ile guclenir.

### 14.2 Motion Controls

- jump timing.
- knee lift.
- optional arm rotation.

### 14.3 3D Scene

- Rope arc as animated curve.
- Character shadow.
- Floor impact ring.
- Combo sparks.
- Speed increases gradually.

### 14.4 Engine Code Skeleton

```ts
export type RopeState = {
  ropeAngle: number;
  speed: number;
  combo: number;
  misses: number;
  score: number;
};

export function tickRope(state: RopeState, delta: number) {
  return {
    ...state,
    ropeAngle: (state.ropeAngle + state.speed * delta) % (Math.PI * 2),
    speed: Math.min(8.5, state.speed + delta * 0.03)
  };
}
```

---

## 15. Game 10: Animal Mimic

Kohne ad: Heyvan Yamsilama.

### 15.1 Fantasy

Usaqlar heyvan hereketlerini edir: qurbaga kimi tullan, qus kimi qol cirp, ayi kimi yeri, dovsan kimi jump.

### 15.2 3D Scene

- Cartoon forest.
- Friendly animal coach.
- Big movement cards.
- Reward stickers.

### 15.3 Motion

- frogJump: squat + jump.
- birdFlap: both arms flap.
- bearWalk: alternating arms.
- rabbitHop: small repeated jumps.

Bu oyun usaq ucun fitness-i "mesq" kimi yox, rol oyunu kimi gosterecek.

---

## 16. Code Architecture Proposal

### 16.1 Directory Structure

```txt
src/
  shared/
    motion/
      motion-types.ts
      use-motion-input.ts
      gesture-classifier.ts
      gesture-cooldowns.ts
      camera-status.ts
    voice/
      voice-commands.ts
      use-voice-commands.ts
    render/
      particle-system.ts
      scene-lights.ts
      camera-shake.ts
      neon-materials.ts
    components/
      CalibrationScreen.tsx
      PoseOverlay.tsx
      GameHUD.tsx
      GameOverPanel.tsx
  features/
    fitrun-adventure/
    dance-quest/
    boxing-arena/
    sports-stadium/
    balloon-party/
    balance-garden/
    reflex-reactor/
    hula-hoop/
    jump-rope/
    animal-mimic/
```

### 16.2 Game Definition Contract

```ts
export type FitPlayGameId =
  | "fitrun-adventure"
  | "dance-quest"
  | "boxing-arena"
  | "sports-stadium"
  | "balloon-party"
  | "balance-garden"
  | "reflex-reactor"
  | "hula-hoop"
  | "jump-rope"
  | "animal-mimic";

export type FitPlayGameDefinition = {
  id: FitPlayGameId;
  title: string;
  audience: Array<"family" | "kids" | "women" | "men" | "fitness">;
  intensity: "low" | "medium" | "high";
  sessionLength: "30s" | "60s" | "3min" | "5min" | "10min";
  requiredBodyParts: Array<"head" | "hands" | "hips" | "knees" | "feet">;
  primaryCommands: MotionCommand[];
  component: React.ComponentType<{ onBackToGames: () => void }>;
};
```

### 16.3 Engine Rule

Her oyunda:

- `engine/*.ts`: pure logic.
- `render/*.tsx`: Three.js.
- `input/*.ts`: motion mapping.
- `*.test.ts`: engine and gesture tests.

Render hec vaxt gesture hesablama etmemelidir. Gesture core event gonderir, engine state update edir, render state-i gosterir.

---

## 17. Performance Rules

TV/Browser ucun performans vacibdir:

- 60 FPS hedef, minimum 30 FPS fallback.
- Mesh-lar reuse edilmelidir, her frame new geometry yaradilmamalidir.
- Particle pool istifade edilmelidir.
- Shadows yalniz esas obyektlerde.
- Pixel ratio max 2.
- Mobile browser ucun low/medium/high quality toggle.

Quality config:

```ts
export type VisualQuality = "low" | "medium" | "high";

export const QUALITY_PRESETS = {
  low: {
    shadows: false,
    particles: 80,
    backgroundActors: 6,
    pixelRatio: 1
  },
  medium: {
    shadows: true,
    particles: 180,
    backgroundActors: 14,
    pixelRatio: 1.5
  },
  high: {
    shadows: true,
    particles: 360,
    backgroundActors: 28,
    pixelRatio: 2
  }
} as const;
```

---

## 18. TV UX Rules

FitPlay TV ucun hazirlanirsa:

- Font iri olmalidir.
- Button-lar uzaqdan oxunmalidir.
- Kamera statusu daima gorunmelidir.
- "Basla" duymesine uzaqdan basa bilmeyen user sesle baslatmalidir.
- Error mesajlari texniki yox, insani olmalidir.

Bad:

- "Pose detection failed"

Good:

- "Ayaqlarin kamerada gorunmur. Bir az geri cekil."

Bad:

- "Low confidence"

Good:

- "Isiq biraz zeifdir. Uzunu kameraya cevir."

---

## 19. Implementation Priority

### Phase 1: Foundation

- `MotionInputCore`
- `CalibrationScreen`
- `VoiceCommands`
- `PoseOverlay`
- `GameHUD`
- `ParticleSystem`
- `CameraShake`

### Phase 2: First Real Flagship

FitRun Adventure tam professional edilmeli:

- Canli 3D world.
- Full body motion control.
- Power-up.
- Collision.
- Highscore.
- TV UI.
- Voice start/restart/back.

### Phase 3: Family/Kids Game

Balloon Party 3D:

- Hand reach detection.
- Bright 3D visuals.
- Confetti.
- 60s family challenge.

### Phase 4: Fitness Game

Dance Quest veya Boxing Arena:

- Beat/combo.
- Coach/opponent.
- High movement intensity.

### Phase 5: Full Catalog

- Balance Garden.
- Sports Stadium.
- Reflex Reactor.
- Hula Hoop.
- Jump Rope.
- Animal Mimic.

---

## 20. Acceptance Criteria

FitPlay upgrade ugurlu sayilirsa:

- User klaviatura olmadan oyuna baslaya bilir.
- Kamera user-in tam bedenini tanimaq ucun rehberlik verir.
- En azi bir oyun Subway Surfers kimi canli, hereketli, effektli runner hissi verir.
- En azi bir usaq/aile oyunu rengli, sade ve cox interaktivdir.
- Her gesture ekranda aninda visual feedback verir.
- Oyunlar real fiziki hereket teleb edir.
- Keyboard yalniz debug fallback-dir.
- `npm run build` kecir.
- Three.js canvas nonblank render edir.
- TV-den 2-4 metr mesafede UI oxunur.

---

## 21. Next Coding Prompt

Bu senedden sonra implementasiya ucun ilk prompt:

```txt
FitPlay kod bazasinda keyboard-first prototip oyunlari camera-first motion game architecture-a cevir.
Evvel shared MotionInputCore, CalibrationScreen, VoiceCommands, PoseOverlay, GameHUD, ParticleSystem ve CameraShake modullarini yarat.
Sonra Subway Runner-i FitRun Adventure kimi yeniden qur: 3D Baku/neon runner, moving world, procedural buildings, coins, power-ups, character body animation, camera shake, particles, dynamic fog, voice start/restart/back, MediaPipe gesture events.
Keyboard input yalniz debug fallback kimi qalsin.
Kod TypeScript, Next.js ve Three.js ile yazilsin.
Engine logic pure testable olsun.
```

---

## 22. Final Note

FitPlay-in ferqi bu olmalidir: user oyunu oynayanda idman etdiyini unudur, amma beden hereketde qalir. Oyunlar sade prototip kimi yox, arcade polish-i olan 3D dunya kimi gorunmelidir. Her oyun "kamera qarsisinda oynamaq buna deyer" hissi vermelidir.
