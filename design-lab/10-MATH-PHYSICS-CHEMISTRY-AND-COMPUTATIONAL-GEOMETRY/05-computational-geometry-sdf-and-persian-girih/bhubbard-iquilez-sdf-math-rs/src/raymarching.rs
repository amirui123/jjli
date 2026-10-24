//! Sphere tracing, ray marching, normal estimation, ambient occlusion, and soft shadows.

use glam::{Vec2, Vec3};

/// A 3D ray with starting origin and unit direction vector.
#[derive(Debug, Clone, Copy, PartialEq)]
pub struct Ray {
    /// Ray origin point.
    pub origin: Vec3,
    /// Unit ray direction vector.
    pub direction: Vec3,
}

impl Ray {
    /// Create a new ray. `direction` will be normalized.
    #[inline]
    pub fn new(origin: Vec3, direction: Vec3) -> Self {
        Self {
            origin,
            direction: direction.normalize(),
        }
    }

    /// Point along the ray at distance `t`.
    #[inline]
    pub fn point_at(&self, t: f32) -> Vec3 {
        self.origin + self.direction * t
    }
}

/// Configuration settings for sphere tracing.
#[derive(Debug, Clone, Copy)]
pub struct RayMarchConfig {
    /// Minimum tracing distance.
    pub min_dist: f32,
    /// Maximum tracing distance.
    pub max_dist: f32,
    /// Maximum number of march steps.
    pub max_steps: usize,
    /// Surface hit threshold epsilon.
    pub epsilon: f32,
}

impl Default for RayMarchConfig {
    fn default() -> Self {
        Self {
            min_dist: 0.01,
            max_dist: 50.0,
            max_steps: 128,
            epsilon: 1e-4,
        }
    }
}

/// The result of a sphere tracing operation.
#[derive(Debug, Clone, Copy, PartialEq)]
pub struct RayMarchHit {
    /// True if an SDF surface was struck.
    pub hit: bool,
    /// Total distance traversed along the ray.
    pub distance: f32,
    /// Exact 3D point of contact on the surface.
    pub position: Vec3,
    /// Surface unit normal vector at the hit point.
    pub normal: Vec3,
    /// Number of steps taken during the march.
    pub steps: usize,
}

/// Sphere trace a ray through an arbitrary SDF scene.
///
/// Implements standard sphere tracing:
/// $$t_{i+1} = t_i + \text{scene}(p)$$
pub fn ray_march<F>(ray: &Ray, scene_sdf: F, config: &RayMarchConfig) -> RayMarchHit
where
    F: Fn(Vec3) -> f32,
{
    let mut t = config.min_dist;
    let mut steps = 0;

    while t < config.max_dist && steps < config.max_steps {
        steps += 1;
        let pos = ray.point_at(t);
        let dist = scene_sdf(pos);

        if dist < config.epsilon {
            let normal = estimate_normal(pos, &scene_sdf, config.epsilon * 2.0);
            return RayMarchHit {
                hit: true,
                distance: t,
                position: pos,
                normal,
                steps,
            };
        }

        t += dist;
    }

    RayMarchHit {
        hit: false,
        distance: t,
        position: ray.point_at(t),
        normal: Vec3::ZERO,
        steps,
    }
}

/// Estimate surface normal using Inigo Quilez's tetrahedron technique ($O(4)$ SDF queries).
///
/// Uses four tetrahedron vertices to calculate gradient with minimal queries:
/// $$k_0 = (1, -1, -1), k_1 = (-1, -1, 1), k_2 = (-1, 1, -1), k_3 = (1, 1, 1)$$
/// $$N = \sum_{i=0}^3 k_i \cdot \text{scene}(p + k_i \cdot \epsilon)$$
pub fn estimate_normal<F>(p: Vec3, scene_sdf: &F, eps: f32) -> Vec3
where
    F: Fn(Vec3) -> f32,
{
    let k0 = Vec3::new(1.0, -1.0, -1.0);
    let k1 = Vec3::new(-1.0, -1.0, 1.0);
    let k2 = Vec3::new(-1.0, 1.0, -1.0);
    let k3 = Vec3::new(1.0, 1.0, 1.0);

    let grad = k0 * scene_sdf(p + k0 * eps)
        + k1 * scene_sdf(p + k1 * eps)
        + k2 * scene_sdf(p + k2 * eps)
        + k3 * scene_sdf(p + k3 * eps);

    let len = grad.length();
    if len > 1e-12 {
        grad / len
    } else {
        Vec3::Y
    }
}

