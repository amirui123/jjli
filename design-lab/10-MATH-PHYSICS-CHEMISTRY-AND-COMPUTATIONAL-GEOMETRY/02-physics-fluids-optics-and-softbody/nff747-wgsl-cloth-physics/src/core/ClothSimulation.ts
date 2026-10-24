/**
 * ClothSimulation.ts
 * Core WebGPU XPBD (Extended Position-Based Dynamics) cloth simulation orchestrator.
 * Manages zero-copy GPU VRAM buffers, multi-substep compute passes, colliders, and wind forces.
 * Includes CPU reference solver for verification and non-WebGPU environments.
 */

import { ClothTopology } from '../geometry/ClothMeshGenerator';
import { xpbdPredictShader } from '../shaders/xpbdPredict.wgsl';
import { xpbdDistanceShader } from '../shaders/xpbdDistance.wgsl';
import { xpbdBendingShader } from '../shaders/xpbdBending.wgsl';
import { xpbdCollisionShader } from '../shaders/xpbdCollision.wgsl';
import { normalUpdateWGSL } from '../shaders/normalUpdate.wgsl';


export interface SimulationConfig {
  substeps?: number;
  gravity?: [number, number, number];
  wind?: [number, number, number];
  damping?: number;
  compliance?: number;
  sphereCollider?: {
    center: [number, number, number];
    radius: number;
    friction: number;
  };
  groundCollider?: {
    height: number;
    friction: number;
  };
}

export class ClothSimulation {
  public readonly topology: ClothTopology;
  public config: Required<SimulationConfig>;

  // WebGPU Handles (null if running in headless CPU fallback mode)
  private device: GPUDevice | null = null;
  private positionsBuffer: GPUBuffer | null = null;
  private prevPositionsBuffer: GPUBuffer | null = null;
  private velocitiesBuffer: GPUBuffer | null = null;
  private normalsBuffer: GPUBuffer | null = null;
  private distanceConstraintsBuffer: GPUBuffer | null = null;
  private dihedralConstraintsBuffer: GPUBuffer | null = null;
  private simParamsBuffer: GPUBuffer | null = null;
  private colliderParamsBuffer: GPUBuffer | null = null;

  // Compute Pipelines
  private predictPipeline: GPUComputePipeline | null = null;
  private distancePipeline: GPUComputePipeline | null = null;
  private bendingPipeline: GPUComputePipeline | null = null;
  private collisionPipeline: GPUComputePipeline | null = null;
  private normalPipeline: GPUComputePipeline | null = null;

  // Bind Groups
  private predictBindGroup: GPUBindGroup | null = null;
  private distanceBindGroup: GPUBindGroup | null = null;
  private bendingBindGroup: GPUBindGroup | null = null;
  private collisionBindGroup: GPUBindGroup | null = null;
  private normalBindGroup: GPUBindGroup | null = null;

  // CPU fallback state
  public cpuPositions: Float32Array;
  public cpuPrevPositions: Float32Array;
  public cpuVelocities: Float32Array;
  public cpuNormals: Float32Array;

  constructor(topology: ClothTopology, config: SimulationConfig = {}) {
    this.topology = topology;
    this.config = {
      substeps: config.substeps ?? 10,
      gravity: config.gravity ?? [0.0, -9.81, 0.0],
      wind: config.wind ?? [0.0, 0.0, 0.0],
      damping: config.damping ?? 0.005,
      compliance: config.compliance ?? 1e-5,
      sphereCollider: config.sphereCollider ?? {
        center: [0.0, 0.5, 0.0],
        radius: 0.4,
        friction: 0.3,
      },
      groundCollider: config.groundCollider ?? {
        height: -1.0,
        friction: 0.5,
      },
    };

    // Copy initial CPU positions
    this.cpuPositions = new Float32Array(topology.positions);
    this.cpuPrevPositions = new Float32Array(topology.positions);
    this.cpuVelocities = new Float32Array(topology.numParticles * 4);
    this.cpuNormals = new Float32Array(topology.normals);
  }

