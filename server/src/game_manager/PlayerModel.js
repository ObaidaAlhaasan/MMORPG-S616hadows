export default class PlayerModel {
  constructor(playerId, spawnLocations, players, name, frame) {
    this.attack = 25;
    this.defense = 10;
    this.health = 150;
    this.maxHealth = 150;
    this.gold = 0;
    this.playerAttacking = false;
    this.flipX = true;
    this.id = playerId;
    this.spawnLocations = spawnLocations;
    this.playerName = name;
    this.frame = frame;
    this.playerItems = {};
    this.maxNumberOfItems = 5;

    const location = this.generateLocation(players);
    [this.x, this.y] = location;
  }

  canPickupItem() {
    if (Object.keys(this.playerItems).length < 5) {
      return true;
    }
    return false;
  }

  addItem(item) {
    this.playerItems[item.id] = item;
    this.attack += item.attackBonus;
    this.defense += item.defenseBonus;
    this.maxHealth += item.healthBonus;
  }

  removeItem(itemId) {
    this.attack -= this.playerItems[itemId].attackBonus;
    this.defense -= this.playerItems[itemId].defenseBonus;
    this.maxHealth -= this.playerItems[itemId].healthBonus;
    delete this.playerItems[itemId];
  }

  playerAttacked(attack) {
    const damage = this.defense - attack;
    this.updateHealth(damage);
  }

  updateGold(gold) {
    this.gold += gold;
  }

  updateHealth(health) {
    this.health += health;
    if (this.health > this.maxHealth) this.health = this.maxHealth;
  }

  respawn(players) {
    this.health = this.maxHealth;
    const location = this.generateLocation(players);
    [this.x, this.y] = location;
  }

  generateLocation(players) {
    const location = this.spawnLocations[Math.floor(Math.random() * this.spawnLocations.length)];
    const invalidLocation = Object.keys(players).some((key) => {
      if (players[key].x === location[0] && players[key].y === location[1]) {
        return true;
      }
      return false;
    });
    if (invalidLocation) return this.generateLocation(players);
    return location;
  }
}
