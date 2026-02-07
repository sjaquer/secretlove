// ===== PLAYER – Animation + Physics =====

import {
  TILE_SIZE, VIEWPORT_HEIGHT, BASE_GRAVITY, MAX_FALL_SPEED,
  COYOTE_FRAMES, JUMP_BUFFER_FRAMES,
  TILE_GROUND, TILE_PLATFORM, TILE_BRIDGE, TILE_SPECIAL, TILE_HAZARD,
} from './constants';
import type { Inputs, GameState, IMapAccessor, PlayerAnimState } from './types';
import type { AudioSystem } from './audio';

export class Player {
  x = 0;
  y = 0;
  width = 18;
  height = 30;
  velX = 0;
  velY = 0;

  // Physics tuning
  speed = 5.5;
  acceleration = 0.7;
  friction = 0.82;
  gravity = BASE_GRAVITY;
  private normalGravity = BASE_GRAVITY;
  private floatGravity = BASE_GRAVITY * 0.4; // Gravedad reducida al mantener salto

  grounded = false;
  facingRight = true;
  alive = true;

  // Jump mechanics
  private coyoteCounter = 0;
  private jumpBufferCounter = 0;
  private isJumping = false;
  private jumpHeld = false;
  private jumpCutoff = false;

  // Animation
  animState: PlayerAnimState = 'idle';
  animFrame = 0;
  private animTimer = 0;
  private stompBounce = false;

  // Invincibility frames after being hurt
  invincible = false;
  private invTimer = 0;

  reset(sx: number, sy: number) {
    this.x = sx;
    this.y = sy;
    this.velX = 0;
    this.velY = 0;
    this.grounded = false;
    this.alive = true;
    this.animState = 'idle';
    this.animFrame = 0;
    this.invincible = false;
    this.invTimer = 0;
    this.coyoteCounter = 0;
    this.jumpBufferCounter = 0;
    this.isJumping = false;
  }

  setGravity(g: number) {
    this.normalGravity = g;
    this.floatGravity = g * 0.4;
    this.gravity = g;
  }

  update(inputs: Inputs, mapWidth: number, map: IMapAccessor, state: GameState, audio: AudioSystem) {
    if (!this.alive) return;

    // Invincibility timer
    if (this.invincible) {
      this.invTimer--;
      if (this.invTimer <= 0) this.invincible = false;
    }

    // --- Horizontal movement ---
    if (inputs.left) {
      this.velX -= this.acceleration;
      this.facingRight = false;
    } else if (inputs.right) {
      this.velX += this.acceleration;
      this.facingRight = true;
    } else {
      this.velX *= this.friction;
      if (Math.abs(this.velX) < 0.2) this.velX = 0;
    }
    this.velX = Math.max(-this.speed, Math.min(this.speed, this.velX));

    // Apply horizontal movement + collisions
    this.x += this.velX;
    this.checkCollisions(true, map, state, audio);

    // --- Coyote time ---
    if (this.grounded) {
      this.coyoteCounter = COYOTE_FRAMES;
    } else {
      this.coyoteCounter--;
    }

    // --- Jump buffer ---
    if (inputs.up) {
      this.jumpBufferCounter = JUMP_BUFFER_FRAMES;
    } else {
      this.jumpBufferCounter--;
    }

    // --- Jump ---
    if (this.jumpBufferCounter > 0 && this.coyoteCounter > 0 && !this.isJumping) {
      const jumpForce = this.gravity < 0.4 ? -8 : -11; // lower jump on moon
      this.velY = jumpForce;
      this.isJumping = true;
      this.jumpHeld = true;
      this.jumpCutoff = false;
      this.coyoteCounter = 0;
      this.jumpBufferCounter = 0;
      audio.playSound('jump');
    }

    // Variable jump height – release up to cut jump short
    if (this.isJumping && !inputs.up && !this.jumpCutoff && this.velY < -3) {
      this.velY *= 0.5;
      this.jumpCutoff = true;
    }

    // Gravedad dinámica: reducida si se mantiene salto presionado y está cayendo
    if (inputs.up && this.velY > 0 && !this.grounded) {
      this.gravity = this.floatGravity;
    } else {
      this.gravity = this.normalGravity;
    }

    // Gravity
    this.velY += this.gravity;
    if (this.velY > MAX_FALL_SPEED) this.velY = MAX_FALL_SPEED;

    // Apply vertical + collisions
    this.y += this.velY;
    this.checkCollisions(false, map, state, audio);

    if (this.grounded) {
      this.isJumping = false;
      this.jumpCutoff = false;
    }

    // Bounds
    if (this.x < 0) this.x = 0;
    if (this.x > mapWidth - this.width) this.x = mapWidth - this.width;

    // Fell off map
    if (this.y > map.height * TILE_SIZE + 50) {
      if (!state.isFading) {
        state.isFading = true;
        audio.playSound('hurt');
      }
    }

    // Stomp bounce (applied after collision check)
    if (this.stompBounce) {
      this.velY = this.gravity < 0.4 ? -6 : -9;
      this.stompBounce = false;
    }

    // --- Animation state ---
    this.updateAnimation(inputs);
  }

