import { Monster } from "../types";

export const generateMonster = () => {
  generateRandomMonster();

  return monsters[monsters.length - 1];
};

const MAX_HITPOINTS = 20;
const MAX_ATTACK_DAMAGE = 6;

export const monsters: Monster[] = [];

function generateRandomMonster() {
  const hitpoints = generateRandomValue(MAX_HITPOINTS);

  const newMonster = {
    hitpoints: hitpoints,

    maxHitpoints: hitpoints,
    attackDamage: generateRandomValue(MAX_ATTACK_DAMAGE),
    coords: { x: 0, y: 0 },
  };

  monsters.push(newMonster);
}

function generateRandomValue(value: number) {
  let random = Math.ceil(Math.random() * value);
  if (random < value / 2) {
    random += 3;
  }
  return random;
}
