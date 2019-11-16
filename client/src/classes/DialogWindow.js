import { createInputField } from '../utils/utils';
import ModalWindow from './ModalWindow';

export default class DialogWindow extends ModalWindow {
  constructor(scene, opts) {
    super(scene, opts);

    this.messages = [];
    this.messageCount = 0;
    this.messagesHeight = 0;
    this.messageGroup = this.scene.add.group();

    this.graphics.setDepth(2);
    this.createInput();
    this.createWindow();
    this.makeInteractive();
  }

  calculateWindowDimension() {
    const x = this.x - this.windowWidth - 2 + this.scene.cameras.main.worldView.x;
    const y = this.y + 2 + this.scene.cameras.main.worldView.y;
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

      // update position of dialog container
      this.dialogContainer.setPosition(x + 1, y + 1);
      this.dialogContainer.setAlpha(this.textAlpha);
    } else {
      this.rect = this.scene.add.rectangle(x + 1, y + 1, rectWidth - 1, rectHeight - 1);
      if (this.debug) this.rect.setFillStyle(0x6666ff);
      this.rect.setOrigin(0, 0);

      // create dialog container for the chat messages
      this.dialogContainer = this.scene.add.container(x + 1, y + 1);
      this.dialogContainer.setDepth(3);
      this.dialogContainer.setAlpha(this.textAlpha);
    }
  }

  makeInteractive() {
    this.rect.setInteractive();
    this.rect.on('pointerover', () => {
      this.input.classList.add('chat-visible');
      this.input.classList.remove('chat-invisible');

      this.windowAlpha = 1;
      this.borderAlpha = 1;
      this.textAlpha = 1;
      this.redrawWindow();
    });

    this.rect.on('pointerout', () => {
      this.input.classList.remove('chat-visible');
      this.input.classList.add('chat-invisible');

      this.windowAlpha = 0.4;
      this.borderAlpha = 0.3;
      this.textAlpha = 0.2;
      this.redrawWindow();
    });
  }

  addNewMessage(messageObject) {
    this.messages.push(messageObject);

    const windowDimensions = this.calculateWindowDimension();
    const message = `${messageObject.name}: ${messageObject.message}`;

    let messageText = this.messageGroup.getFirstDead();
    if (!messageText) {
      messageText = this.scene.add.text(0, this.messagesHeight, message, {
        fontSize: '18px',
        fill: '#fff',
        wordWrap: {
          width: windowDimensions.rectWidth,
        },
      });
      this.messageGroup.add(messageText);
    } else {
      messageText.setText(message);
      messageText.setY(this.messagesHeight);
      messageText.setActive(true);
      messageText.setVisible(true);
    }
    this.dialogContainer.add(messageText);
    this.messageCount += 1;
    this.messagesHeight += messageText.height;

    // stop the message list from going off screen
    if (this.messagesHeight > (windowDimensions.rectHeight - 60)) {
      // reset messages height
      this.messagesHeight = 0;
      // remove the first dialog item from our array
      this.messages.shift();
      // loop through the message group and update the text of each item
      this.messageGroup.getChildren().forEach((child, index) => {
        if (index > this.messages.length - 1) {
          child.setActive(false);
          child.setVisible(false);
        } else {
          child.setText(`${this.messages[index].name}: ${this.messages[index].message}`);
          child.setY(this.messagesHeight);
          child.setActive(true);
          child.setVisible(true);
          this.messagesHeight += child.height;
        }
      });
    }
  }

  resize(gameSize) {
    this.x = gameSize.width;

    if (gameSize.width < 560) {
      this.input.classList.remove('chat-sidebar');
      this.input.classList.add('chat-bottom');

      this.windowWidth = gameSize.width;
      this.windowHeight = 200;
      this.y = gameSize.height - this.windowHeight;
    } else {
      this.input.classList.add('chat-sidebar');
      this.input.classList.remove('chat-bottom');

      this.windowWidth = 305;
      this.windowHeight = gameSize.height;
      this.y = 0;
    }

    this.redrawWindow();
  }

  createInput() {
    this.input = createInputField('text', 'chatInput', 'chatInput', 'chat-input chat-invisible');

    if (this.x < 560) {
      this.input.classList.add('chat-bottom');
    } else {
      this.input.classList.add('chat-sidebar');
    }

    document.body.appendChild(this.input);
  }
}
