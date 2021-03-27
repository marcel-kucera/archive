export interface CardData {
  number: number;
  color: COLOR;
}

export enum COLOR {
  RED = "red",
  BLUE = "blue",
  YELLOW = "yellow",
  GREEN = "green",
}

export function createCard(number: number, color: COLOR): CardData {
  return { number: number, color: color };
}
