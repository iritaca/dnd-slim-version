import { Player } from "../types";

export const generatePlayer = () => players[0];

export const players: Player[] = [
  {
    hitpoints: 20,
    attackDamage: 5,
    stage: 0,

    coords: { xPosition: 0, yPosition: 0 },
  },
];
