// ===== CAMERA =====

export class Camera {
  x = 0;
  y = 0;

  constructor(public width: number, public height: number) {}

  follow(target: { x: number; y: number }, mapWidth: number) {
    // Smooth horizontal follow
    const targetX = target.x - this.width / 2;
    this.x += (targetX - this.x) * 0.1;
    if (this.x < 0) this.x = 0;
    if (this.x + this.width > mapWidth) this.x = mapWidth - this.width;
  }
}
