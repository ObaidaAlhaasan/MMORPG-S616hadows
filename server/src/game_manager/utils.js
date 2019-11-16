export const SpawnerType = {
  MONSTER: 'MONSTER',
  CHEST: 'CHEST',
  ITEM: 'ITEM',
};

export function randomNumber(min, max) {
  return Math.floor(Math.random() * max) + min;
}
