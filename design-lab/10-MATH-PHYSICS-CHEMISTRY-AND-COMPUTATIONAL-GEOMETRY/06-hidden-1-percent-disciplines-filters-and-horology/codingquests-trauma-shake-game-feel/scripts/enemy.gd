class_name Enemy
extends CharacterBody2D

## The thing you hit. It walks back to its post, and it takes the shove.
##
## Two lines carry the whole feel of an impact:
##
##     velocity = _knockback
##     _knockback = _knockback.move_toward(Vector2.ZERO, friction * delta)
##
## The first says a shoved enemy moves the way the shove says, not the way its own
## brain says. The second bleeds the shove off over time. move_toward walks a value
## toward a target by a fixed step, so friction here is measured in pixels per
## second squared, and the slide always ends at exactly zero instead of creeping.

## How fast the crate walks back to its post, in pixels per second.
##
## It is a training dummy, not a hunter. Anything that closes on you while you are
## trying to read a single hit is noise: you end up tuning the chase, not the
## impact. The browser lab at codingquests.io/godot-game-feel-lab does the same.
const WALK_HOME_SPEED := 62.0

## Below this speed the shove is over and the enemy gets to act again, in pixels
## per second. Without a floor, a nearly-stopped enemy stays "recovering" forever.
const RECOVERED_BELOW := 4.0

## Squash at the moment of impact: wider and shorter, then eased back. The eye
## reads a deformed shape as a shape that absorbed force. It is the oldest trick
## in animation and it costs one tween.
const SQUASH_X := 1.34
const SQUASH_Y := 0.68
const SQUASH_TIME := 0.24

## How long the white hit flash lasts. Short. It is a punctuation mark, not a
## light show.
const FLASH_TIME := 0.09

@onready var body: Polygon2D = $Body

var _knockback := Vector2.ZERO
var _flash_time := 0.0
var _base_color: Color

## Where it started, which is where it walks back to.
var _home := Vector2.ZERO


func _ready() -> void:
	add_to_group("enemy")
	_base_color = body.color
	_home = global_position


func _physics_process(delta: float) -> void:
	# Hit-stop. The fighters stop dead while the sparks and the camera carry on,
	# which is what makes a freeze read as impact instead of as a dropped frame.
	# (The EVERYTHING freeze style stops the sparks too, via Engine.time_scale.)
	if GameFeel.frozen:
		velocity = Vector2.ZERO
		return

	if _flash_time > 0.0:
		_flash_time = maxf(_flash_time - delta, 0.0)
		body.color = _base_color.lerp(Color.WHITE, _flash_time / FLASH_TIME)

	if is_recovering() and GameFeel.hitstun_enabled:
		# Shoved, and stunned. The crate has no say in where it goes until the
		# shove runs out.
		velocity = _knockback
		_bleed_off_knockback(delta)
	elif is_recovering():
		# Shoved, but NOT stunned: it walks home mid-shove and fights its own
		# knockback. This is what a hit feels like when knockback is the only
		# layer you added, and it is why the number alone never fixes it.
		velocity = _knockback + _walk_home()
		_bleed_off_knockback(delta)
	else:
		_knockback = Vector2.ZERO
		velocity = _walk_home()
	move_and_slide()


func _bleed_off_knockback(delta: float) -> void:
	_knockback = _knockback.move_toward(Vector2.ZERO, GameFeel.knockback_friction * delta)


## Back to where it stands. Identical to the browser lab's _walk_home().
func _walk_home() -> Vector2:
	var to_home: Vector2 = _home - global_position
	if to_home.length() < 4.0:
		return Vector2.ZERO
	return to_home.normalized() * WALK_HOME_SPEED


## True while a shove is still carrying the enemy. Read it before letting the
## enemy attack, turn, or play a walk animation: acting mid-shove is what makes a
## hit feel weightless even when the knockback number is large.
func is_recovering() -> bool:
	return _knockback.length() > RECOVERED_BELOW


## Called by the player on a landed hit. `direction` points away from the attacker.
func apply_knockback(direction: Vector2, force: float) -> void:
	_knockback = direction.normalized() * force


## Flash, squash, and stretch back out.
func react() -> void:
	_flash_time = FLASH_TIME
	body.scale = Vector2(SQUASH_X, SQUASH_Y)
	var tween := create_tween()
	tween.tween_property(body, "scale", Vector2.ONE, SQUASH_TIME) \
		.set_ease(Tween.EASE_OUT) \
		.set_trans(Tween.TRANS_ELASTIC)
