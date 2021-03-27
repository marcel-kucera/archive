extends Actor

var anim_player
var objective_arrow
var score_label
var money_label

var current_objective:Node
var objective_pool:Array
var score:int = 0
var money:int

func _ready():
	hp_bar = $UI/MenuBG/MarginContainer/VBoxContainer/HP_Bar
	anim_player = $Sprite/AnimationPlayer
	objective_arrow = $Sprite/Arrow
	score_label = $UI/MenuBG/MarginContainer/VBoxContainer/Score
	money_label = $UI/MenuBG/MarginContainer/VBoxContainer/Money
	
	gamestate.player = self
	gamestate.current_score = 0
	objective_pool = get_parent().get_objectives()
	get_new_objective()
	
func process_input():
	process_input_movement()
	process_input_shooting()

func process_input_movement():
	velocity = Vector2()
	if Input.is_action_pressed('right'):
		velocity.x += 1
		$Sprite.flip_h = false
		$Sprite/Node2D.scale = Vector2(1,1)
	if Input.is_action_pressed('left'):
		velocity.x -= 1
		$Sprite.flip_h = true
		$Sprite/Node2D.scale = Vector2(-1,1)
	if Input.is_action_pressed('down'):
		velocity.y += 1
	if Input.is_action_pressed('up'):
		velocity.y -= 1
		
	if velocity == Vector2.ZERO:
		anim_player.play("Rest")
	else:
		anim_player.play("Walk")
		
	velocity = velocity.normalized() * speed

func process_input_shooting():
	if Input.is_action_pressed("shoot"):
		shoot(get_global_mouse_position())

func die():
	gamestate.new_score(score)
	get_tree().change_scene("res://scenes/failscreen/FailScreen.tscn")

func update_ui():
	.update_ui()
	objective_arrow.look_at(current_objective.position)
	objective_arrow.rotation += deg2rad(90)
	score_label.text = "Score: " + str(score)
	money_label.text = "Money: " + str(money)

func open_upgrades():
	$UI/Upgrades.reveal_yourself()

func get_new_objective():
	current_objective = objective_pool[int(rand_range(0,objective_pool.size()))]

func complete_objective(objective):
	if(objective == current_objective):
		hp += 1
		if (hp > max_hp):
			hp = max_hp
		
		add_score(500)
		if(objective_pool.size() == 1):
			objective_pool = get_parent().get_objectives()
		objective_pool.erase(current_objective)
		get_new_objective()

func add_score(to_add):
	score += to_add
	money += to_add

func _physics_process(_delta):
	process_input()
