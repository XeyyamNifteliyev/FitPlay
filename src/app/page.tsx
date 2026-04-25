"use client";

import { useState } from "react";

import { GameSelect } from "@/components/game-select/GameSelect";
import { SubwayRunner } from "@/features/subway-runner/SubwayRunner";

export default function Home() {
  const [screen, setScreen] = useState<"select" | "runner">("select");

  return (
    <main className="app-shell">
      {screen === "select" ? (
        <GameSelect onStartSubway={() => setScreen("runner")} />
      ) : (
        <>
          <nav className="topbar" aria-label="FitPlay naviqasiya">
            <button type="button" onClick={() => setScreen("select")}>
              Oyunlara qayit
            </button>
            <strong>FitPlay / Subway Runner</strong>
            <span>Solo demo</span>
          </nav>
          <SubwayRunner onBackToGames={() => setScreen("select")} />
        </>
      )}
    </main>
  );
}
