type GameHUDItem = {
  label: string;
  value: string | number;
};

type GameHUDProps = {
  items: GameHUDItem[];
};

export function GameHUD({ items }: GameHUDProps) {
  return (
    <div className="game-hud" aria-live="polite">
      {items.map((item) => (
        <div key={item.label}>
          <span className="hud-label">{item.label}</span>
          <strong>{item.value}</strong>
        </div>
      ))}
    </div>
  );
}
