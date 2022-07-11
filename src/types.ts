type CoordsInMap = { x: number; y: number };
export interface Player {
  hitpoints: number;
  attackDamage: number;
  stage: number;
  movementMult: number;
  coords: CoordsInMap;
}

export interface Monster {
  hitpoints: number;
  attackDamage: number;
  coords: CoordsInMap;
}

export interface NextLevelDoor {
  coords: CoordsInMap;
}

export type BattleWinner = "player" | "monster";

export interface Hitpoints {
  name: string;
  value: number;
  maxValue: number;
}
