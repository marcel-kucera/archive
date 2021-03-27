extends KinematicBody2D
class_name Actor

export var max_hp:int
export var speed:int
export var contact_damage:int
export var proj_damage:int
export var proj_speed:int
export var bullet_cooldown:int
export var hit_cooldown:int
export var bullet:PackedScene
export var bullet_amount:int
export var bullet_angle:int
var hp_bar:ProgressBar

var hp:int
var bullet_timestamp:int
var hit_timestamp:int
var velocity:Vector2

func _ready():
	hp = max_hp
	
func take_damage(i):
	if OS.get_ticks_msec() - hit_timestamp > hit_cooldown:
		hit_timestamp = OS.get_ticks_msec()
		hp -= i
		if hp < 1:
			die()

func die():
	self.queue_free()

func update_ui():
	if hp_bar:
		hp_bar.max_value = max_hp
		hp_bar.value = hp
		
func shoot(shoot_to):
	if(OS.get_ticks_msec() - bullet_timestamp > bullet_cooldown):
		if bullet_amount == 1:
			shoot_bullet(shoot_to,0)
		else:
			var starting_angle = -(bullet_angle/2)
			var step = bullet_angle/(bullet_amount-1)
			for n in range(bullet_amount):
				shoot_bullet(get_global_mouse_position(),starting_angle+step*n)
		bullet_timestamp = OS.get_ticks_msec()
		
func shoot_bullet(shoot_to,rotation_mod):
	var bullet_instance = bullet.instance()
	bullet_instance.adjust(proj_damage,proj_speed,position,shoot_to,10,rotation_mod)
	get_parent().add_child(bullet_instance)

func _physics_process(_delta):
	update_ui()
	move_and_slide(velocity)
