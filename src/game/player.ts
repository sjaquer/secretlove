// ===== PLAYER =====

import { TILE_SIZE, VIEWPORT_HEIGHT, TILE_STONE, TILE_BRICK, TILE_BRIDGE, TILE_MOSS_STONE, TILE_LAVA, COLORS } from './constants';
import type { Inputs, GameState, IMapAccessor } from './types';
import type { AudioSystem } from './audio';

export class Player {
  width = 22;
  height = 28;
  velX = 0;
  velY = 0;
  speed = 5.5;
  acceleration = 0.7;
  friction = 0.85;
  jumpForce = 13;
  grounded = false;
  facingRight = true;
  coyoteTime = 0;
  wasJumpPressed = false;
  runFrame = 0;
  animFrame = 0;
  animTimer = 0;
  isDead = false;

  constructor(public x: number, public y: number) {}

  update(inputs: Inputs, mapWidth: number, map: IMapAccessor, state: GameState, audio: AudioSystem) {
    // Horizontal Movement
    if (inputs.left) {
      this.velX -= this.acceleration;
      if (this.velX < -this.speed) this.velX = -this.speed;
      this.facingRight = false;
      this.runFrame++;
    } else if (inputs.right) {
      this.velX += this.acceleration;
      if (this.velX > this.speed) this.velX = this.speed;
      this.facingRight = true;
      this.runFrame++;
    } else {
      this.velX *= this.friction;
      if (Math.abs(this.velX) < 0.1) this.velX = 0;
      this.runFrame = 0;
    }

    // Animation timer
    this.animTimer++;
    if (this.animTimer > 6) {
      this.animTimer = 0;
      this.animFrame = (this.animFrame + 1) % 4;
    }

    // Coyote Time
    if (this.grounded) {
      this.coyoteTime = 8;
    } else if (this.coyoteTime > 0) {
      this.coyoteTime--;
    }

    // Jump Physics
    if (inputs.up) {
      if (!this.wasJumpPressed && this.coyoteTime > 0) {
        this.velY = -this.jumpForce;
        this.grounded = false;
        this.coyoteTime = 0;
        audio.playSound('jump');
      }
      if (this.velY < 0) {
        this.velY += 0.28;
      } else {
        this.velY += 0.25;
      }
    } else {
      if (this.velY < -3) {
        this.velY *= 0.6;
      }
      this.velY += 0.65;
    }
    this.wasJumpPressed = inputs.up;

    this.x += this.velX;
    this.checkCollisions(true, map, state, audio);
    this.y += this.velY;
    this.checkCollisions(false, map, state, audio);

    if (this.x < 0) this.x = 0;

    // Fall death
    if (this.y > VIEWPORT_HEIGHT + 50 && !state.isFading) {
      state.isFading = true;
      audio.playSound('fall');
    }

    if (this.x > mapWidth - this.width) this.x = mapWidth - this.width;
  }

  checkCollisions(isX: boolean, map: IMapAccessor, state: GameState, audio: AudioSystem) {
    const startX = Math.floor(this.x / TILE_SIZE);
    const endX = Math.floor((this.x + this.width) / TILE_SIZE);
    const startY = Math.floor(this.y / TILE_SIZE);
    const endY = Math.floor((this.y + this.height) / TILE_SIZE);
    this.grounded = false;

    for (let y = startY; y <= endY; y++) {
      for (let x = startX; x <= endX; x++) {
        const tile = map.getTile(x, y);
        
        // Lava kills
        if (tile === TILE_LAVA) {
          if (!state.isFading) {
            state.isFading = true;
            audio.playSound('lava');
          }
          return;
        }

        // Solid tiles
        if (tile === TILE_STONE || tile === TILE_BRICK || tile === TILE_BRIDGE || tile === TILE_MOSS_STONE) {
          if (isX) {
            if (this.velX > 0) this.x = x * TILE_SIZE - this.width - 0.1;
            else if (this.velX < 0) this.x = (x + 1) * TILE_SIZE + 0.1;
            this.velX = 0;
          } else {
            if (this.velY > 0) {
              this.y = y * TILE_SIZE - this.height - 0.1;
              this.grounded = true;
              this.velY = 0;
            } else if (this.velY < 0) {
              this.y = (y + 1) * TILE_SIZE + 0.1;
              this.velY = 0;
            }
          }
        }
      }
    }
  }

