class_name DamageNumber
extends RefCounted

## The number that floats up off a hit.
##
## It is the cheapest feedback in the whole stack and it does two jobs at once: it
## confirms the hit landed, and it says how much the hit was worth. A player who
## can see the number is a player who can tell a good hit from a bad one without
## being told.
##
## Built in code, tweened, and freed when it lands. No scene, no font file.

const RISE := 34.0
const LIFE := 0.72


static func spawn(parent: Node, position: Vector2, value: int) -> void:
	if parent == null:
		return
	var label := Label.new()
	label.text = str(value)
	label.position = position - Vector2(10.0, 20.0)
	label.z_index = 100
	label.add_theme_color_override("font_color", Color(1.0, 0.85, 0.45))
	label.add_theme_font_size_override("font_size", 16)
	parent.add_child(label)

	# Up and fading. The rise is eased out so it leaps first and drifts after,
	# which is what makes it read as a reaction rather than as a UI element.
	var tween := label.create_tween()
	tween.set_parallel(true)
	tween.tween_property(label, "position:y", label.position.y - RISE, LIFE).set_ease(Tween.EASE_OUT).set_trans(Tween.TRANS_QUAD)
	tween.tween_property(label, "modulate:a", 0.0, LIFE).set_ease(Tween.EASE_IN)
	tween.chain().tween_callback(label.queue_free)
