export interface ShaderFrameLoopOptions {
  requestFrame: (callback: FrameRequestCallback) => number;
  cancelFrame: (frameId: number) => void;
  isActive: () => boolean;
  draw: (timestamp: number) => void;
}
export declare class ShaderFrameLoop {
  constructor(options: ShaderFrameLoopOptions);
  refresh(): void;
  stop(): void;
  dispose(): void;
}
