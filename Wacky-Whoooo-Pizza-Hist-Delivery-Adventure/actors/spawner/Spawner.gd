extends Node2D

tool

export var est_cooldown:int
export var cooldown_range:int
export var spawn_range:int
export var enemy:PackedScene
var player
var visibility
var debug_draw

var timestamp
var cooldown

func _ready():
	player = get_parent().get_parent().get_node("Player")
	visibility = $VisibilityNotifier2D
	debug_draw = false
	
	timestamp = OS.get_ticks_msec()
	cooldown = int(rand_range(est_cooldown-cooldown_range,est_cooldown+cooldown_range))
	
func _process(_delta):
	if !Engine.editor_hint:
		try_spawn()
	if debug_draw:
		update()

func try_spawn():
	if OS.get_ticks_msec() - timestamp > cooldown:
		timestamp = OS.get_ticks_msec()
		cooldown = int(rand_range(est_cooldown-cooldown_range,est_cooldown+cooldown_range))
		print(cooldown)
		if !visibility.is_on_screen() && in_spawn_range():
			spawn()

func spawn():
	var enemy_instance = enemy.instance()
	enemy_instance.position = position
	get_parent().get_parent().add_child(enemy_instance)
	
func in_spawn_range():
	return position.distance_to(player.position) < spawn_range

func _draw():
	if debug_draw:
		if in_spawn_range():
			draw_line(Vector2.ZERO,to_local(get_parent().get_parent().get_node("Player").position),Color(255, 0, 0),2)
