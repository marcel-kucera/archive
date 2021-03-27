import { emit } from "node:process";
import { Socket } from "socket.io";
import { CardData } from "./cardData";
import {
  discardAllowed,
  generateCardDeck,
  returnCard,
  takeCard,
} from "./cardDeck";
import events from "./events";

export default class gameState {
  deck: CardData[];
  discard: CardData;
  players: Player[];
  turn: number;

  constructor() {
    this.players = [];
    this.deck = generateCardDeck();
    this.discard = takeCard(this.deck);
    this.turn = 0;
  }

  discardCard(index: number, player: Player) {
    if (discardAllowed(this.discard, player.hand[index])) {
      let cardToDiscard = player.hand.splice(index, 1)[0]; //get card to discard from held cards
      returnCard(this.deck, this.discard); //return old discard to deck
      this.discard = cardToDiscard; //put card on discard
    }
  }

  drawCard(player: CardData[]) {
    if (this.deck.length != 0) {
      this.deck.push(takeCard(this.deck));
    }
  }

  handlePlayerConnect(socket: Socket): number {
    if (this.players.length > 2) {
      return;
    } else {
      let newPlayer: Player = new Player(socket);
      for (let i = 0; i < 5; i++) {
        newPlayer.hand.push(takeCard(this.deck));
      }
      this.players.push(newPlayer);
      if (this.players.length == 2) {
        this.updatePlayers();
      }
    }
  }

  updatePlayers() {
    for (let i = 0; i < this.players.length; i++) {
      this.players[i].socket.emit(events.update, this.buildClientState(i));
    }
  }

  buildClientState(index: number) {
    let state = new clientState();
    state.discard = this.discard;
    for (let i = 0; i < this.players.length; i++) {
      if ((index = i)) {
        state.held = this.players[i].hand;
      } else {
        state.oppenentCardAmount = this.players[i].hand.length;
      }
    }
  }
}

export class Player {
  hand: CardData[];
  socket: Socket;

  constructor(socket: Socket) {
    this.socket = socket;
    this.hand = [];
  }
}

export class clientState {
  discard: CardData;
  held: CardData[];
  oppenentCardAmount: number;
}