/// Compute ambient occlusion along the surface normal vector.
///
/// Samples the distance field at successive steps away from the surface.
/// If geometry is nearby, sampled distance will be less than step offset, darkening the surface.
pub fn ambient_occlusion<F>(p: Vec3, normal: Vec3, scene_sdf: &F, step_size: f32, num_samples: usize) -> f32
where
    F: Fn(Vec3) -> f32,
{
    let mut occ = 0.0;
    let mut weight = 1.0;

    for i in 1..=num_samples {
        let h = (i as f32) * step_size;
        let d = scene_sdf(p + normal * h);
        occ += (h - d) * weight;
        weight *= 0.5;
    }

    (1.0 - (occ * 1.5).clamp(0.0, 1.0)).max(0.0)
}

/// Compute penumbra soft shadow factor towards a light source.
///
/// Implements Inigo Quilez's improved soft shadow cone tracing without shadow-acne band artifacts:
/// Returns a scalar factor in $[0.0, 1.0]$ where 1.0 is fully lit and 0.0 is fully in shadow.
pub fn soft_shadow<F>(
    ray_origin: Vec3,
    light_dir: Vec3,
    min_dist: f32,
    max_dist: f32,
    softness_k: f32,
    scene_sdf: &F,
) -> f32
where
    F: Fn(Vec3) -> f32,
{
    let mut res: f32 = 1.0;
    let mut t = min_dist;
    let mut ph = 1e10f32;

    while t < max_dist {
        let h = scene_sdf(ray_origin + light_dir * t);
        if h < 0.001 {
            return 0.0;
        }
        let term = if ph < 1e9 && h < 1.99 * ph {
            let y = (h * h) / (2.0 * ph);
            if y < h && t > y {
                let d = (h * h - y * y).max(0.0).sqrt();
                (softness_k * d / (t - y)).min(softness_k * h / t)
            } else {
                softness_k * h / t
            }
        } else {
            softness_k * h / t
        };
        res = res.min(term);
        ph = h;
        t += h.max(0.01);
    }

    res.clamp(0.0, 1.0)
}

/// Perspective pinhole camera for generating rays into the scene.
#[derive(Debug, Clone, Copy)]
pub struct Camera {
    pub eye: Vec3,
    pub target: Vec3,
    pub up: Vec3,
    pub fov_y_rad: f32,
    pub aspect_ratio: f32,
}

impl Camera {
    /// Create a new camera.
    pub fn new(eye: Vec3, target: Vec3, up: Vec3, fov_deg: f32, aspect_ratio: f32) -> Self {
        Self {
            eye,
            target,
            up: up.normalize(),
            fov_y_rad: fov_deg.to_radians(),
            aspect_ratio,
        }
    }

    /// Generate ray for normalized device coordinate `ndc` in $[-1, 1]$.
    pub fn get_ray(&self, ndc: Vec2) -> Ray {
        let forward = (self.target - self.eye).normalize();
        let right = forward.cross(self.up).normalize();
        let up = right.cross(forward).normalize();

        let half_height = (self.fov_y_rad * 0.5).tan();
        let half_width = half_height * self.aspect_ratio;

        let dir = (forward + right * (ndc.x * half_width) + up * (ndc.y * half_height)).normalize();
        Ray::new(self.eye, dir)
    }
}