  /**
   * Initializes WebGPU compute pipelines and allocates VRAM buffers.
   */
  public async initGPU(device: GPUDevice): Promise<void> {
    this.device = device;
    const numP = this.topology.numParticles;

    // Buffer sizes
    const vec4ByteSize = numP * 16;

    // 1. Positions Buffer (Vertex buffer + Storage buffer for direct zero-copy render)
    this.positionsBuffer = device.createBuffer({
      label: 'Cloth Positions',
      size: vec4ByteSize,
      usage: GPUBufferUsage.STORAGE | GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST | GPUBufferUsage.COPY_SRC,
    });
    device.queue.writeBuffer(this.positionsBuffer, 0, this.topology.positions);

    // 2. Previous Positions Buffer
    this.prevPositionsBuffer = device.createBuffer({
      label: 'Cloth Prev Positions',
      size: vec4ByteSize,
      usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
    });
    device.queue.writeBuffer(this.prevPositionsBuffer, 0, this.topology.positions);

    // 3. Velocities Buffer
    this.velocitiesBuffer = device.createBuffer({
      label: 'Cloth Velocities',
      size: vec4ByteSize,
      usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
    });

    // 4. Normals Buffer (Vertex buffer + Storage buffer)
    this.normalsBuffer = device.createBuffer({
      label: 'Cloth Normals',
      size: vec4ByteSize,
      usage: GPUBufferUsage.STORAGE | GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST | GPUBufferUsage.COPY_SRC,
    });
    device.queue.writeBuffer(this.normalsBuffer, 0, this.topology.normals);

    // 5. Constraints Buffers
    this.distanceConstraintsBuffer = device.createBuffer({
      label: 'Cloth Distance Constraints',
      size: Math.max(this.topology.distanceConstraints.byteLength, 16),
      usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
    });
    device.queue.writeBuffer(this.distanceConstraintsBuffer, 0, this.topology.distanceConstraints);

    this.dihedralConstraintsBuffer = device.createBuffer({
      label: 'Cloth Dihedral Constraints',
      size: Math.max(this.topology.dihedralConstraints.byteLength, 32),
      usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
    });
    device.queue.writeBuffer(this.dihedralConstraintsBuffer, 0, this.topology.dihedralConstraints);

    // 6. Uniform Buffers
    // SimParams: 48 bytes aligned to 16
    this.simParamsBuffer = device.createBuffer({
      label: 'Sim Params Uniform',
      size: 64,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });

    // ColliderParams: 48 bytes
    this.colliderParamsBuffer = device.createBuffer({
      label: 'Collider Params Uniform',
      size: 48,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });

    // Compile Shader Modules & Pipelines
    const predictModule = device.createShaderModule({ code: xpbdPredictShader });
    this.predictPipeline = device.createComputePipeline({
      layout: 'auto',
      compute: { module: predictModule, entryPoint: 'main' },
    });

    const distanceModule = device.createShaderModule({ code: xpbdDistanceShader });
    this.distancePipeline = device.createComputePipeline({
      layout: 'auto',
      compute: { module: distanceModule, entryPoint: 'main' },
    });

    const bendingModule = device.createShaderModule({ code: xpbdBendingShader });
    this.bendingPipeline = device.createComputePipeline({
      layout: 'auto',
      compute: { module: bendingModule, entryPoint: 'main' },
    });

    const collisionModule = device.createShaderModule({ code: xpbdCollisionShader });
    this.collisionPipeline = device.createComputePipeline({
      layout: 'auto',
      compute: { module: collisionModule, entryPoint: 'main' },
    });

    const normalModule = device.createShaderModule({ code: normalUpdateWGSL });
    this.normalPipeline = device.createComputePipeline({
      layout: 'auto',
      compute: { module: normalModule, entryPoint: 'main' },
    });

    // Create Bind Groups
    this.predictBindGroup = device.createBindGroup({
      layout: this.predictPipeline.getBindGroupLayout(0),
      entries: [
        { binding: 0, resource: { buffer: this.simParamsBuffer } },
        { binding: 1, resource: { buffer: this.positionsBuffer } },
        { binding: 2, resource: { buffer: this.prevPositionsBuffer } },
        { binding: 3, resource: { buffer: this.velocitiesBuffer } },
      ],
    });

    this.distanceBindGroup = device.createBindGroup({
      layout: this.distancePipeline.getBindGroupLayout(0),
      entries: [
        { binding: 0, resource: { buffer: this.simParamsBuffer } },
        { binding: 1, resource: { buffer: this.positionsBuffer } },
        { binding: 2, resource: { buffer: this.distanceConstraintsBuffer } },
      ],
    });

    this.bendingBindGroup = device.createBindGroup({
      layout: this.bendingPipeline.getBindGroupLayout(0),
      entries: [
        { binding: 0, resource: { buffer: this.simParamsBuffer } },
        { binding: 1, resource: { buffer: this.positionsBuffer } },
        { binding: 2, resource: { buffer: this.dihedralConstraintsBuffer } },
      ],
    });

    this.collisionBindGroup = device.createBindGroup({
      layout: this.collisionPipeline.getBindGroupLayout(0),
      entries: [
        { binding: 0, resource: { buffer: this.colliderParamsBuffer } },
        { binding: 1, resource: { buffer: this.positionsBuffer } },
        { binding: 2, resource: { buffer: this.prevPositionsBuffer } },
      ],
    });

    this.normalBindGroup = device.createBindGroup({
      layout: this.normalPipeline.getBindGroupLayout(0),
      entries: [
        { binding: 0, resource: { buffer: this.simParamsBuffer } },
        { binding: 1, resource: { buffer: this.positionsBuffer } },
        { binding: 2, resource: { buffer: this.normalsBuffer } },
      ],
    });

    this.updateUniforms(1 / 60);
  }

