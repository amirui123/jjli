class_name Impact
extends RefCounted

## Impact sparks, built in code so there is no scene to keep in sync and nothing
## to import when you drop this into your own project.
##
## The one thing worth copying here is the DIRECTION. Sparks that fly out along
## the strike vector read as "the sword did this". Sparks that puff out in a
## circle read as "something happened here". Same particle count, completely
## different sentence.
##
## CPUParticles2D on purpose, not GPUParticles2D. GPU particles interpolate on
## the render thread, and toggling Engine.time_scale between 0 and 1 (which is
## what the EVERYTHING freeze style does) makes them jitter. CPU particles are
## fine at these counts and behave under any time scale.

const COUNT := 14

## Radians either side of the strike vector. A cone, not a puff.
const SPREAD := 0.62

const MIN_SPEED := 90.0
const MAX_SPEED := 280.0
const MIN_LIFE := 0.22
const MAX_LIFE := 0.5
const GRAVITY := 260.0


## Spawn one burst and let it free itself when it is done.
##
## `direction` points the way the hit was travelling, so pass the same vector the
## knockback used.
static func burst(parent: Node, position: Vector2, direction: Vector2) -> void:
	if parent == null:
		return
	var particles := CPUParticles2D.new()
	particles.position = position
	particles.emitting = false
	particles.one_shot = true
	particles.explosiveness = 1.0
	particles.amount = COUNT
	particles.lifetime = MAX_LIFE
	particles.direction = direction.normalized()
	particles.spread = rad_to_deg(SPREAD)
	particles.initial_velocity_min = MIN_SPEED
	particles.initial_velocity_max = MAX_SPEED
	particles.gravity = Vector2(0.0, GRAVITY)
	particles.damping_min = 120.0
	particles.damping_max = 260.0
	particles.scale_amount_min = 1.5
	particles.scale_amount_max = 3.5
	# Bright at the moment of impact, dark by the time it lands. A spark that
	# stays the same colour for its whole life reads as confetti.
	var ramp := Gradient.new()
	ramp.set_color(0, Color(1.0, 0.96, 0.75, 1.0))
	ramp.set_color(1, Color(0.78, 0.32, 0.15, 0.0))
	particles.color_ramp = ramp
	parent.add_child(particles)
	particles.emitting = true

	# Free the node once the last particle is gone, rather than leaving a pile of
	# finished emitters in the tree.
	var timer := parent.get_tree().create_timer(MAX_LIFE + 0.2, true, false, true)
	timer.timeout.connect(func() -> void:
		if is_instance_valid(particles):
			particles.queue_free()
	)
