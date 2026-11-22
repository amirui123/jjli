export interface AudioBufferLike {
  readonly numberOfChannels: number;
  readonly sampleRate: number;
  readonly length: number;
  getChannelData(channel: number): Float32Array;
}
export declare function encodeWav(buffer: AudioBufferLike): Blob;
