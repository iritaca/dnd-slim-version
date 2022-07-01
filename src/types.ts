type CoordsInMap = [number, number];
export interface Player {
  hitpoints: number;
  attackDamage: number;
  stage: number;
  coords: CoordsInMap;
}

export interface Monster {
  hitpoints: number;
  attackDamage: number;
  coords: CoordsInMap;
}

export type BattleWinner = "player" | "monster";

export interface Hitpoints {
  name: string;
  value: number;
  maxValue: number;
}
