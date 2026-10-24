extends Camera2D

## Trauma-based camera shake, the version from Squirrel Eiserloh's GDC 2016 talk
## "Juicing Your Cameras With Math". Three ideas, and all three matter.
##
## 1. TRAUMA, NOT SHAKE. Hits add to a stress value between 0 and 1 that decays
##    on its own. Nothing has to remember to stop shaking, and two hits close
##    together stack into one bigger shake instead of fighting each other.
##
## 2. TRAUMA SQUARED. The shake is trauma * trauma, so 0.3 trauma gives 9% shake
##    and 0.9 gives 81%. Small hits stay quiet, big ones are unmistakable. Shake
##    straight off a linear trauma makes every hit feel like the same hit.
##
## 3. NOISE, NOT RANDOM. A fresh random number every frame is a buzz. Smooth
##    noise is a shake: consecutive samples are related, so the camera travels
##    instead of vibrating. It also survives slow motion, and you can tune it by
##    frequency.
##
## In 2D, shake the ROTATION as well as the position. A degree or two of roll is
## most of why an impact reads as force rather than as a glitch.

## Pixels of offset at full trauma.
const MAX_OFFSET := 13.0

## Radians of roll at full trauma. About 2.6 degrees.
const MAX_ROLL := 0.046

## Noise samples per second. Lower is a lurch, higher is a buzz.
const FREQUENCY := 24.0

## Pixels the camera is shoved along the hit direction, on top of the noise. This
## is the half of screen shake that carries information: a hit to the right moves
## the camera right.
const KICK := 11.0

## How fast that shove comes back, in pixels per second.
const KICK_RECOVERY := 42.0

var _noise := FastNoiseLite.new()
var _time := 0.0
var _kick := Vector2.ZERO


func _ready() -> void:
	# Camera2D ignores its own rotation by default, which would silently throw the
	# roll away. Without this line the camera shakes but never tilts.
	ignore_rotation = false
	_noise.noise_type = FastNoiseLite.TYPE_SIMPLEX_SMOOTH
	_noise.seed = randi()
	_noise.frequency = 1.0
	GameFeel.hit_landed.connect(_on_hit_landed)


func _process(delta: float) -> void:
	_time += delta
	_kick = _kick.move_toward(Vector2.ZERO, KICK_RECOVERY * delta)

	var amount := GameFeel.trauma * GameFeel.trauma
	if amount <= 0.0 and _kick.is_zero_approx():
		offset = Vector2.ZERO
		rotation = 0.0
		return

	var t := _time * FREQUENCY
	offset = Vector2(
		_noise.get_noise_2d(t, 0.0) * MAX_OFFSET * amount,
		_noise.get_noise_2d(t, 100.0) * MAX_OFFSET * amount,
	) + _kick
	rotation = _noise.get_noise_2d(t, 200.0) * MAX_ROLL * amount


func _on_hit_landed(_position: Vector2, direction: Vector2) -> void:
	if not GameFeel.shake_enabled:
		return
	_kick = direction.normalized() * KICK
