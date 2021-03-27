extends Node

var objectives:Array

func get_objectives() -> Array:
	objectives = $Objectives.get_children()
	return objectives
