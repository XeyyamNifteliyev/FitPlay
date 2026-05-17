"use client";

import { useMemo, useState } from "react";

import { CATEGORY_LABELS, GAMES, type GameCategory } from "./games";

type GameSelectProps = {
  onStartSubway: () => void;
  onStartZumba: () => void;
  onStartBoxing: () => void;
  onStartBalloon: () => void;
  onStartPenalty: () => void;
  onStartPilates: () => void;
};

const CATEGORIES: GameCategory[] = ["all", "women", "men", "kids"];

export function GameSelect({
  onStartSubway,
  onStartZumba,
  onStartBoxing,
  onStartBalloon,
  onStartPenalty,
  onStartPilates
}: GameSelectProps) {
  const [category, setCategory] = useState<GameCategory>("all");
  const startHandlers: Record<string, () => void> = {
    "subway-runner": onStartSubway,
    "zumba-dance": onStartZumba,
    "boxing-pvp": onStartBoxing,
    "balloon-pop": onStartBalloon,
    penalty: onStartPenalty,
    "pilates-flow": onStartPilates
  };

  const games = useMemo(
    () =>
      GAMES.filter((game) => category === "all" || game.category.includes(category)),
    [category]
  );

  return (
    <section className="game-select" aria-label="Oyun secimi">
      <div className="game-select__header">
        <div>
          <p className="eyebrow">Kamera + ekran + hereket</p>
          <h1>FitPlay</h1>
          <p>
            Evde interaktiv idman oyunu. Ilk demo Subway Runner ile baslayir,
            novbeti merhelede kamera hereketleri bu input sistemine qosulacaq.
          </p>
        </div>
        <button className="primary-action" type="button" onClick={onStartSubway}>
          Subway Runner baslat
        </button>
      </div>

      <div className="category-tabs" role="tablist" aria-label="Kateqoriyalar">
        {CATEGORIES.map((item) => (
          <button
            key={item}
            type="button"
            role="tab"
            aria-selected={category === item}
            className={category === item ? "is-active" : ""}
            onClick={() => setCategory(item)}
          >
            {CATEGORY_LABELS[item]}
          </button>
        ))}
      </div>

      <div className="game-grid">
        {games.map((game) => (
          <article className={`game-card game-card--${game.status}`} key={game.id}>
            <div className="game-card__topline">
              <span>{game.players} oyuncu</span>
              <span>{game.duration}</span>
            </div>
            <div className="game-card__emoji" aria-hidden="true">
              {game.emoji}
            </div>
            <h2>{game.title}</h2>
            <p>{game.description}</p>
            <div className="game-card__meta">
              <span>{game.difficulty}</span>
              {game.tags.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
            {game.status === "active" ? (
              <button type="button" onClick={startHandlers[game.id]}>
                Oyna
              </button>
            ) : (
              <button type="button" disabled>
                Tezlikle
              </button>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
