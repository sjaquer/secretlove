// ===== CAMERA =====

import { VIEWPORT_WIDTH, VIEWPORT_HEIGHT, TILE_SIZE } from './constants';

export class Camera {
  x = 0;

  constructor(private vw: number = VIEWPORT_WIDTH, private vh: number = VIEWPORT_HEIGHT) {}

  follow(target: { x: number; y: number; width: number }, mapPixelWidth: number) {
    const targetX = target.x + target.width / 2 - this.vw / 2;
    this.x += (targetX - this.x) * 0.1;
    this.x = Math.max(0, Math.min(this.x, mapPixelWidth - this.vw));
  }

  reset() {
    this.x = 0;
  }
}
