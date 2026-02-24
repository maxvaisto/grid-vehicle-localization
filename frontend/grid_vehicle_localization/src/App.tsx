import { useEffect, useState } from 'react';
import Board from './Board';
import {
  fetchBoard,
  fetchColormap,
  fetchProbabilityField,
  fetchVehiclePosition,
  postMove,
  type ColorId,
  type Colormap,
  type VehiclePosition,
} from './api';

interface AppState {
  board: ColorId[][];
  colormap: Colormap;
  probabilityField: number[][];
  vehiclePosition: VehiclePosition;
  loading: boolean;
  error: string | null;
  moving: boolean;
}

const EMPTY_STATE: AppState = {
  board: [],
  colormap: { 0: { RGB: [0, 0, 0] }, 1: { RGB: [0, 0, 0] }, 2: { RGB: [0, 0, 0] }, 3: { RGB: [0, 0, 0] } },
  probabilityField: [],
  vehiclePosition: { x: 0, y: 0 },
  loading: true,
  error: null,
  moving: false,
};

export default function App() {
  const [state, setState] = useState<AppState>(EMPTY_STATE);

  useEffect(() => {
    async function init() {
      try {
        const [board, colormap] = await Promise.all([fetchBoard(), fetchColormap()]);
        const [probabilityField, vehiclePosition] = await Promise.all([
          fetchProbabilityField(),
          fetchVehiclePosition(),
        ]);
        setState((s) => ({ ...s, board, colormap, probabilityField, vehiclePosition, loading: false }));
      } catch (e) {
        setState((s) => ({ ...s, loading: false, error: String(e) }));
      }
    }
    init();
  }, []);

  async function handleMove() {
    setState((s) => ({ ...s, moving: true }));
    try {
      await postMove();
      const [probabilityField, vehiclePosition] = await Promise.all([
        fetchProbabilityField(),
        fetchVehiclePosition(),
      ]);
      setState((s) => ({ ...s, probabilityField, vehiclePosition, moving: false }));
    } catch (e) {
      setState((s) => ({ ...s, moving: false, error: String(e) }));
    }
  }

  if (state.loading) return <p>Loading...</p>;
  if (state.error) return <p style={{ color: 'red' }}>Error: {state.error}</p>;

  return (
    <>
      <h1>Grid vehicle localization</h1>
      <Board
        board={state.board}
        colormap={state.colormap}
        probabilityField={state.probabilityField}
        vehiclePosition={state.vehiclePosition}
      />
      <div style={{ textAlign: 'center', marginTop: '12px' }}>
        <button onClick={handleMove} disabled={state.moving}>
          {state.moving ? 'Moving...' : 'Move'}
        </button>
      </div>
    </>
  );
}
