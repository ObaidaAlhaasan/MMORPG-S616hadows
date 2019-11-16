export default class ModalWindow {
  constructor(scene, opts) {
    if (!opts) opts = {};
    const {
      x = 0,
      y = 0,
      debug = false,
      borderThickness = 3,
      borderColor = 0x907748,
      borderAlpha = 0.3,
      windowAlpha = 0.4,
      textAlpha = 0.2,
      windowColor = 0x303030,
      windowWidth = 305,
      windowHeight = scene.scale.height,
    } = opts;

    this.scene = scene;
    this.x = x;
    this.y = y;
    this.debug = debug;

    this.borderThickness = borderThickness;
    this.borderColor = borderColor;
    this.borderAlpha = borderAlpha;
    this.windowAlpha = windowAlpha;
    this.textAlpha = textAlpha;
    this.windowColor = windowColor;
    this.windowWidth = windowWidth;
    this.windowHeight = windowHeight;

    this.graphics = this.scene.add.graphics();
  }

  createOuterWindow({
    x, y, rectWidth, rectHeight,
  }) {
    this.graphics.lineStyle(this.borderThickness, this.borderColor, this.borderAlpha);
    this.graphics.strokeRect(x, y, rectWidth, rectHeight);
  }

  createInnerWindow({
    x, y, rectWidth, rectHeight,
  }) {
    this.graphics.fillStyle(this.windowColor, this.windowAlpha);
    this.graphics.fillRect(x + 1, y + 1, rectWidth - 1, rectHeight - 1);
  }

  redrawWindow() {
    this.graphics.clear();
    this.createWindow();
  }

  createWindow() {
    const windowDimensions = this.calculateWindowDimension();
    this.createOuterWindow(windowDimensions);
    this.createInnerWindow(windowDimensions);
    this.createInnerWindowRectangle(windowDimensions);
  }

  update() {
    // update the dialog window if the main world view has changed
    if (this.scene.cameras.main.worldView.x > 0 || this.scene.cameras.main.worldView.y > 0) {
      this.redrawWindow();
    }
  }
}
