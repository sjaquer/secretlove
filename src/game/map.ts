// ===== GAME MAP =====

import {
  TILE_SIZE, VIEWPORT_WIDTH, VIEWPORT_HEIGHT,
  TILE_AIR, TILE_STONE, TILE_BRICK, TILE_LAVA, TILE_BRIDGE, TILE_MOSS_STONE,
  COLORS, FLOWER_MESSAGES
} from './constants';
import type { Flower, CastleObj, TorchObj, LavaPool, Checkpoint, DecoChain, Banner, GameState } from './types';
import type { Player } from './player';
import type { AudioSystem } from './audio';

export class GameMap {
  width = 600;
  height = 20;
  data: Uint8Array;
  flowers: Flower[] = [];
  castle: CastleObj;
  torches: TorchObj[] = [];
  checkpoints: Checkpoint[] = [];
  lavaAnimFrame = 0;
  chains: DecoChain[] = [];
  banners: Banner[] = [];

  // Callbacks
  private onFlowerCollected: (total: number) => void = () => {};
  private onMessage: (text: string, opts?: { autoClear?: boolean; duration?: number }) => void = () => {};
  private onWin: (count: number) => void = () => {};
  private gameState: GameState | null = null;

  constructor() {
    this.data = new Uint8Array(this.width * this.height);
    this.castle = { x: 0, y: 0, width: 120, height: 160 };
    this.generate();
  }

  setCallbacks(
    onFlowerCollected: (total: number) => void,
    onMessage: (text: string, opts?: { autoClear?: boolean; duration?: number }) => void,
    onWin: (count: number) => void,
    gameState: GameState
  ) {
    this.onFlowerCollected = onFlowerCollected;
    this.onMessage = onMessage;
    this.onWin = onWin;
    this.gameState = gameState;
  }

