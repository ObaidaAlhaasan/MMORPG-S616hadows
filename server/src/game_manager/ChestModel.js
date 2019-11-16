import v4 from 'uuid/v4';

export default class ChestModel {
  constructor(x, y, gold, spawnerId) {
    this.id = `${spawnerId}-${v4()}`;
    this.spawnerId = spawnerId;
    this.x = x;
    this.y = y;
    this.gold = gold;
  }
}
