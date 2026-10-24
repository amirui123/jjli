export interface WindFieldConfig {
  baseVelocity: [number, number, number];
  gustFrequency: number;
  gustAmplitude: number;
  airDensity: number; // e.g. 1.225 kg/m^3
  liftCoefficient: number;
  dragCoefficient: number;
}

export interface TriangleAerodynamics {
  triangleIndex: number;
  area: number;
  normal: [number, number, number];
  centroidVelocity: [number, number, number];
  force: [number, number, number];
}
