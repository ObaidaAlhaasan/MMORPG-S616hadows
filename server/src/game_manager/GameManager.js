import v4 from 'uuid/v4';
import jwt from 'jsonwebtoken';
import PlayerModel from './PlayerModel';
import * as levelData from '../../public/assets/level/large_level.json';
import Spawner from './Spawner';
import { SpawnerType } from './utils';
import ChatModel from '../models/ChatModel';
import * as itemData from '../../public/assets/level/tools.json';

export default class GameManager {
  constructor(io) {
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

  setup() {
    this.parseMapData();
    this.setupEventListeners();
    this.setupSpawners();
  }

  parseMapData() {
    this.levelData = levelData;
    this.levelData.layers.forEach((layer) => {
      if (layer.name === 'player_locations') {
        layer.objects.forEach((obj) => {
          this.playerLocations.push([obj.x, obj.y]);
        });
      } else if (layer.name === 'monster_locations') {
        layer.objects.forEach((obj) => {
          if (this.monsterLocations[obj.properties.spawner]) {
            this.monsterLocations[obj.properties.spawner].push([obj.x, obj.y]);
          } else {
            this.monsterLocations[obj.properties.spawner] = [[obj.x, obj.y]];
          }
        });
      } else if (layer.name === 'chest_locations') {
        layer.objects.forEach((obj) => {
          if (this.chestLocations[obj.properties.spawner]) {
            this.chestLocations[obj.properties.spawner].push([obj.x, obj.y]);
          } else {
            this.chestLocations[obj.properties.spawner] = [[obj.x, obj.y]];
          }
        });
      }
    });
  }

  setupEventListeners() {
    this.io.on('connection', (socket) => {
      // player disconnected
      socket.on('disconnect', () => {
        // delete user data from server
        delete this.players[socket.id];

        // emit a message to all players to remove this player
        this.io.emit('disconnect', socket.id);
      });

      socket.on('newPlayer', (token, frame) => {
        try {
          let name = v4();
          if (process.env.BYPASS_AUTH !== 'ENABLED') {
            // validate token, if valid send game information, else reject login
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // get the player's name
            ({ name } = decoded.user);
          }

          // create a new Player
          this.spawnPlayer(socket.id, name, frame);

          // send the players object to the new player
          socket.emit('currentPlayers', this.players);

          // send the monsters object to the new player
          socket.emit('currentMonsters', this.monsters);

          // send the chests object to the new player
          socket.emit('currentChests', this.chests);

          // send the items object to the new player
          socket.emit('currentItems', this.items);

          // inform the other players of the new player that joined
          socket.broadcast.emit('spawnPlayer', this.players[socket.id]);
        } catch (error) {
          console.log(error.message);
          socket.emit('invalidToken');
        }
      });

      socket.on('sendMessage', async (message, token) => {
        try {
          let name = v4();
          let email = '';

          if (process.env.BYPASS_AUTH !== 'ENABLED') {
            // validate token, if valid send game information, else reject login
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // get the player's name
            ({ name, email } = decoded.user);

            // store the message in the database
            await ChatModel.create({ email, message });
          }

          // emit the message to all players
          this.io.emit('newMessage', {
            message,
            name,
            frame: this.players[socket.id].frame,
          });
        } catch (error) {
          console.log(error.message);
          socket.emit('invalidToken');
        }
      });

      socket.on('playerMovement', (playerData) => {
        if (this.players[socket.id]) {
          this.players[socket.id].x = playerData.x;
          this.players[socket.id].y = playerData.y;
          this.players[socket.id].flipX = playerData.flipX;
          this.players[socket.id].playerAttacking = playerData.playerAttacking;
          this.players[socket.id].currentDirection = playerData.currentDirection;

          // emit a message to all players about the player that moved
          this.io.emit('playerMoved', this.players[socket.id]);
        }
      });

      socket.on('playerDroppedItem', (itemId) => {
        this.players[socket.id].removeItem(itemId);
        socket.emit('updateItems', this.players[socket.id]);
        socket.broadcast.emit('updatePlayersItems', socket.id, this.players[socket.id]);
      });

      socket.on('pickUpItem', (itemId) => {
        // update the spawner
        if (this.items[itemId]) {
          if (this.players[socket.id].canPickupItem()) {
            this.players[socket.id].addItem(this.items[itemId]);
            socket.emit('updateItems', this.players[socket.id]);
            socket.broadcast.emit('updatePlayersItems', socket.id, this.players[socket.id]);

            // removing the item
            this.spawners[this.items[itemId].spawnerId].removeObject(itemId);
          }
        }
      });

      socket.on('pickUpChest', (chestId) => {
        // update the spawner
        if (this.chests[chestId]) {
          const { gold } = this.chests[chestId];

          // updating the players gold
          this.players[socket.id].updateGold(gold);
          socket.emit('updateScore', this.players[socket.id].gold);
          socket.broadcast.emit('updatePlayersScore', socket.id, this.players[socket.id].gold);

          // removing the chest
          this.spawners[this.chests[chestId].spawnerId].removeObject(chestId);
        }
      });

      socket.on('monsterAttacked', (monsterId) => {
        // update the spawner
        if (this.monsters[monsterId]) {
          const { gold, attack } = this.monsters[monsterId];
          const playerAttackValue = this.players[socket.id].attack;

          // subtract health monster model
          this.monsters[monsterId].loseHealth(playerAttackValue);

          // check the monsters health, and if dead remove that object
          if (this.monsters[monsterId].health <= 0) {
            // updating the players gold
            this.players[socket.id].updateGold(gold);
            socket.emit('updateScore', this.players[socket.id].gold);

            // removing the monster
            this.spawners[this.monsters[monsterId].spawnerId].removeObject(monsterId);
            this.io.emit('monsterRemoved', monsterId);

            // add bonus health to the player
            this.players[socket.id].updateHealth(15);
            this.io.emit('updatePlayerHealth', socket.id, this.players[socket.id].health);
          } else {
            // update the players health
            this.players[socket.id].playerAttacked(attack);
            this.io.emit('updatePlayerHealth', socket.id, this.players[socket.id].health);

            // update the monsters health
            this.io.emit('updateMonsterHealth', monsterId, this.monsters[monsterId].health);

            // check the player's health, if below 0 have the player respawn
            if (this.players[socket.id].health <= 0) {
              // update the gold the player has
              this.players[socket.id].updateGold(parseInt(-this.players[socket.id].gold / 2, 10));
              socket.emit('updateScore', this.players[socket.id].gold);

              // respawn the player
              this.players[socket.id].respawn(this.players);
              this.io.emit('respawnPlayer', this.players[socket.id]);
            }
          }
        }
      });

      socket.on('attackedPlayer', (attackedPlayerId) => {
        if (this.players[attackedPlayerId]) {
          // get required info from attacked player
          const { gold } = this.players[attackedPlayerId];
          const playerAttackValue = this.players[socket.id].attack;

          // subtract health from attacked player
          this.players[attackedPlayerId].playerAttacked(playerAttackValue);

          // check attacked players health, if dead send gold to other player
          if (this.players[attackedPlayerId].health <= 0) {
            // get the amount of gold, and update player object
            this.players[socket.id].updateGold(gold);

            // respawn attacked player
            this.players[attackedPlayerId].respawn(this.players);
            this.io.emit('respawnPlayer', this.players[attackedPlayerId]);

            // send update gold message to player
            socket.emit('updateScore', this.players[socket.id].gold);

            // reset the attacked players gold
            this.players[attackedPlayerId].updateGold(-gold);
            this.io.to(`${attackedPlayerId}`).emit('updateScore', this.players[attackedPlayerId].gold);

            // add bonus health to the player
            this.players[socket.id].updateHealth(15);
            this.io.emit('updatePlayerHealth', socket.id, this.players[socket.id].health);
          } else {
            this.io.emit('updatePlayerHealth', attackedPlayerId, this.players[attackedPlayerId].health);
          }
        }
      });

      // player connected to our game
      console.log('player connected to our game');
      console.log(socket.id);
    });
  }

  setupSpawners() {
    const config = {
      spawnInterval: 3000,
      limit: 3,
      spawnerType: SpawnerType.CHEST,
      id: '',
    };
    let spawner;

    // create chest spawners
    Object.keys(this.chestLocations).forEach((key) => {
      config.id = `chest-${key}`;

      spawner = new Spawner(
        config,
        this.chestLocations[key],
        this.addChest.bind(this),
        this.deleteChest.bind(this),
      );
      this.spawners[spawner.id] = spawner;
    });

    // create monster spawners
    Object.keys(this.monsterLocations).forEach((key) => {
      config.id = `monster-${key}`;
      config.spawnerType = SpawnerType.MONSTER;

      spawner = new Spawner(
        config,
        this.monsterLocations[key],
        this.addMonster.bind(this),
        this.deleteMonster.bind(this),
        this.moveMonsters.bind(this),
      );
      this.spawners[spawner.id] = spawner;
    });

    // create item spawner
    config.id = 'item';
    config.spawnerType = SpawnerType.ITEM;
    config.limit = 3;
    config.spawnInterval = 1000 * 60 * 5;
    spawner = new Spawner(
      config,
      this.itemLocations,
      this.addItem.bind(this),
      this.deleteItem.bind(this),
    );
    this.spawners[spawner.id] = spawner;
  }

  spawnPlayer(playerId, name, frame) {
    const player = new PlayerModel(playerId, this.playerLocations, this.players, name, frame);
    this.players[playerId] = player;
  }

  addChest(chestId, chest) {
    this.chests[chestId] = chest;
    this.io.emit('chestSpawned', chest);
  }

  deleteChest(chestId) {
    delete this.chests[chestId];
    this.io.emit('chestRemoved', chestId);
  }

  addMonster(monsterId, monster) {
    this.monsters[monsterId] = monster;
    this.io.emit('monsterSpawned', monster);
  }

  deleteMonster(monsterId) {
    delete this.monsters[monsterId];
    this.io.emit('monsterRemoved', monsterId);
  }

  moveMonsters() {
    this.io.emit('monsterMovement', this.monsters);
  }

  addItem(itemId, item) {
    this.items[itemId] = item;
    this.io.emit('itemSpawned', item);
  }

  deleteItem(itemId) {
    delete this.items[itemId];
    this.io.emit('itemRemoved', itemId);
  }
}
