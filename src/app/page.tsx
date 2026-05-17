"use client";

import { useState } from "react";

import { GameSelect } from "@/components/game-select/GameSelect";
import { BalloonPop } from "@/features/balloon-pop/BalloonPop";
import { BoxingPvP } from "@/features/boxing-pvp/BoxingPvP";
import { Penalty } from "@/features/penalty/Penalty";
import { PilatesFlow } from "@/features/pilates-flow/PilatesFlow";
import { SubwayRunner } from "@/features/subway-runner/SubwayRunner";
import { ZumbaDance } from "@/features/zumba-dance/ZumbaDance";

type Screen =
  | "select"
  | "runner"
  | "zumba"
  | "boxing"
  | "balloon"
  | "penalty"
  | "pilates";

export default function Home() {
  const [screen, setScreen] = useState<Screen>("select");
  const back = () => setScreen("select");

  return (
    <main className="app-shell">
      {screen === "select" ? (
        <GameSelect
          onStartSubway={() => setScreen("runner")}
          onStartZumba={() => setScreen("zumba")}
          onStartBoxing={() => setScreen("boxing")}
          onStartBalloon={() => setScreen("balloon")}
          onStartPenalty={() => setScreen("penalty")}
          onStartPilates={() => setScreen("pilates")}
        />
      ) : null}

      {screen === "runner" ? (
        <>
          <nav className="topbar" aria-label="FitPlay naviqasiya">
            <button type="button" onClick={back}>
              Oyunlara qayit
            </button>
            <strong>FitPlay / Subway Runner</strong>
            <span>Solo demo</span>
          </nav>
          <SubwayRunner onBackToGames={back} />
        </>
      ) : null}

      {screen === "zumba" ? <ZumbaDance onBackToGames={back} /> : null}
      {screen === "boxing" ? <BoxingPvP onBackToGames={back} /> : null}
      {screen === "balloon" ? <BalloonPop onBackToGames={back} /> : null}
      {screen === "penalty" ? <Penalty onBackToGames={back} /> : null}
      {screen === "pilates" ? <PilatesFlow onBackToGames={back} /> : null}
    </main>
  );
}