  generate() {
    for (let i = 0; i < this.data.length; i++) this.data[i] = TILE_AIR;

    // ============================================
    // SECTION 1: THE DUNGEON ENTRANCE (0-150)
    // Dark stone dungeon with torches and lava pits
    // ============================================
    
    // Solid floor
    for (let x = 0; x < 35; x++) {
      for (let y = 13; y < this.height; y++) {
        this.setTile(x, y, x < 5 ? TILE_MOSS_STONE : TILE_STONE);
      }
      // Ceiling
      if (x < 30) this.setTile(x, 4, TILE_STONE);
    }
    
    // Wall torches decorating the entrance
    this.torches.push({ x: 3 * 32, y: 10 * 32, side: 'right' });
    this.torches.push({ x: 12 * 32, y: 10 * 32, side: 'left' });
    this.torches.push({ x: 25 * 32, y: 10 * 32, side: 'right' });
    this.checkpoints.push({ x: 20 * 32, y: 12 * 32 });

    // Chains decoration in dungeon
    this.chains.push({ x: 8 * 32, y: 5 * 32, length: 4 });
    this.chains.push({ x: 18 * 32, y: 5 * 32, length: 3 });

    // Small lava pit at tile 32-33 (tutorial: teaches danger)
    for (let x = 33; x < 36; x++) {
      this.setTile(x, 14, TILE_LAVA);
      for (let y = 15; y < this.height; y++) this.setTile(x, y, TILE_STONE);
    }
    
    // After lava: platforms with torches
    for (let x = 36; x < 90; x++) {
      if ((x - 36) % 9 === 0) {
        const pw = 5 + ((x - 36) % 18 === 0 ? 2 : 0);
        for (let i = 0; i < pw; i++) this.setTile(x + i, 13, TILE_STONE);
        // Bottom fill
        for (let i = 0; i < pw; i++) {
          for (let y = 14; y < this.height; y++) this.setTile(x + i, y, TILE_STONE);
        }
        // Torch on every other platform
        if ((x - 36) % 18 === 0) {
          this.torches.push({ x: (x + 2) * 32, y: 11 * 32, side: 'left' });
        }
        if ((x - 36) % 27 === 0) this.checkpoints.push({ x: x * 32, y: 12 * 32 });
      }
    }

    // Bridge over lava canyon
    for (let x = 85; x < 90; x++) {
      this.setTile(x, 13, TILE_BRIDGE);
    }
    // Lava below bridge
    for (let x = 83; x < 92; x++) {
      this.setTile(x, 15, TILE_LAVA);
      for (let y = 16; y < this.height; y++) this.setTile(x, y, TILE_STONE);
    }

    // Landing after bridge
    for (let x = 90; x < 150; x++) {
      if ((x - 90) % 11 === 0) {
        const h = 11 + ((x - 90) / 11) % 3;
        const pw = 4;
        for (let i = 0; i < pw; i++) {
          this.setTile(x + i, h, TILE_MOSS_STONE);
          for (let y = h + 1; y < this.height; y++) this.setTile(x + i, y, TILE_STONE);
        }
        if ((x - 90) % 33 === 0) {
          this.checkpoints.push({ x: x * 32, y: (h - 1) * 32 });
          this.torches.push({ x: (x + 1) * 32, y: (h - 2) * 32, side: 'right' });
        }
      }
    }

    // ============================================
    // SECTION 2: THE CASTLE WALLS (150-300)
    // Towers with battlements, banners, more lava
    // ============================================
    
    for (let x = 150; x < 300; x++) {
      if ((x - 150) % 16 === 0) {
        // Tower pillar
        for (let y = 8; y < 17; y++) {
          this.setTile(x, y, TILE_BRICK);
          this.setTile(x + 1, y, TILE_BRICK);
        }
        // Wide top platform with battlements
        for (let i = -1; i < 6; i++) this.setTile(x + i, 8, TILE_BRICK);
        // Battlement details
        this.setTile(x - 1, 7, TILE_BRICK);
        this.setTile(x + 2, 7, TILE_BRICK);
        this.setTile(x + 5, 7, TILE_BRICK);
        
        this.torches.push({ x: (x + 3) * 32, y: 6 * 32, side: 'left' });
        
        // Banner on towers
        if ((x - 150) % 32 === 0) {
          this.banners.push({ x: (x + 1) * 32, y: 5 * 32, color: COLORS.pinkDark });
        }

        if ((x - 150) % 48 === 0) this.checkpoints.push({ x: x * 32, y: 7 * 32 });
      }
      // Connection platforms (stepping stones)
      else if ((x - 150) % 16 === 8) {
        for (let i = 0; i < 3; i++) this.setTile(x + i, 10, TILE_BRICK);
      }
    }
    
    // Lava pools between some towers
    for (let section = 0; section < 3; section++) {
      const lx = 158 + section * 48;
      for (let x = lx; x < lx + 4; x++) {
        this.setTile(x, 16, TILE_LAVA);
        for (let y = 17; y < this.height; y++) this.setTile(x, y, TILE_STONE);
      }
    }

    // ============================================
    // SECTION 3: THE INNER SANCTUM (300-450)
    // Dark interior, pillars, chains, narrow paths
    // ============================================
    
    for (let x = 300; x < 450; x++) {
      // Ceiling
      if (x % 20 !== 0) this.setTile(x, 3, TILE_STONE);
      
      if ((x - 300) % 13 === 0) {
        const yStart = 8 + Math.floor(((x - 300) / 13) % 3);
        // Tall pillars
        for (let y = yStart; y < yStart + 7; y++) {
          this.setTile(x, y, TILE_BRICK);
          this.setTile(x + 1, y, TILE_BRICK);
        }
        // Wide platform
        for (let i = -1; i < 7; i++) this.setTile(x + i, yStart, TILE_BRICK);
        
        // Decorative top on pillars
        this.setTile(x, yStart - 1, TILE_MOSS_STONE);
        this.setTile(x + 1, yStart - 1, TILE_MOSS_STONE);
        
        this.torches.push({ x: (x - 1) * 32, y: (yStart - 1) * 32, side: 'right' });
        this.torches.push({ x: (x + 5) * 32, y: (yStart - 1) * 32, side: 'left' });
        
        if ((x - 300) % 39 === 0) {
          this.checkpoints.push({ x: x * 32, y: (yStart - 1) * 32 });
          this.chains.push({ x: (x + 3) * 32, y: 4 * 32, length: yStart - 5 });
        }
      }
    }
    
    // Lava river at bottom of sanctum
    for (let x = 305; x < 445; x++) {
      if (x % 13 > 2) { // Gaps in lava for effect
        this.setTile(x, 17, TILE_LAVA);
      }
      for (let y = 18; y < this.height; y++) this.setTile(x, y, TILE_STONE);
    }

    // ============================================
    // SECTION 4: THE HIGH TOWER (450-600)
    // Ascending platforms, dramatic finale
    // ============================================
    
    let stairH = 13;
    for (let x = 450; x < 560; x++) {
      if ((x - 450) % 8 === 0) {
        stairH = 13 - Math.floor((x - 450) / 22);
        if (stairH < 5) stairH = 5;
        const pw = 6;
        for (let i = 0; i < pw; i++) {
          this.setTile(x + i, stairH, TILE_BRICK);
        }
        // Side wall pieces for visual variety
        this.setTile(x, stairH - 1, TILE_BRICK);
        this.setTile(x + pw - 1, stairH - 1, TILE_BRICK);
        
        if ((x - 450) % 24 === 0) {
          this.checkpoints.push({ x: x * 32, y: (stairH - 1) * 32 });
          this.torches.push({ x: (x + 3) * 32, y: (stairH - 2) * 32, side: 'left' });
        }
      }
    }

    // Castle at the end
    this.castle = {
      x: (this.width - 30) * 32,
      y: 4 * 32,
      width: 140,
      height: 180
    };
    // Large solid platform for final castle
    for (let x = 555; x < 600; x++) {
      for (let y = 7; y < 20; y++) {
        this.setTile(x, y, TILE_BRICK);
      }
      // Battlements on edge
      if (x === 555 || x === 556) {
        this.setTile(x, 6, TILE_BRICK);
        this.setTile(x, 5, TILE_BRICK);
      }
    }
    this.torches.push({ x: 558 * 32, y: 5 * 32, side: 'right' });
    this.torches.push({ x: 570 * 32, y: 5 * 32, side: 'left' });
    this.banners.push({ x: 564 * 32, y: 3 * 32, color: COLORS.gold });

    // Place flowers (3 per section)
    this.placeFlowersInSection(5, 140, 3);
    this.placeFlowersInSection(155, 290, 3);
    this.placeFlowersInSection(305, 440, 3);
    this.placeFlowersInSection(455, 550, 3);
  }

