export type coords = {
  x: number,
  y: number
}

export class BoxConfig {
  i: number;
  j: number;
  x: number;
  y: number;
  point: PointConfig;
}

export class PointConfig {
  x: number;
  y: number;
  scale: number;
}