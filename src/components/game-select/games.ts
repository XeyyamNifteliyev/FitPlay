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
    title: "Subway Runner",
    category: ["women", "men", "all"],
    difficulty: "asan",
    players: "1",
    duration: "sonsuz",
    description: "Qac, tullan, eyil. Ne qeder uzaq geden bilirsen?",
    tags: ["cardio", "runner", "pose-ready"],
    status: "active",
    emoji: "🏃"
  },
  {
    id: "zumba-dance",
    title: "Zumba Dance",
    category: ["women", "all"],
    difficulty: "orta",
    players: "1-4",
    duration: "3-10 deq",
    description: "Ritme uygun reqs et, XP topla.",
    tags: ["dance", "music"],
    status: "active",
    emoji: "💃"
  },
  {
    id: "boxing-pvp",
    title: "Boks PvP",
    category: ["men", "all"],
    difficulty: "orta",
    players: "1-2",
    duration: "3 raund",
    description: "Refleks, blok ve combo zerbeleri.",
    tags: ["pvp", "hiit"],
    status: "active",
    emoji: "🥊"
  },
  {
    id: "balloon-pop",
    title: "Balon Partlatma",
    category: ["kids", "all"],
    difficulty: "asan",
    players: "1",
    duration: "60 san",
    description: "Rengli balonlara toxun ve xal qazan.",
    tags: ["kids", "coordination"],
    status: "active",
    emoji: "🎈"
  },
  {
    id: "penalty",
    title: "Futbol Penalti",
    category: ["men", "all"],
    difficulty: "orta",
    players: "2",
    duration: "5 zerbe",
    description: "Penaltici ve qapici rollari deyisir.",
    tags: ["football", "local"],
    status: "active",
    emoji: "⚽"
  },
  {
    id: "pilates-flow",
    title: "Pilates Flow",
    category: ["women", "all"],
    difficulty: "orta",
    players: "1",
    duration: "10-20 deq",
    description: "Pozani saxla, real-time feedback al.",
    tags: ["mobility", "balance"],
    status: "active",
    emoji: "🧘"
  }
];

export const CATEGORY_LABELS: Record<GameCategory, string> = {
  all: "Hamisi",
  women: "Qadinlar",
  men: "Kisiler",
  kids: "Usaqlar"
};
