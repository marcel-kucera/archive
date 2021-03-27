extends MarginContainer

func _ready():
	self.hide()

func _process(delta):
	if Input.is_action_just_pressed("pause"):
		if get_tree().paused:
			get_tree().paused = false
			self.hide()
		else:
			get_tree().paused = true
			self.show()

func _on_close_pressed():
	get_tree().paused = false
	get_tree().quit(0)


func _on_continue_pressed():
	get_tree().paused = false
	self.hide()


func _on_restart_pressed():
	get_tree().paused = false
	get_tree().reload_current_scene()


func _on_titlescreen_pressed():
	get_tree().paused = false
	get_tree().change_scene("res://scenes/titlescreen/Titlescreen.tscn")
