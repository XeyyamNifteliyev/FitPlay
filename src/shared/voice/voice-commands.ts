export type VoiceCommand =
  | "start"
  | "pause"
  | "resume"
  | "restart"
  | "backToGames"
  | "openCalibration"
  | "camera"
  | "cameraStop"
  | "selectSubway";

export const VOICE_COMMAND_PHRASES: Record<VoiceCommand, string[]> = {
  start: ["basla", "bashla", "baslat", "baslayir", "basliyaq", "start", "oyna", "oyuna basla"],
  pause: ["pauza", "pause", "dayan", "saxla"],
  resume: ["davam et", "devam et", "resume", "davam"],
  restart: ["yeniden", "restart", "tekrar", "yeniden baslat", "tekrar basla"],
  backToGames: ["oyunlara qayit", "oyunlara kayit", "menyu", "geri"],
  openCalibration: ["kalibrasiya", "kalibre", "calibrate", "kamera ayarlari", "kamerani yoxla"],
  camera: ["kamera ac", "kamerani ac", "camera", "kamera"],
  cameraStop: [
    "kamerani dayandir",
    "kamera dayandir",
    "kamerani saxla",
    "camera stop",
    "stop camera"
  ],
  selectSubway: ["subway runner", "sabvey runner", "subway", "qacis oyunu", "qacis"]
};

export function parseVoiceCommand(transcript: string): VoiceCommand | null {
  const normalized = normalizeVoice(transcript);

  const order: VoiceCommand[] = [
    "backToGames",
    "selectSubway",
    "resume",
    "cameraStop",
    "camera",
    "openCalibration",
    "restart",
    "pause",
    "start"
  ];

  for (const command of order) {
    const phrases = VOICE_COMMAND_PHRASES[command];
    if (includesAny(normalized, phrases)) {
      return command;
    }
  }

  return null;
}

function normalizeVoice(value: string) {
  return value
    .toLocaleLowerCase("az")
    .normalize("NFD")
    .replace(/\p{Mark}/gu, "")
    .replaceAll("\u0259", "e")
    .replaceAll("\u0131", "i")
    .replaceAll("\u00F6", "o")
    .replaceAll("\u00FC", "u")
    .replaceAll("\u011F", "g")
    .replaceAll("\u015F", "s")
    .replaceAll("\u00E7", "c")
    .replace(/[^\p{Letter}\p{Number}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function includesAny(value: string, candidates: string[]) {
  return candidates.some((candidate) => value.includes(candidate));
}
