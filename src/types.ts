export interface Player {
  hitpoints: number;
  attackDamage: number;
  position: number;
}

export interface Monster {
  hitpoints: number;
  attackDamage: number;
}

export type BattleWinner = "player" | "monster";

export interface Hitpoints {
  name: string;
  value: number;
  maxValue: number;
}
