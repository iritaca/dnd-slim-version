import { Monster } from "../types";

export const generateMonster = () => monsters[0];

export const monsters: Monster[] = [
  {
    hitpoints: 13,
    attackDamage: 3,
    coords: { xPosition: 0, yPosition: 0 },
  },
];
