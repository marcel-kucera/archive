extends Particles2D

func _ready():
	emitting = true

func adjust(pos,rot):
	position = pos
	rotation = rot

func _process(_delta):
	if not emitting:
		queue_free()
