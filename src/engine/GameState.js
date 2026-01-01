import { GRID_SIZE } from "./constants.js";

export class GameState {
  constructor() {
    this.player = { x: 2, y: 2 };
    this.camera = { x: 2, y: 2 };

    this.frame = Array.from({ length: GRID_SIZE }, () =>
      Array(GRID_SIZE).fill(0)
    );
  }

  computeFrame(maze) {
    const { x: camX, y: camY } = this.camera;

    let startX = camX;
    let startY = camY;

    if (camX < 4) startX = 4;
    if (camX > 60) startX = 60;
    if (camY < 4) startY = 4;
    if (camY > 60) startY = 60;

    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        const mx = col + startX - 4;
        const my = row + startY - 4;
        this.frame[row][col] = maze.isWall(mx, my) ? 1 : 0;
      }
    }

    const px = this.player.x;
    const py = this.player.y;
    this.frame[py][px] = 1;

    return this.frame;
  }
}