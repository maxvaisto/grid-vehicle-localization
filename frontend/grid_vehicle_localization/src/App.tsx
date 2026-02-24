import { useEffect, useState } from 'react';
import Board from './Board';
import {
  fetchBoard,
  fetchColormap,
  fetchProbabilityField,
  fetchVehiclePosition,
  postMove,
  postRestart,
  type ColorId,
  type Colormap,
  type VehiclePosition,
} from './api';

interface AppState {
  board: ColorId[][];
  colormap: Colormap;
  probabilityField: number[][];
  vehiclePosition: VehiclePosition;
  numColors: number;
  loading: boolean;
  error: string | null;
  moving: boolean;
}

const EMPTY_STATE: AppState = {
  board: [],
  colormap: {},
  probabilityField: [],
  vehiclePosition: { x: 0, y: 0 },
  numColors: 4,
  loading: true,
  error: null,
  moving: false,
};

async function loadAll() {
  const [board, colormap] = await Promise.all([fetchBoard(), fetchColormap()]);
  const [probabilityField, vehiclePosition] = await Promise.all([
    fetchProbabilityField(),
    fetchVehiclePosition(),
  ]);
  return { board, colormap, probabilityField, vehiclePosition };
}

export default function App() {
  const [state, setState] = useState<AppState>(EMPTY_STATE);

  useEffect(() => {
    loadAll()
      .then((data) => setState((s) => ({ ...s, ...data, loading: false })))
      .catch((e) => setState((s) => ({ ...s, loading: false, error: String(e) })));
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

  async function handleRestart(numColors: number) {
    setState((s) => ({ ...s, loading: true, numColors }));
    try {
      await postRestart(numColors);
      const data = await loadAll();
      setState((s) => ({ ...s, ...data, loading: false }));
    } catch (e) {
      setState((s) => ({ ...s, loading: false, error: String(e) }));
    }
  }

  if (state.loading) return <p>Loading...</p>;
  if (state.error) return <p style={{ color: 'red' }}>Error: {state.error}</p>;

  return (
    <>
      <h1>Grid vehicle localization</h1>
      <div className="controls">
        <label htmlFor="num-colors-slider">
          Colors: <strong>{state.numColors}</strong>
        </label>
        <input
          id="num-colors-slider"
          type="range"
          min={4}
          max={8}
          value={state.numColors}
          onChange={(e) => handleRestart(Number(e.target.value))}
        />
      </div>
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
