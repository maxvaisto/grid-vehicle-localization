import axios from 'axios';

const client = axios.create({ baseURL: '/api' });

export type ColorId = 0 | 1 | 2 | 3;

export interface ColorInfo {
  RGB: [number, number, number];
}

export type Colormap = Record<ColorId, ColorInfo>;

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
  return {
    0: raw['0'],
    1: raw['1'],
    2: raw['2'],
    3: raw['3'],
  } as Colormap;
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
