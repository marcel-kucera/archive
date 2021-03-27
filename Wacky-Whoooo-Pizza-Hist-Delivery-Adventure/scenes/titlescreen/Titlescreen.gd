extends Control



func _on_Start_pressed():
	get_tree().change_scene("res://maps/map/map.tscn")

func _on_Beenden_pressed():
	get_tree().quit(0)
