import { GameState } from "./GameState.js";
import {
  BLINK_PERIOD_MS,
  BASE_MOVE_DELAY_MS
} from "./constants.js";

export class Engine {
  constructor(maze) {
    this.maze = maze;
    this.state = new GameState();

    this.timeSinceMove = 0;
    this.timeSinceBlink = 0;
    this.blinkOn = true;

    this.pendingMove = { dx: 0, dy: 0 };
  }

  move(dx, dy) {
    this.pendingMove = { dx, dy };
  }

  update(dt) {
    this.timeSinceMove += dt;
    this.timeSinceBlink += dt;

    if (this.timeSinceBlink >= BLINK_PERIOD_MS) {
      this.blinkOn = !this.blinkOn;
      this.timeSinceBlink = 0;
    }

    if (this.timeSinceMove >= BASE_MOVE_DELAY_MS) {
      this.tryMove();
      this.timeSinceMove = 0;
    }
  }

  tryMove() {
    const { dx, dy } = this.pendingMove;
    if (dx === 0 && dy === 0) return;

    const prevX = this.state.camera.x;
    const prevY = this.state.camera.y;
    const nx = prevX + dx;
    const ny = prevY + dy;

    if (!this.maze.isWall(nx, ny)) {
      this.state.camera.x = nx;
      this.state.camera.y = ny;

      if (
        (nx <= 4 && prevX <= 4) ||
        (nx >= 60 && prevX >= 60)
      ) {
        this.state.player.x += dx;
      }

      if (
        (ny <= 4 && prevY <= 4) ||
        (ny >= 60 && prevY >= 60)
      ) {
        this.state.player.y += dy;
      }
    }
  }

  getFrame() {
    const frame = this.state.computeFrame(this.maze);

    if (!this.blinkOn) {
      const { x, y } = this.state.player;
      frame[y][x] = 0;
    }

    return frame;
  }
}