  /**
   * Update uniform buffers on GPU
   */
  private updateUniforms(dt: number): void {
    if (!this.device || !this.simParamsBuffer || !this.colliderParamsBuffer) return;

    const subDt = dt / this.config.substeps;
    const invSubDt = 1.0 / subDt;

    // SimParams layout
    const simData = new ArrayBuffer(64);
    const simFloat = new Float32Array(simData);
    const simUint = new Uint32Array(simData);

    simFloat[0] = subDt;
    simFloat[1] = invSubDt;
    simUint[2] = this.config.substeps;
    simUint[3] = this.topology.numParticles;

    simUint[4] = this.topology.gridWidth;
    simUint[5] = this.topology.gridHeight;
    simFloat[6] = this.config.compliance;
    simFloat[7] = this.config.damping;

    simFloat[8] = this.config.wind[0];
    simFloat[9] = this.config.wind[1];
    simFloat[10] = this.config.wind[2];
    simFloat[11] = 0.0;

    simFloat[12] = this.config.gravity[0];
    simFloat[13] = this.config.gravity[1];
    simFloat[14] = this.config.gravity[2];
    simFloat[15] = 0.0;

    this.device.queue.writeBuffer(this.simParamsBuffer, 0, simData);

    // ColliderParams layout
    const colData = new ArrayBuffer(48);
    const colFloat = new Float32Array(colData);

    const sc = this.config.sphereCollider;
    colFloat[0] = sc.center[0];
    colFloat[1] = sc.center[1];
    colFloat[2] = sc.center[2];
    colFloat[3] = sc.radius;

    const gc = this.config.groundCollider;
    colFloat[4] = 0.0;
    colFloat[5] = 1.0;
    colFloat[6] = 0.0;
    colFloat[7] = gc.height;

    colFloat[8] = sc.friction;
    colFloat[9] = gc.friction;
    colFloat[10] = 0.0;
    colFloat[11] = 0.0;

    this.device.queue.writeBuffer(this.colliderParamsBuffer, 0, colData);
  }

  /**
   * Advances the simulation by dt seconds.
   */
  public step(dt: number = 1 / 60): void {
    if (this.device) {
      this.stepGPU(dt);
    } else {
      this.stepCPU(dt);
    }
  }

