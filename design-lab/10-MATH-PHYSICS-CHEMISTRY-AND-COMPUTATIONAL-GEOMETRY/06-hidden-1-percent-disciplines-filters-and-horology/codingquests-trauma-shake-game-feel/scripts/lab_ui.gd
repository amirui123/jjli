extends CanvasLayer

## The lab panel: three sliders, seven layer switches, and the freeze style.
##
## The panel builds its own nodes in code. That is on purpose: it is tooling, not
## example gameplay code, and building it here means there is no scene path to
## keep in sync and nothing to rewire when you drop these scripts into your own
## project. Delete this file and the LabUI node and the game still runs on the
## numbers in GameFeel.

const PANEL_WIDTH := 262.0

const LAYERS := [
	{"id": "knockback", "label": "Knockback"},
	{"id": "hitstun", "label": "Hitstun"},
	{"id": "hitstop", "label": "Hit-stop"},
	{"id": "shake", "label": "Screen shake"},
	{"id": "sparks", "label": "Sparks"},
	{"id": "reaction", "label": "Flash and squash"},
	{"id": "sound", "label": "Sound"},
]

var _rows: Array[Dictionary] = []
var _boxes: Dictionary = {}
var _settle: Label = null


func _ready() -> void:
	var panel := PanelContainer.new()
	panel.set_anchors_preset(Control.PRESET_TOP_LEFT)
	panel.position = Vector2(12, 12)
	panel.custom_minimum_size = Vector2(PANEL_WIDTH, 0)
	add_child(panel)

	var column := VBoxContainer.new()
	column.add_theme_constant_override("separation", 6)
	panel.add_child(column)

	var title := Label.new()
	title.text = "Game Feel Lab"
	column.add_child(title)

	_add_slider(column, "Knockback force", "%.0f px/s", 0.0, 900.0, 10.0,
		GameFeel.knockback_force, GameFeel.set_knockback_force)
	_add_slider(column, "Knockback friction", "%.0f px/s2", 100.0, 4000.0, 50.0,
		GameFeel.knockback_friction, GameFeel.set_knockback_friction)
	_add_slider(column, "Hit-stop", "%.2f s", 0.0, 0.4, 0.01,
		GameFeel.hitstop_duration, GameFeel.set_hitstop_duration)

	_settle = Label.new()
	column.add_child(_settle)

	column.add_child(HSeparator.new())

	var layers_label := Label.new()
	layers_label.text = "Layers"
	column.add_child(layers_label)

	for layer in LAYERS:
		var id: String = layer["id"]
		var box := CheckBox.new()
		box.text = layer["label"]
		box.button_pressed = _layer_is_on(id)
		box.toggled.connect(func(on: bool) -> void: GameFeel.set_layer(id, on))
		column.add_child(box)
		_boxes[id] = box

	var freeze := OptionButton.new()
	freeze.add_item("Freeze: the fighters", GameFeel.FreezeStyle.FIGHTERS)
	freeze.add_item("Freeze: everything", GameFeel.FreezeStyle.EVERYTHING)
	freeze.selected = GameFeel.freeze_style
	freeze.item_selected.connect(func(index: int) -> void:
		GameFeel.freeze_style = index as GameFeel.FreezeStyle
	)
	column.add_child(freeze)

	var buttons := HBoxContainer.new()
	column.add_child(buttons)

	var baseline := Button.new()
	baseline.text = "Nothing"
	baseline.tooltip_text = "Every layer off, so you can hear the difference"
	baseline.pressed.connect(_on_baseline_pressed)
	buttons.add_child(baseline)

	var everything := Button.new()
	everything.text = "Everything"
	everything.pressed.connect(_on_everything_pressed)
	buttons.add_child(everything)

	var help := Label.new()
	help.text = "WASD to move, Space to swing"
	column.add_child(help)

	GameFeel.settings_changed.connect(_refresh)
	_refresh()


func _layer_is_on(id: String) -> bool:
	match id:
		"knockback":
			return GameFeel.knockback_enabled
		"hitstun":
			return GameFeel.hitstun_enabled
		"hitstop":
			return GameFeel.hitstop_enabled
		"shake":
			return GameFeel.shake_enabled
		"sparks":
			return GameFeel.sparks_enabled
		"reaction":
			return GameFeel.reaction_enabled
		"sound":
			return GameFeel.sound_enabled
	return false


func _add_slider(parent: Node, label_text: String, value_format: String,
		minimum: float, maximum: float, step: float, value: float,
		setter: Callable) -> void:
	var row := VBoxContainer.new()
	row.add_theme_constant_override("separation", 2)
	parent.add_child(row)

	var label := Label.new()
	row.add_child(label)

	var slider := HSlider.new()
	slider.min_value = minimum
	slider.max_value = maximum
	slider.step = step
	slider.value = value
	slider.custom_minimum_size = Vector2(PANEL_WIDTH - 24.0, 24.0)
	slider.value_changed.connect(func(new_value: float) -> void: setter.call(new_value))
	row.add_child(slider)

	_rows.append({"label": label, "text": label_text, "format": value_format, "slider": slider})


func _refresh() -> void:
	for row in _rows:
		var label: Label = row["label"]
		var slider: HSlider = row["slider"]
		label.text = "%s: %s" % [row["text"], (row["format"] as String) % slider.value]

	if _settle:
		_settle.text = "Shove settles in %.2f s" % GameFeel.settle_seconds()

	for id in _boxes:
		var box: CheckBox = _boxes[id]
		box.set_pressed_no_signal(_layer_is_on(id))


func _on_baseline_pressed() -> void:
	GameFeel.use_baseline()
	_pull_sliders_from_settings()


func _on_everything_pressed() -> void:
	GameFeel.use_everything()
	_pull_sliders_from_settings()


## A preset changed the numbers behind the sliders' backs, so move the handles to
## match. set_value_no_signal keeps this from calling the setters back.
func _pull_sliders_from_settings() -> void:
	var values := [
		GameFeel.knockback_force,
		GameFeel.knockback_friction,
		GameFeel.hitstop_duration,
	]
	for i in _rows.size():
		var slider: HSlider = _rows[i]["slider"]
		slider.set_value_no_signal(values[i])
	_refresh()