  draw(ctx: CanvasRenderingContext2D, camX: number) {
    const px = Math.floor(this.x - camX);
    const py = Math.floor(this.y);
    const bob = this.grounded && this.runFrame > 0 ? ((this.animFrame % 2 === 0) ? -1 : 1) : 0;
    const mirror = this.facingRight ? 1 : -1;
    
    ctx.save();
    if (!this.facingRight) {
      ctx.translate(px + this.width, 0);
      ctx.scale(-1, 1);
      ctx.translate(-px, 0);
    }

    // === PIXEL ART PRINCESS SPRITE ===
    
    // Shadow under character
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(px + 3, py + this.height - 2, this.width - 6, 3);

    // Boots
    ctx.fillStyle = '#4a2020';
    ctx.fillRect(px + 4, py + 24 + bob, 5, 4);
    ctx.fillRect(px + 13, py + 24 + bob, 5, 4);
    // Boot shine
    ctx.fillStyle = '#6a3030';
    ctx.fillRect(px + 5, py + 25 + bob, 2, 2);
    ctx.fillRect(px + 14, py + 25 + bob, 2, 2);

    // Dress (Base) - Flowing shape
    ctx.fillStyle = COLORS.pink;
    ctx.fillRect(px + 5, py + 14 + bob, 12, 10);
    // Dress bottom (wider)
    ctx.fillRect(px + 3, py + 20 + bob, 16, 5);
    // Dress detail lines
    ctx.fillStyle = COLORS.pinkDark;
    ctx.fillRect(px + 8, py + 14 + bob, 2, 10);
    ctx.fillRect(px + 12, py + 16 + bob, 1, 8);
    // Dress top (bodice)
    ctx.fillStyle = '#e0559e';
    ctx.fillRect(px + 6, py + 12 + bob, 10, 3);
    // Belt
    ctx.fillStyle = COLORS.gold;
    ctx.fillRect(px + 5, py + 14 + bob, 12, 2);
    ctx.fillStyle = COLORS.goldDark;
    ctx.fillRect(px + 9, py + 14 + bob, 4, 2); // Belt buckle

    // Arms
    ctx.fillStyle = '#ffccaa';
    // Near arm
    ctx.fillRect(px + 15, py + 13 + bob, 3, 6);
    // Far arm
    ctx.fillRect(px + 4, py + 13 + bob, 3, 6);
    // Sleeves (puffed)
    ctx.fillStyle = COLORS.pink;
    ctx.fillRect(px + 15, py + 12 + bob, 3, 3);
    ctx.fillRect(px + 4, py + 12 + bob, 3, 3);

    // Neck
    ctx.fillStyle = '#ffccaa';
    ctx.fillRect(px + 9, py + 9 + bob, 4, 4);

    // Head
    ctx.fillStyle = '#ffccaa';
    ctx.fillRect(px + 6, py + 2 + bob, 10, 8);
    // Cheeks
    ctx.fillStyle = '#ffaaaa';
    ctx.fillRect(px + 7, py + 7 + bob, 2, 2);
    ctx.fillRect(px + 13, py + 7 + bob, 2, 2);
    
    // Eyes
    ctx.fillStyle = '#442266';
    ctx.fillRect(px + 8, py + 5 + bob, 2, 2);
    ctx.fillRect(px + 12, py + 5 + bob, 2, 2);
    // Eye shine
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(px + 8, py + 5 + bob, 1, 1);
    ctx.fillRect(px + 12, py + 5 + bob, 1, 1);
    
    // Mouth (smile)
    ctx.fillStyle = '#cc6666';
    ctx.fillRect(px + 10, py + 8 + bob, 2, 1);

    // Hair (Long flowing brown hair)
    ctx.fillStyle = '#6b3510';
    ctx.fillRect(px + 5, py + 1 + bob, 12, 3); // Top of head
    ctx.fillRect(px + 5, py + 2 + bob, 3, 12); // Left side (back hair)
    ctx.fillRect(px + 14, py + 2 + bob, 3, 12); // Right side
    // Hair ends (flowing)
    ctx.fillStyle = '#8b4513';
    ctx.fillRect(px + 4, py + 10 + bob, 3, 6);
    ctx.fillRect(px + 15, py + 10 + bob, 3, 6);
    // Hair highlights
    ctx.fillStyle = '#9b6523';
    ctx.fillRect(px + 6, py + 2 + bob, 2, 2);
    ctx.fillRect(px + 13, py + 2 + bob, 2, 2);

    // Crown (detailed)
    ctx.fillStyle = COLORS.gold;
    ctx.fillRect(px + 6, py + bob, 10, 2);
    ctx.fillRect(px + 7, py - 1 + bob, 2, 2);
    ctx.fillRect(px + 10, py - 2 + bob, 2, 3);
    ctx.fillRect(px + 13, py - 1 + bob, 2, 2);
    // Crown jewels
    ctx.fillStyle = '#ff0044';
    ctx.fillRect(px + 10, py - 1 + bob, 2, 1);
    ctx.fillStyle = '#4444ff';
    ctx.fillRect(px + 7, py + bob, 1, 1);
    ctx.fillRect(px + 14, py + bob, 1, 1);

    ctx.restore();
  }
}
