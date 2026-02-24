import './styles.css';
import type { ColorInfo } from './api';

interface TileProps {
  colorInfo: ColorInfo;
  probability: number;
  isVehicle: boolean;
  isPredicted: boolean;
}

export function Tile({ colorInfo, probability, isVehicle, isPredicted }: TileProps) {
  const [r, g, b] = colorInfo.RGB;

  let className = 'tile';
  if (isPredicted && isVehicle) className += ' tile--predicted-correct';
  else if (isPredicted) className += ' tile--predicted-wrong';
  else if (isVehicle) className += ' tile--vehicle';

  return (
    <div className={className} style={{ background: `rgb(${r}, ${g}, ${b})` }}>
      {isPredicted && (
        <span className="tile__prediction">{isVehicle ? '\u2713' : '?'}</span>
      )}
      <span className="tile__prob">{(probability * 100).toFixed(2)}%</span>
    </div>
  );
}
