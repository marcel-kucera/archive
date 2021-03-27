extends Node2D

func _on_Area2D_body_entered(body):
	if body.get_groups().has("player"):
		body.complete_objective(self)