  /**
   * Dispatches GPU XPBD sub-steps in a single command buffer pass.
   */
  private stepGPU(dt: number): void {
    if (!this.device || !this.predictPipeline || !this.distancePipeline) return;

    this.updateUniforms(dt);

    const commandEncoder = this.device.createCommandEncoder({ label: 'XPBD Cloth Encoder' });
    const computePass = commandEncoder.beginComputePass({ label: 'XPBD Substep Pass' });

    const particleWorkgroups = Math.ceil(this.topology.numParticles / 64);
    const distanceWorkgroups = Math.ceil(this.topology.numDistanceConstraints / 64);
    const bendingWorkgroups = Math.ceil(this.topology.numDihedralConstraints / 64);

    for (let s = 0; s < this.config.substeps; s++) {
      // 1. Predict
      computePass.setPipeline(this.predictPipeline);
      computePass.setBindGroup(0, this.predictBindGroup!);
      computePass.dispatchWorkgroups(particleWorkgroups);

      // 2. Solve Distance Constraints
      computePass.setPipeline(this.distancePipeline);
      computePass.setBindGroup(0, this.distanceBindGroup!);
      computePass.dispatchWorkgroups(distanceWorkgroups);

      // 3. Solve Dihedral Bending Constraints (if present)
      if (this.topology.numDihedralConstraints > 0 && this.bendingPipeline) {
        computePass.setPipeline(this.bendingPipeline);
        computePass.setBindGroup(0, this.bendingBindGroup!);
        computePass.dispatchWorkgroups(bendingWorkgroups);
      }

      // 4. Collisions
      if (this.collisionPipeline) {
        computePass.setPipeline(this.collisionPipeline);
        computePass.setBindGroup(0, this.collisionBindGroup!);
        computePass.dispatchWorkgroups(particleWorkgroups);
      }
    }

    // 5. Recompute Vertex Normals
    if (this.normalPipeline) {
      computePass.setPipeline(this.normalPipeline);
      computePass.setBindGroup(0, this.normalBindGroup!);
      computePass.dispatchWorkgroups(particleWorkgroups);
    }

    computePass.end();
    this.device.queue.submit([commandEncoder.finish()]);
  }

