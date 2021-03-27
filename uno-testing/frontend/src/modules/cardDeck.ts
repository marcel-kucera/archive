import { CardData, COLOR, createCard } from "./cardData";

export function generateCardDeck(): CardData[] {
  let cards: CardData[] = [];
  let colors: COLOR[] = Object.values(COLOR);
  colors.forEach((c) => {
    for (let i = 0; i < 2; i++) {
      for (let i = 1; i <= 9; i++) {
        cards.push(createCard(i, c));
      }
    }
    cards.push(createCard(0, c));
  });
  return cards;
}

export function takeCard(deck: CardData[]) {
  let number = Math.floor(Math.random() * deck.length);
  let card = deck.splice(number, 1)[0];
  return card;
}

export function returnCard(deck: CardData[], addCard: CardData) {
  deck.push(addCard);
}

export function discardAllowed(discard: CardData, check: CardData): boolean {
  return check.number == discard.number || check.color == discard.color;
}
