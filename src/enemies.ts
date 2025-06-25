import { Graphics, RenderLayer } from "pixi.js";
import { adaptState, adaptSyncEffect } from "promethium-js";

const [enemiesState, setEnemiesState] = adaptState({
  health: 100,
  position: { x: 1, y: 1 },
});

export const enemiesLayer = new RenderLayer();
const enemyGraphics = new Graphics();
enemiesLayer.attach();

function drawPlayerGraphics() {
  adaptSyncEffect(() => {
    enemyGraphics.clear();
    enemyGraphics
      .circle(100, 100, 50)
      .fill({ color: 0xff0000 })
      .stroke({ width: 2, color: 0x000000 });
    enemyGraphics.pivot.set(enemyGraphics.width / 2, enemyGraphics.height / 2);
    enemyGraphics.angle = 180;
    enemyGraphics.alpha = 1;
  });
}

function updatePlayerState() {}