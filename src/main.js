import { Engine } from "./engine/Engine.js";
import { Maze } from "./engine/Maze.js";
import { KeyboardInput } from "./input/KeyboardInput.js";
import { LedBoardView } from "./render/LedBoardView.js";

import { mazeData } from "./mazeData.js"; // your maze array

function init() {
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

  const modal = document.getElementById("readme-modal");
  const openBtn = document.getElementById("readme-open");
  const closeBtn = document.getElementById("readme-close");
  const tabButtons = Array.from(document.querySelectorAll(".modal-tab"));
  const panels = Array.from(document.querySelectorAll(".modal-panel"));

  function setModalOpen(open) {
    if (!modal) return;
    modal.style.display = open ? "flex" : "none";
    modal.setAttribute("aria-hidden", open ? "false" : "true");
  }

  function setActiveTab(tabKey) {
    tabButtons.forEach(btn => {
      const active = btn.dataset.tab === tabKey;
      btn.dataset.active = active ? "true" : "false";
      btn.setAttribute("aria-selected", active ? "true" : "false");
    });
    panels.forEach(panel => {
      const active = panel.dataset.panel === tabKey;
      panel.dataset.active = active ? "true" : "false";
    });
  }

  if (openBtn && closeBtn && modal) {
    setModalOpen(true);

    openBtn.addEventListener("click", () => {
      setModalOpen(true);
    });

    closeBtn.addEventListener("click", () => {
      setModalOpen(false);
    });

    modal.addEventListener("click", e => {
      if (e.target === modal) setModalOpen(false);
    });

    tabButtons.forEach(btn => {
      btn.addEventListener("click", () => {
        setActiveTab(btn.dataset.tab);
      });
    });
  }
}

if (document.readyState === "loading") {
  window.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
