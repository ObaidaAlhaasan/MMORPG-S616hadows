import * as Phaser from 'phaser';
import UiButton from '../classes/UiButton';
import {getParam} from '../utils/utils';

export default class TitleScene extends Phaser.Scene {
  constructor() {
    super('Title');
  }

  create() {
    // create title text
    this.titleText = this.add.text(this.scale.width / 2, this.scale.height / 2, 'S616hadows Games', {
      fontSize: '128px',
      fill: '#fff'
    });
    this.titleText.setOrigin(0.5);

    // create a login button
    this.loginButton = new UiButton(
      this,
      this.scale.width / 2,
      this.scale.height * 0.65,
      'button1',
      'button2',
      'Login',
      this.startScene.bind(this, 'Login'),
    );

    // create a sign up button
    this.signUpButton = new UiButton(
      this,
      this.scale.width / 2,
      this.scale.height * 0.75,
      'button1',
      'button2',
      'Sign Up',
      this.startScene.bind(this, 'SignUp'),
    );

    const resetPasswordSceneCheck = getParam('scene');
    if (resetPasswordSceneCheck && resetPasswordSceneCheck === 'resetPassword') {
      this.scale.removeListener('resize', this.resize);
      this.scene.start('ResetPassword');
    }

    // handle game resize
    this.scale.on('resize', this.resize, this);
    // resize our game
    this.resize({height: this.scale.height, width: this.scale.width});
  }

  startScene(targetScene) {
    this.scale.removeListener('resize', this.resize);
    this.scene.start(targetScene);
  }

  resize(gameSize) {
    const {width, height} = gameSize;

    this.cameras.resize(width, height);

    if (width < 1000) {
      this.titleText.setFontSize('64px');
    } else {
      this.titleText.setFontSize('128px');
    }

    if (height < 700) {
      this.titleText.setPosition(width / 2, height * 0.4);
      this.loginButton.setPosition(width / 2, height * 0.55);
      this.signUpButton.setPosition(width / 2, height * 0.7);
      this.loginButton.setScale(0.7);
      this.signUpButton.setScale(0.7);
    } else {
      this.titleText.setPosition(width / 2, height / 2);
      this.loginButton.setPosition(width / 2, height * 0.65);
      this.signUpButton.setPosition(width / 2, height * 0.75);
      this.loginButton.setScale(1);
      this.signUpButton.setScale(1);
    }
  }
}
