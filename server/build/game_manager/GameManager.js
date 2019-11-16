"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _v = _interopRequireDefault(require("uuid/v4"));

var _jsonwebtoken = _interopRequireDefault(require("jsonwebtoken"));

var _PlayerModel = _interopRequireDefault(require("./PlayerModel"));

var levelData = _interopRequireWildcard(require("../../public/assets/level/large_level.json"));

var _Spawner = _interopRequireDefault(require("./Spawner"));

var _utils = require("./utils");

var _ChatModel = _interopRequireDefault(require("../models/ChatModel"));

var itemData = _interopRequireWildcard(require("../../public/assets/level/tools.json"));

var GameManager =
/*#__PURE__*/
function () {
  function GameManager(io) {
    (0, _classCallCheck2["default"])(this, GameManager);
    this.io = io;
    this.spawners = {};
    this.chests = {};
    this.monsters = {};
    this.players = {};
    this.items = {};
    this.playerLocations = [];
    this.chestLocations = {};
    this.monsterLocations = {};
    this.itemLocations = itemData.locations;
  }

  (0, _createClass2["default"])(GameManager, [{
    key: "setup",
    value: function setup() {
      this.parseMapData();
      this.setupEventListeners();
      this.setupSpawners();
    }
  }, {
    key: "parseMapData",
    value: function parseMapData() {
      var _this = this;

      this.levelData = levelData;
      this.levelData.layers.forEach(function (layer) {
        if (layer.name === 'player_locations') {
          layer.objects.forEach(function (obj) {
            _this.playerLocations.push([obj.x, obj.y]);
          });
        } else if (layer.name === 'monster_locations') {
          layer.objects.forEach(function (obj) {
            if (_this.monsterLocations[obj.properties.spawner]) {
              _this.monsterLocations[obj.properties.spawner].push([obj.x, obj.y]);
            } else {
              _this.monsterLocations[obj.properties.spawner] = [[obj.x, obj.y]];
            }
          });
        } else if (layer.name === 'chest_locations') {
          layer.objects.forEach(function (obj) {
            if (_this.chestLocations[obj.properties.spawner]) {
              _this.chestLocations[obj.properties.spawner].push([obj.x, obj.y]);
            } else {
              _this.chestLocations[obj.properties.spawner] = [[obj.x, obj.y]];
            }
          });
        }
      });
    }
  }, {
    key: "setupEventListeners",
    value: function setupEventListeners() {
      var _this2 = this;

      this.io.on('connection', function (socket) {
        // player disconnected
        socket.on('disconnect', function () {
          // delete user data from server
          delete _this2.players[socket.id]; // emit a message to all players to remove this player

          _this2.io.emit('disconnect', socket.id);
        });
        socket.on('newPlayer', function (token, frame) {
          try {
            var name = (0, _v["default"])();

            if (process.env.BYPASS_AUTH !== 'ENABLED') {
              // validate token, if valid send game information, else reject login
              var decoded = _jsonwebtoken["default"].verify(token, process.env.JWT_SECRET); // get the player's name


              name = decoded.user.name;
            } // create a new Player


            _this2.spawnPlayer(socket.id, name, frame); // send the players object to the new player


            socket.emit('currentPlayers', _this2.players); // send the monsters object to the new player

            socket.emit('currentMonsters', _this2.monsters); // send the chests object to the new player

            socket.emit('currentChests', _this2.chests); // send the items object to the new player

            socket.emit('currentItems', _this2.items); // inform the other players of the new player that joined

            socket.broadcast.emit('spawnPlayer', _this2.players[socket.id]);
          } catch (error) {
            console.log(error.message);
            socket.emit('invalidToken');
          }
        });
        socket.on('sendMessage',
        /*#__PURE__*/
        function () {
          var _ref = (0, _asyncToGenerator2["default"])(
          /*#__PURE__*/
          _regenerator["default"].mark(function _callee(message, token) {
            var name, email, decoded, _decoded$user;

            return _regenerator["default"].wrap(function _callee$(_context) {
              while (1) {
                switch (_context.prev = _context.next) {
                  case 0:
                    _context.prev = 0;
                    name = (0, _v["default"])();
                    email = '';

                    if (!(process.env.BYPASS_AUTH !== 'ENABLED')) {
                      _context.next = 10;
                      break;
                    }

                    // validate token, if valid send game information, else reject login
                    decoded = _jsonwebtoken["default"].verify(token, process.env.JWT_SECRET); // get the player's name

                    _decoded$user = decoded.user;
                    name = _decoded$user.name;
                    email = _decoded$user.email;
                    _context.next = 10;
                    return _ChatModel["default"].create({
                      email: email,
                      message: message
                    });

                  case 10:
                    // emit the message to all players
                    _this2.io.emit('newMessage', {
                      message: message,
                      name: name,
                      frame: _this2.players[socket.id].frame
                    });

                    _context.next = 17;
                    break;

                  case 13:
                    _context.prev = 13;
                    _context.t0 = _context["catch"](0);
                    console.log(_context.t0.message);
                    socket.emit('invalidToken');

                  case 17:
                  case "end":
                    return _context.stop();
                }
              }
            }, _callee, null, [[0, 13]]);
          }));

          return function (_x, _x2) {
            return _ref.apply(this, arguments);
          };
        }());
        socket.on('playerMovement', function (playerData) {
          if (_this2.players[socket.id]) {
            _this2.players[socket.id].x = playerData.x;
            _this2.players[socket.id].y = playerData.y;
            _this2.players[socket.id].flipX = playerData.flipX;
            _this2.players[socket.id].playerAttacking = playerData.playerAttacking;
            _this2.players[socket.id].currentDirection = playerData.currentDirection; // emit a message to all players about the player that moved

            _this2.io.emit('playerMoved', _this2.players[socket.id]);
          }
        });
        socket.on('playerDroppedItem', function (itemId) {
          _this2.players[socket.id].removeItem(itemId);

          socket.emit('updateItems', _this2.players[socket.id]);
          socket.broadcast.emit('updatePlayersItems', socket.id, _this2.players[socket.id]);
        });
        socket.on('pickUpItem', function (itemId) {
          // update the spawner
          if (_this2.items[itemId]) {
            if (_this2.players[socket.id].canPickupItem()) {
              _this2.players[socket.id].addItem(_this2.items[itemId]);

              socket.emit('updateItems', _this2.players[socket.id]);
              socket.broadcast.emit('updatePlayersItems', socket.id, _this2.players[socket.id]); // removing the item

              _this2.spawners[_this2.items[itemId].spawnerId].removeObject(itemId);
            }
          }
        });
        socket.on('pickUpChest', function (chestId) {
          // update the spawner
          if (_this2.chests[chestId]) {
            var gold = _this2.chests[chestId].gold; // updating the players gold

            _this2.players[socket.id].updateGold(gold);

            socket.emit('updateScore', _this2.players[socket.id].gold);
            socket.broadcast.emit('updatePlayersScore', socket.id, _this2.players[socket.id].gold); // removing the chest

            _this2.spawners[_this2.chests[chestId].spawnerId].removeObject(chestId);
          }
        });
        socket.on('monsterAttacked', function (monsterId) {
          // update the spawner
          if (_this2.monsters[monsterId]) {
            var _this2$monsters$monst = _this2.monsters[monsterId],
                gold = _this2$monsters$monst.gold,
                attack = _this2$monsters$monst.attack;
            var playerAttackValue = _this2.players[socket.id].attack; // subtract health monster model

            _this2.monsters[monsterId].loseHealth(playerAttackValue); // check the monsters health, and if dead remove that object


            if (_this2.monsters[monsterId].health <= 0) {
              // updating the players gold
              _this2.players[socket.id].updateGold(gold);

              socket.emit('updateScore', _this2.players[socket.id].gold); // removing the monster

              _this2.spawners[_this2.monsters[monsterId].spawnerId].removeObject(monsterId);

              _this2.io.emit('monsterRemoved', monsterId); // add bonus health to the player


              _this2.players[socket.id].updateHealth(15);

              _this2.io.emit('updatePlayerHealth', socket.id, _this2.players[socket.id].health);
            } else {
              // update the players health
              _this2.players[socket.id].playerAttacked(attack);

              _this2.io.emit('updatePlayerHealth', socket.id, _this2.players[socket.id].health); // update the monsters health


              _this2.io.emit('updateMonsterHealth', monsterId, _this2.monsters[monsterId].health); // check the player's health, if below 0 have the player respawn


              if (_this2.players[socket.id].health <= 0) {
                // update the gold the player has
                _this2.players[socket.id].updateGold(parseInt(-_this2.players[socket.id].gold / 2, 10));

                socket.emit('updateScore', _this2.players[socket.id].gold); // respawn the player

                _this2.players[socket.id].respawn(_this2.players);

                _this2.io.emit('respawnPlayer', _this2.players[socket.id]);
              }
            }
          }
        });
        socket.on('attackedPlayer', function (attackedPlayerId) {
          if (_this2.players[attackedPlayerId]) {
            // get required info from attacked player
            var gold = _this2.players[attackedPlayerId].gold;
            var playerAttackValue = _this2.players[socket.id].attack; // subtract health from attacked player

            _this2.players[attackedPlayerId].playerAttacked(playerAttackValue); // check attacked players health, if dead send gold to other player


            if (_this2.players[attackedPlayerId].health <= 0) {
              // get the amount of gold, and update player object
              _this2.players[socket.id].updateGold(gold); // respawn attacked player


              _this2.players[attackedPlayerId].respawn(_this2.players);

              _this2.io.emit('respawnPlayer', _this2.players[attackedPlayerId]); // send update gold message to player


              socket.emit('updateScore', _this2.players[socket.id].gold); // reset the attacked players gold

              _this2.players[attackedPlayerId].updateGold(-gold);

              _this2.io.to("".concat(attackedPlayerId)).emit('updateScore', _this2.players[attackedPlayerId].gold); // add bonus health to the player


              _this2.players[socket.id].updateHealth(15);

              _this2.io.emit('updatePlayerHealth', socket.id, _this2.players[socket.id].health);
            } else {
              _this2.io.emit('updatePlayerHealth', attackedPlayerId, _this2.players[attackedPlayerId].health);
            }
          }
        }); // player connected to our game

        console.log('player connected to our game');
        console.log(socket.id);
      });
    }
  }, {
    key: "setupSpawners",
    value: function setupSpawners() {
      var _this3 = this;

      var config = {
        spawnInterval: 3000,
        limit: 3,
        spawnerType: _utils.SpawnerType.CHEST,
        id: ''
      };
      var spawner; // create chest spawners

      Object.keys(this.chestLocations).forEach(function (key) {
        config.id = "chest-".concat(key);
        spawner = new _Spawner["default"](config, _this3.chestLocations[key], _this3.addChest.bind(_this3), _this3.deleteChest.bind(_this3));
        _this3.spawners[spawner.id] = spawner;
      }); // create monster spawners

      Object.keys(this.monsterLocations).forEach(function (key) {
        config.id = "monster-".concat(key);
        config.spawnerType = _utils.SpawnerType.MONSTER;
        spawner = new _Spawner["default"](config, _this3.monsterLocations[key], _this3.addMonster.bind(_this3), _this3.deleteMonster.bind(_this3), _this3.moveMonsters.bind(_this3));
        _this3.spawners[spawner.id] = spawner;
      }); // create item spawner

      config.id = 'item';
      config.spawnerType = _utils.SpawnerType.ITEM;
      config.limit = 3;
      config.spawnInterval = 1000 * 60 * 5;
      spawner = new _Spawner["default"](config, this.itemLocations, this.addItem.bind(this), this.deleteItem.bind(this));
      this.spawners[spawner.id] = spawner;
    }
  }, {
    key: "spawnPlayer",
    value: function spawnPlayer(playerId, name, frame) {
      var player = new _PlayerModel["default"](playerId, this.playerLocations, this.players, name, frame);
      this.players[playerId] = player;
    }
  }, {
    key: "addChest",
    value: function addChest(chestId, chest) {
      this.chests[chestId] = chest;
      this.io.emit('chestSpawned', chest);
    }
  }, {
    key: "deleteChest",
    value: function deleteChest(chestId) {
      delete this.chests[chestId];
      this.io.emit('chestRemoved', chestId);
    }
  }, {
    key: "addMonster",
    value: function addMonster(monsterId, monster) {
      this.monsters[monsterId] = monster;
      this.io.emit('monsterSpawned', monster);
    }
  }, {
    key: "deleteMonster",
    value: function deleteMonster(monsterId) {
      delete this.monsters[monsterId];
      this.io.emit('monsterRemoved', monsterId);
    }
  }, {
    key: "moveMonsters",
    value: function moveMonsters() {
      this.io.emit('monsterMovement', this.monsters);
    }
  }, {
    key: "addItem",
    value: function addItem(itemId, item) {
      this.items[itemId] = item;
      this.io.emit('itemSpawned', item);
    }
  }, {
    key: "deleteItem",
    value: function deleteItem(itemId) {
      delete this.items[itemId];
      this.io.emit('itemRemoved', itemId);
    }
  }]);
  return GameManager;
}();

exports["default"] = GameManager;
//# sourceMappingURL=GameManager.js.map