import { Server } from "socket.io";
import events from "./modules/events";
import gameState from "./modules/gameState";

const currGame: gameState = new gameState();

const io = new Server({cors: {origin: "*", methods: ["GET","POST"]}});
io.on("connection", (socket) => {
  console.log("player connected!");
  socket.emit(events.waiting);
  currGame.handlePlayerConnect(socket);
});

io.listen(3001);
console.log("boi");
