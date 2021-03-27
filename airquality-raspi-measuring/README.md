# airquality-raspi-measuring

Measure the air quality using raspberry pis and a MH-Z19B Sensor

Setup
--

### Client

Required python libraries:
`requests`
`mh-z19`

You need to enable the serial port and give the script root to access it

Put in working directory:
* a `server` file with the api server url
* a `room` file with the room name of the Raspberry
* a `password` file with the password specified in server

Example command: `sudo python3 client.py`

### Server

See `stack` folder for example docker-compose config

* Build server image with `Dockerfile` in `server` directory
* Set `SERVER` env var to address of OpenTSDB
* Set `PASSWORD` env var to same password as the client
* Expose port 3000 of container

Start container

Further hints
--

To seperate all graphs of the rooms from each other in grafana, you have to set a dashboard variable with the query `suggest_tagv()` and enable `Multi-value`.
Then set the filterof the graph to `room` `iliteral_or` `$varName` and enable `Group by`
