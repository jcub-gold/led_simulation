import { MAZE_SIZE } from "./constants.js";

export class Maze {
  constructor(data) {
    this.data = data;
    this.width = MAZE_SIZE;
    this.height = MAZE_SIZE;
  }

  isWall(x, y) {
    if (x < 0 || y < 0 || x >= this.width || y >= this.height) {
      return true;
    }

    const col = Math.floor(x / 16);
    const bit = 15 - (x % 16);
    return (this.data[y][col] & (1 << bit)) !== 0;
  }
}