type GameTopbarProps = {
  title: string;
  mode?: string;
  onBack: () => void;
};

export function GameTopbar({ title, mode = "Solo demo", onBack }: GameTopbarProps) {
  return (
    <nav className="topbar" aria-label="FitPlay naviqasiya">
      <button type="button" onClick={onBack}>
        Oyunlara qayit
      </button>
      <strong>FitPlay / {title}</strong>
      <span>{mode}</span>
    </nav>
  );
}