  triggerStompBounce() {
    this.stompBounce = true;
  }

  makeInvincible(frames: number) {
    this.invincible = true;
    this.invTimer = frames;
  }

  private updateAnimation(inputs: Inputs) {
    this.animTimer++;
    const prev = this.animState;

    if (!this.alive) {
      this.animState = 'death';
    } else if (this.stompBounce) {
      this.animState = 'stomp';
    } else if (!this.grounded && this.velY < -1) {
      this.animState = 'jump';
    } else if (!this.grounded && this.velY > 1) {
      this.animState = 'fall';
    } else if (Math.abs(this.velX) > 0.5) {
      this.animState = 'walk';
    } else {
      this.animState = 'idle';
    }

    if (this.animState !== prev) {
      this.animFrame = 0;
      this.animTimer = 0;
    }

    // Advance frame
    const speeds: Record<PlayerAnimState, number> = { idle: 30, walk: 8, jump: 1, fall: 1, stomp: 1, death: 10 };
    if (this.animTimer >= speeds[this.animState]) {
      this.animTimer = 0;
      const maxFrames: Record<PlayerAnimState, number> = { idle: 2, walk: 4, jump: 1, fall: 1, stomp: 1, death: 3 };
      this.animFrame = (this.animFrame + 1) % maxFrames[this.animState];
    }
  }

  private checkCollisions(isX: boolean, map: IMapAccessor, state: GameState, audio: AudioSystem) {
    const startX = Math.floor(this.x / TILE_SIZE);
    const endX = Math.floor((this.x + this.width) / TILE_SIZE);
    const startY = Math.floor(this.y / TILE_SIZE);
    const endY = Math.floor((this.y + this.height) / TILE_SIZE);
    if (!isX) this.grounded = false;

    for (let ty = startY; ty <= endY; ty++) {
      for (let tx = startX; tx <= endX; tx++) {
        const tile = map.getTile(tx, ty);

        // Hazard kills
        if (tile === TILE_HAZARD) {
          if (!state.isFading) {
            state.isFading = true;
            audio.playSound('lava');
          }
          return;
        }

        // Platform: only block from top when falling
        if (tile === TILE_PLATFORM) {
          if (!isX && this.velY > 0) {
            const tileTop = ty * TILE_SIZE;
            if (this.y + this.height - this.velY <= tileTop + 4) {
              this.y = tileTop - this.height;
              this.grounded = true;
              this.velY = 0;
            }
          }
          continue;
        }

        // Solid tiles
        if (tile === TILE_GROUND || tile === TILE_BRIDGE || tile === TILE_SPECIAL) {
          if (isX) {
            if (this.velX > 0) this.x = tx * TILE_SIZE - this.width - 0.1;
            else if (this.velX < 0) this.x = (tx + 1) * TILE_SIZE + 0.1;
            this.velX = 0;
          } else {
            if (this.velY > 0) {
              this.y = ty * TILE_SIZE - this.height - 0.1;
              this.grounded = true;
              this.velY = 0;
            } else if (this.velY < 0) {
              this.y = (ty + 1) * TILE_SIZE + 0.1;
              this.velY = 0;
            }
          }
        }
      }
    }
  }

