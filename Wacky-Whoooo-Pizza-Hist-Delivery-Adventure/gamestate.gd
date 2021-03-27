extends Node

var current_score:int
var highscore:int
var player:Node

func new_score(s):
	current_score = s
	if current_score > highscore:
		highscore = current_score
