# Spieler erbt von der Klasse Actor
extends Actor

# Kinder Nodes für Benutzer Oberfläche
var anim_player
var objective_arrow
var score_label
var money_label

# Variablen zu Missionen, Score und Geld
var current_objective:Node
var objective_pool:Array #Enthält alle Abliefer Punkte
var score:int = 0
var money:int

# Initialisiert alle wichtige Variablen:
func _ready():
	# 1. Objekte für Benutzeroberfläche
	hp_bar = $UI/MenuBG/MarginContainer/VBoxContainer/HP_Bar
	anim_player = $Sprite/AnimationPlayer
	objective_arrow = $Sprite/Arrow
	score_label = $UI/MenuBG/MarginContainer/VBoxContainer/Score
	money_label = $UI/MenuBG/MarginContainer/VBoxContainer/Money
	
	gamestate.player = self # 2. Trägt Spiele in globale Variable ein
	gamestate.current_score = 0
	objective_pool = get_parent().get_objectives() #Läd alle Missionspunkte
	get_new_objective() #Sucht den ersten Missionspunkt aus

#Ruft alle Methoden auf, die die Eingabe des Spielers verarbeiten
func process_input():
	process_input_movement()
	process_input_shooting()

#Prüft auf Richtungseingaben und setzt dann die Geschwindigkeit des Spielers 
func process_input_movement():
	#Prüft auf eingaben
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
	
	#Spiele die angemessene Animation für die Geschwindigkeit
	if velocity == Vector2.ZERO:
		anim_player.play("Rest")
	else:
		anim_player.play("Walk")
		
	velocity = velocity.normalized() * speed #Stellt sicher, dass die Bewegungsgeschwindigkeit immer gleich bleibt

#Prüft, ob der Spieler schießt und ruft dann shoot() aus der Geerbten Klasse auf mit der Mausposition auf
func process_input_shooting():
	if Input.is_action_pressed("shoot"):
		shoot(get_global_mouse_position())

#Wenn die Leben auf 0 fallen, wird der Score gespeichert und es wird zum Failscreen gewechselt
func die():
	gamestate.new_score(score)
	get_tree().change_scene("res://scenes/failscreen/FailScreen.tscn")

#Aktualisiert die Benutzeroberfläche
func update_ui():
	.update_ui() #Ruft Methode aus Actor-Klasse auf um Lebensleiste zu aktualisieren
	objective_arrow.look_at(current_objective.position)
	objective_arrow.rotation += deg2rad(90)
	score_label.text = "Score: " + str(score)
	money_label.text = "Money: " + str(money)

#Öffnet Upgrade-Bildschirm
func open_upgrades():
	$UI/Upgrades.reveal_yourself()

#Suchte wechselt den derzeitigen Missionspunkt zu einem neuen aus dem Pool
func get_new_objective():
	current_objective = objective_pool[int(rand_range(0,objective_pool.size()))]

#Wird aufgerufen, wenn ein Missionspunkt berührt wurde
func complete_objective(objective):
	if(objective == current_objective): #Ist der Missionspunkt der derzeitig Aktive?

		#Heilung
		hp += 1
		if (hp > max_hp):
			hp = max_hp
		
		add_score(500) #Fügt extra Score hinzu

		#Wenn der Missionpool leer ist, wird dieser wieder aufgefüllt
		if(objective_pool.size() == 1):
			objective_pool = get_parent().get_objectives()

		objective_pool.erase(current_objective) #Entfernt den Berührten Missionspunkt aus dem Missionspool
		get_new_objective() #Wähle eine neue Mission aus

#Fügt Score und so auch Geld hinzu
func add_score(to_add):
	score += to_add
	money += to_add

#Hauptschleife
#Wird bei zu jedem Frame ausgeführt
func _physics_process(_delta):
	process_input()
