//! # sdf-math-rs
//!
//! A pure Rust implementation of 2D & 3D Signed Distance Fields (SDF), Constructive Solid
//! Geometry (CSG), polynomial smooth blending, domain transformations, and ray marching /
//! sphere tracing algorithms based on the mathematical research of **Inigo Quilez**.
//!
//! ## Modules
//!
//! - [`sdf2d`]: 2D distance functions: `circle`, `box2d`, `oriented_box`, `segment`, `capsule2d`, `equilateral_triangle`, `rounded_box2d`, `ring`.
//! - [`sdf3d`]: 3D distance functions: `sphere`, `box3d`, `rounded_box`, `torus`, `capped_cylinder`, `capsule3d`, `cone`, `plane`, `ellipsoid`.
//! - [`ops`]: CSG operations (`union`, `subtraction`, `intersection`), smooth blending (`smin`, `smax`, `smooth_subtraction`, `smooth_intersection`), and domain transforms (`repeat`, `twist`, `bend`, `displacement_noise`).
//! - [`raymarching`]: Sphere tracing engine (`ray_march`), tetrahedron normal estimation (`estimate_normal`), ambient occlusion (`ambient_occlusion`), and soft shadow cone tracing (`soft_shadow`).

pub mod ops;
pub mod raymarching;
pub mod sdf2d;
pub mod sdf3d;

// Re-export glam types for convenience
pub use glam::{Vec2, Vec3};

// Re-export primary operators and raymarching constructs
pub use ops::{
    bend, displacement_noise, intersection, repeat, repeat2d, repeat_finite, smax, smin,
    smooth_intersection, smooth_subtraction, subtraction, twist, union,
};
pub use raymarching::{
    ambient_occlusion, estimate_normal, ray_march, soft_shadow, Camera, Ray, RayMarchConfig,
    RayMarchHit,
};
