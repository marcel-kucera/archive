import Axios from "axios";
import Express from "express";

const router = Express.Router();
const url = "";
const server = url ? url : process.env.SERVER;
const pass = "";
const password = pass ? pass : process.env.PASSWORD;

router.post("/insert", (req, res) => {
  if (req.body.password != password) {
    res.sendStatus(401);
    return;
  }

  let co2 = req.body.co2;
  let temp = req.body.temp;
  let room = req.body.room;
  let timestamp = new Date().getTime();

  console.log(`${room}: CO2: ${co2}\tTemp: ${temp}C`);

  let data = [
    {
      metric: "co2",
      timestamp: timestamp,
      value: co2,
      tags: {
        room: room,
      },
    },
    {
      metric: "temp",
      timestamp: timestamp,
      value: temp,
      tags: {
        room: room,
      },
    },
  ];

  Axios.post(server + "/api/put", data)
    .then((response) => res.sendStatus(200))
    .catch((error) => {
      if (error.response) {
        console.log("Error from DB");
        res.sendStatus(400);
      } else {
        console.log("Cant reach DB");
        res.sendStatus(500);
      }
    });
});

export default router;
