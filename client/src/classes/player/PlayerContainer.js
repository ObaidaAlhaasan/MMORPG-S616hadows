import * as Phaser from 'phaser';
import Player from './Player';
import Direction from '../../utils/direction';

export default class PlayerContainer extends Phaser.GameObjects.Container {
  constructor(scene, x, y, key, frame, health, maxHealth, id, attackAudio, mainPlayer, playerName,
              gold, defenseValue, attackValue, items) {
    super(scene, x, y);
    this.scene = scene; // the scene this container will be added to
    this.velocity = 420; // the velocity when moving our player
    this.currentDirection = Direction.RIGHT;
    this.playerAttacking = false;
    this.flipX = true;
    this.swordHit = false;
    this.health = health;
    this.maxHealth = maxHealth;
    this.id = id;
    this.attackAudio = attackAudio;
    this.mainPlayer = mainPlayer;
    this.playerName = playerName;
    this.gold = gold;
    this.defenseValue = defenseValue;
    this.attackValue = attackValue;
    this.items = items;

    // set a size on the container
    this.setSize(64, 64);
    // enable physics
    this.scene.physics.world.enable(this);
    // collide with world bounds
    this.body.setCollideWorldBounds(true);
    // add the player container to our existing scene
    this.scene.add.existing(this);

    if (this.mainPlayer) {
      // have the camera follow the player
      this.scene.cameras.main.startFollow(this);
    }

    // create the player
    this.player = new Player(this.scene, 0, 0, key, frame);
    this.add(this.player);

    // create the weapon game object
    this.weapon = this.scene.add.image(40, 0, 'items', 4);
    this.scene.add.existing(this.weapon);
    this.weapon.setScale(1.5);
    this.scene.physics.world.enable(this.weapon);
    this.add(this.weapon);
    this.weapon.alpha = 0;

    // create the player healthbar
    this.createHealthBar();

    // create the player name
    this.createPlayerName();
  }

  createPlayerName() {
    this.playerNameText = this.scene.make.text({
      x: this.x - 32,
      y: this.y - 60,
      text: this.playerName,
      style: {
        font: '14px monospace',
        fill: '#ffffff',
      },
    });
  }

  updatePlayerNamePosition() {
    this.playerNameText.setPosition(this.x - 32, this.y - 60);
  }

  createHealthBar() {
    this.healthBar = this.scene.add.graphics();
    this.updateHealthBar();
  }

  updateHealthBar() {
    this.healthBar.clear();
    this.healthBar.fillStyle(0xffffff, 1);
    this.healthBar.fillRect(this.x - 32, this.y - 40, 64, 5);
    this.healthBar.fillGradientStyle(0xff0000, 0xffffff, 4);
    this.healthBar.fillRect(this.x - 32, this.y - 40, 64 * (this.health / this.maxHealth), 5);
  }

  updateHealth(health) {
    this.health = health;
    this.updateHealthBar();
  }

  respawn(playerObject) {
    this.health = playerObject.health;
    this.setPosition(playerObject.x, playerObject.y);
    this.updateHealthBar();
    this.updatePlayerNamePosition();
  }

  update(cursors) {
    this.body.setVelocity(0);

    if (this.mainPlayer) {
      if (cursors.left.isDown) {
        this.body.setVelocityX(-this.velocity);
        this.currentDirection = Direction.LEFT;
        this.player.flipX = false;
        this.flipX = false;
      } else if (cursors.right.isDown) {
        this.body.setVelocityX(this.velocity);
        this.currentDirection = Direction.RIGHT;
        this.player.flipX = true;
        this.flipX = true;
      }

      if (cursors.up.isDown) {
        this.body.setVelocityY(-this.velocity);
        this.currentDirection = Direction.UP;
      } else if (cursors.down.isDown) {
        this.body.setVelocityY(this.velocity);
        this.currentDirection = Direction.DOWN;
      }

      if (Phaser.Input.Keyboard.JustDown(cursors.space) && !this.playerAttacking) {
        this.attack();
      }
    }

    if (this.currentDirection === Direction.UP) {
      this.weapon.setPosition(0, -40);
    } else if (this.currentDirection === Direction.DOWN) {
      this.weapon.setPosition(0, 40);
    } else if (this.currentDirection === Direction.LEFT) {
      this.weapon.setPosition(-40, 0);
    } else if (this.currentDirection === Direction.RIGHT) {
      this.weapon.setPosition(40, 0);
    }

    if (this.playerAttacking) {
      if (this.weapon.flipX) {
        this.weapon.angle -= 10;
      } else {
        this.weapon.angle += 10;
      }
    } else {
      if (this.currentDirection === Direction.DOWN) {
        this.weapon.setAngle(-270);
      } else if (this.currentDirection === Direction.UP) {
        this.weapon.setAngle(-90);
      } else {
        this.weapon.setAngle(0);
      }

      this.weapon.flipX = false;
      if (this.currentDirection === Direction.LEFT) {
        this.weapon.flipX = true;
      }
    }

    this.updateHealthBar();
    this.updatePlayerNamePosition();
  }

  updateFlipX() {
    this.player.flipX = this.flipX;
  }

  attack() {
    this.weapon.alpha = 1;
    this.playerAttacking = true;
    if (this.mainPlayer) this.attackAudio.play();
    this.scene.time.delayedCall(150, () => {
      this.weapon.alpha = 0;
      this.playerAttacking = false;
      this.swordHit = false;
    }, [], this);
  }

  cleanUp() {
    this.healthBar.destroy();
    this.playerNameText.destroy();
    this.player.destroy();
    this.destroy();
  }

  dropItem(itemNumber) {
    const keys = Object.keys(this.items);
    delete this.items[keys[itemNumber]];
    this.scene.sendDropItemMessage(keys[itemNumber]);
  }
}
