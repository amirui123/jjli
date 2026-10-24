# sdf-math-rs

[![Deploy GitHub Pages](https://github.com/bhubbard/sdf-math-rs/actions/workflows/pages.yml/badge.svg)](https://github.com/bhubbard/sdf-math-rs/actions/workflows/pages.yml)
[![GitHub Pages](https://img.shields.io/badge/Live_Visualizer-GitHub_Pages-blue?style=flat&logo=github)](https://code.brandonhubbard.com/sdf-math-rs/)
[![License: MIT OR Apache-2.0](https://img.shields.io/badge/License-MIT%20OR%20Apache--2.0-blue.svg)](LICENSE)
[![Rust: Edition 2024](https://img.shields.io/badge/Rust-2024_Edition-orange?logo=rust)](https://www.rust-lang.org/)

A pure Rust implementation of 2D and 3D Signed Distance Fields (SDF), Constructive Solid Geometry (CSG), polynomial smooth blending, spatial domain transformations, and sphere tracing ray marching algorithms based on the mathematical research of **Inigo Quilez**.

✨ **[Live Interactive 2D/3D SDF & Ray Marching Visualizer](https://code.brandonhubbard.com/sdf-math-rs/)** (or [GitHub Pages mirror](https://bhubbard.github.io/sdf-math-rs/))

---

## Features

- **2D Distance Functions (`src/sdf2d.rs`)**:
  - `circle(p, r)`: Euclidean circle centered at origin.
  - `box2d(p, b)`: Axis-aligned box with half-extents $b$.
  - `oriented_box(p, a, b, th)`: Arbitrarily rotated box from point $a$ to $b$ with thickness $th$.
  - `segment(p, a, b)`: Distance to 1D line segment.
  - `capsule2d(p, a, b, r)`: 2D stadium / capsule.
  - `equilateral_triangle(p, r)`: Inigo Quilez exact equilateral triangle distance.
  - `rounded_box2d(p, b, r)`: Box with rounded corners.
  - `ring(p, r, th)`: Annulus ring with radius and wall thickness.
- **3D Distance Functions (`src/sdf3d.rs`)**:
  - `sphere(p, r)`: Euclidean sphere.
  - `box3d(p, b)`: Axis-aligned 3D cuboid.
  - `rounded_box(p, b, r)`: Box with continuous rounded edges.
  - `torus(p, t)`: Torus in XZ plane with major radius $t_x$ and minor radius $t_y$.
  - `capped_cylinder(p, h, r)`: Cylinder along Y-axis with half-height $h$ and radius $r$.
  - `capsule3d(p, a, b, r)`: 3D capsule segment.
  - `cone(p, r, h)`: Exact distance to cone with base radius $r$ and height $h$.
  - `plane(p, n, h)`: Infinite oriented plane with normal $n$ and offset $h$.
  - `ellipsoid(p, r)`: Semi-axes bounding ellipsoid.
- **CSG Combinators & Domain Operations (`src/ops.rs`)**:
  - Boolean CSG: `union` ($\min$), `subtraction` ($\max(-d_1, d_2)$), `intersection` ($\max$).
  - Polynomial Smooth Minimum (`smin(a, b, k)`):
    $$h = \max(k - |a - b|, 0) / k$$
    $$\text{smin}(a, b, k) = \min(a, b) - h^2 \cdot k \cdot 0.25$$
  - Polynomial Smooth Maximum (`smax(a, b, k)`), `smooth_subtraction`, and `smooth_intersection`.
  - Domain tiling: `repeat(p, c)` and `repeat_finite(p, c, l)`.
  - Non-linear transforms: `twist(p, k)` and `bend(p, k)`.
  - Harmonic trigonometric noise displacement: `displacement_noise(p, freq, amp)`.
- **Ray Marching & Shading Engine (`src/raymarching.rs`)**:
  - Sphere tracing algorithm: $t_{i+1} = t_i + \text{scene}(p)$.
  - Surface normal estimation using Inigo Quilez's **tetrahedron gradient** ($O(4)$ distance queries instead of 6).
  - Ambient Occlusion (AO) estimation along surface normal vectors.
  - Penumbra soft shadow cone tracing without band artifacts.

---

## Quick Start

Add to your `Cargo.toml`:

```toml
[dependencies]
sdf-math-rs = { git = "https://github.com/bhubbard/sdf-math-rs" }
glam = "0.29"
```

### 1. Evaluating 2D & 3D Signed Distance Fields

```rust
use glam::{Vec2, Vec3};
use sdf_math_rs::{sdf2d, sdf3d, ops};

fn main() {
    // 2D distance to a rounded box
    let p2 = Vec2::new(1.2, 0.5);
    let d2 = sdf2d::rounded_box2d(p2, Vec2::new(1.0, 0.8), 0.2);
    println!("2D Box Distance: {d2}");

    // 3D smooth blending of a sphere and a torus
    let p3 = Vec3::new(0.5, 0.2, 0.0);
    let d_sphere = sdf3d::sphere(p3, 1.0);
    let d_torus = sdf3d::torus(p3, Vec2::new(1.2, 0.3));
    
    // Smooth union blending with radius k = 0.3
    let blended = ops::smin(d_sphere, d_torus, 0.3);
    println!("Smooth Blended CSG: {blended}");
}
```

### 2. Ray Marching & Sphere Tracing a Scene

```rust
use glam::Vec3;
use sdf_math_rs::{
    ray_march, Camera, RayMarchConfig,
    sdf3d::{plane, sphere},
    ops::smin,
};

fn main() {
    // Define an SDF scene closure
    let scene = |p: Vec3| {
        let s1 = sphere(p - Vec3::new(0.0, 1.0, 0.0), 1.0);
        let s2 = sphere(p - Vec3::new(0.8, 1.2, 0.0), 0.7);
        let blended_spheres = smin(s1, s2, 0.4);
        let ground = plane(p, Vec3::Y, 0.0);
        blended_spheres.min(ground)
    };

    // Setup camera
    let cam = Camera::new(
        Vec3::new(0.0, 2.0, 4.0), // Eye position
        Vec3::new(0.0, 1.0, 0.0), // Target
        Vec3::Y,                  // Up vector
        60.0,                     // FOV degrees
        16.0 / 9.0,               // Aspect ratio
    );

    // Cast a ray through screen center (0, 0)
    let ray = cam.get_ray(glam::Vec2::ZERO);
    let config = RayMarchConfig::default();

    let hit = ray_march(&ray, scene, &config);
    if hit.hit {
        println!("Surface hit at distance: {:.3}", hit.distance);
        println!("Hit coordinate: {:?}", hit.position);
        println!("Estimated normal: {:?}", hit.normal);
    }
}
```

---

## Interactive Visualizer

The included web visualizer in `docs/index.html` showcases:
- **3D Ray Marching**: Real-time sphere tracing with smooth union blending ($k$ slider), twist deformation, displacement noise, azimuth light rotation, ambient occlusion, and soft shadow penumbras.
- **2D Contour Field**: Exact Inigo Quilez distance coloring (orange exterior, cyan interior, white zero-contour), animated wave pulses, and interactive mouse tangent clearance circles.

Try it in your browser: **[https://code.brandonhubbard.com/sdf-math-rs/](https://code.brandonhubbard.com/sdf-math-rs/)**

---

## License

Dual-licensed under either:
- Apache License, Version 2.0 ([LICENSE-APACHE](LICENSE-APACHE) or http://www.apache.org/licenses/LICENSE-2.0)
- MIT license ([LICENSE-MIT](LICENSE-MIT) or http://opensource.org/licenses/MIT)
