extends Node2D

export var particles:PackedScene

var damage:int
var speed:int
var angle:float
var velocity:Vector2

func adjust(damage,speed,position,shoot_to,offset,rotation_mod):
	self.damage = damage
	self.speed = speed
	self.position = position
	self.position.y -= offset
	angle = self.position.angle_to_point(shoot_to)+deg2rad(rotation_mod)+deg2rad(180)
	velocity = Vector2(speed,0).rotated(angle)
	self.position = self.position + Vector2(50,0).rotated(angle)

func _physics_process(delta):
	position = position + velocity*delta

func emit_particles():
	var part_inst = particles.instance()
	part_inst.adjust(position,angle)
	part_inst.emitting = true
	get_parent().add_child(part_inst)

func _on_Area2D_body_entered(body):
	if (!body.get_groups().has("player")):
		emit_particles()
		self.queue_free()
	if (body.get_groups().has("enemy")):
		body.take_damage(damage)
