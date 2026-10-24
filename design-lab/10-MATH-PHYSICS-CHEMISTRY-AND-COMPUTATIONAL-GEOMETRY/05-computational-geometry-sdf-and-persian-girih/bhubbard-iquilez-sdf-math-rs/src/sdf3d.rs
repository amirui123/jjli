//! 3D Signed Distance Fields (SDF) based on Inigo Quilez's distance functions.

use glam::{Vec2, Vec3};

/// Signed distance to a sphere centered at origin with radius `r`.
#[inline]
pub fn sphere(p: Vec3, r: f32) -> f32 {
    p.length() - r
}

/// Signed distance to an axis-aligned 3D box centered at origin with half-extents `b`.
#[inline]
pub fn box3d(p: Vec3, b: Vec3) -> f32 {
    let q = p.abs() - b;
    q.max(Vec3::ZERO).length() + q.x.max(q.y.max(q.z)).min(0.0)
}

/// Signed distance to a rounded box with corner radius `r` and half-extents `b`.
#[inline]
pub fn rounded_box(p: Vec3, b: Vec3, r: f32) -> f32 {
    let q = p.abs() - b + Vec3::splat(r);
    q.max(Vec3::ZERO).length() + q.x.max(q.y.max(q.z)).min(0.0) - r
}

/// Signed distance to a torus lying in the XZ plane.
/// `t.x` is the major radius (center of the tube to center of the torus).
/// `t.y` is the minor radius (radius of the tube).
#[inline]
pub fn torus(p: Vec3, t: Vec2) -> f32 {
    let q = Vec2::new(Vec2::new(p.x, p.z).length() - t.x, p.y);
    q.length() - t.y
}

/// Signed distance to a capped cylinder aligned along the Y axis.
/// `h` is half the height, `r` is the radius.
#[inline]
pub fn capped_cylinder(p: Vec3, h: f32, r: f32) -> f32 {
    let d = Vec2::new(Vec2::new(p.x, p.z).length(), p.y.abs()) - Vec2::new(r, h);
    d.max(Vec2::ZERO).length() + d.x.max(d.y).min(0.0)
}

/// Signed distance to a 3D line segment / capsule between points `a` and `b` with radius `r`.
#[inline]
pub fn capsule3d(p: Vec3, a: Vec3, b: Vec3, r: f32) -> f32 {
    let pa = p - a;
    let ba = b - a;
    let len_sq = ba.length_squared();
    let h = if len_sq > 1e-12 {
        (pa.dot(ba) / len_sq).clamp(0.0, 1.0)
    } else {
        0.0
    };
    (pa - ba * h).length() - r
}

/// Signed distance to a cone with base radius `r` and height `h`.
/// The cone apex is at origin (0, 0, 0) opening downward along -Y towards base at y = -h.
#[inline]
pub fn cone(p: Vec3, r: f32, h: f32) -> f32 {
    // Inigo Quilez exact cone
    let q = Vec2::new(Vec2::new(p.x, p.z).length(), p.y);
    let tip = Vec2::ZERO;
    let base = Vec2::new(r, -h);

    let k = Vec2::new(r, h);
    let m2 = k.length_squared();

    let d1 = q - tip;
    let _d2 = q - base;
    let d3 = q - Vec2::new((q.x).clamp(0.0, r), -h);

    // Segment distance to side slope
    let ba = base - tip;
    let u = (d1.dot(ba) / m2).clamp(0.0, 1.0);
    let side_dist = (d1 - ba * u).length();
    let cap_dist = d3.length();

    let dist = side_dist.min(cap_dist);

    // Inside test
    let inside = q.y <= 0.0 && q.y >= -h && (q.x * h + q.y * r <= 0.0);
    if inside {
        -dist
    } else {
        dist
    }
}

/// Signed distance to an infinite plane with unit normal `n` and offset `h`.
/// $d = (p \cdot n) + h$.
#[inline]
pub fn plane(p: Vec3, n: Vec3, h: f32) -> f32 {
    p.dot(n) + h
}

/// Signed distance to an ellipsoid with semi-axes `r`.
#[inline]
pub fn ellipsoid(p: Vec3, r: Vec3) -> f32 {
    let k0 = (p / r).length();
    let k1 = (p / (r * r)).length();
    k0 * (k0 - 1.0) / k1
}