  createPlatform(x: number, y: number, w: number, tile = TILE_BRICK) {
    for (let i = 0; i < w; i++) this.setTile(x + i, Math.floor(y), tile);
  }

  placeFlowersInSection(startX: number, endX: number, count: number) {
    for (let i = 0; i < count; i++) {
      let tries = 0;
      while (tries < 150) {
        const tx = Math.floor(startX + Math.random() * (endX - startX));
        let ty = 0;
        for (let y = 0; y < this.height; y++) {
          if (this.getTile(tx, y) !== TILE_AIR && this.getTile(tx, y) !== TILE_LAVA) {
            ty = y - 1;
            break;
          }
        }
        if (ty > 2 && ty < 14) {
          this.flowers.push({
            x: tx * 32 + 8,
            y: ty * 32 + 8,
            id: this.flowers.length,
            active: true,
            animOffset: Math.random() * Math.PI * 2
          });
          break;
        }
        tries++;
      }
    }
  }

  getTile(x: number, y: number): number {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) return TILE_AIR;
    return this.data[y * this.width + x];
  }

  setTile(x: number, y: number, type: number) {
    if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
      this.data[y * this.width + x] = type;
    }
  }

  update(player: Player, audio: AudioSystem) {
    if (!this.gameState) return;
    
    this.lavaAnimFrame++;

    // Update checkpoints
    this.checkpoints.forEach(cp => {
      if (Math.abs(player.x - cp.x) < 64 && Math.abs(player.y - cp.y) < 64) {
        this.gameState!.lastCheckpoint = { x: cp.x, y: cp.y };
      }
    });

    // Collect flowers
    let collected = 0;
    this.flowers.forEach(flower => {
      if (!flower.active) return;
      if (player.x < flower.x + 16 && player.x + player.width > flower.x &&
          player.y < flower.y + 16 && player.y + player.height > flower.y) {
        flower.active = false;
        collected++;
        audio.playSound('coin');
        this.onMessage(FLOWER_MESSAGES[flower.id] || "Un mensaje especial...", { autoClear: false });
        this.gameState!.isPausedForFlower = true;
        this.gameState!.flowerPauseStartTime = Date.now();
      }
    });
    if (collected > 0) {
      this.onFlowerCollected(this.flowers.filter(f => !f.active).length);
    }

    // Castle win check
    if (player.x > this.castle.x + 40 && player.x < this.castle.x + 100) {
      const fc = this.flowers.filter(f => !f.active).length;
      if (fc >= 1) this.onWin(fc);
      else this.onMessage("Necesito flores para entrar...");
    }
  }

  // ===== RENDERING =====

  draw(ctx: CanvasRenderingContext2D, camX: number) {
    const startCol = Math.floor(camX / TILE_SIZE);
    const endCol = startCol + Math.ceil(VIEWPORT_WIDTH / TILE_SIZE) + 1;
    const time = Date.now();

    // Draw chains (background layer)
    this.chains.forEach(c => {
      const sx = c.x - camX;
      if (sx > -50 && sx < VIEWPORT_WIDTH + 50) {
        this.drawChain(ctx, sx, c.y, c.length);
      }
    });

    // Draw banners (background layer)
    this.banners.forEach(b => {
      const sx = b.x - camX;
      if (sx > -50 && sx < VIEWPORT_WIDTH + 50) {
        this.drawBanner(ctx, sx, b.y, b.color, time);
      }
    });

    // Draw torches (background layer)
    this.torches.forEach(t => {
      const sx = t.x - camX;
      if (sx > -50 && sx < VIEWPORT_WIDTH + 50) {
        this.drawTorch(ctx, sx, t.y, time);
        // Torch light glow
        this.drawTorchGlow(ctx, sx, t.y);
      }
    });

    // Draw tiles
    for (let y = 0; y < this.height; y++) {
      for (let x = startCol; x <= endCol; x++) {
        const tile = this.getTile(x, y);
        if (tile === TILE_AIR) continue;
        const drawX = Math.floor(x * TILE_SIZE - camX);
        const drawY = y * TILE_SIZE;
        this.drawTile(ctx, tile, drawX, drawY, x, y, time);
      }
    }

    // Draw castle
    if (this.castle.x - camX < VIEWPORT_WIDTH + 100 && this.castle.x + this.castle.width - camX > -100) {
      this.drawCastle(ctx, this.castle.x - camX, time);
    }

    // Draw flowers
    this.flowers.forEach(flower => {
      if (flower.active) {
        const sx = flower.x - camX;
        if (sx > -30 && sx < VIEWPORT_WIDTH + 30) {
          const hoverY = Math.sin(time / 300 + flower.animOffset) * 3;
          this.drawTulip(ctx, sx, flower.y + hoverY, time, flower.animOffset);
        }
      }
    });
  }

  drawTile(ctx: CanvasRenderingContext2D, tile: number, x: number, y: number, tileX: number, tileY: number, time: number) {
    const T = TILE_SIZE;
    
    switch (tile) {
      case TILE_STONE: {
        // Dark stone with pixel detail
        ctx.fillStyle = COLORS.stoneDark;
        ctx.fillRect(x, y, T, T);
        // Brick pattern
        const offset = (tileY % 2 === 0) ? 0 : T / 2;
        ctx.fillStyle = COLORS.stoneMid;
        ctx.fillRect(x + 1, y + 1, T - 2, T / 2 - 2);
        ctx.fillRect(x + 1 + (offset > 0 ? -T/4 : T/4), y + T/2 + 1, T - 2, T / 2 - 2);
        // Mortar lines
        ctx.fillStyle = COLORS.stoneShadow;
        ctx.fillRect(x, y + T / 2 - 1, T, 2);
        ctx.fillRect(x + T / 2 + (tileY % 2 === 0 ? 0 : T/4), y, 2, T / 2);
        ctx.fillRect(x + (tileY % 2 === 0 ? T/4 : 0), y + T/2, 2, T / 2);
        // Random cracks
        if ((tileX * 7 + tileY * 13) % 11 === 0) {
          ctx.fillStyle = COLORS.stoneShadow;
          ctx.fillRect(x + 8, y + 4, 2, 6);
          ctx.fillRect(x + 10, y + 8, 4, 2);
        }
        // Highlight on top edge
        if (this.getTile(tileX, tileY - 1) === TILE_AIR) {
          ctx.fillStyle = COLORS.stoneHighlight;
          ctx.fillRect(x + 1, y, T - 2, 2);
        }
        break;
      }
      case TILE_BRICK: {
        // Castle bricks with detailed pattern
        ctx.fillStyle = COLORS.brickDark;
        ctx.fillRect(x, y, T, T);
        const brickOffset = (tileY % 2 === 0) ? 0 : 8;
        // Row 1
        ctx.fillStyle = COLORS.brickMid;
        ctx.fillRect(x + 1 + brickOffset, y + 1, 14, 13);
        if (brickOffset === 0) ctx.fillRect(x + 17, y + 1, 14, 13);
        else ctx.fillRect(x + 1, y + 1, 6, 13);
        // Row 2
        ctx.fillStyle = COLORS.brickLight;
        ctx.fillRect(x + 1 + (brickOffset === 0 ? 8 : 0), y + 17, 14, 13);
        ctx.fillRect(x + (brickOffset === 0 ? 24 : 16), y + 17, 7, 13);
        // Mortar
        ctx.fillStyle = COLORS.brickMortar;
        ctx.fillRect(x, y + 15, T, 2);
        ctx.fillRect(x + 15 + brickOffset, y, 2, 16);
        ctx.fillRect(x + 15 + (brickOffset === 0 ? 8 : 0), y + 16, 2, 16);
        // Top highlight
        if (this.getTile(tileX, tileY - 1) === TILE_AIR) {
          ctx.fillStyle = COLORS.brickLight;
          ctx.fillRect(x + 1, y, T - 2, 1);
        }
        break;
      }
      case TILE_LAVA: {
        // Animated lava
        const wave = Math.sin(time / 200 + tileX * 0.5) * 3;
        ctx.fillStyle = COLORS.lavaDeep;
        ctx.fillRect(x, y, T, T);
        // Lava surface waves
        ctx.fillStyle = COLORS.lavaMid;
        ctx.fillRect(x, y + 2 + wave, T, T - 4);
        ctx.fillStyle = COLORS.lavaBright;
        ctx.fillRect(x + 4, y + 4 + wave, T - 8, 6);
        // Bright spots (bubbles)
        const bubble = Math.sin(time / 150 + tileX * 2) * 2;
        ctx.fillStyle = COLORS.lavaGlow;
        ctx.fillRect(x + 6 + bubble, y + 8, 4, 4);
        ctx.fillRect(x + 18 - bubble, y + 12, 3, 3);
        // Top glow
        ctx.fillStyle = 'rgba(255, 100, 0, 0.4)';
        ctx.fillRect(x, y - 4, T, 6);
        ctx.fillStyle = 'rgba(255, 200, 0, 0.2)';
        ctx.fillRect(x, y - 8, T, 6);
        break;
      }
      case TILE_BRIDGE: {
        // Wooden bridge
        ctx.fillStyle = COLORS.woodDark;
        ctx.fillRect(x, y, T, T);
        // Planks
        ctx.fillStyle = COLORS.woodMid;
        ctx.fillRect(x + 1, y + 2, 14, T - 4);
        ctx.fillRect(x + 17, y + 2, 14, T - 4);
        // Plank detail
        ctx.fillStyle = COLORS.woodLight;
        ctx.fillRect(x + 3, y + 4, 4, T - 8);
        ctx.fillRect(x + 19, y + 4, 4, T - 8);
        // Nails
        ctx.fillStyle = COLORS.metalDark;
        ctx.fillRect(x + 2, y + 3, 2, 2);
        ctx.fillRect(x + 12, y + 3, 2, 2);
        ctx.fillRect(x + 18, y + 3, 2, 2);
        ctx.fillRect(x + 28, y + 3, 2, 2);
        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.fillRect(x, y + T - 2, T, 2);
        break;
      }
      case TILE_MOSS_STONE: {
        // Stone with moss
        ctx.fillStyle = COLORS.stoneDark;
        ctx.fillRect(x, y, T, T);
        ctx.fillStyle = COLORS.stoneMid;
        ctx.fillRect(x + 1, y + 1, T - 2, T - 2);
        // Moss patches
        ctx.fillStyle = COLORS.mossDark;
        ctx.fillRect(x, y, 8, 4);
        ctx.fillRect(x + 14, y + 2, 10, 3);
        ctx.fillRect(x + 2, y + T - 6, 6, 4);
        ctx.fillStyle = COLORS.mossLight;
        ctx.fillRect(x + 1, y + 1, 4, 2);
        ctx.fillRect(x + 16, y + 3, 4, 1);
        // Mortar
        ctx.fillStyle = COLORS.stoneShadow;
        ctx.fillRect(x, y + T / 2, T, 1);
        break;
      }
    }
  }

  drawTorch(ctx: CanvasRenderingContext2D, x: number, y: number, time: number) {
    // Wall bracket (metal)
    ctx.fillStyle = COLORS.metalDark;
    ctx.fillRect(x - 2, y + 12, 12, 4);
    ctx.fillRect(x, y + 8, 4, 8);
    ctx.fillStyle = COLORS.metalMid;
    ctx.fillRect(x - 1, y + 13, 10, 2);
    
    // Torch handle (wood)
    ctx.fillStyle = COLORS.woodDark;
    ctx.fillRect(x + 1, y + 2, 6, 12);
    ctx.fillStyle = COLORS.woodMid;
    ctx.fillRect(x + 2, y + 3, 4, 10);
    ctx.fillStyle = COLORS.woodLight;
    ctx.fillRect(x + 3, y + 4, 2, 8);
    
    // Wrapping at top
    ctx.fillStyle = '#666';
    ctx.fillRect(x, y + 2, 8, 3);
    
    // Flame (animated)
    const f1 = Math.sin(time / 80) * 2;
    const f2 = Math.cos(time / 60) * 1.5;
    const f3 = Math.sin(time / 100 + 1) * 1;
    
    // Outer flame
    ctx.fillStyle = COLORS.fireRed;
    ctx.fillRect(x - 1 + f2, y - 8 + f1, 10, 10);
    // Mid flame
    ctx.fillStyle = COLORS.fireOrange;
    ctx.fillRect(x + f2, y - 6 + f1, 8, 7);
    // Inner flame
    ctx.fillStyle = COLORS.fireYellow;
    ctx.fillRect(x + 1 + f3, y - 4 + f1, 6, 5);
    // Core
    ctx.fillStyle = COLORS.fireWhite;
    ctx.fillRect(x + 2 + f3, y - 2 + f1, 4, 3);
    
    // Sparks
    if (Math.random() > 0.7) {
      ctx.fillStyle = COLORS.fireYellow;
      ctx.fillRect(x + Math.random() * 8, y - 10 - Math.random() * 6, 2, 2);
    }
  }

  drawTorchGlow(ctx: CanvasRenderingContext2D, x: number, y: number) {
    // Radial glow effect around torch
    const gradient = ctx.createRadialGradient(x + 4, y, 5, x + 4, y, 80);
    gradient.addColorStop(0, 'rgba(255, 150, 50, 0.15)');
    gradient.addColorStop(0.5, 'rgba(255, 100, 20, 0.05)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(x - 80, y - 80, 168, 168);
  }

  drawChain(ctx: CanvasRenderingContext2D, x: number, y: number, length: number) {
    for (let i = 0; i < length; i++) {
      const cy = y + i * 12;
      // Chain link
      ctx.fillStyle = COLORS.metalDark;
      ctx.fillRect(x + 1, cy, 4, 10);
      ctx.fillStyle = COLORS.metalMid;
      ctx.fillRect(x + 2, cy + 1, 2, 3);
      ctx.fillRect(x + 2, cy + 6, 2, 3);
      ctx.fillStyle = COLORS.metalLight;
      ctx.fillRect(x + 2, cy + 2, 1, 1);
    }
  }

  drawBanner(ctx: CanvasRenderingContext2D, x: number, y: number, color: string, time: number) {
    const wave = Math.sin(time / 400) * 2;
    // Pole
    ctx.fillStyle = COLORS.metalMid;
    ctx.fillRect(x + 3, y - 2, 2, 34);
    // Banner cloth
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x + 6, y);
    ctx.lineTo(x + 20 + wave, y + 4);
    ctx.lineTo(x + 18 + wave, y + 24);
    ctx.lineTo(x + 12 + wave / 2, y + 20);
    ctx.lineTo(x + 6, y + 28);
    ctx.fill();
    // Banner detail
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.fillRect(x + 8, y + 6, 6 + wave / 2, 2);
    ctx.fillRect(x + 10, y + 12, 4, 2);
  }

  drawTulip(ctx: CanvasRenderingContext2D, x: number, y: number, time: number, offset: number) {
    // Glow behind flower
    const glow = Math.sin(time / 300 + offset) * 0.1 + 0.2;
    ctx.fillStyle = `rgba(255, 0, 100, ${glow})`;
    ctx.fillRect(x - 2, y - 4, 20, 24);
    
    // Stem
    ctx.fillStyle = '#3a7a3a';
    ctx.fillRect(x + 6, y + 8, 3, 10);
    // Leaves
    ctx.fillStyle = '#4caf50';
    ctx.fillRect(x + 1, y + 12, 5, 2);
    ctx.fillRect(x + 0, y + 11, 3, 2);
    ctx.fillRect(x + 10, y + 10, 5, 2);
    ctx.fillRect(x + 12, y + 9, 3, 2);
    
    // Petals (detailed tulip shape)
    ctx.fillStyle = '#ff0055';
    // Left petal
    ctx.fillRect(x + 2, y + 1, 4, 7);
    ctx.fillRect(x + 1, y + 2, 2, 4);
    // Right petal
    ctx.fillRect(x + 10, y + 1, 4, 7);
    ctx.fillRect(x + 13, y + 2, 2, 4);
    // Center petal
    ctx.fillStyle = '#ff2266';
    ctx.fillRect(x + 5, y, 6, 8);
    ctx.fillRect(x + 6, y - 2, 4, 3);
    // Petal highlights
    ctx.fillStyle = '#ff6699';
    ctx.fillRect(x + 6, y + 1, 2, 3);
    ctx.fillRect(x + 3, y + 2, 1, 3);
    ctx.fillRect(x + 11, y + 2, 1, 3);
    // Center detail
    ctx.fillStyle = '#ffcc00';
    ctx.fillRect(x + 7, y + 4, 2, 2);
  }

  drawCastle(ctx: CanvasRenderingContext2D, screenX: number, time: number) {
    const baseY = 7 * TILE_SIZE;
    const x = screenX;
    
    // Main body
    ctx.fillStyle = '#1a1020';
    ctx.fillRect(x + 10, baseY + 20, 120, 120);
    
    // Brick detail on body
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 6; col++) {
        const bx = x + 12 + col * 20 + (row % 2 === 0 ? 0 : 10);
        const by = baseY + 22 + row * 15;
        ctx.fillStyle = '#2a1a30';
        ctx.fillRect(bx, by, 18, 13);
        ctx.fillStyle = '#3a2540';
        ctx.fillRect(bx + 1, by + 1, 16, 5);
      }
    }

    // Left tower
    ctx.fillStyle = '#15101a';
    ctx.fillRect(x - 10, baseY - 30, 40, 170);
    // Right tower
    ctx.fillRect(x + 110, baseY - 30, 40, 170);
    
    // Tower tops (pointed)
    ctx.fillStyle = '#0a080e';
    // Left
    ctx.beginPath();
    ctx.moveTo(x + 10, baseY - 30);
    ctx.lineTo(x - 15, baseY);
    ctx.lineTo(x + 35, baseY);
    ctx.fill();
    // Right
    ctx.beginPath();
    ctx.moveTo(x + 130, baseY - 30);
    ctx.lineTo(x + 105, baseY);
    ctx.lineTo(x + 155, baseY);
    ctx.fill();
    
    // Battlements on top
    for (let i = 0; i < 5; i++) {
      ctx.fillStyle = '#1a1020';
      ctx.fillRect(x + 20 + i * 22, baseY + 14, 18, 8);
    }
    
    // Door (arched)
    ctx.fillStyle = '#3a2010';
    ctx.fillRect(x + 50, baseY + 100, 40, 40);
    ctx.beginPath();
    ctx.arc(x + 70, baseY + 100, 20, Math.PI, 0);
    ctx.fill();
    // Door details
    ctx.fillStyle = '#2a1508';
    ctx.fillRect(x + 68, baseY + 84, 4, 56);
    ctx.fillStyle = COLORS.gold;
    ctx.fillRect(x + 58, baseY + 118, 4, 4);
    ctx.fillRect(x + 78, baseY + 118, 4, 4);
    
    // Windows with glow
    const windowGlow = Math.sin(time / 500) * 0.2 + 0.6;
    ctx.fillStyle = `rgba(255, 200, 100, ${windowGlow})`;
    ctx.fillRect(x + 55, baseY + 40, 10, 16);
    ctx.fillRect(x + 75, baseY + 40, 10, 16);
    ctx.fillRect(x + 3, baseY - 10, 8, 12);
    ctx.fillRect(x + 125, baseY - 10, 8, 12);
    // Window frames
    ctx.fillStyle = '#0a080e';
    ctx.fillRect(x + 59, baseY + 40, 2, 16);
    ctx.fillRect(x + 79, baseY + 40, 2, 16);
    ctx.fillRect(x + 55, baseY + 47, 10, 2);
    ctx.fillRect(x + 75, baseY + 47, 10, 2);
    
    // Flags on towers
    const flagWave = Math.sin(time / 300) * 3;
    ctx.fillStyle = COLORS.pinkDark;
    ctx.beginPath();
    ctx.moveTo(x + 10, baseY - 40);
    ctx.lineTo(x + 26 + flagWave, baseY - 36);
    ctx.lineTo(x + 22 + flagWave, baseY - 28);
    ctx.lineTo(x + 10, baseY - 30);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(x + 130, baseY - 40);
    ctx.lineTo(x + 146 + flagWave, baseY - 36);
    ctx.lineTo(x + 142 + flagWave, baseY - 28);
    ctx.lineTo(x + 130, baseY - 30);
    ctx.fill();
    // Flag poles
    ctx.fillStyle = COLORS.metalMid;
    ctx.fillRect(x + 9, baseY - 42, 2, 14);
    ctx.fillRect(x + 129, baseY - 42, 2, 14);
  }
}
