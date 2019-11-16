"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.randomNumber = randomNumber;
exports.SpawnerType = void 0;
var SpawnerType = {
  MONSTER: 'MONSTER',
  CHEST: 'CHEST',
  ITEM: 'ITEM'
};
exports.SpawnerType = SpawnerType;

function randomNumber(min, max) {
  return Math.floor(Math.random() * max) + min;
}
//# sourceMappingURL=utils.js.map