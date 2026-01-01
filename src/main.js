import { Engine } from "./engine/Engine.js";
import { Maze } from "./engine/Maze.js";
import { KeyboardInput } from "./input/KeyboardInput.js";
import { LedBoardView } from "./render/LedBoardView.js";

import { mazeData } from "./mazeData.js"; // your maze array

const maze = new Maze(mazeData);
const engine = new Engine(maze);
const input = new KeyboardInput();

const renderer = new LedBoardView();

let last = performance.now();

function loop(now) {
  const dt = now - last;
  last = now;

  const { dx, dy } = input.getDirection();
  engine.move(dx, dy);
  engine.update(dt);

  renderer.draw(engine.getFrame());

  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
