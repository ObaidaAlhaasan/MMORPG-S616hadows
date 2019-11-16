import ModalWindow from './ModalWindow';

export default class InventoryWindow extends ModalWindow {
  constructor(scene, opts) {
    super(scene, opts);

    this.playerObject = {};
    this.mainPlayer = false;
    this.inventoryItems = {};
    this.graphics.setDepth(3);
    this.createWindow();
    this.hideWindow();
  }

  calculateWindowDimension() {
    let x = this.x + (this.scene.scale.width / 4);
    let y = this.y + (this.scene.scale.height * 0.1);

    if (this.scene.scale.width < 750) {
      x = this.x + 40;
      y = this.y + 40;
    }

    const rectHeight = this.windowHeight - 5;
    const rectWidth = this.windowWidth;
    return {
      x, y, rectWidth, rectHeight,
    };
  }

  createInnerWindowRectangle({
    x, y, rectWidth, rectHeight,
  }) {
    if (this.rect) {
      this.rect.setPosition(x + 1, y + 1);
      this.rect.setDisplaySize(rectWidth - 1, rectHeight - 1);

      // update the position of our inventory container
      this.inventoryContainer.setPosition(x + 1, y + 1);
      this.inventoryContainer.setSize(rectWidth - 1, rectHeight - 1);

      // center the title text
      this.titleText.setPosition(this.inventoryContainer.width / 2, 20);
      this.itemsText.setPosition(this.inventoryContainer.width / 2, 140);

      // update inventory container positions
      this.updateInventoryContainerPositions();
    } else {
      this.rect = this.scene.add.rectangle(x + 1, y + 1, rectWidth - 1, rectHeight - 1);
      if (this.debug) this.rect.setFillStyle(0x6666ff);
      this.rect.setOrigin(0, 0);

      // create inventory container for positioning elements
      this.inventoryContainer = this.scene.add.container(x + 1, y + 1);
      this.inventoryContainer.setDepth(3);
      this.inventoryContainer.setAlpha(this.textAlpha);

      // create inventory title
      this.titleText = this.scene.add.text(this.inventoryContainer.width / 2, 20, 'Player Stats', { fontSize: '22px', fill: '#ffffff', align: 'center' });
      this.titleText.setOrigin(0.5);
      this.inventoryContainer.add(this.titleText);

      // create inventory stats
      this.createInventoryStats();

      // create inventory slots
      this.createInventorySlots();
    }
  }

  createInventoryStats() {
    this.statsContainer = this.scene.add.container(0, 80);
    this.inventoryContainer.add(this.statsContainer);

    const textOptions = {
      fontSize: '22px',
      fill: '#ffffff',
    };

    // create attack stats information
    this.swordIcon = this.scene.add.image(0, 0, 'inventorySword').setScale(1.5);
    this.statsContainer.add(this.swordIcon);
    this.swordStatText = this.scene.add.text(0, 0, '100', textOptions);
    this.statsContainer.add(this.swordStatText);

    // create defense stats information
    this.shieldIcon = this.scene.add.image(90, 0, 'inventoryShield').setScale(1.5);
    this.statsContainer.add(this.shieldIcon);
    this.shieldStatText = this.scene.add.text(90, 0, '100', textOptions);
    this.statsContainer.add(this.shieldStatText);

    // create gold stats information
    this.goldIcon = this.scene.add.image(180, 0, 'inventoryGold').setScale(1.5);
    this.statsContainer.add(this.goldIcon);
    this.goldStatText = this.scene.add.text(180, 0, '100', textOptions);
    this.statsContainer.add(this.goldStatText);
  }

