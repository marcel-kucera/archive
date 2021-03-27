extends Control

#Ich weiß dass das scheiße gecodet ist aber "PROTOTYP"

var player
var kosten1 = 1000
var kosten2 = 1000
var kosten3 = 1000

func _ready():
	self.hide()
	player = get_parent().get_parent()
	
func reveal_yourself():
	self.show()
	get_tree().paused = true
	
func _process(delta):
	if self.visible:
		update_ui()
		if Input.is_action_just_pressed("pause"):
			get_tree().paused = false
			self.hide()
	player.money_label.text = "Money: " + str(player.money)

func update_ui():
	$MarginContainer/MenuBG/MarginContainer/VBoxContainer/HBoxContainer/VBoxContainer/Kosten.text = "Kosten: "+str(kosten1)
	$MarginContainer/MenuBG/MarginContainer/VBoxContainer/HBoxContainer/VBoxContainer2/Kosten.text = "Kosten: "+str(kosten2)
	$MarginContainer/MenuBG/MarginContainer/VBoxContainer/HBoxContainer/VBoxContainer3/Kosten.text = "Kosten: "+str(kosten3)
	check_disable_button($MarginContainer/MenuBG/MarginContainer/VBoxContainer/HBoxContainer/VBoxContainer/buy_multishot,kosten1)
	check_disable_button($MarginContainer/MenuBG/MarginContainer/VBoxContainer/HBoxContainer/VBoxContainer2/buy_damage,kosten2)
	check_disable_button($MarginContainer/MenuBG/MarginContainer/VBoxContainer/HBoxContainer/VBoxContainer3/buy_firerate,kosten3)

func check_disable_button(button:Button,cost:int):
	if cost > player.money:
		button.disabled = true
	else:
		button.disabled = false

func _on_buy_multishot_pressed():
	if(kosten1 <= player.money):
		player.bullet_amount += 2
		player.bullet_angle += 15
		player.money -= kosten1
		kosten1 += 500

func _on_close_pressed():
	get_tree().paused = false
	self.hide()


func _on_buy_damage_pressed():
	if(kosten2 <= player.money):
		player.proj_damage += 20
		player.money -= kosten2
		kosten2 += 500


func _on_buy_firerate_pressed():
	if(kosten3 <= player.money):
		player.bullet_cooldown -= 10
		player.money -= kosten3
		kosten3 += 500
