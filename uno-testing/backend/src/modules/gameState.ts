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

  discardCard(index: number, playerID: number): void {
    if (
      this.turn == playerID &&
      discardAllowed(this.discard, this.players[playerID].hand[index])
    ) {
      const cardToDiscard = this.players[playerID].hand.splice(index, 1)[0]; //get card to discard from held cards
      returnCard(this.deck, this.discard); //return old discard to deck
      this.discard = cardToDiscard; //put card on discard
      this.nextTurn();
    }
    this.updatePlayers();
  }

  nextTurn(): void {
    if (this.turn == this.players.length - 1) {
      this.turn = 0;
    } else {
      this.turn++;
    }
    while (!this.canPlayerPlace(this.players[this.turn])) {
      this.drawCard(this.players[this.turn]);
    }
  }

  canPlayerPlace(player: Player): boolean {
    let canPlace = false;
    for (let i = 0; i < player.hand.length && !canPlace; i++) {
      if (discardAllowed(this.discard, player.hand[i])) {
        canPlace = true;
      }
    }
    return canPlace;
  }

  drawCard(player: Player): void {
    if (this.deck.length != 0) {
      player.hand.push(takeCard(this.deck));
    }
    this.updatePlayers();
  }

  handlePlayerConnect(socket: Socket): number {
    if (this.players.length >= 2) {
      console.log("too many players");
      return;
    } else {
      const newPlayer: Player = new Player(socket);
      newPlayer.id = this.players.length;
      socket.on(events.discard, (index) => {
        this.discardCard(index, newPlayer.id);
      });

      for (let i = 0; i < 5; i++) {
        newPlayer.hand.push(takeCard(this.deck));
      }

      this.players.push(newPlayer);
      if (this.players.length == 2) {
        this.updatePlayers();
      }
    }
  }

  updatePlayers(): void {
    for (let i = 0; i < this.players.length; i++) {
      const state = this.buildClientState(i);

      this.players[i].socket.emit(events.update, state);
    }
  }

  buildClientState(index: number): clientState {
    const state = new clientState();
    state.id = this.players[index].id;
    state.turnNumber = this.turn;
    state.discard = this.discard;
    for (let i = 0; i < this.players.length; i++) {
      if (index == i) {
        state.held = this.players[i].hand;
      } else {
        state.oppenentCardAmount = this.players[i].hand.length;
      }
    }
    return state;
  }
}

export class Player {
  id: number;
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
  id: number;
  turnNumber: number;
}
