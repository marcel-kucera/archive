export class RelicListModel {
  lith: RelicModel[];
  meso: RelicModel[];
  neo: RelicModel[];
  axi: RelicModel[];

  constructor() {
    this.lith = [];
    this.meso = [];
    this.neo = [];
    this.axi = [];
  }
}

export class RelicModel {
  id: string;
  amount: number;

  constructor() {
    this.id = "";
    this.amount = 0;
  }
}
