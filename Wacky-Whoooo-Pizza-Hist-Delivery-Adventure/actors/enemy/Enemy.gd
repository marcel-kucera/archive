extends Actor

export var kill_score:int
var player
var navmap

var path
var act = true

func _ready():
	hp_bar = $HP_Bar
	player = gamestate.player
	navmap = get_parent().get_node("Navigation2D")
	
	path = navmap.get_simple_path(position, player.position,true)

func _physics_process(delta):
	chase_player(delta)

func chase_player(delta):
	if act:
		$AnimationPlayer.play("walk")
		#If player is visible direct chase
		if is_player_in_los():
			direct_chase()	
		#Otherwise fall back on navigation
		else:
			navigation_chase(delta)

func is_player_in_los() -> bool:
	var sight_ray = get_world_2d().direct_space_state.intersect_ray(position,player.position,[self])
	if !sight_ray.empty():
		return sight_ray.collider == player
	else:
		return false

func direct_chase():
		velocity = Vector2(speed,0).rotated(get_angle_to(player.position))
		hurt_player()

func navigation_chase(delta):
	velocity = Vector2.ZERO
	#Calculate new path if path finished or player moved
	if path.size() == 0 || path[path.size()-1].distance_to(player.position) > 50:
		path = navmap.get_simple_path(position, player.position,true)

	#Follow Path
	if path.size() > 0:
		var dist = position.distance_to(path[0])
		if dist > 15:
			position = position.linear_interpolate(path[0],(speed * delta)/dist)
		else:
			path.remove(0)

func hurt_player():
	for collision_nr in range(get_slide_count()):
		if get_slide_collision(collision_nr).collider:
			if get_slide_collision(collision_nr).collider.get_groups().has("player"):
				player.take_damage(contact_damage)

func die():
	act = false
	velocity = Vector2.ZERO
	set_collision_layer_bit(0,false)
	set_collision_mask_bit(0,false)
	player.add_score(kill_score)
	$AnimationPlayer.play("die")

func _on_AnimationPlayer_animation_finished(anim_name):
	if anim_name == "die":
		.die()
