// ===== ENEMY SYSTEM =====

import { TILE_SIZE, TILE_GROUND, TILE_BRIDGE, TILE_SPECIAL, TILE_PLATFORM } from './constants';
import type { EnemyType, EnemySpawn, IMapAccessor } from './types';

interface EnemyInstance {
  x: number;
  y: number;
  type: EnemyType;
  alive: boolean;
  velX: number;
  velY: number;
  patrolLeft: number;  // pixel x
  patrolRight: number; // pixel x
  frame: number;
  frameTimer: number;
  deathTimer: number;
  width: number;
  height: number;
  facingRight: boolean;
}

const ENEMY_PROPS: Record<EnemyType, { w: number; h: number; speed: number; color1: string; color2: string; flies: boolean }> = {
  slime:    { w: 24, h: 18, speed: 1.2, color1: '#44cc44', color2: '#228822', flies: false },
  bat:      { w: 26, h: 16, speed: 1.8, color1: '#8844aa', color2: '#552266', flies: true },
  frog:     { w: 22, h: 20, speed: 1.0, color1: '#44aa44', color2: '#226622', flies: false },
  scorpion: { w: 28, h: 16, speed: 1.5, color1: '#cc6622', color2: '#884411', flies: false },
  alien:    { w: 22, h: 24, speed: 0.8, color1: '#66ccff', color2: '#3388bb', flies: true },
};

export class EnemyManager {
  enemies: EnemyInstance[] = [];

  spawn(defs: EnemySpawn[]) {
    this.enemies = defs.map(d => {
      const p = ENEMY_PROPS[d.type];
      return {
        x: d.x * TILE_SIZE,
        y: d.y * TILE_SIZE,
        type: d.type,
        alive: true,
        velX: p.speed * (Math.random() > 0.5 ? 1 : -1),
        velY: 0,
        patrolLeft: d.patrolLeft * TILE_SIZE,
        patrolRight: d.patrolRight * TILE_SIZE,
        frame: 0,
        frameTimer: 0,
        deathTimer: 0,
        width: p.w,
        height: p.h,
        facingRight: true,
      };
    });
  }

  update(map: IMapAccessor) {
    const time = Date.now();
    for (const e of this.enemies) {
      if (!e.alive) {
        e.deathTimer++;
        continue;
      }

      const props = ENEMY_PROPS[e.type];

      // Animation frame
      e.frameTimer++;
      if (e.frameTimer > 12) {
        e.frame = (e.frame + 1) % 4;
        e.frameTimer = 0;
      }

      if (props.flies) {
        // Flying enemies: sine wave vertical + horizontal patrol
        e.x += e.velX;
        e.y += Math.sin(time * 0.003 + e.x * 0.01) * 0.8;
        if (e.x <= e.patrolLeft || e.x + e.width >= e.patrolRight) {
          e.velX *= -1;
        }
      } else {
        // Ground enemies: patrol and reverse at boundaries / walls
        e.x += e.velX;

        // Apply gravity
        e.velY += 0.4;
        if (e.velY > 8) e.velY = 8;
        e.y += e.velY;

        // Floor collision
        const feetY = Math.floor((e.y + e.height) / TILE_SIZE);
        const midX = Math.floor((e.x + e.width / 2) / TILE_SIZE);
        const tile = map.getTile(midX, feetY);
        if (tile === TILE_GROUND || tile === TILE_BRIDGE || tile === TILE_SPECIAL || tile === TILE_PLATFORM) {
          e.y = feetY * TILE_SIZE - e.height;
          e.velY = 0;

          // Frog jumps periodically
          if (e.type === 'frog' && e.frame === 0 && e.frameTimer === 0) {
            e.velY = -6;
          }
        }

        // Reverse at patrol bounds or edge
        if (e.x <= e.patrolLeft || e.x + e.width >= e.patrolRight) {
          e.velX *= -1;
        }

        // Reverse at wall
        const aheadX = Math.floor((e.x + (e.velX > 0 ? e.width + 2 : -2)) / TILE_SIZE);
        const bodyY = Math.floor((e.y + e.height / 2) / TILE_SIZE);
        const wallTile = map.getTile(aheadX, bodyY);
        if (wallTile === TILE_GROUND || wallTile === TILE_SPECIAL) {
          e.velX *= -1;
        }

        // Check for edge (no ground ahead) – reverse to avoid falling
        const edgeX = Math.floor((e.x + (e.velX > 0 ? e.width + 4 : -4)) / TILE_SIZE);
        const belowTile = map.getTile(edgeX, feetY);
        if (belowTile !== TILE_GROUND && belowTile !== TILE_BRIDGE && belowTile !== TILE_SPECIAL && belowTile !== TILE_PLATFORM) {
          e.velX *= -1;
        }
      }

      e.facingRight = e.velX > 0;
    }
  }