  updateInventoryContainerPositions() {
    this.inventoryContainer.setSize(this.inventoryContainer.width - 40, 80);
    this.swordIcon.x = this.inventoryContainer.width * 0.1;
    this.swordStatText.x = this.inventoryContainer.width * 0.1 + 30;
    this.shieldIcon.x = this.inventoryContainer.width * 0.5;
    this.shieldStatText.x = this.inventoryContainer.width * 0.5 + 30;
    this.goldIcon.x = this.inventoryContainer.width * 0.85;
    this.goldStatText.x = this.inventoryContainer.width * 0.85 + 30;

    for (let x = 0; x < 5; x += 1) {
      this.inventoryItems[x].item.x = this.inventoryContainer.width * 0.1;
      this.inventoryItems[x].discardButton.x = this.inventoryContainer.width;
      this.inventoryItems[x].itemName.x = this.inventoryContainer.width * 0.18;
      this.inventoryItems[x].attackIcon.x = this.inventoryContainer.width * 0.5;
      this.inventoryItems[x].defenseIcon.x = this.inventoryContainer.width * 0.65;
      this.inventoryItems[x].healthIcon.x = this.inventoryContainer.width * 0.8;
      this.inventoryItems[x].attackIconText.x = this.inventoryContainer.width * 0.5 + 15;
      this.inventoryItems[x].defenseIconText.x = this.inventoryContainer.width * 0.65 + 15;
      this.inventoryItems[x].healthIconText.x = this.inventoryContainer.width * 0.8 + 15;
    }
  }

  createInventorySlots() {
    // create items title
    this.itemsText = this.scene.add.text(this.inventoryContainer.width / 2, 140, 'Player Inventory', { fontSize: '22px', fill: '#ffffff', align: 'center' });
    this.itemsText.setOrigin(0.5);
    this.inventoryContainer.add(this.itemsText);

    // create containter
    this.itemsContainer = this.scene.add.container(0, 120);
    this.statsContainer.add(this.itemsContainer);

    this.createInventoryItems();
  }

  removeItem(itemNumber) {
    this.playerObject.dropItem(itemNumber);
    this.showWindow(this.playerObject, this.mainPlayer);
  }

  createInventoryItems() {
    for (let x = 0; x < 5; x += 1) {
      const yPos = 0 + 55 * x;

      // create inventory item icon
      this.inventoryItems[x] = {};
      this.inventoryItems[x].item = this.scene.add.image(0, yPos, 'tools', 0).setScale(1.5);
      this.itemsContainer.add(this.inventoryItems[x].item);

      // create discard item button
      this.inventoryItems[x].discardButton = this.scene.add.image(0, yPos, 'inventoryRemove').setScale(0.75).setInteractive();
      this.itemsContainer.add(this.inventoryItems[x].discardButton);
      this.inventoryItems[x].discardButton.on('pointerdown', () => {
        this.removeItem(x);
      });

      // create item name text
      this.inventoryItems[x].itemName = this.scene.add.text(0, yPos - 10, 'Item 1 Name', { fontSize: '14px', fill: '#ffffff' });
      this.itemsContainer.add(this.inventoryItems[x].itemName);

      // create item stats icons
      this.inventoryItems[x].attackIcon = this.scene.add.image(0, yPos, 'inventorySword').setScale(0.75);
      this.inventoryItems[x].defenseIcon = this.scene.add.image(0, yPos, 'inventoryShield').setScale(0.75);
      this.inventoryItems[x].healthIcon = this.scene.add.image(0, yPos, 'inventoryHeart').setScale(0.75);
      this.itemsContainer.add(this.inventoryItems[x].attackIcon);
      this.itemsContainer.add(this.inventoryItems[x].defenseIcon);
      this.itemsContainer.add(this.inventoryItems[x].healthIcon);

      // create items stats text
      this.inventoryItems[x].attackIconText = this.scene.add.text(0, yPos - 10, '5', { fontSize: '14px', fill: '#00ff00' });
      this.inventoryItems[x].defenseIconText = this.scene.add.text(0, yPos - 10, '10', { fontSize: '14px', fill: '#00ff00' });
      this.inventoryItems[x].healthIconText = this.scene.add.text(0, yPos - 10, '-5', { fontSize: '14px', fill: '#ff0000' });
      this.itemsContainer.add(this.inventoryItems[x].attackIconText);
      this.itemsContainer.add(this.inventoryItems[x].defenseIconText);
      this.itemsContainer.add(this.inventoryItems[x].healthIconText);
    }
  }

