import './styles.css';
import { Tile } from './Tile';
import type { ColorId, Colormap, VehiclePosition } from './api';

interface BoardProps {
  board: ColorId[][];
  colormap: Colormap;
  probabilityField: number[][];
  vehiclePosition: VehiclePosition;
  predictedPosition: VehiclePosition | null;
}

export default function Board({ board, colormap, probabilityField, vehiclePosition, predictedPosition }: BoardProps) {
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
            isPredicted={predictedPosition !== null && predictedPosition.x === rowIdx && predictedPosition.y === colIdx}
          />
        ))
      )}
    </div>
  );
}
