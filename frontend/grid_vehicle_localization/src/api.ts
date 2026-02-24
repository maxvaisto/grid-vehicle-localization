import axios from 'axios';

const client = axios.create({ baseURL: '/api' });

export type ColorId = number;

export interface ColorInfo {
  RGB: [number, number, number];
}

export type Colormap = Record<number, ColorInfo>;

export interface VehiclePosition {
  x: number;
  y: number;
}

export async function fetchBoard(): Promise<ColorId[][]> {
  const res = await client.get<{ board: ColorId[][] }>('/get_board');
  return res.data.board;
}

export async function fetchColormap(): Promise<Colormap> {
  const res = await client.get<{ colormap: Record<string, ColorInfo> }>('/get_colormap');
  const raw = res.data.colormap;
  const result: Colormap = {};
  for (const key of Object.keys(raw)) {
    result[Number(key)] = raw[key];
  }
  return result;
}

export async function fetchProbabilityField(): Promise<number[][]> {
  const res = await client.get<{ probability_field: number[][] }>('/get_probability');
  return res.data.probability_field;
}

export async function fetchVehiclePosition(): Promise<VehiclePosition> {
  const res = await client.get<{ vehicle_position: VehiclePosition }>('/vehicle_position');
  return res.data.vehicle_position;
}

export async function postMove(): Promise<void> {
  await client.post('/move');
}

export async function postRestart(numColors: number, boardSize: number): Promise<void> {
  await client.post('/restart', { num_colors: numColors, board_size: boardSize });
}