  resize(gameSize) {
    if (gameSize.width < 750) {
      this.windowWidth = this.scene.scale.width - 80;
      this.windowHeight = this.scene.scale.height - 80;
    } else {
      this.windowWidth = this.scene.scale.width / 2;
      this.windowHeight = this.scene.scale.height * 0.8;
    }

    this.redrawWindow();
  }

  hideWindow() {
    this.rect.disableInteractive();
    this.inventoryContainer.setAlpha(0);
    this.graphics.setAlpha(0);
  }

  showWindow(playerObject, mainPlayer) {
    this.mainPlayer = mainPlayer;
    this.playerObject = playerObject;
    this.rect.setInteractive();
    this.inventoryContainer.setAlpha(1);
    this.graphics.setAlpha(1);

    // update player stats
    this.swordStatText.setText(playerObject.attackValue);
    this.shieldStatText.setText(playerObject.defenseValue);
    this.goldStatText.setText(playerObject.gold);

    // hide inventory items that are not needed
    for (let i = Object.keys(playerObject.items).length; i < 5; i += 1) {
      this.hideInventoryItem(i);
    }

    // populate inventory items
    const keys = Object.keys(playerObject.items);
    for (let i = 0; i < keys.length; i += 1) {
      this.updateInventoryItem(playerObject.items[keys[i]], i);
    }
  }

  hideInventoryItem(itemNumber) {
    this.inventoryItems[itemNumber].item.setAlpha(0);
    this.inventoryItems[itemNumber].discardButton.setAlpha(0);
    this.inventoryItems[itemNumber].itemName.setAlpha(0);
    this.inventoryItems[itemNumber].attackIcon.setAlpha(0);
    this.inventoryItems[itemNumber].attackIconText.setAlpha(0);
    this.inventoryItems[itemNumber].defenseIcon.setAlpha(0);
    this.inventoryItems[itemNumber].defenseIconText.setAlpha(0);
    this.inventoryItems[itemNumber].healthIcon.setAlpha(0);
    this.inventoryItems[itemNumber].healthIconText.setAlpha(0);
  }

  showInventoryItem(itemNumber) {
    this.inventoryItems[itemNumber].item.setAlpha(1);
    this.inventoryItems[itemNumber].itemName.setAlpha(1);
    this.inventoryItems[itemNumber].attackIcon.setAlpha(1);
    this.inventoryItems[itemNumber].attackIconText.setAlpha(1);
    this.inventoryItems[itemNumber].defenseIcon.setAlpha(1);
    this.inventoryItems[itemNumber].defenseIconText.setAlpha(1);
    this.inventoryItems[itemNumber].healthIcon.setAlpha(1);
    this.inventoryItems[itemNumber].healthIconText.setAlpha(1);

    if (this.mainPlayer) {
      this.inventoryItems[itemNumber].discardButton.setAlpha(1);
    } else {
      this.inventoryItems[itemNumber].discardButton.setAlpha(0);
    }
  }

  updateInventoryItem(item, itemNumber) {
    this.inventoryItems[itemNumber].item.setFrame(item.frame);
    this.inventoryItems[itemNumber].itemName.setText(item.name);
    this.inventoryItems[itemNumber].attackIconText.setText(item.attackBonus);
    this.inventoryItems[itemNumber].defenseIconText.setText(item.defenseBonus);
    this.inventoryItems[itemNumber].healthIconText.setText(item.healthBonus);

    if (item.attackBonus > 0) {
      this.inventoryItems[itemNumber].attackIconText.setFill('#00ff00');
    } else {
      this.inventoryItems[itemNumber].attackIconText.setFill('#ff0000');
    }
    if (item.defenseBonus > 0) {
      this.inventoryItems[itemNumber].defenseIconText.setFill('#00ff00');
    } else {
      this.inventoryItems[itemNumber].defenseIconText.setFill('#ff0000');
    }
    if (item.healthBonus > 0) {
      this.inventoryItems[itemNumber].healthIconText.setFill('#00ff00');
    } else {
      this.inventoryItems[itemNumber].healthIconText.setFill('#ff0000');
    }

    this.showInventoryItem(itemNumber);
  }
}
