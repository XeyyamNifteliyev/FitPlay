export type GameCategory = "women" | "men" | "kids" | "all";

export type GameCard = {
  id: string;
  title: string;
  category: GameCategory[];
  difficulty: "asan" | "orta" | "cetin";
  players: string;
  duration: string;
  description: string;
  tags: string[];
  status: "active" | "soon";
  emoji: string;
};

export const GAMES: GameCard[] = [
  {
    id: "subway-runner",
    title: "FitRun Metro Chase",
    category: ["women", "men", "all"],
    difficulty: "asan",
    players: "1",
    duration: "sonsuz",
    description: "Metro relslerinde qac, qatarlarin arasindan kec, pullari topla.",
    tags: ["3D runner", "kamera", "chase"],
    status: "active",
    emoji: "RUN"
  },
  {
    id: "zumba-dance",
    title: "Dance Quest",
    category: ["women", "all"],
    difficulty: "orta",
    players: "1-4",
    duration: "3-10 deq",
    description: "Ritmle qol ve beden hereketlerini tut, combo ve XP qazan.",
    tags: ["reqs", "ritm", "party"],
    status: "active",
    emoji: "DNC"
  },
  {
    id: "boxing-pvp",
    title: "Boxing Arena",
    category: ["men", "all"],
    difficulty: "orta",
    players: "1-2",
    duration: "3 raund",
    description: "Jab, blok, combo ve reflekslerle ringde xal ustunluyu qur.",
    tags: ["ring", "HIIT", "refleks"],
    status: "active",
    emoji: "BOX"
  },
  {
    id: "balloon-pop",
    title: "Balloon Party 3D",
    category: ["kids", "all"],
    difficulty: "asan",
    players: "1",
    duration: "60 san",
    description: "Ellerle ucan balonlari vur, rengli burstlerle xal topla.",
    tags: ["usaq", "el-koordinasiya"],
    status: "active",
    emoji: "POP"
  },
  {
    id: "penalty",
    title: "Sports Stadium",
    category: ["men", "all"],
    difficulty: "orta",
    players: "2",
    duration: "5 zerbe",
    description: "Penalti vur, qapici kimi tullan, stadion atmosferini yasa.",
    tags: ["futbol", "kick", "stadion"],
    status: "active",
    emoji: "GOAL"
  },
  {
    id: "pilates-flow",
    title: "Balance Garden",
    category: ["women", "all"],
    difficulty: "orta",
    players: "1",
    duration: "10-20 deq",
    description: "Pozani saxla, nefes ritmini tut, balans ve mobillik qazan.",
    tags: ["balans", "mobility", "sakit"],
    status: "active",
    emoji: "ZEN"
  }
];

export const CATEGORY_LABELS: Record<GameCategory, string> = {
  all: "Hamisi",
  women: "Qadinlar",
  men: "Kisiler",
  kids: "Usaqlar"
};
