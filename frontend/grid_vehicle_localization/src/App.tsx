import { useEffect, useRef, useState } from 'react';
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
  boardSize: number;
  loading: boolean;
  error: string | null;
  moving: boolean;
  autoPlaying: boolean;
  certaintyThreshold: number;
  gameOver: boolean;
  predictedPosition: VehiclePosition | null;
  predictionCorrect: boolean | null;
}

const EMPTY_STATE: AppState = {
  board: [],
  colormap: {},
  probabilityField: [],
  vehiclePosition: { x: 0, y: 0 },
  numColors: 4,
  boardSize: 5,
  loading: true,
  error: null,
  moving: false,
  autoPlaying: false,
  certaintyThreshold: 90,
  gameOver: false,
  predictedPosition: null,
  predictionCorrect: null,
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
  const autoPlayingRef = useRef(false);
  const certaintyThresholdRef = useRef(90);

  useEffect(() => {
    loadAll()
      .then((data) => setState((s) => ({ ...s, ...data, loading: false })))
      .catch((e) => setState((s) => ({ ...s, loading: false, error: String(e) })));
    return () => { autoPlayingRef.current = false; };
  }, []);

  async function handleMove() {
    setState((s) => ({ ...s, moving: true }));
    try {
      await postMove();
      const [probabilityField, vehiclePosition] = await Promise.all([
        fetchProbabilityField(),
        fetchVehiclePosition(),
      ]);

      // Find tile with highest probability
      let maxProb = 0;
      let maxRow = 0, maxCol = 0;
      for (let r = 0; r < probabilityField.length; r++) {
        for (let c = 0; c < (probabilityField[r]?.length ?? 0); c++) {
          if (probabilityField[r][c] > maxProb) {
            maxProb = probabilityField[r][c];
            maxRow = r;
            maxCol = c;
          }
        }
      }

      const threshold = certaintyThresholdRef.current / 100;
      if (maxProb >= threshold) {
        const predictedPosition = { x: maxRow, y: maxCol };
        const predictionCorrect = vehiclePosition.x === maxRow && vehiclePosition.y === maxCol;
        autoPlayingRef.current = false;
        setState((s) => ({
          ...s,
          probabilityField,
          vehiclePosition,
          moving: false,
          autoPlaying: false,
          gameOver: true,
          predictedPosition,
          predictionCorrect,
        }));
      } else {
        setState((s) => ({ ...s, probabilityField, vehiclePosition, moving: false }));
      }
    } catch (e) {
      setState((s) => ({ ...s, moving: false, error: String(e) }));
    }
  }

  function handleContinue() {
    setState((s) => ({ ...s, gameOver: false, predictedPosition: null, predictionCorrect: null }));
  }

  function handleToggleAutoPlay() {
    if (autoPlayingRef.current) {
      autoPlayingRef.current = false;
      setState((s) => ({ ...s, autoPlaying: false }));
    } else {
      autoPlayingRef.current = true;
      setState((s) => ({ ...s, autoPlaying: true }));
      async function step() {
        if (!autoPlayingRef.current) return;
        await handleMove();
        if (autoPlayingRef.current) setTimeout(step, 200);
      }
      step();
    }
  }

  async function handleRestart(numColors: number, boardSize: number) {
    autoPlayingRef.current = false;
    setState((s) => ({
      ...s,
      loading: true,
      numColors,
      boardSize,
      autoPlaying: false,
      gameOver: false,
      predictedPosition: null,
      predictionCorrect: null,
    }));
    try {
      await postRestart(numColors, boardSize);
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
          min={3}
          max={8}
          value={state.numColors}
          onChange={(e) => handleRestart(Number(e.target.value), state.boardSize)}
        />
        <label htmlFor="board-size-slider">
          Size: <strong>{state.boardSize}&times;{state.boardSize}</strong>
        </label>
        <input
          id="board-size-slider"
          type="range"
          min={4}
          max={16}
          value={state.boardSize}
          onChange={(e) => handleRestart(state.numColors, Number(e.target.value))}
        />
        <label htmlFor="certainty-slider">
          Stop at: <strong>{state.certaintyThreshold}%</strong>
        </label>
        <input
          id="certainty-slider"
          type="range"
          min={50}
          max={99}
          value={state.certaintyThreshold}
          onChange={(e) => {
            const val = Number(e.target.value);
            certaintyThresholdRef.current = val;
            setState((s) => ({ ...s, certaintyThreshold: val }));
          }}
        />
      </div>
      {state.gameOver && state.predictedPosition !== null && (
        <div className="game-over-banner">
          <h2>Algorithm locked on!</h2>
          <p>
            Predicted position: row {state.predictedPosition.x + 1}, col {state.predictedPosition.y + 1}
          </p>
          <p className={state.predictionCorrect ? 'result--correct' : 'result--wrong'}>
            {state.predictionCorrect
              ? '\u2713 Correct! The cart is exactly where predicted.'
              : `\u2717 Wrong! The cart was at row ${state.vehiclePosition.x + 1}, col ${state.vehiclePosition.y + 1}.`}
          </p>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '10px' }}>
            <button onClick={handleContinue}>Continue</button>
            <button onClick={() => handleRestart(state.numColors, state.boardSize)}>New Game</button>
          </div>
        </div>
      )}
      <Board
        board={state.board}
        colormap={state.colormap}
        probabilityField={state.probabilityField}
        vehiclePosition={state.vehiclePosition}
        predictedPosition={state.predictedPosition}
      />
      <div style={{ textAlign: 'center', marginTop: '12px', display: 'flex', gap: '8px', justifyContent: 'center' }}>
        <button onClick={handleMove} disabled={state.moving || state.autoPlaying || state.gameOver}>
          {state.moving ? 'Moving...' : 'Move'}
        </button>
        <button onClick={handleToggleAutoPlay} disabled={(state.moving && !state.autoPlaying) || state.gameOver}>
          {state.autoPlaying ? 'Stop' : 'Auto-play'}
        </button>
      </div>
    </>
  );
}
