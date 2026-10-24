//! 2D Signed Distance Fields (SDF) based on Inigo Quilez's distance functions.

use glam::Vec2;

/// Signed distance to a circle centered at origin with radius `r`.
/// Returns negative inside, positive outside, and zero on the boundary.
#[inline]
pub fn circle(p: Vec2, r: f32) -> f32 {
    p.length() - r
}

/// Signed distance to an axis-aligned box centered at origin with half-extents `b`.
#[inline]
pub fn box2d(p: Vec2, b: Vec2) -> f32 {
    let d = p.abs() - b;
    d.max(Vec2::ZERO).length() + d.x.max(d.y).min(0.0)
}

/// Signed distance to a box with custom orientation and thickness between points `a` and `b`.
/// `th` is the full thickness (width) perpendicular to the segment [a, b].
#[inline]
pub fn oriented_box(p: Vec2, a: Vec2, b: Vec2, th: f32) -> f32 {
    let l = (b - a).length();
    if l <= 1e-6 {
        return circle(p - a, th * 0.5);
    }
    let d = (b - a) / l;
    let q = p - (a + b) * 0.5;
    // Rotate into segment local frame: [d, (-d.y, d.x)]
    let local = Vec2::new(d.x * q.x + d.y * q.y, -d.y * q.x + d.x * q.y);
    let h = Vec2::new(l * 0.5, th * 0.5);
    box2d(local, h)
}

/// Distance to a 1D line segment between endpoints `a` and `b`.
#[inline]
pub fn segment(p: Vec2, a: Vec2, b: Vec2) -> f32 {
    let pa = p - a;
    let ba = b - a;
    let len_sq = ba.length_squared();
    let h = if len_sq > 1e-12 {
        (pa.dot(ba) / len_sq).clamp(0.0, 1.0)
    } else {
        0.0
    };
    (pa - ba * h).length()
}

/// Signed distance to a 2D capsule (stadium) between points `a` and `b` with radius `r`.
#[inline]
pub fn capsule2d(p: Vec2, a: Vec2, b: Vec2, r: f32) -> f32 {
    segment(p, a, b) - r
}

/// Signed distance to an equilateral triangle with inscribed radius `r`.
/// Based on Inigo Quilez's exact equilateral triangle distance function.
#[inline]
pub fn equilateral_triangle(mut p: Vec2, r: f32) -> f32 {
    let k = 3.0f32.sqrt();
    p.x = p.x.abs() - r;
    p.y += r / k;
    if p.x + k * p.y > 0.0 {
        p = Vec2::new(p.x - k * p.y, -k * p.x - p.y) * 0.5;
    }
    p.x -= p.x.clamp(-2.0 * r, 0.0);
    -p.length() * p.y.signum()
}

/// Signed distance to a rounded box with corner radius `r`.
#[inline]
pub fn rounded_box2d(p: Vec2, b: Vec2, r: f32) -> f32 {
    box2d(p, b - Vec2::splat(r)) - r
}

/// Signed distance to a ring / annulus with radius `r` and thickness `th`.
#[inline]
pub fn ring(p: Vec2, r: f32, th: f32) -> f32 {
    (p.length() - r).abs() - th * 0.5
}