  /**
   * Headless CPU XPBD implementation for verification and unit testing.
   */
  public stepCPU(dt: number): void {
    const subDt = dt / this.config.substeps;
    const invSubDt = 1.0 / subDt;
    const numP = this.topology.numParticles;

    for (let s = 0; s < this.config.substeps; s++) {
      // 1. Predict Verlet
      for (let i = 0; i < numP; i++) {
        const invM = this.cpuPositions[i * 4 + 3];
        if (invM <= 0.0) continue;

        // Save prev
        this.cpuPrevPositions[i * 4 + 0] = this.cpuPositions[i * 4 + 0];
        this.cpuPrevPositions[i * 4 + 1] = this.cpuPositions[i * 4 + 1];
        this.cpuPrevPositions[i * 4 + 2] = this.cpuPositions[i * 4 + 2];

        // Velocity damping & acceleration
        const dampingFactor = Math.max(0.0, 1.0 - this.config.damping);
        let vx = this.cpuVelocities[i * 4 + 0] * dampingFactor + (this.config.gravity[0] + this.config.wind[0]) * subDt;
        let vy = this.cpuVelocities[i * 4 + 1] * dampingFactor + (this.config.gravity[1] + this.config.wind[1]) * subDt;
        let vz = this.cpuVelocities[i * 4 + 2] * dampingFactor + (this.config.gravity[2] + this.config.wind[2]) * subDt;

        this.cpuVelocities[i * 4 + 0] = vx;
        this.cpuVelocities[i * 4 + 1] = vy;
        this.cpuVelocities[i * 4 + 2] = vz;

        // Predict
        this.cpuPositions[i * 4 + 0] += vx * subDt;
        this.cpuPositions[i * 4 + 1] += vy * subDt;
        this.cpuPositions[i * 4 + 2] += vz * subDt;
      }

      // 2. Solve Distance Constraints with XPBD compliance
      const numC = this.topology.numDistanceConstraints;
      const cBuf = this.topology.distanceConstraints;

      for (let i = 0; i < numC; i++) {
        const p1 = Math.round(cBuf[i * 4 + 0]);
        const p2 = Math.round(cBuf[i * 4 + 1]);
        const restLen = cBuf[i * 4 + 2];
        const compliance = cBuf[i * 4 + 3];

        const w1 = this.cpuPositions[p1 * 4 + 3];
        const w2 = this.cpuPositions[p2 * 4 + 3];
        const wSum = w1 + w2;
        if (wSum <= 1e-7) continue;

        const dx = this.cpuPositions[p1 * 4 + 0] - this.cpuPositions[p2 * 4 + 0];
        const dy = this.cpuPositions[p1 * 4 + 1] - this.cpuPositions[p2 * 4 + 1];
        const dz = this.cpuPositions[p1 * 4 + 2] - this.cpuPositions[p2 * 4 + 2];
        const currentLen = Math.hypot(dx, dy, dz);
        if (currentLen <= 1e-7) continue;

        const C = currentLen - restLen;
        const alphaTilde = compliance * invSubDt * invSubDt;
        const deltaLambda = -C / (wSum + alphaTilde);

        const nx = dx / currentLen;
        const ny = dy / currentLen;
        const nz = dz / currentLen;

        if (w1 > 0.0) {
          this.cpuPositions[p1 * 4 + 0] += nx * w1 * deltaLambda;
          this.cpuPositions[p1 * 4 + 1] += ny * w1 * deltaLambda;
          this.cpuPositions[p1 * 4 + 2] += nz * w1 * deltaLambda;
        }
        if (w2 > 0.0) {
          this.cpuPositions[p2 * 4 + 0] -= nx * w2 * deltaLambda;
          this.cpuPositions[p2 * 4 + 1] -= ny * w2 * deltaLambda;
          this.cpuPositions[p2 * 4 + 2] -= nz * w2 * deltaLambda;
        }
      }

      // 3. Collisions & Velocity Update
      for (let i = 0; i < numP; i++) {
        const invM = this.cpuPositions[i * 4 + 3];
        if (invM <= 0.0) continue;

        // Ground collision
        const groundY = this.config.groundCollider.height;
        if (this.cpuPositions[i * 4 + 1] < groundY) {
          this.cpuPositions[i * 4 + 1] = groundY;
        }

        // Sphere collision
        const sc = this.config.sphereCollider;
        const sx = this.cpuPositions[i * 4 + 0] - sc.center[0];
        const sy = this.cpuPositions[i * 4 + 1] - sc.center[1];
        const sz = this.cpuPositions[i * 4 + 2] - sc.center[2];
        const sDist = Math.hypot(sx, sy, sz);
        if (sDist < sc.radius && sDist > 1e-6) {
          const push = sc.radius - sDist;
          this.cpuPositions[i * 4 + 0] += (sx / sDist) * push;
          this.cpuPositions[i * 4 + 1] += (sy / sDist) * push;
          this.cpuPositions[i * 4 + 2] += (sz / sDist) * push;
        }

        // Recompute velocity from displacement
        this.cpuVelocities[i * 4 + 0] = (this.cpuPositions[i * 4 + 0] - this.cpuPrevPositions[i * 4 + 0]) * invSubDt;
        this.cpuVelocities[i * 4 + 1] = (this.cpuPositions[i * 4 + 1] - this.cpuPrevPositions[i * 4 + 1]) * invSubDt;
        this.cpuVelocities[i * 4 + 2] = (this.cpuPositions[i * 4 + 2] - this.cpuPrevPositions[i * 4 + 2]) * invSubDt;
      }
    }
  }

  public getPositionsBuffer(): GPUBuffer | null {
    return this.positionsBuffer;
  }

  public getNormalsBuffer(): GPUBuffer | null {
    return this.normalsBuffer;
  }

  public dispose(): void {
    if (this.positionsBuffer) {
      this.positionsBuffer.destroy();
      this.positionsBuffer = null;
    }
    if (this.prevPositionsBuffer) {
      this.prevPositionsBuffer.destroy();
      this.prevPositionsBuffer = null;
    }
    if (this.velocitiesBuffer) {
      this.velocitiesBuffer.destroy();
      this.velocitiesBuffer = null;
    }
    if (this.normalsBuffer) {
      this.normalsBuffer.destroy();
      this.normalsBuffer = null;
    }
    if (this.distanceConstraintsBuffer) {
      this.distanceConstraintsBuffer.destroy();
      this.distanceConstraintsBuffer = null;
    }
    if (this.dihedralConstraintsBuffer) {
      this.dihedralConstraintsBuffer.destroy();
      this.dihedralConstraintsBuffer = null;
    }
    if (this.simParamsBuffer) {
      this.simParamsBuffer.destroy();
      this.simParamsBuffer = null;
    }
    if (this.colliderParamsBuffer) {
      this.colliderParamsBuffer.destroy();
      this.colliderParamsBuffer = null;
    }
  }
}
