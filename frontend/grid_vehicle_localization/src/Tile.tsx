import './styles.css';
import type { ColorInfo } from './api';

interface TileProps {
  colorInfo: ColorInfo;
  probability: number;
  isVehicle: boolean;
}

export function Tile({ colorInfo, probability, isVehicle }: TileProps) {
  const [r, g, b] = colorInfo.RGB;
  return (
    <div
      className={`tile${isVehicle ? ' tile--vehicle' : ''}`}
      style={{ background: `rgb(${r}, ${g}, ${b})` }}
    >
      <span className="tile__prob">{(probability * 100).toFixed(2)}%</span>
    </div>
  );
}
