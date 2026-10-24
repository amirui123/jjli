extends Node2D

## The room. It owns the effects that belong to the world rather than to either
## fighter: the sparks, the floating number, and the sound.
##
## It knows nothing about the player. It listens for one signal.
##
## That is worth more than it looks. The attack code says "a hit landed, here,
## going that way" and stops caring. Every reaction after that is a script that
## subscribes. Adding a freeze frame, a controller rumble or a slow motion effect
## later means writing that one thing, never opening player.gd again.

func _ready() -> void:
	GameFeel.hit_landed.connect(_on_hit_landed)


func _on_hit_landed(position: Vector2, direction: Vector2) -> void:
	if GameFeel.sparks_enabled:
		# Spawn on the near face of the target, not at its centre, so the sparks
		# look like they came off the surface the blade touched.
		Impact.burst(self, position - direction.normalized() * 12.0, direction)
	if GameFeel.reaction_enabled:
		DamageNumber.spawn(self, position - Vector2(0.0, 14.0), randi_range(7, 11))
	if GameFeel.sound_enabled:
		HitSound.play(self)
