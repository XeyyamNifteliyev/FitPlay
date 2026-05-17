type GameOverModalProps = {
  title: string;
  score: number;
  highScore: number;
  primaryLabel: string;
  onPrimary: () => void;
  onBack: () => void;
};

export function GameOverModal({
  title,
  score,
  highScore,
  primaryLabel,
  onPrimary,
  onBack
}: GameOverModalProps) {
  return (
    <div className="game-over-modal" role="dialog" aria-label={title}>
      <p>{title}</p>
      <div className="game-over-modal__scores">
        <span>Skor: {score}</span>
        <span>Rekord: {highScore}</span>
      </div>
      <div className="game-over-modal__actions">
        <button type="button" onClick={onPrimary}>
          {primaryLabel}
        </button>
        <button type="button" onClick={onBack}>
          Oyunlara qayit
        </button>
      </div>
    </div>
  );
}
