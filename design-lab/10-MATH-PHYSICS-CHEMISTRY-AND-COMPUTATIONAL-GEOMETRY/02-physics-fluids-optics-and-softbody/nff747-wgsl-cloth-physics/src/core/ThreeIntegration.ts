/**
 * ThreeIntegration.ts
 * Adapter for Three.js rendering pipelines.
 * Provides custom BufferGeometry construction and zero-copy VRAM buffer binding helpers.
 */

import { ClothSimulation } from './ClothSimulation';

export interface MinimalBufferGeometry {
  setAttribute(name: string, attribute: any): any;
  setIndex(index: any): any;
  computeVertexNormals?(): void;
}

export class ThreeIntegration {
  /**
   * Constructs a standard or WebGPU-compatible BufferGeometry definition
   * from the ClothSimulation topology.
   */
  public static createGeometryDefinition(sim: ClothSimulation) {
    const topo = sim.topology;
    const numP = topo.numParticles;

    // Convert vec4 positions [x, y, z, w] to vec3 positions [x, y, z] for standard Three.js Float32BufferAttribute
    const pos3 = new Float32Array(numP * 3);
    for (let i = 0; i < numP; i++) {
      pos3[i * 3 + 0] = sim.cpuPositions[i * 4 + 0];
      pos3[i * 3 + 1] = sim.cpuPositions[i * 4 + 1];
      pos3[i * 3 + 2] = sim.cpuPositions[i * 4 + 2];
    }

    const norm3 = new Float32Array(numP * 3);
    for (let i = 0; i < numP; i++) {
      norm3[i * 3 + 0] = sim.cpuNormals[i * 4 + 0];
      norm3[i * 3 + 1] = sim.cpuNormals[i * 4 + 1];
      norm3[i * 3 + 2] = sim.cpuNormals[i * 4 + 2];
    }

    return {
      positions: pos3,
      normals: norm3,
      uvs: topo.uvs,
      indices: topo.indices,
      updateGeometry: (geometry: any) => {
        const pAttr = geometry.attributes.position;
        if (pAttr) {
          const pArray = pAttr.array;
          for (let i = 0; i < numP; i++) {
            pArray[i * 3 + 0] = sim.cpuPositions[i * 4 + 0];
            pArray[i * 3 + 1] = sim.cpuPositions[i * 4 + 1];
            pArray[i * 3 + 2] = sim.cpuPositions[i * 4 + 2];
          }
          pAttr.needsUpdate = true;
        }

        const nAttr = geometry.attributes.normal;
        if (nAttr) {
          const nArray = nAttr.array;
          for (let i = 0; i < numP; i++) {
            nArray[i * 3 + 0] = sim.cpuNormals[i * 4 + 0];
            nArray[i * 3 + 1] = sim.cpuNormals[i * 4 + 1];
            nArray[i * 3 + 2] = sim.cpuNormals[i * 4 + 2];
          }
          nAttr.needsUpdate = true;
        }
      },
    };
  }
}