  /** Check stomp / damage. Returns: 'stomp' | 'hurt' | null */
  checkPlayerCollision(px: number, py: number, pw: number, ph: number, pVelY: number): { result: 'stomp' | 'hurt'; enemy: EnemyInstance } | null {
    for (const e of this.enemies) {
      if (!e.alive || e.deathTimer > 0) continue;

      // AABB overlap with slight margin for better feel
      const margin = 2;
      if (px + pw - margin > e.x && px + margin < e.x + e.width && py + ph - margin > e.y && py + margin < e.y + e.height) {
        // Stomp: player falling and their feet are above enemy's top third
        if (pVelY > 0 && py + ph - 6 < e.y + e.height * 0.4) {
          return { result: 'stomp', enemy: e };
        }
        return { result: 'hurt', enemy: e };
      }
    }
    return null;
  }

  killEnemy(e: EnemyInstance) {
    e.alive = false;
    e.deathTimer = 1;
  }

  draw(ctx: CanvasRenderingContext2D, camX: number) {
    for (const e of this.enemies) {
      if (e.deathTimer > 30) continue; // fully despawned

      const sx = Math.floor(e.x - camX);
      const sy = Math.floor(e.y);
      const props = ENEMY_PROPS[e.type];

      if (sx + e.width < -20 || sx > 820) continue; // off screen

      ctx.save();

      // Death animation: squish + fade
      if (!e.alive) {
        const t = Math.min(e.deathTimer / 20, 1);
        ctx.globalAlpha = 1 - t;
        ctx.translate(sx + e.width / 2, sy + e.height);
        ctx.scale(1 + t * 0.5, 1 - t * 0.7);
        ctx.translate(-(sx + e.width / 2), -(sy + e.height));
      }

      // Draw based on type
      switch (e.type) {
        case 'slime':
          this.drawSlime(ctx, sx, sy, e, props);
          break;
        case 'bat':
          this.drawBat(ctx, sx, sy, e, props);
          break;
        case 'frog':
          this.drawFrog(ctx, sx, sy, e, props);
          break;
        case 'scorpion':
          this.drawScorpion(ctx, sx, sy, e, props);
          break;
        case 'alien':
          this.drawAlien(ctx, sx, sy, e, props);
          break;
      }

      ctx.restore();
    }
  }

  // ----- Per-type pixel art renderers -----

  private drawSlime(ctx: CanvasRenderingContext2D, x: number, y: number, e: EnemyInstance, p: typeof ENEMY_PROPS.slime) {
    const bounce = Math.sin(e.frame * Math.PI / 2) * 3;
    // Body
    ctx.fillStyle = p.color1;
    ctx.beginPath();
    ctx.ellipse(x + e.width / 2, y + e.height - 4 + bounce, e.width / 2, e.height / 2 - bounce / 2, 0, Math.PI, 0);
    ctx.fill();
    ctx.fillStyle = p.color2;
    ctx.beginPath();
    ctx.ellipse(x + e.width / 2, y + e.height - 2, e.width / 2, 4, 0, 0, Math.PI);
    ctx.fill();
    // Eyes
    const eyeOff = e.facingRight ? 3 : -3;
    ctx.fillStyle = '#fff';
    ctx.fillRect(x + 7 + eyeOff, y + e.height - 12 + bounce, 4, 5);
    ctx.fillRect(x + 14 + eyeOff, y + e.height - 12 + bounce, 4, 5);
    ctx.fillStyle = '#000';
    ctx.fillRect(x + 8 + eyeOff + (e.facingRight ? 1 : 0), y + e.height - 10 + bounce, 2, 3);
    ctx.fillRect(x + 15 + eyeOff + (e.facingRight ? 1 : 0), y + e.height - 10 + bounce, 2, 3);
  }

