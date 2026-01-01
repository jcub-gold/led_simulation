export class KeyboardInput {
  constructor() {
    this.state = { dx: 0, dy: 0 };

    window.addEventListener("keydown", e => {
      if (e.key === "ArrowLeft") this.state = { dx: -1, dy: 0 };
      if (e.key === "ArrowRight") this.state = { dx: 1, dy: 0 };
      if (e.key === "ArrowUp") this.state = { dx: 0, dy: -1 };
      if (e.key === "ArrowDown") this.state = { dx: 0, dy: 1 };
    });

    window.addEventListener("keyup", () => {
      this.state = { dx: 0, dy: 0 };
    });
  }

  getDirection() {
    return this.state;
  }
}