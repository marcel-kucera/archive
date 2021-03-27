import requests
import mh_z19
import time

server = open("server","r").read().strip()+"/insert"
room = open("room","r").read().strip()
password = open("password","r").read().strip()


while True:
  values = mh_z19.read_all()
  r = requests.post(server, data={"room":room, "co2": values["co2"],"temp": values["temperature"], "password":password})
  time.sleep(15)