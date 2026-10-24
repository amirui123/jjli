extends Node

## GameFeel - the three numbers this lab is about, the freeze, and the trauma.
##
## Autoloaded as `GameFeel` (see project.godot), so the player, the enemy, the
## camera and the slider panel all read one source of truth. Change a value here
## and every hit in the game changes with it.
##
## THE THREE NUMBERS
##
##   knockback_force      how hard a hit shoves the target, in pixels per second
##   knockback_friction   how fast that shove bleeds off, in pixels per second squared
##   hitstop_duration     how long the fight freezes on impact, in real seconds
##
## Force and friction together decide how long the target slides:
##
##   settle time = knockback_force / knockback_friction
##
## So 320 force with 900 friction settles in about a third of a second. Raising
## force alone makes the hit travel further AND last longer. Raise friction with
## it if you want a big shove that snaps back quickly.
##
## THE LAYERS
##
## An impact is not one effect, it is seven stacked on top of each other, and each
## one is worth meeting on its own. The booleans below turn them on and off at
## runtime so you can hear what each is actually contributing. Ship with them all
## true; they exist so you can take them apart.
##
## Feel it in a browser first: https://codingquests.io/godot-game-feel-lab

signal settings_changed

## Emitted the moment a hit lands, before anything reacts to it. The camera, the
## sparks and the sound all hang off this rather than off the player, so adding a
## new reaction never means editing the attack code.
signal hit_landed(position: Vector2, direction: Vector2)

# ---------------------------------------------------------------------------
# The three numbers
# ---------------------------------------------------------------------------

## How hard a landed hit shoves the target, in pixels per second.
@export var knockback_force: float = 320.0

## How fast the shove bleeds off, in pixels per second squared. Higher is snappier.
@export var knockback_friction: float = 900.0

## How long the fight freezes on impact, in real seconds. 0.0 turns hit-stop off.
##
## Real action games sit between about 0.05 and 0.2, which is 3 to 12 frames at
## 60fps, and scale it with how heavy the attack is. Past about 0.2 it stops
## reading as impact and starts reading as the game hitching.
@export var hitstop_duration: float = 0.08

# ---------------------------------------------------------------------------
# The layers
# ---------------------------------------------------------------------------

## The shove itself.
@export var knockback_enabled: bool = true

## Whether the shove also takes the target's control away while it lasts.
## Without this the enemy walks back in mid-shove and the hit reads as weightless
## no matter how big the knockback number is.
@export var hitstun_enabled: bool = true

## The freeze on impact.
@export var hitstop_enabled: bool = true

## Camera trauma.
@export var shake_enabled: bool = true

## Impact sparks along the strike vector.
@export var sparks_enabled: bool = true

## Hit flash, squash and stretch, and the floating damage number.
@export var reaction_enabled: bool = true

## The impact sound.
@export var sound_enabled: bool = true

## What a freeze holds still.
##
## FIGHTERS is what shipped action games do: the two bodies stop dead while the
## sparks keep flying and the camera keeps shaking, so the pause reads as impact.
##
## EVERYTHING is the one line version, Engine.time_scale = 0.0, and it is what
## most tutorials teach. Try both. The difference is bigger than it sounds.
enum FreezeStyle { FIGHTERS, EVERYTHING }
@export var freeze_style: FreezeStyle = FreezeStyle.FIGHTERS

# ---------------------------------------------------------------------------
# Camera trauma
# ---------------------------------------------------------------------------

## Trauma added by one landed hit. Read by scripts/shake.gd.
const TRAUMA_PER_HIT := 0.42

## Trauma lost per second.
const TRAUMA_DECAY := 1.5

## Stress, from 0 to 1. The shake is this SQUARED, which is the whole trick: at
## 0.3 you get 9% shake and at 0.9 you get 81%, so a small hit stays quiet and a
## big one is unmistakable. Linear trauma makes every hit feel like the same hit.
var trauma := 0.0

## True while a hit is holding the fighters still. Both freeze styles set it, so
## a body only has to check this one flag.
var frozen := false

## Bumped by every hit_stop() call so an older freeze cannot un-freeze the game
## that a newer one just froze. Without this, two hits close together end with the
## first one's timer restoring time_scale while the second still wants it at zero.
var _hitstop_token := 0


func _process(delta: float) -> void:
	trauma = maxf(trauma - TRAUMA_DECAY * delta, 0.0)


## Called by the attacker when a hit lands. Everything else hangs off the signal.
func report_hit(position: Vector2, direction: Vector2) -> void:
	if shake_enabled:
		trauma = minf(trauma + TRAUMA_PER_HIT, 1.0)
	if hitstop_enabled:
		hit_stop(hitstop_duration)
	hit_landed.emit(position, direction)


## Freeze for `duration` REAL seconds.
##
## THE TRAP, and it is the reason this function is longer than you expect:
## `await get_tree().create_timer(duration).timeout` is scaled by
## Engine.time_scale. At a time scale of zero that timer never finishes, so the
## line that unfreezes the game never runs and the game locks up with no error at
## all. The fourth argument, ignore_time_scale, is the fix.
func hit_stop(duration: float) -> void:
	if duration <= 0.0:
		return
	_hitstop_token += 1
	var token := _hitstop_token
	frozen = true
	if freeze_style == FreezeStyle.EVERYTHING:
		# Not 0.0: a zero physics step breaks bodies standing on moving platforms.
		Engine.time_scale = 0.02
	await get_tree().create_timer(duration, true, false, true).timeout
	# A later hit_stop already owns the clock. Leave it frozen for that one.
	if token == _hitstop_token:
		frozen = false
		Engine.time_scale = 1.0


## How long a shove takes to come to rest, in seconds. The slider panel shows this
## so you can read the feel as a number instead of guessing at it.
func settle_seconds() -> float:
	if knockback_friction <= 0.0:
		return 0.0
	return knockback_force / knockback_friction


func set_knockback_force(value: float) -> void:
	knockback_force = value
	settings_changed.emit()


func set_knockback_friction(value: float) -> void:
	knockback_friction = value
	settings_changed.emit()


func set_hitstop_duration(value: float) -> void:
	hitstop_duration = value
	settings_changed.emit()


func set_layer(layer: String, on: bool) -> void:
	match layer:
		"knockback":
			knockback_enabled = on
		"hitstun":
			hitstun_enabled = on
		"hitstop":
			hitstop_enabled = on
		"shake":
			shake_enabled = on
		"sparks":
			sparks_enabled = on
		"reaction":
			reaction_enabled = on
		"sound":
			sound_enabled = on
	settings_changed.emit()


## The numbers the lab starts on. The panel's Reset button calls this.
func reset_to_defaults() -> void:
	knockback_force = 320.0
	knockback_friction = 900.0
	hitstop_duration = 0.08
	settings_changed.emit()


## Every tunable off, and every layer off. This is the "before" half of the
## comparison: the hit still lands and still does damage, it just has no weight.
func use_baseline() -> void:
	knockback_force = 0.0
	knockback_friction = 900.0
	hitstop_duration = 0.0
	knockback_enabled = false
	hitstun_enabled = false
	hitstop_enabled = false
	shake_enabled = false
	sparks_enabled = false
	reaction_enabled = false
	sound_enabled = false
	settings_changed.emit()


## Everything on, at the tuned numbers.
func use_everything() -> void:
	reset_to_defaults()
	knockback_enabled = true
	hitstun_enabled = true
	hitstop_enabled = true
	shake_enabled = true
	sparks_enabled = true
	reaction_enabled = true
	sound_enabled = true
	settings_changed.emit()
