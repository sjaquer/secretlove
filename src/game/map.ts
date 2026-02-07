// ===== GAME MAP – Tile rendering, decorations, flowers, portal =====

import {
  TILE_SIZE, VIEWPORT_WIDTH, VIEWPORT_HEIGHT, LEVEL_HEIGHT,
  TILE_AIR, TILE_GROUND, TILE_PLATFORM, TILE_HAZARD, TILE_BRIDGE, TILE_SPECIAL,
  THEME_COLORS, FLOWER_MESSAGES,
} from './constants';
import type {
  LevelTheme, Flower, TorchObj, Checkpoint, Portal,
  GameState, LevelData, IMapAccessor,
} from './types';
import type { Player } from './player';
import type { AudioSystem } from './audio';

export class GameMap implements IMapAccessor {
  width = 100;
  height = LEVEL_HEIGHT;
  tiles: Uint8Array = new Uint8Array(0);
  theme: LevelTheme = 'castle';

  flowers: Flower[] = [];
  torches: TorchObj[] = [];
  checkpoints: Checkpoint[] = [];
  portal: Portal = { x: 0, y: 0, active: false };

  private globalFlowerOffset = 0; // flower index offset based on level

  // Callbacks
  private onFlower: ((total: number) => void) | null = null;
  private onMessage: ((text: string, opts?: { autoClear?: boolean; duration?: number }) => void) | null = null;
  private onWin: (() => void) | null = null;

  loadLevel(data: LevelData, theme: LevelTheme, flowerOffset: number) {
    this.width = data.width;
    this.height = data.height;
    this.tiles = data.tiles;
    this.theme = theme;
    this.globalFlowerOffset = flowerOffset;

    this.flowers = data.flowers.map((f, i) => ({
      x: f.x, y: f.y,
      id: flowerOffset + i,
      active: true,
      animOffset: Math.random() * Math.PI * 2,
    }));

    this.torches = data.torches;
    this.checkpoints = data.checkpoints;
    this.portal = { x: data.portalX, y: data.portalY, active: true };
  }

  setCallbacks(
    onFlower: (total: number) => void,
    onMessage: (text: string, opts?: { autoClear?: boolean; duration?: number }) => void,
    onWin: () => void,
  ) {
    this.onFlower = onFlower;
    this.onMessage = onMessage;
    this.onWin = onWin;
  }

