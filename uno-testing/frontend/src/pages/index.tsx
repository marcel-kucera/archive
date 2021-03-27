import { Card, CardDiscard, CardHolder } from "components/Cards";
import { COLOR, createCard } from "modules/cardData";
import { discardAllowed } from "modules/cardDeck";
import events from "modules/events";
import { clientState } from "modules/gameState";

import { useEffect, useState } from "react";

import { io, Manager, Socket } from "socket.io-client";

import styles from "../styles/Home.module.css";

export default function Home() {
  const [held, setHeld] = useState([]);
  const [discard, setDiscard] = useState();
  const [status, setStatus] = useState("unknown");
  const [opponent, setOpponent] = useState();
  const [socket, setSocket] = useState(null);
  const [id, setID] = useState(-1);
  const [turn, setTurn] = useState("unknown");
  const discardFunc = (index) => {
    if (discardAllowed(discard, held[index]))
      socket.emit(events.discard, index);
  };
  useEffect(() => {
    let connection = io("http://192.168.12.1:3001");
    setSocket(connection);
    connection.on(events.waiting, () => setStatus(events.waiting));
    connection.on(events.update, (clientState) => {
      setID(clientState.id);
      setStatus("playing");
      if (clientState.turnNumber == clientState.id) {
        setTurn("your turn");
      } else {
        setTurn("opponent turn");
      }
      setHeld(clientState.held);
      setDiscard(clientState.discard);
      setOpponent(clientState.oppenentCardAmount);
    });
  }, []);

  return (
    <div className={styles.game}>
      <span style={{ color: "white" }}>{status}</span>
      <br />
      <span style={{ color: "white" }}>{turn}</span>
      <br />
      <span style={{ color: "white" }}>you are player {id}</span>
      <br />
      <span style={{ color: "white" }}>opponentCards: {opponent}</span>
      <br />
      <CardDiscard cardData={discard}></CardDiscard>

      <div className={styles.cardHolder}>
        <CardHolder cards={held} discardFunc={discardFunc}></CardHolder>
      </div>
    </div>
  );
}
