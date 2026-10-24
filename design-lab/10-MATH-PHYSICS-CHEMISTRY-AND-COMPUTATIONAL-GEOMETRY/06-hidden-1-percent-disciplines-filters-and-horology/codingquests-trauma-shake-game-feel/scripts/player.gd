extends CharacterBody2D

## The player. Moves, swings, and reports every landed hit to GameFeel.
##
## Nothing here is tuned by the lab. Movement speed, swing length and swing range
## stay fixed on purpose, so the only thing changing between two runs is the feel
## of the impact itself.
##
## Note what this script does NOT do: it does not shake the camera, spawn sparks,
## or play a sound. It reports the hit, and GameFeel emits a signal that those
## three listen for. Adding a new reaction later means writing the reaction, not
## editing the attack.

const SPEED := 190.0
const ACCELERATION := 1800.0
const FRICTION := 2000.0

## How far the swing reaches, in pixels, measured from the player's centre.
const ATTACK_RANGE := 46.0

## How wide the swing is. 1.2 radians each side of where the player is facing,
## so a bit under a 140 degree cone in total.
const ATTACK_ARC := 1.2

## How long the swing can land a hit, in seconds.
const ACTIVE_WINDOW := 0.12

## How long before the player can swing again, in seconds.
const ATTACK_COOLDOWN := 0.34

## A small forward lunge on the swing. Fixed, and not one of the three numbers: an
## attack that moves the attacker forward reads as committed at any tuning.
const LUNGE_SPEED := 140.0

@onready var blade: Polygon2D = $Blade

var facing := Vector2.RIGHT
var _swing_time := 0.0
var _cooldown := 0.0
var _already_hit: Array[Enemy] = []


func _ready() -> void:
	add_to_group("player")
	blade.modulate.a = 0.45


func _physics_process(delta: float) -> void:
	# Held still by a landed hit. The sparks and the camera carry on without us,
	# which is what makes a freeze read as impact instead of as a dropped frame.
	if GameFeel.frozen:
		velocity = Vector2.ZERO
		return

	_tick_timers(delta)
	_move(delta)
	if _swing_time > 0.0:
		_check_for_hits()
	if Input.is_action_just_pressed("attack"):
		_start_swing()


func _tick_timers(delta: float) -> void:
	if _cooldown > 0.0:
		_cooldown = maxf(_cooldown - delta, 0.0)
	if _swing_time > 0.0:
		_swing_time = maxf(_swing_time - delta, 0.0)
		if _swing_time <= 0.0:
			blade.modulate.a = 0.45


func _move(delta: float) -> void:
	var input := Input.get_vector("move_left", "move_right", "move_up", "move_down")
	if input != Vector2.ZERO:
		facing = input.normalized()
		velocity = velocity.move_toward(input.normalized() * SPEED, ACCELERATION * delta)
	else:
		velocity = velocity.move_toward(Vector2.ZERO, FRICTION * delta)
	move_and_slide()
	blade.rotation = facing.angle()


func _start_swing() -> void:
	if _cooldown > 0.0:
		return
	_cooldown = ATTACK_COOLDOWN
	_swing_time = ACTIVE_WINDOW
	_already_hit.clear()
	blade.modulate.a = 1.0
	blade.rotation = facing.angle()
	velocity += facing * LUNGE_SPEED


## Everything in the "enemy" group that is inside the swing gets hit once.
##
## A distance and angle test, not an Area2D, because this lab is about what a hit
## FEELS like rather than about how it is detected. The hitbox and hurtbox version
## is its own quest: https://codingquests.io/quests/2d-roguelike-combat-core
func _check_for_hits() -> void:
	for node in get_tree().get_nodes_in_group("enemy"):
		var enemy := node as Enemy
		if enemy == null or enemy in _already_hit:
			continue
		var to_enemy: Vector2 = enemy.global_position - global_position
		if to_enemy.length() > ATTACK_RANGE:
			continue
		if absf(to_enemy.angle_to(facing)) > ATTACK_ARC:
			continue
		_already_hit.append(enemy)
		_land_hit(enemy, to_enemy.normalized())


## One landed hit, and every layer that hangs off it.
func _land_hit(enemy: Enemy, direction: Vector2) -> void:
	if GameFeel.knockback_enabled:
		enemy.apply_knockback(direction, GameFeel.knockback_force)
	if GameFeel.reaction_enabled:
		enemy.react()
	# The freeze and the trauma live in here, and the signal it emits is what the
	# camera, the sparks and the sound are listening for.
	GameFeel.report_hit(enemy.global_position, direction)