  getTile(x: number, y: number): number {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) return TILE_AIR;
    return this.tiles[y * this.width + x];
  }

  update(player: Player, audio: AudioSystem, state: GameState) {
    // Check flower collection
    for (const f of this.flowers) {
      if (!f.active) continue;
      const dx = (player.x + player.width / 2) - (f.x + 12);
      const dy = (player.y + player.height / 2) - (f.y + 12);
      if (Math.abs(dx) < 22 && Math.abs(dy) < 22) {
        f.active = false;
        state.totalFlowers++;
        state.score += 500;
        audio.playSound('coin');
        this.onFlower?.(state.totalFlowers);

        const msgIdx = f.id % FLOWER_MESSAGES.length;
        this.onMessage?.(FLOWER_MESSAGES[msgIdx], { autoClear: false });
        state.isPausedForFlower = true;
        state.flowerPauseStartTime = Date.now();
      }
    }

    // Check portal – skip if already fading/dying or transitioning
    if (this.portal.active && !state.isFading && !state.levelTransitioning) {
      const dx = (player.x + player.width / 2) - (this.portal.x + 16);
      const dy = (player.y + player.height / 2) - (this.portal.y + 16);
      if (Math.abs(dx) < 24 && Math.abs(dy) < 24) {
        this.portal.active = false; // deactivate so it can't fire twice
        audio.playSound('portal');
        this.onWin?.();
      }
    }

    // Update checkpoint
    for (const cp of this.checkpoints) {
      const dx = (player.x + player.width / 2) - (cp.x + 16);
      const dy = (player.y + player.height / 2) - (cp.y + 16);
      if (Math.abs(dx) < 30 && Math.abs(dy) < 30) {
        state.lastCheckpoint = { x: cp.x, y: cp.y };
      }
    }
  }

  // ===== DRAW =====
  draw(ctx: CanvasRenderingContext2D, camX: number) {
    const colors = THEME_COLORS[this.theme];
    const startTX = Math.floor(camX / TILE_SIZE) - 1;
    const endTX = startTX + Math.ceil(VIEWPORT_WIDTH / TILE_SIZE) + 2;
    const time = Date.now();

    // Draw tiles
    for (let ty = 0; ty < this.height; ty++) {
      for (let tx = startTX; tx <= endTX; tx++) {
        if (tx < 0 || tx >= this.width) continue;
        const tile = this.getTile(tx, ty);
        if (tile === TILE_AIR) continue;

        const sx = Math.floor(tx * TILE_SIZE - camX);
        const sy = ty * TILE_SIZE;

        switch (tile) {
          case TILE_GROUND:
            this.drawGround(ctx, sx, sy, tx, ty, colors);
            break;
          case TILE_PLATFORM:
            this.drawPlatform(ctx, sx, sy, colors);
            break;
          case TILE_HAZARD:
            this.drawHazard(ctx, sx, sy, time, colors);
            break;
          case TILE_BRIDGE:
            this.drawBridge(ctx, sx, sy, colors);
            break;
          case TILE_SPECIAL:
            this.drawSpecial(ctx, sx, sy, colors);
            break;
        }
      }
    }

    // Draw torches
    for (const torch of this.torches) {
      this.drawTorch(ctx, torch.x - camX, torch.y, time);
    }

    // Draw flowers
    for (const f of this.flowers) {
      if (!f.active) continue;
      this.drawFlower(ctx, f.x - camX, f.y, time, f.animOffset);
    }

    // Draw portal
    if (this.portal.active) {
      this.drawPortal(ctx, this.portal.x - camX, this.portal.y, time);
    }
  }

  // --- Tile renderers ---

  private drawGround(ctx: CanvasRenderingContext2D, x: number, y: number, tx: number, ty: number, c: Record<string, string>) {
    ctx.fillStyle = c.ground1;
    ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
    // Top edge line
    const above = this.getTile(tx, ty - 1);
    if (above === TILE_AIR || above === TILE_HAZARD || above === TILE_PLATFORM) {
      ctx.fillStyle = c.groundHighlight;
      ctx.fillRect(x, y, TILE_SIZE, 2);
    }
    // Mortar lines
    ctx.fillStyle = c.groundLine;
    ctx.fillRect(x, y + TILE_SIZE - 1, TILE_SIZE, 1);
    ctx.fillRect(x + TILE_SIZE - 1, y, 1, TILE_SIZE);
    // Subtle noise
    if ((tx + ty) % 3 === 0) {
      ctx.fillStyle = c.ground2;
      ctx.fillRect(x + 4, y + 8, 6, 4);
    }
    if ((tx * 7 + ty * 3) % 5 === 0) {
      ctx.fillStyle = c.groundHighlight;
      ctx.fillRect(x + 12, y + 3, 3, 2);
    }
  }

  private drawPlatform(ctx: CanvasRenderingContext2D, x: number, y: number, c: Record<string, string>) {
    ctx.fillStyle = c.platform;
    ctx.fillRect(x, y, TILE_SIZE, 8);
    ctx.fillStyle = c.platformLine;
    ctx.fillRect(x, y + 8, TILE_SIZE, 2);
    ctx.fillStyle = c.groundHighlight;
    ctx.fillRect(x, y, TILE_SIZE, 2);
  }

  private drawHazard(ctx: CanvasRenderingContext2D, x: number, y: number, time: number, c: Record<string, string>) {
    // Animated hazard (lava/water/quicksand/void)
    const wave = Math.sin(time * 0.003 + x * 0.05) * 3;
    ctx.fillStyle = c.hazard2;
    ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
    ctx.fillStyle = c.hazard1;
    ctx.fillRect(x, y + 4 + wave, TILE_SIZE, TILE_SIZE - 4);

    // Bubbles/particles
    const bubble1Y = y + 8 + Math.sin(time * 0.005 + x) * 4;
    const bubble2Y = y + 14 + Math.sin(time * 0.004 + x * 1.3) * 3;
    ctx.fillStyle = c.hazardGlow;
    ctx.beginPath();
    ctx.arc(x + 8, bubble1Y, 3, 0, Math.PI * 2);
    ctx.arc(x + 22, bubble2Y, 2, 0, Math.PI * 2);
    ctx.fill();

    // Surface glow
    ctx.fillStyle = c.hazardGlow;
    ctx.fillRect(x, y + wave, TILE_SIZE, 6);
  }

  private drawBridge(ctx: CanvasRenderingContext2D, x: number, y: number, c: Record<string, string>) {
    ctx.fillStyle = c.bridge;
    ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
    // Planks
    ctx.fillStyle = c.bridgeLine;
    for (let i = 0; i < 4; i++) {
      ctx.fillRect(x + i * 8, y, 1, TILE_SIZE);
    }
    // Nails
    ctx.fillStyle = '#888';
    ctx.fillRect(x + 2, y + 2, 2, 2);
    ctx.fillRect(x + 18, y + 14, 2, 2);
    // Top edge
    ctx.fillStyle = c.bridge;
    ctx.fillRect(x, y, TILE_SIZE, 3);
  }

  private drawSpecial(ctx: CanvasRenderingContext2D, x: number, y: number, c: Record<string, string>) {
    ctx.fillStyle = c.special1;
    ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
    ctx.fillStyle = c.special2;
    ctx.fillRect(x + 2, y + 2, 12, 8);
    // Moss patches
    ctx.fillStyle = c.specialMoss;
    ctx.fillRect(x + 1, y, 6, 3);
    ctx.fillRect(x + 20, y + 4, 8, 3);
    ctx.fillRect(x + 4, y + TILE_SIZE - 4, 10, 4);
  }

  // --- Decorations ---

  private drawTorch(ctx: CanvasRenderingContext2D, x: number, y: number, time: number) {
    // Holder
    ctx.fillStyle = '#5a4a3a';
    ctx.fillRect(x + 4, y + 8, 6, 16);
    ctx.fillStyle = '#8b7a5a';
    ctx.fillRect(x + 2, y + 6, 10, 4);

    // Flame (animated)
    const flicker = Math.sin(time * 0.01) * 2;
    const flicker2 = Math.cos(time * 0.015) * 1.5;
    ctx.fillStyle = '#ff6600';
    ctx.beginPath();
    ctx.ellipse(x + 7, y + 2 + flicker, 4, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffaa00';
    ctx.beginPath();
    ctx.ellipse(x + 7 + flicker2, y + 1 + flicker, 2.5, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffee66';
    ctx.beginPath();
    ctx.ellipse(x + 7, y + 2 + flicker, 1.5, 2, 0, 0, Math.PI * 2);
    ctx.fill();

    // Glow
    ctx.save();
    ctx.globalAlpha = 0.12 + Math.sin(time * 0.008) * 0.04;
    const glow = ctx.createRadialGradient(x + 7, y + 2, 2, x + 7, y + 2, 40);
    glow.addColorStop(0, '#ff880088');
    glow.addColorStop(1, '#ff880000');
    ctx.fillStyle = glow;
    ctx.fillRect(x - 33, y - 38, 80, 80);
    ctx.restore();

    // Sparks
    for (let i = 0; i < 2; i++) {
      const sx = x + 5 + Math.sin(time * 0.008 + i * 3) * 4;
      const sy = y - 4 - (time * 0.03 + i * 20) % 12;
      ctx.fillStyle = '#ffcc44';
      ctx.fillRect(sx, sy, 1, 1);
    }
  }

  private drawFlower(ctx: CanvasRenderingContext2D, x: number, y: number, time: number, offset: number) {
    const bob = Math.sin(time * 0.003 + offset) * 3;
    const fx = x + 4;
    const fy = y + bob;

    // Glow
    ctx.save();
    ctx.globalAlpha = 0.2 + Math.sin(time * 0.004 + offset) * 0.1;
    const glow = ctx.createRadialGradient(fx + 8, fy + 8, 2, fx + 8, fy + 8, 20);
    glow.addColorStop(0, '#ff88cc');
    glow.addColorStop(1, '#ff88cc00');
    ctx.fillStyle = glow;
    ctx.fillRect(fx - 12, fy - 12, 40, 40);
    ctx.restore();

    // Stem
    ctx.fillStyle = '#3a8a3a';
    ctx.fillRect(fx + 7, fy + 12, 2, 10);
    // Leaf
    ctx.fillStyle = '#5aaa4a';
    ctx.fillRect(fx + 9, fy + 16, 4, 2);

    // Petals (tulip shape)
    ctx.fillStyle = '#ff4488';
    ctx.beginPath();
    ctx.ellipse(fx + 8, fy + 8, 6, 7, 0, Math.PI * 0.8, Math.PI * 0.2);
    ctx.fill();
    ctx.fillStyle = '#ff66aa';
    ctx.beginPath();
    ctx.ellipse(fx + 8, fy + 7, 4, 5, 0, Math.PI * 0.8, Math.PI * 0.2);
    ctx.fill();

    // Center
    ctx.fillStyle = '#ffcc44';
    ctx.beginPath();
    ctx.arc(fx + 8, fy + 6, 2, 0, Math.PI * 2);
    ctx.fill();
  }

  private drawPortal(ctx: CanvasRenderingContext2D, x: number, y: number, time: number) {
    const pulse = Math.sin(time * 0.004) * 4;

    // Outer glow
    ctx.save();
    ctx.globalAlpha = 0.25;
    const glow = ctx.createRadialGradient(x + 16, y + 16, 4, x + 16, y + 16, 30 + pulse);
    glow.addColorStop(0, '#d4af37');
    glow.addColorStop(0.5, '#ff88cc44');
    glow.addColorStop(1, '#00000000');
    ctx.fillStyle = glow;
    ctx.fillRect(x - 20, y - 20, 72, 72);
    ctx.restore();

    // Portal ring
    ctx.strokeStyle = '#d4af37';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(x + 16, y + 16, 12 + pulse / 2, 14 + pulse / 2, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Inner swirl
    ctx.strokeStyle = '#ff88cc';
    ctx.lineWidth = 2;
    const angle = time * 0.003;
    for (let i = 0; i < 3; i++) {
      const a = angle + (i * Math.PI * 2) / 3;
      ctx.beginPath();
      ctx.arc(x + 16 + Math.cos(a) * 6, y + 16 + Math.sin(a) * 6, 3, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Center
    ctx.fillStyle = '#ffffff';
    ctx.globalAlpha = 0.6 + Math.sin(time * 0.006) * 0.3;
    ctx.beginPath();
    ctx.arc(x + 16, y + 16, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;

    // Floating particles
    for (let i = 0; i < 4; i++) {
      const pa = time * 0.002 + i * 1.5;
      const pr = 18 + Math.sin(time * 0.003 + i) * 5;
      ctx.fillStyle = '#d4af3788';
      ctx.fillRect(x + 16 + Math.cos(pa) * pr, y + 16 + Math.sin(pa) * pr, 2, 2);
    }
  }
}
