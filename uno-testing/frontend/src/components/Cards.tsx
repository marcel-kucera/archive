import { CardData, COLOR } from "modules/cardData";
import { discardAllowed } from "modules/cardDeck";
import events from "modules/events";
import { io, Socket } from "socket.io-client";

import style from "styles/Cards.module.css";

interface CardHolderProps {
  cards: CardData[];
  discardFunc: Function;
}

export function CardHolder(props: CardHolderProps) {
  return (
    <div className={style.cardHolder}>
      {props.cards.map((card, index) => (
        <CardHeld
          cardData={card}
          index={index}
          discardFunc={props.discardFunc}
        ></CardHeld>
      ))}
    </div>
  );
}

interface CardHeldProps {
  cardData: CardData;
  index: number;
  discardFunc: Function;
}

export function CardHeld(props: CardHeldProps) {
  return (
    <div className={style.cardHeld}>
      <div onClick={() => props.discardFunc(props.index)}>
        <Card data={props.cardData}></Card>
      </div>
    </div>
  );
}

interface CardDiscardProps {
  cardData: CardData;
}

export function CardDiscard(props: CardDiscardProps) {
  return <Card data={props.cardData} className={style.discard}></Card>;
}

interface CardProps {
  data: CardData;
  className?: string;
}
export function Card(props: CardProps) {
  let className = style.cardWrapper;
  className += props.className ? " " + props.className : "";

  let data = props.data;
  if (!props.data) {
    data = { number: 1, color: COLOR.RED };
  }

  return (
    <div className={className}>
      <div className={style.card} style={{ borderColor: data.color }}>
        <span className={style.cardText}>{data.number}</span>
      </div>
    </div>
  );
}
