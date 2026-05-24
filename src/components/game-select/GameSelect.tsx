"use client";

import { useMemo, useState, type CSSProperties } from "react";

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

const GAME_ACCENTS: Record<string, string> = {
  "subway-runner": "#38bdf8",
  "zumba-dance": "#f43f5e",
  "boxing-pvp": "#f97316",
  "balloon-pop": "#facc15",
  penalty: "#22c55e",
  "pilates-flow": "#2dd4bf"
};

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
  const featuredGame = GAMES[0];

  return (
    <section className="game-select" aria-label="Oyun secimi">
      <div className="game-select__hero">
        <div className="game-select__intro">
          <p className="eyebrow">TV ucun camera-first fitness arcade</p>
          <h1>FitPlay Arena</h1>
          <p>
            Klaviatura oyunu deyil: beden kameranin qarsisinda joystick olur.
            Qacis, reqs, boks, futbol ve balans oyunlari canli arena kimi
            qurulur.
          </p>
          <div className="hero-metrics" aria-label="FitPlay imkanlari">
            <span>
              <strong>6</strong>
              oyun modu
            </span>
            <span>
              <strong>3D</strong>
              arcade dunya
            </span>
            <span>
              <strong>TV</strong>
              uzaqdan idare
            </span>
          </div>
          <button className="primary-action" type="button" onClick={onStartSubway}>
            FitRun Metro Chase baslat
          </button>
        </div>

        <button
          className="featured-preview"
          type="button"
          onClick={startHandlers[featuredGame.id]}
          aria-label={`${featuredGame.title} baslat`}
        >
          <div className="featured-preview__hud">
            <span>LIVE</span>
            <span>Baki Metro</span>
          </div>
          <div className="featured-preview__tunnel" aria-hidden="true">
            <span className="featured-preview__train featured-preview__train--left" />
            <span className="featured-preview__train featured-preview__train--right" />
            <span className="featured-preview__runner" />
            <span className="featured-preview__guard" />
            <span className="featured-preview__coin featured-preview__coin--one" />
            <span className="featured-preview__coin featured-preview__coin--two" />
            <span className="featured-preview__coin featured-preview__coin--three" />
          </div>
          <div className="featured-preview__copy">
            <small>Aktiv oyun</small>
            <strong>{featuredGame.title}</strong>
            <span>Qatarlar, pullar, chase ve kamera hereketleri</span>
          </div>
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
          <article
            className={`game-card game-card--${game.status}`}
            key={game.id}
            style={{ "--accent": GAME_ACCENTS[game.id] ?? "#38bdf8" } as CSSProperties}
          >
            <div className="game-card__topline">
              <span>{game.players} oyuncu</span>
              <span>{game.duration}</span>
              <span>{game.status === "active" ? "kamera-ready" : "tezlikle"}</span>
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
                Arenaya gir
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
