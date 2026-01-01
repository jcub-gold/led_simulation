export class LedBoardView {
  constructor({ canvasId = "board" } = {}) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) {
      throw new Error(`Canvas element #${canvasId} not found`);
    }

    if (!this.canvas.width) this.canvas.width = 720;
    if (!this.canvas.height) this.canvas.height = 720;

    this.ctx = this.canvas.getContext("2d");

    this.BOARD = { x: 80, y: 80, w: 560, h: 560, r: 18 };
    this.ARDUINO_W = 120;
    this.LED_GRID = 8;
    this.COMPONENT_PIN_DX = 1;
    this.COMPONENT_PIN_DY = -1;

    this.PIN_SPACING = 14;
    this.PIN_START_X = this.BOARD.x + 16;
    this.PIN_START_Y = this.BOARD.y + 16;
    this.PIN_COUNT_X = Math.floor((this.BOARD.w - 32) / this.PIN_SPACING) + 1;
    this.PIN_COUNT_Y = Math.floor((this.BOARD.h - 32) / this.PIN_SPACING) + 1;
  }

  pinToCanvas(px, py) {
    return {
      x: this.PIN_START_X + px * this.PIN_SPACING,
      y: this.PIN_START_Y + py * this.PIN_SPACING
    };
  }

  roundedRect(x, y, w, h, r) {
    const { ctx } = this;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  drawBoard() {
    const { ctx, BOARD } = this;
    this.roundedRect(BOARD.x, BOARD.y, BOARD.w, BOARD.h, BOARD.r);
    ctx.fillStyle = "#b13a2f";
    ctx.fill();
  }

  drawPerfHoles() {
    const { ctx, PIN_START_X, PIN_START_Y, PIN_SPACING, PIN_COUNT_X, PIN_COUNT_Y } = this;
    ctx.fillStyle = "#6b1e18";
    for (let y = PIN_START_Y; y <= PIN_START_Y + (PIN_COUNT_Y - 1) * PIN_SPACING; y += PIN_SPACING) {
      for (let x = PIN_START_X; x <= PIN_START_X + (PIN_COUNT_X - 1) * PIN_SPACING; x += PIN_SPACING) {
        ctx.beginPath();
        ctx.arc(x, y, 1.6, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  drawArduinoArea() {
    const { ctx, BOARD, ARDUINO_W } = this;
    const x = BOARD.x + 12;
    const y = BOARD.y + 20;
    const w = ARDUINO_W - 24;
    const h = 240;

    ctx.fillStyle = "#d27a7a";
    ctx.fillRect(x, y, w, h);

    ctx.strokeStyle = "#8a2f2f";
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, w, h);

    ctx.fillStyle = "#222";
    ctx.font = "bold 14px monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("ARDUINO", x + w / 2, y + h / 2);
  }

  drawLedOff(cx, cy, r) {
    const { ctx } = this;
    const grad = ctx.createRadialGradient(
      cx - r * 0.2,
      cy - r * 0.2,
      r * 0.1,
      cx,
      cy,
      r
    );
    grad.addColorStop(0, "#8a8a8a");
    grad.addColorStop(1, "#4f4f4f");

    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();

    ctx.strokeStyle = "rgba(0,0,0,0.65)";
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(
      cx - r * 0.35,
      cy - r * 0.35,
      r * 0.22,
      0,
      Math.PI * 2
    );
    ctx.fillStyle = "rgba(255,255,255,0.04)";
    ctx.fill();
  }

  drawLedOn(cx, cy, r) {
    const { ctx } = this;
    const glow = ctx.createRadialGradient(cx, cy, r * 0.4, cx, cy, r * 1.9);
    glow.addColorStop(0, "rgba(255,255,255,0.55)");
    glow.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(cx, cy, r * 1.9, 0, Math.PI * 2);
    ctx.fill();

    const grad = ctx.createRadialGradient(
      cx - r * 0.25,
      cy - r * 0.25,
      r * 0.2,
      cx,
      cy,
      r
    );
    grad.addColorStop(0, "#ffffff");
    grad.addColorStop(0.6, "#ffffff");
    grad.addColorStop(1, "#dadada");

    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();

    ctx.strokeStyle = "rgba(0,0,0,0.2)";
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(cx - r * 0.35, cy - r * 0.35, r * 0.4, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,255,255,0.6)";
    ctx.fill();
  }

  drawLEDs(frame) {
    const { PIN_SPACING, PIN_COUNT_X, LED_GRID, COMPONENT_PIN_DX, COMPONENT_PIN_DY } = this;
    const LED_STEP = 3 * PIN_SPACING;
    const r = PIN_SPACING * 0.9;

    const anchorPinX = PIN_COUNT_X - 4 + COMPONENT_PIN_DX;
    const anchorPinY = 3 + COMPONENT_PIN_DY;

    const { x: startX, y: startY } = this.pinToCanvas(anchorPinX, anchorPinY);

    for (let row = 0; row < LED_GRID; row++) {
      for (let col = 0; col < LED_GRID; col++) {
        const cx = startX - col * LED_STEP;
        const cy = startY + row * LED_STEP;

        const on = frame[row][LED_GRID - 1 - col] === 1;
        if (on) this.drawLedOn(cx, cy, r);
        else this.drawLedOff(cx, cy, r);
      }
    }
  }

  drawRowWiresAndTransistors() {
    const { PIN_COUNT_X, LED_GRID, COMPONENT_PIN_DX, COMPONENT_PIN_DY, PIN_SPACING, ctx } = this;
    const leftmostLedPinX =
      PIN_COUNT_X - 4 - (LED_GRID - 1) * 3 + COMPONENT_PIN_DX;

    const transistorPinX = leftmostLedPinX - 3;
    const transistorStartPinY = 3 + COMPONENT_PIN_DY;

    const halfPin = PIN_SPACING / 2;

    for (let row = 0; row < LED_GRID; row++) {
      let { x, y } = this.pinToCanvas(
        transistorPinX,
        transistorStartPinY + row * 3
      );

      x += halfPin;
      y -= halfPin;

      ctx.fillStyle = "#111";

      ctx.fillRect(x - 7.5, y + 4.5, 15, 10.5);

      ctx.beginPath();
      ctx.moveTo(x - 6.75, y + 4.5);
      ctx.lineTo(x + 6.75, y + 4.5);
      ctx.lineTo(x + 4.5, y - 6);
      ctx.lineTo(x - 4.5, y - 6);
      ctx.closePath();
      ctx.fill();
    }
  }

  drawColumnResistors() {
    const { PIN_COUNT_X, LED_GRID, COMPONENT_PIN_DX, COMPONENT_PIN_DY, ctx } = this;
    const basePinX = PIN_COUNT_X - 4 + COMPONENT_PIN_DX;
    const basePinY = 3 + LED_GRID * 3 + 1 + COMPONENT_PIN_DY;

    for (let col = 0; col < LED_GRID; col++) {
      const { x, y } = this.pinToCanvas(basePinX - col * 3, basePinY);

      ctx.strokeStyle = "#777";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x, y - 14);
      ctx.lineTo(x, y - 6);
      ctx.moveTo(x, y + 6);
      ctx.lineTo(x, y + 14);
      ctx.stroke();

      ctx.fillStyle = "#e6d4a3";
      ctx.fillRect(x - 8, y - 6, 16, 12);

      ctx.strokeStyle = "#8a6b2d";
      ctx.strokeRect(x - 8, y - 6, 16, 12);
    }
  }

  drawMinus(x, y, size = 5) {
    const { ctx } = this;
    ctx.beginPath();
    ctx.moveTo(x - size, y);
    ctx.lineTo(x + size, y);
    ctx.stroke();
  }

  drawPlus(x, y, size = 5) {
    const { ctx } = this;
    ctx.beginPath();
    ctx.moveTo(x - size, y);
    ctx.lineTo(x + size, y);
    ctx.moveTo(x, y - size);
    ctx.lineTo(x, y + size);
    ctx.stroke();
  }

  drawMatrixGuideLines() {
    const { PIN_COUNT_X, LED_GRID, COMPONENT_PIN_DX, COMPONENT_PIN_DY, PIN_SPACING, ctx } = this;
    const anchorPinX = PIN_COUNT_X - 4 + COMPONENT_PIN_DX;
    const anchorPinY = 3 + COMPONENT_PIN_DY;

    const leftmostLedPinX = anchorPinX - (LED_GRID - 1) * 3;
    const transistorPinX = leftmostLedPinX - 3;

    const resistorBasePinY = 3 + LED_GRID * 3 + 1 + COMPONENT_PIN_DY;

    const vPinXs = [
      transistorPinX - 0.5,
      transistorPinX - 1.5,
      transistorPinX - 2.5
    ];

    const hPinYs = [
      resistorBasePinY + 1.5,
      resistorBasePinY + 2.5,
      resistorBasePinY + 3.5
    ];

    const topY = this.pinToCanvas(0, 0).y - PIN_SPACING / 2;
    const bottomY = this.pinToCanvas(0, hPinYs[2]).y;

    const rightX = this.pinToCanvas(PIN_COUNT_X - 1, 0).x + PIN_SPACING / 2;

    ctx.save();
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 1;

    ctx.beginPath();

    for (let i = 0; i < vPinXs.length; i++) {
      const x = this.pinToCanvas(vPinXs[i], 0).x;
      const yEnd = this.pinToCanvas(0, hPinYs[i]).y;

      ctx.moveTo(x, topY);
      ctx.lineTo(x, yEnd);
    }

    for (let i = 0; i < hPinYs.length; i++) {
      const y = this.pinToCanvas(0, hPinYs[i]).y;
      const xStart = this.pinToCanvas(vPinXs[i], 0).x;

      ctx.moveTo(xStart, y);
      ctx.lineTo(rightX, y);
    }

    ctx.stroke();
    ctx.restore();

    const yTop = this.pinToCanvas(0, hPinYs[0]).y;
    const yMiddle = this.pinToCanvas(0, hPinYs[1]).y;
    const yBottom = this.pinToCanvas(0, hPinYs[2]).y;

    const symbolX = rightX + 9;

    ctx.save();
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 1;

    this.drawPlus(symbolX, (yTop + yMiddle) / 2, 5);
    this.drawMinus(symbolX, (yMiddle + yBottom) / 2, 5);

    ctx.restore();
  }

  drawInnerFill() {
    const { PIN_COUNT_X, LED_GRID, COMPONENT_PIN_DX, COMPONENT_PIN_DY, PIN_SPACING, ctx } = this;
    const anchorPinX = PIN_COUNT_X - 4 + COMPONENT_PIN_DX;
    const anchorPinY = 3 + COMPONENT_PIN_DY;

    const leftmostLedPinX = anchorPinX - (LED_GRID - 1) * 3;
    const transistorPinX = leftmostLedPinX - 3;

    const resistorBasePinY = 3 + LED_GRID * 3 + 1 + COMPONENT_PIN_DY;

    const vPinXs = [
      transistorPinX - 0.5,
      transistorPinX - 1.5,
      transistorPinX - 2.5
    ];

    const hPinYs = [
      resistorBasePinY + 1.5,
      resistorBasePinY + 2.5,
      resistorBasePinY + 3.5
    ];

    const xV2 = this.pinToCanvas(vPinXs[0], 0).x;
    const xV3 = this.pinToCanvas(vPinXs[1], 0).x;

    const yH1 = this.pinToCanvas(0, hPinYs[0]).y;
    const yH2 = this.pinToCanvas(0, hPinYs[1]).y;

    const topY = this.pinToCanvas(0, 0).y - PIN_SPACING / 2;
    const rightX = this.pinToCanvas(PIN_COUNT_X - 1, 0).x + PIN_SPACING / 2;

    ctx.save();
    ctx.fillStyle = "#f0f0f0";

    ctx.fillRect(
      xV3,
      topY,
      xV2 - xV3,
      yH1 - topY
    );

    ctx.fillRect(
      xV3,
      yH1,
      rightX - xV3,
      yH2 - yH1
    );

    ctx.restore();
  }

  render(frame) {
    const { ctx, canvas } = this;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    this.drawBoard();
    this.drawInnerFill();
    this.drawPerfHoles();
    this.drawArduinoArea();
    this.drawLEDs(frame);
    this.drawRowWiresAndTransistors();
    this.drawColumnResistors();
    this.drawMatrixGuideLines();
  }

  draw(frame) {
    this.render(frame);
  }
}
