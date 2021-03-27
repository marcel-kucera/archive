extends PanelContainer

func _ready():
	$MarginContainer/VBoxContainer/MenuBG/VBoxContainer/Score.text = "Score: " + str(gamestate.current_score)
	$MarginContainer/VBoxContainer/MenuBG/VBoxContainer/Highscore.text  = "Highscore: " + str(gamestate.highscore)

func _on_titlescreen_pressed():
	get_tree().change_scene("res://scenes/titlescreen/Titlescreen.tscn")

func _on_restart_pressed():
	get_tree().change_scene("res://maps/map/map.tscn")


func _on_close_pressed():
	get_tree().quit(0)
