// ===== BACKGROUND RENDERER =====

import { VIEWPORT_WIDTH, VIEWPORT_HEIGHT, TILE_SIZE, COLORS } from './constants';
import type { Camera } from './camera';

export class BackgroundRenderer {
  // Pre-calculated star positions for consistency
  private stars: { x: number; y: number; size: number; brightness: number }[] = [];
  
  constructor() {
    // Generate stable star field
    for (let i = 0; i < 60; i++) {
      this.stars.push({
        x: (i * 1237 + 421) % VIEWPORT_WIDTH,
        y: (i * 653 + 178) % (VIEWPORT_HEIGHT * 0.6),
        size: i % 3 === 0 ? 2 : 1,
        brightness: 0.4 + (i % 5) * 0.15,
      });
    }
  }

  draw(ctx: CanvasRenderingContext2D, camera: Camera, time: number) {
    const camX = camera.x;

    if (camX < 150 * TILE_SIZE) {
      this.drawDungeon(ctx, camX, time);
    } else if (camX < 300 * TILE_SIZE) {
      this.drawCastleWalls(ctx, camX, time);
    } else if (camX < 450 * TILE_SIZE) {
      this.drawSanctum(ctx, camX, time);
    } else {
      this.drawTower(ctx, camX, time);
    }
  }

  private drawDungeon(ctx: CanvasRenderingContext2D, camX: number, time: number) {
    // Deep dungeon background
    const grad = ctx.createLinearGradient(0, 0, 0, VIEWPORT_HEIGHT);
    grad.addColorStop(0, '#080510');
    grad.addColorStop(0.5, '#0d0a14');
    grad.addColorStop(1, '#120a0a');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, VIEWPORT_WIDTH, VIEWPORT_HEIGHT);

    // Background stone walls (parallax)
    ctx.fillStyle = '#0f0c16';
    for (let i = 0; i < 30; i++) {
      let wx = (i * 60 - camX * 0.15) % (VIEWPORT_WIDTH + 200);
      if (wx < -60) wx += VIEWPORT_WIDTH + 260;
      const wy = 20 + (i * 37) % 300;
      ctx.fillRect(wx, wy, 50, 30);
      ctx.fillStyle = '#0a0812';
      ctx.fillRect(wx + 1, wy + 14, 49, 2);
      ctx.fillStyle = '#0f0c16';
    }

    // Dripping water effect
    for (let i = 0; i < 5; i++) {
      const dx = (i * 180 - camX * 0.3) % VIEWPORT_WIDTH;
      const dropY = (time / 10 + i * 123) % VIEWPORT_HEIGHT;
      ctx.fillStyle = 'rgba(100, 150, 255, 0.3)';
      ctx.fillRect(dx, dropY, 2, 6);
    }

