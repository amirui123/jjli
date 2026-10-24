//! CSG Combinators, smooth blending, and spatial domain transformations.

use glam::{Vec2, Vec3};

/// Constructive Solid Geometry (CSG) boolean union: $\min(d_1, d_2)$.
#[inline]
pub fn union(d1: f32, d2: f32) -> f32 {
    d1.min(d2)
}

/// CSG boolean subtraction: carves shape 1 out of shape 2: $\max(-d_1, d_2)$.
#[inline]
pub fn subtraction(d1: f32, d2: f32) -> f32 {
    (-d1).max(d2)
}

/// CSG boolean intersection: $\max(d_1, d_2)$.
#[inline]
pub fn intersection(d1: f32, d2: f32) -> f32 {
    d1.max(d2)
}

/// Polynomial smooth minimum between two distances with smoothing radius `k`.
///
/// Implements Inigo Quilez's quadratic smooth minimum:
/// $$h = \max(k - |a - b|, 0) / k$$
/// $$\text{smin}(a, b, k) = \min(a, b) - h^2 \cdot k \cdot 0.25$$
#[inline]
pub fn smin(a: f32, b: f32, k: f32) -> f32 {
    if k <= 1e-6 {
        return a.min(b);
    }
    let h = (k - (a - b).abs()).max(0.0) / k;
    a.min(b) - h * h * k * 0.25
}

/// Polynomial smooth maximum with smoothing factor `k`.
///
/// $$h = \max(k - |a - b|, 0) / k$$
/// $$\text{smax}(a, b, k) = \max(a, b) + h^2 \cdot k \cdot 0.25$$
#[inline]
pub fn smax(a: f32, b: f32, k: f32) -> f32 {
    if k <= 1e-6 {
        return a.max(b);
    }
    let h = (k - (a - b).abs()).max(0.0) / k;
    a.max(b) + h * h * k * 0.25
}

/// Smooth subtraction of distance `d1` from `d2` with blending factor `k`.
#[inline]
pub fn smooth_subtraction(d1: f32, d2: f32, k: f32) -> f32 {
    smax(-d1, d2, k)
}

/// Smooth intersection of two distance fields with blending factor `k`.
#[inline]
pub fn smooth_intersection(d1: f32, d2: f32, k: f32) -> f32 {
    smax(d1, d2, k)
}

/// Infinite domain repetition in 3D: tiles space with cell period `c`.
#[inline]
pub fn repeat(p: Vec3, c: Vec3) -> Vec3 {
    p - c * (p / c).round()
}

/// Infinite domain repetition in 2D: tiles space with cell period `c`.
#[inline]
pub fn repeat2d(p: Vec2, c: Vec2) -> Vec2 {
    p - c * (p / c).round()
}

/// Finite domain repetition in 3D: limits replication count within $[-l, l]$ cells.
#[inline]
pub fn repeat_finite(p: Vec3, c: Vec3, l: Vec3) -> Vec3 {
    let q = (p / c).round().clamp(-l, l);
    p - c * q
}

/// Twists space around the Y-axis proportional to height: $k$ controls rate of twist.
#[inline]
pub fn twist(p: Vec3, k: f32) -> Vec3 {
    let angle = k * p.y;
    let cos_a = angle.cos();
    let sin_a = angle.sin();
    Vec3::new(
        cos_a * p.x - sin_a * p.z,
        p.y,
        sin_a * p.x + cos_a * p.z,
    )
}

/// Bends space along the X-axis around the Y-axis.
#[inline]
pub fn bend(p: Vec3, k: f32) -> Vec3 {
    let angle = k * p.x;
    let cos_a = angle.cos();
    let sin_a = angle.sin();
    Vec3::new(
        cos_a * p.x - sin_a * p.y,
        sin_a * p.x + cos_a * p.y,
        p.z,
    )
}

/// Harmonic trigonometric displacement noise for adding organic or porous textures.
#[inline]
pub fn displacement_noise(p: Vec3, freq: f32, amp: f32) -> f32 {
    amp * (freq * p.x).sin() * (freq * p.y).sin() * (freq * p.z).sin()
}
