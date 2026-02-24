import './styles.css';
import { Tile } from './Tile';
import type { ColorId, Colormap, VehiclePosition } from './api';

interface BoardProps {
  board: ColorId[][];
  colormap: Colormap;
  probabilityField: number[][];
  vehiclePosition: VehiclePosition;
}

export default function Board({ board, colormap, probabilityField, vehiclePosition }: BoardProps) {
  const cols = board[0]?.length ?? 5;

  return (
    <div className="board" style={{ gridTemplateColumns: `repeat(${cols}, 80px)` }}>
      {board.map((row, rowIdx) =>
        row.map((colorId, colIdx) => (
          <Tile
            key={`${rowIdx}-${colIdx}`}
            colorInfo={colormap[colorId]}
            probability={probabilityField[rowIdx]?.[colIdx] ?? 0}
            isVehicle={vehiclePosition.x === rowIdx && vehiclePosition.y === colIdx}
          />
        ))
      )}
    </div>
  );
}
