"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _v = _interopRequireDefault(require("uuid/v4"));

var _utils = require("./utils");

var MonsterModel =
/*#__PURE__*/
function () {
  function MonsterModel(x, y, gold, spawnerId, frame, health, attack) {
    (0, _classCallCheck2["default"])(this, MonsterModel);
    this.id = "".concat(spawnerId, "-").concat((0, _v["default"])());
    this.spawnerId = spawnerId;
    this.x = x * 2;
    this.y = y * 2;
    this.gold = gold;
    this.frame = frame;
    this.health = health;
    this.maxHealth = health;
    this.attack = attack;
  }

  (0, _createClass2["default"])(MonsterModel, [{
    key: "loseHealth",
    value: function loseHealth(attack) {
      this.health -= attack;
    }
  }, {
    key: "move",
    value: function move() {
      var randomPosition = (0, _utils.randomNumber)(1, 8);
      var distance = 64;

      switch (randomPosition) {
        case 1:
          this.x += distance;
          break;

        case 2:
          this.x -= distance;
          break;

        case 3:
          this.y += distance;
          break;

        case 4:
          this.y -= distance;
          break;

        case 5:
          this.x += distance;
          this.y += distance;
          break;

        case 6:
          this.x += distance;
          this.y -= distance;
          break;

        case 7:
          this.x -= distance;
          this.y += distance;
          break;

        case 8:
          this.x -= distance;
          this.y -= distance;
          break;

        default:
          break;
      }
    }
  }]);
  return MonsterModel;
}();

exports["default"] = MonsterModel;
//# sourceMappingURL=MonsterModel.js.map