  // ===== PIXEL ART RENDERING =====
  draw(ctx: CanvasRenderingContext2D, camX: number) {
    const px = Math.floor(this.x - camX);
    const py = Math.floor(this.y);

    // Invincibility blink
    if (this.invincible && Math.floor(this.invTimer / 3) % 2 === 0) return;

    ctx.save();

    // Flip if facing left
    if (!this.facingRight) {
      ctx.translate(px + this.width / 2, 0);
      ctx.scale(-1, 1);
      ctx.translate(-(px + this.width / 2), 0);
    }

    const f = this.animFrame;
    const isWalk = this.animState === 'walk';
    const isJump = this.animState === 'jump';
    const isFall = this.animState === 'fall';

    // Leg offsets for walk animation
    const legOffset = isWalk ? [[-1, 0, 1, 0], [0, 0, 0, 0], [1, 0, -1, 0], [0, 0, 0, 0]][f] : [0, 0, 0, 0];
    const armOffset = isWalk ? Math.sin(f * Math.PI / 2) * 1.5 : 0;
    const bodySquash = this.animState === 'idle' && f === 1 ? 1 : 0;

    // --- Boots (más pequeñas) ---
    ctx.fillStyle = '#6b3a2a';
    ctx.fillRect(px + 4 + (legOffset[0] || 0), py + 26 + bodySquash, 4, 4);
    ctx.fillRect(px + 10 + (legOffset[2] || 0), py + 26 + bodySquash, 4, 4);
    ctx.fillStyle = '#8b5a3a';
    ctx.fillRect(px + 4 + (legOffset[0] || 0), py + 26 + bodySquash, 4, 2);
    ctx.fillRect(px + 10 + (legOffset[2] || 0), py + 26 + bodySquash, 4, 2);

    // --- Legs (más delgadas) ---
    ctx.fillStyle = '#f8d8c0';
    if (isJump) {
      ctx.fillRect(px + 5, py + 22, 3, 4);
      ctx.fillRect(px + 10, py + 22, 3, 4);
    } else if (isFall) {
      ctx.fillRect(px + 4, py + 23, 3, 4);
      ctx.fillRect(px + 11, py + 23, 3, 4);
    } else {
      ctx.fillRect(px + 5 + (legOffset[0] || 0), py + 23 + bodySquash, 3, 4);
      ctx.fillRect(px + 10 + (legOffset[2] || 0), py + 23 + bodySquash, 3, 4);
    }

    // --- Vestido morado (más delgado y elegante) ---
    ctx.fillStyle = '#9b59d0'; // Morado principal
    const dressY = isJump ? py + 11 : py + 12 + bodySquash;
    // Forma de campana del vestido
    ctx.fillRect(px + 4, dressY, 10, 2);
    ctx.fillRect(px + 3, dressY + 2, 12, 2);
    ctx.fillRect(px + 2, dressY + 4, 14, 6 - bodySquash);
    
    // Sombras del vestido
    ctx.fillStyle = '#7b3fb0';
    ctx.fillRect(px + 2, dressY + 7, 14, 3);
    
    // Detalles brillantes
    ctx.fillStyle = '#d0a0ff';
    ctx.fillRect(px + 6, dressY + 1, 6, 1);
    ctx.fillRect(px + 5, dressY + 3, 8, 1);

    // Cinturón dorado
    ctx.fillStyle = '#d4af37';
    ctx.fillRect(px + 4, dressY + 5, 10, 2);
    ctx.fillStyle = '#ffcc44';
    ctx.fillRect(px + 7, dressY + 5, 4, 2);

    // --- Torso (más delgado) ---
    ctx.fillStyle = '#9b59d0';
    ctx.fillRect(px + 5, py + 7, 8, 6 + bodySquash);

    // --- Brazos (más delgados) ---
    ctx.fillStyle = '#f8d8c0';
    if (isJump) {
      // Arms up
      ctx.fillRect(px + 2, py + 3, 2, 6);
      ctx.fillRect(px + 14, py + 3, 2, 6);
    } else if (isFall) {
      // Arms out
      ctx.fillRect(px + 0, py + 9, 4, 2);
      ctx.fillRect(px + 14, py + 9, 4, 2);
    } else {
      ctx.fillRect(px + 2, py + 8 + armOffset, 2, 5);
      ctx.fillRect(px + 14, py + 8 - armOffset, 2, 5);
    }
    // Mangas moradas
    ctx.fillStyle = '#d0a0ff';
    ctx.fillRect(px + 2, py + 7, 2, 2);
    ctx.fillRect(px + 14, py + 7, 2, 2);

    // --- Cabeza (más proporcionada) ---
    ctx.fillStyle = '#f8d8c0';
    ctx.fillRect(px + 5, py + 1, 8, 7);

    // Cabello (castaño, fluyente)
    ctx.fillStyle = '#6b3a1a';
    ctx.fillRect(px + 4, py - 1, 10, 4);
    ctx.fillRect(px + 3, py + 1, 2, 6);
    ctx.fillRect(px + 13, py + 1, 2, 7);
    // Brillo del cabello
    ctx.fillStyle = '#8b5a3a';
    ctx.fillRect(px + 5, py - 1, 3, 1);
    ctx.fillRect(px + 13, py + 3, 1, 3);

    // Rostro
    // Ojos (morados)
    ctx.fillStyle = '#8844aa';
    ctx.fillRect(px + 6, py + 4, 2, 2);
    ctx.fillRect(px + 10, py + 4, 2, 2);
    // Brillo ojos
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(px + 6, py + 4, 1, 1);
    ctx.fillRect(px + 10, py + 4, 1, 1);
    // Mejillas
    ctx.fillStyle = '#ffaaaa';
    ctx.fillRect(px + 5, py + 6, 2, 1);
    ctx.fillRect(px + 11, py + 6, 2, 1);
    // Sonrisa
    ctx.fillStyle = '#c06080';
    ctx.fillRect(px + 7, py + 6, 3, 1);

    // --- Corona ---
    ctx.fillStyle = '#d4af37';
    ctx.fillRect(px + 5, py - 2, 8, 3);
    ctx.fillStyle = '#ffcc44';
    ctx.fillRect(px + 5, py - 4, 2, 2);
    ctx.fillRect(px + 8, py - 5, 2, 3);
    ctx.fillRect(px + 11, py - 4, 2, 2);
    // Joyas
    ctx.fillStyle = '#ff2244';
    ctx.fillRect(px + 6, py - 3, 1, 1);
    ctx.fillStyle = '#9b59d0'; // Amatista morada
    ctx.fillRect(px + 9, py - 4, 1, 1);
    ctx.fillStyle = '#ff2244';
    ctx.fillRect(px + 12, py - 3, 1, 1);

    ctx.restore();
  }
}