  private drawBat(ctx: CanvasRenderingContext2D, x: number, y: number, e: EnemyInstance, p: typeof ENEMY_PROPS.bat) {
    const wingAngle = Math.sin(e.frame * Math.PI / 2) * 0.5;
    ctx.fillStyle = p.color1;
    // Body
    ctx.beginPath();
    ctx.ellipse(x + e.width / 2, y + e.height / 2, 6, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    // Wings
    ctx.save();
    ctx.translate(x + e.width / 2, y + e.height / 2 - 2);
    // Left wing
    ctx.fillStyle = p.color2;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(-8, -8 + wingAngle * 10, -13, 2 + wingAngle * 6);
    ctx.quadraticCurveTo(-6, 4, 0, 0);
    ctx.fill();
    // Right wing
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(8, -8 + wingAngle * 10, 13, 2 + wingAngle * 6);
    ctx.quadraticCurveTo(6, 4, 0, 0);
    ctx.fill();
    ctx.restore();
    // Eyes
    ctx.fillStyle = '#ff4444';
    ctx.fillRect(x + e.width / 2 - 4, y + e.height / 2 - 3, 2, 2);
    ctx.fillRect(x + e.width / 2 + 2, y + e.height / 2 - 3, 2, 2);
  }

  private drawFrog(ctx: CanvasRenderingContext2D, x: number, y: number, e: EnemyInstance, p: typeof ENEMY_PROPS.frog) {
    const hop = e.velY < 0 ? -3 : 0;
    // Body
    ctx.fillStyle = p.color1;
    ctx.beginPath();
    ctx.ellipse(x + e.width / 2, y + e.height - 6 + hop, 10, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    // Belly
    ctx.fillStyle = '#88cc88';
    ctx.beginPath();
    ctx.ellipse(x + e.width / 2, y + e.height - 3 + hop, 7, 4, 0, 0, Math.PI);
    ctx.fill();
    // Eyes (big, on top)
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(x + 6, y + e.height - 14 + hop, 4, 0, Math.PI * 2);
    ctx.arc(x + 16, y + e.height - 14 + hop, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#000';
    ctx.fillRect(x + 5 + (e.facingRight ? 1 : -1), y + e.height - 15 + hop, 3, 3);
    ctx.fillRect(x + 15 + (e.facingRight ? 1 : -1), y + e.height - 15 + hop, 3, 3);
    // Legs
    ctx.fillStyle = p.color2;
    if (e.velY < 0) {
      // Jumping – legs extended
      ctx.fillRect(x + 2, y + e.height - 2, 6, 4);
      ctx.fillRect(x + 14, y + e.height - 2, 6, 4);
    } else {
      ctx.fillRect(x + 3, y + e.height - 3, 5, 3);
      ctx.fillRect(x + 14, y + e.height - 3, 5, 3);
    }
  }

  private drawScorpion(ctx: CanvasRenderingContext2D, x: number, y: number, e: EnemyInstance, p: typeof ENEMY_PROPS.scorpion) {
    const legWiggle = Math.sin(e.frame * Math.PI / 2) * 2;
    // Body
    ctx.fillStyle = p.color1;
    ctx.beginPath();
    ctx.ellipse(x + e.width / 2, y + e.height - 5, 10, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    // Tail (curls based on facing)
    ctx.strokeStyle = p.color2;
    ctx.lineWidth = 3;
    ctx.beginPath();
    const tailDir = e.facingRight ? -1 : 1;
    ctx.moveTo(x + e.width / 2 + tailDir * 8, y + e.height - 5);
    ctx.quadraticCurveTo(x + e.width / 2 + tailDir * 14, y + e.height - 20, x + e.width / 2 + tailDir * 6, y + e.height - 22);
    ctx.stroke();
    // Stinger
    ctx.fillStyle = '#ff4444';
    ctx.beginPath();
    ctx.arc(x + e.width / 2 + tailDir * 6, y + e.height - 23, 2, 0, Math.PI * 2);
    ctx.fill();
    // Pincers
    ctx.fillStyle = p.color1;
    const pDir = e.facingRight ? 1 : -1;
    ctx.fillRect(x + e.width / 2 + pDir * 8, y + e.height - 8, 4, 3);
    ctx.fillRect(x + e.width / 2 + pDir * 8, y + e.height - 12, 4, 3);
    // Legs
    for (let i = 0; i < 3; i++) {
      ctx.fillStyle = p.color2;
      ctx.fillRect(x + 4 + i * 7, y + e.height - 2 + (i % 2 === 0 ? legWiggle : -legWiggle), 3, 2);
    }
    // Eyes
    ctx.fillStyle = '#000';
    ctx.fillRect(x + e.width / 2 + pDir * 3, y + e.height - 9, 2, 2);
  }

  private drawAlien(ctx: CanvasRenderingContext2D, x: number, y: number, e: EnemyInstance, p: typeof ENEMY_PROPS.alien) {
    const bob = Math.sin(Date.now() * 0.004 + e.x) * 3;
    // Body (oval)
    ctx.fillStyle = p.color1;
    ctx.beginPath();
    ctx.ellipse(x + e.width / 2, y + e.height / 2 + bob, 9, 11, 0, 0, Math.PI * 2);
    ctx.fill();
    // Antenna
    ctx.strokeStyle = p.color2;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x + e.width / 2, y + 2 + bob);
    ctx.lineTo(x + e.width / 2, y - 4 + bob);
    ctx.stroke();
    ctx.fillStyle = '#ffff00';
    ctx.beginPath();
    ctx.arc(x + e.width / 2, y - 5 + bob, 2, 0, Math.PI * 2);
    ctx.fill();
    // Big eye
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.ellipse(x + e.width / 2, y + e.height / 2 - 2 + bob, 5, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(x + e.width / 2 + 1, y + e.height / 2 - 3 + bob, 2, 0, Math.PI * 2);
    ctx.fill();
    // Glow
    ctx.save();
    ctx.globalAlpha = 0.15;
    ctx.fillStyle = p.color1;
    ctx.beginPath();
    ctx.arc(x + e.width / 2, y + e.height / 2 + bob, 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    // Tentacles
    ctx.strokeStyle = p.color2;
    ctx.lineWidth = 2;
    for (let i = -1; i <= 1; i += 2) {
      ctx.beginPath();
      ctx.moveTo(x + e.width / 2 + i * 4, y + e.height - 2 + bob);
      ctx.quadraticCurveTo(x + e.width / 2 + i * 8, y + e.height + 4 + bob, x + e.width / 2 + i * 5, y + e.height + 7 + bob);
      ctx.stroke();
    }
  }
}