    // Fog at the bottom
    const fogGrad = ctx.createLinearGradient(0, VIEWPORT_HEIGHT - 80, 0, VIEWPORT_HEIGHT);
    fogGrad.addColorStop(0, 'rgba(20, 15, 30, 0)');
    fogGrad.addColorStop(1, 'rgba(20, 15, 30, 0.6)');
    ctx.fillStyle = fogGrad;
    ctx.fillRect(0, VIEWPORT_HEIGHT - 80, VIEWPORT_WIDTH, 80);
  }

  private drawCastleWalls(ctx: CanvasRenderingContext2D, camX: number, time: number) {
    // Night sky
    const grad = ctx.createLinearGradient(0, 0, 0, VIEWPORT_HEIGHT);
    grad.addColorStop(0, '#08081e');
    grad.addColorStop(0.4, '#101030');
    grad.addColorStop(1, '#1a1040');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, VIEWPORT_WIDTH, VIEWPORT_HEIGHT);

    // Stars with twinkle
    this.stars.forEach((star, i) => {
      const twinkle = Math.sin(time / 300 + i * 0.7) * 0.3 + star.brightness;
      ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0, twinkle)})`;
      ctx.fillRect(star.x, star.y, star.size, star.size);
    });

    // Moon
    ctx.save();
    ctx.fillStyle = '#fffacc';
    ctx.shadowBlur = 40;
    ctx.shadowColor = '#fffacc';
    ctx.beginPath();
    ctx.arc(650, 60, 25, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    // Moon crater
    ctx.fillStyle = '#eee8aa';
    ctx.fillRect(642, 54, 4, 4);
    ctx.fillRect(656, 64, 3, 3);
    ctx.restore();

    // Distant castle silhouettes (parallax)
    ctx.fillStyle = '#0d0d28';
    for (let i = 0; i < 4; i++) {
      let bx = (i * 250 - camX * 0.05) % (VIEWPORT_WIDTH + 400);
      if (bx < -120) bx += VIEWPORT_WIDTH + 520;
      // Tower shape
      ctx.fillRect(bx, 200, 30, 250);
      ctx.fillRect(bx + 50, 240, 60, 210);
      ctx.fillRect(bx + 40, 230, 10, 10);
      // Battlement
      ctx.fillRect(bx - 5, 190, 10, 14);
      ctx.fillRect(bx + 25, 190, 10, 14);
    }

    // Ground mist
    for (let i = 0; i < 8; i++) {
      const mx = (i * 120 + Math.sin(time / 800 + i) * 20 - camX * 0.2) % VIEWPORT_WIDTH;
      ctx.fillStyle = 'rgba(30, 20, 50, 0.4)';
      ctx.fillRect(mx, VIEWPORT_HEIGHT - 40, 80, 40);
    }
  }

  private drawSanctum(ctx: CanvasRenderingContext2D, camX: number, time: number) {
    // Deep dark interior
    const grad = ctx.createLinearGradient(0, 0, 0, VIEWPORT_HEIGHT);
    grad.addColorStop(0, '#0a0610');
    grad.addColorStop(0.5, '#15101f');
    grad.addColorStop(1, '#1a0a0a');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, VIEWPORT_WIDTH, VIEWPORT_HEIGHT);

    // Background pillars (parallax, slow)
    ctx.fillStyle = '#0e0a15';
    for (let i = 0; i < 8; i++) {
      let px = (i * 150 - camX * 0.08) % (VIEWPORT_WIDTH + 200);
      if (px < -50) px += VIEWPORT_WIDTH + 250;
      ctx.fillRect(px, 0, 40, VIEWPORT_HEIGHT);
      // Pillar capital
      ctx.fillStyle = '#12101a';
      ctx.fillRect(px - 5, 40, 50, 15);
      ctx.fillStyle = '#0e0a15';
    }

    // Stained glass window (far background)
    const windowX = 400 - (camX * 0.05) % 800;
    if (windowX > -100 && windowX < VIEWPORT_WIDTH + 100) {
      // Window frame
      ctx.fillStyle = '#1a1525';
      ctx.fillRect(windowX, 20, 60, 100);
      // Glass panels
      const wGlow = Math.sin(time / 600) * 0.1 + 0.3;
      ctx.fillStyle = `rgba(100, 50, 150, ${wGlow})`;
      ctx.fillRect(windowX + 4, 24, 24, 44);
      ctx.fillStyle = `rgba(200, 50, 100, ${wGlow})`;
      ctx.fillRect(windowX + 32, 24, 24, 44);
      ctx.fillStyle = `rgba(50, 80, 180, ${wGlow})`;
      ctx.fillRect(windowX + 4, 72, 52, 44);
      // Dividers
      ctx.fillStyle = '#0a0610';
      ctx.fillRect(windowX + 28, 20, 4, 100);
      ctx.fillRect(windowX, 68, 60, 4);
    }

    // Lava glow from below
    const lavaGlowIntensity = Math.sin(time / 400) * 0.05 + 0.1;
    const lavaGrad = ctx.createLinearGradient(0, VIEWPORT_HEIGHT - 100, 0, VIEWPORT_HEIGHT);
    lavaGrad.addColorStop(0, 'rgba(180, 50, 0, 0)');
    lavaGrad.addColorStop(1, `rgba(180, 50, 0, ${lavaGlowIntensity})`);
    ctx.fillStyle = lavaGrad;
    ctx.fillRect(0, VIEWPORT_HEIGHT - 100, VIEWPORT_WIDTH, 100);
  }

  private drawTower(ctx: CanvasRenderingContext2D, camX: number, time: number) {
    // Dramatic starry sky gradient
    const grad = ctx.createLinearGradient(0, 0, 0, VIEWPORT_HEIGHT);
    grad.addColorStop(0, '#000015');
    grad.addColorStop(0.3, '#0a0a30');
    grad.addColorStop(0.7, '#201040');
    grad.addColorStop(1, '#300a20');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, VIEWPORT_WIDTH, VIEWPORT_HEIGHT);

    // Stars with twinkle
    this.stars.forEach((star, i) => {
      const twinkle = Math.sin(time / 200 + i * 1.3) * 0.3 + star.brightness;
      ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0, twinkle)})`;
      ctx.fillRect(star.x, star.y, star.size, star.size);
    });

    // Large moon with window bars
    ctx.save();
    ctx.fillStyle = '#fffabc';
    ctx.shadowBlur = 50;
    ctx.shadowColor = '#fffabc';
    ctx.beginPath();
    ctx.arc(680, 70, 45, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    // Moon details
    ctx.fillStyle = '#eee8a0';
    ctx.fillRect(665, 58, 6, 6);
    ctx.fillRect(688, 72, 4, 4);
    ctx.fillRect(675, 82, 3, 3);
    // Window bars over moon
    ctx.fillStyle = '#201040';
    ctx.fillRect(676, 25, 8, 90);
    ctx.fillRect(635, 66, 90, 8);
    ctx.restore();

    // Distant floating particles (magic)
    for (let i = 0; i < 15; i++) {
      const px = (i * 73 + Math.sin(time / 400 + i * 2) * 30) % VIEWPORT_WIDTH;
      const py = (i * 41 + Math.cos(time / 500 + i) * 20) % VIEWPORT_HEIGHT;
      const alpha = Math.sin(time / 300 + i * 0.8) * 0.3 + 0.3;
      ctx.fillStyle = `rgba(200, 150, 255, ${Math.max(0, alpha)})`;
      ctx.fillRect(px, py, 2, 2);
    }
  }
}
