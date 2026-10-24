# XPBD Graph Coloring & Multi-Pass WebGPU Architecture

## 1. Problem Statement: Gauss-Seidel Race Conditions
When solving distance and bending constraints on modern GPUs in parallel, two threads modifying positions of adjacent particles that share an edge create a non-deterministic race condition.

## 2. Graph Coloring Solution
By partitioning the dual constraint graph into **independent sets** using the **Welsh-Powell algorithm**, no two constraints in the same color batch share a particle. Each color batch can be safely executed in parallel across hundreds of WebGPU compute workgroups with **zero atomic locks** and **zero write collisions**.

## 3. Chebyshev Semi-Iterative Acceleration
Dynamic Successive Over-Relaxation (SOR) with Chebyshev recurrence:
$$\omega^{(k+1)} = \frac{1}{1 - \frac{1}{4}\rho^2 \omega^{(k)}}$$
Accelerates XPBD convergence by 35–45% while preserving energy conservation.
