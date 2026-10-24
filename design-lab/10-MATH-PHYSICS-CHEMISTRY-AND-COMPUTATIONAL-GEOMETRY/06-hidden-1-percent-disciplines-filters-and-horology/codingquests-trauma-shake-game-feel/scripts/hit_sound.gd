class_name HitSound
extends RefCounted

## The impact sound, generated in code.
##
## Sound is the layer people forget and the one they miss most. Mute a good action
## game and half the weight goes with the audio, not the animation.
##
## This project ships no audio files on purpose: no third party assets means no
## licence to chase and nothing to attribute. So the hit is synthesised once, the
## first time it is needed, and cached.
##
## What it is made of, which is most of what a good impact sound is made of:
##
##   a noise burst      the crack. Very short, very loud, decays almost at once
##   a falling tone     the body. Drops in pitch, which is what "heavy" sounds like
##   a fast envelope    all of it gone inside 120 milliseconds
##
## And then the part that matters more than the sound itself: PITCH VARIATION.
## The same sample at the same pitch, forty times in a row, turns into a machine
## gun and the ear stops hearing it as impact. A few percent either way and it
## stays alive. That is the `pitch_scale` line at the bottom.

const SAMPLE_RATE := 22050
const DURATION := 0.12

## How far the pitch wanders either side of normal.
const PITCH_SPREAD := 0.18

static var _stream: AudioStreamWAV = null


static func play(parent: Node) -> void:
	if parent == null:
		return
	if _stream == null:
		_stream = _build()

	var player := AudioStreamPlayer.new()
	player.stream = _stream
	player.volume_db = -6.0
	player.pitch_scale = randf_range(1.0 - PITCH_SPREAD, 1.0 + PITCH_SPREAD)
	parent.add_child(player)
	player.finished.connect(player.queue_free)
	player.play()


## 16 bit mono PCM, little endian, which is what AudioStreamWAV expects in `data`.
static func _build() -> AudioStreamWAV:
	var frames := int(SAMPLE_RATE * DURATION)
	var bytes := PackedByteArray()
	bytes.resize(frames * 2)

	for i in frames:
		var t := float(i) / float(SAMPLE_RATE)
		var progress := float(i) / float(frames)

		# The crack: noise that is gone almost immediately.
		var noise := randf_range(-1.0, 1.0) * pow(1.0 - progress, 8.0)

		# The body: a tone falling from 220Hz to about 70Hz.
		var frequency := lerpf(220.0, 70.0, progress)
		var tone := sin(TAU * frequency * t) * pow(1.0 - progress, 3.0)

		var sample := clampf(noise * 0.55 + tone * 0.75, -1.0, 1.0)
		bytes.encode_s16(i * 2, int(sample * 32000.0))

	var stream := AudioStreamWAV.new()
	stream.format = AudioStreamWAV.FORMAT_16_BITS
	stream.mix_rate = SAMPLE_RATE
	stream.stereo = false
	stream.data = bytes
	return stream
