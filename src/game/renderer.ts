// ===== BACKGROUND RENDERER – unique per level theme =====

import { VIEWPORT_WIDTH, VIEWPORT_HEIGHT, THEME_COLORS } from './constants';
import type { LevelTheme } from './types';
import type { Camera } from './camera';

interface Star { x: number; y: number; size: number; brightness: number; twinkleSpeed: number; }

export class BackgroundRenderer {
  theme: LevelTheme = 'castle';
  private stars: Star[] = [];
  private particles: { x: number; y: number; vx: number; vy: number; life: number; maxLife: number }[] = [];

  setTheme(theme: LevelTheme) {
    this.theme = theme;
    this.stars = [];
    this.particles = [];

    // Generate stars for outdoor levels
    if (theme === 'rooftop' || theme === 'moon') {
      const count = theme === 'moon' ? 200 : 120;
      for (let i = 0; i < count; i++) {
        this.stars.push({
          x: Math.random() * 2000,
          y: Math.random() * VIEWPORT_HEIGHT * 0.7,
          size: Math.random() * 2 + 0.5,
          brightness: Math.random(),
          twinkleSpeed: 0.001 + Math.random() * 0.003,
        });
      }
    }

    // Desert particles (heat shimmer dots)
    if (theme === 'desert') {
      for (let i = 0; i < 30; i++) {
        this.particles.push({
          x: Math.random() * 2000, y: VIEWPORT_HEIGHT * 0.4 + Math.random() * VIEWPORT_HEIGHT * 0.4,
          vx: Math.random() * 0.3 - 0.15, vy: -0.2 - Math.random() * 0.3,
          life: Math.random() * 200, maxLife: 200,
        });
      }
    }

    // Swamp particles (fireflies)
    if (theme === 'swamp') {
      for (let i = 0; i < 25; i++) {
        this.particles.push({
          x: Math.random() * 2000, y: VIEWPORT_HEIGHT * 0.3 + Math.random() * VIEWPORT_HEIGHT * 0.5,
          vx: Math.random() * 0.4 - 0.2, vy: Math.random() * 0.2 - 0.1,
          life: Math.random() * 300, maxLife: 300,
        });
      }
    }

    // Moon particles (floating dust)
    if (theme === 'moon') {
      for (let i = 0; i < 20; i++) {
        this.particles.push({
          x: Math.random() * 2500, y: Math.random() * VIEWPORT_HEIGHT,
          vx: Math.random() * 0.2 - 0.1, vy: -0.05 - Math.random() * 0.1,
          life: Math.random() * 400, maxLife: 400,
        });
      }
    }
  }

  draw(ctx: CanvasRenderingContext2D, camera: Camera, time: number) {
    switch (this.theme) {
      case 'castle':  this.drawCastle(ctx, camera, time); break;
      case 'rooftop': this.drawRooftop(ctx, camera, time); break;
      case 'swamp':   this.drawSwamp(ctx, camera, time); break;
      case 'desert':  this.drawDesert(ctx, camera, time); break;
      case 'moon':    this.drawMoon(ctx, camera, time); break;
    }
  }

  // ===== CASTLE: dark dungeon, torchlight glow =====
  private drawCastle(ctx: CanvasRenderingContext2D, cam: Camera, time: number) {
    // Gradient background (very dark)
    const grad = ctx.createLinearGradient(0, 0, 0, VIEWPORT_HEIGHT);
    grad.addColorStop(0, '#0a0612');
    grad.addColorStop(0.5, '#12081e');
    grad.addColorStop(1, '#1a0c28');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, VIEWPORT_WIDTH, VIEWPORT_HEIGHT);

    // Parallax background stone walls
    const parallax = cam.x * 0.15;
    ctx.fillStyle = '#1a1228';
    for (let i = 0; i < 30; i++) {
      const bx = (i * 70 - parallax) % (VIEWPORT_WIDTH + 100) - 50;
      const by = 50 + (i * 37) % (VIEWPORT_HEIGHT - 100);
      ctx.fillRect(bx, by, 40 + (i % 3) * 20, 20 + (i % 2) * 10);
    }

    // Floor lava glow (subtle)
    ctx.save();
    ctx.globalAlpha = 0.08 + Math.sin(time * 0.002) * 0.03;
    const lavaGlow = ctx.createLinearGradient(0, VIEWPORT_HEIGHT - 80, 0, VIEWPORT_HEIGHT);
    lavaGlow.addColorStop(0, '#00000000');
    lavaGlow.addColorStop(1, '#ff440044');
    ctx.fillStyle = lavaGlow;
    ctx.fillRect(0, VIEWPORT_HEIGHT - 80, VIEWPORT_WIDTH, 80);
    ctx.restore();

    // Dust motes
    ctx.fillStyle = '#ffffff08';
    for (let i = 0; i < 8; i++) {
      const dx = (time * 0.01 + i * 100) % VIEWPORT_WIDTH;
      const dy = (Math.sin(time * 0.001 + i) * 30) + VIEWPORT_HEIGHT * 0.4;
      ctx.fillRect(dx, dy, 2, 2);
    }
  }

  // ===== ROOFTOP: night sky, moon, stars =====
  private drawRooftop(ctx: CanvasRenderingContext2D, cam: Camera, time: number) {
    // Night sky gradient
    const grad = ctx.createLinearGradient(0, 0, 0, VIEWPORT_HEIGHT);
    grad.addColorStop(0, '#050818');
    grad.addColorStop(0.4, '#0c1430');
    grad.addColorStop(1, '#1a2850');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, VIEWPORT_WIDTH, VIEWPORT_HEIGHT);

    // Stars with twinkling
    for (const s of this.stars) {
      const sx = (s.x - cam.x * 0.05) % (VIEWPORT_WIDTH + 100) - 50;
      const alpha = 0.3 + Math.sin(time * s.twinkleSpeed + s.brightness * 10) * 0.4 + s.brightness * 0.3;
      ctx.fillStyle = `rgba(255, 255, 240, ${Math.max(0, Math.min(1, alpha))})`;
      ctx.fillRect(sx, s.y, s.size, s.size);
    }

    // Moon
    const moonX = VIEWPORT_WIDTH * 0.75 - cam.x * 0.02;
    const moonY = 50;
    ctx.fillStyle = '#e8e0c8';
    ctx.beginPath();
    ctx.arc(moonX, moonY, 30, 0, Math.PI * 2);
    ctx.fill();
    // Craters
    ctx.fillStyle = '#d0c8b0';
    ctx.beginPath();
    ctx.arc(moonX - 8, moonY - 5, 5, 0, Math.PI * 2);
    ctx.arc(moonX + 10, moonY + 8, 4, 0, Math.PI * 2);
    ctx.arc(moonX + 3, moonY - 10, 3, 0, Math.PI * 2);
    ctx.fill();
    // Moon glow
    ctx.save();
    ctx.globalAlpha = 0.06;
    const moonGlow = ctx.createRadialGradient(moonX, moonY, 30, moonX, moonY, 100);
    moonGlow.addColorStop(0, '#ffffcc');
    moonGlow.addColorStop(1, '#00000000');
    ctx.fillStyle = moonGlow;
    ctx.fillRect(moonX - 100, moonY - 100, 200, 200);
    ctx.restore();

    // Distant city silhouette
    ctx.fillStyle = '#0a0e1a';
    const sil = cam.x * 0.08;
    for (let i = 0; i < 20; i++) {
      const bx = (i * 60 - sil) % (VIEWPORT_WIDTH + 100) - 50;
      const bh = 30 + (i * 17) % 60;
      ctx.fillRect(bx, VIEWPORT_HEIGHT - bh - 20, 35, bh + 20);
    }

    // Wind lines
    ctx.strokeStyle = 'rgba(255,255,255,0.04)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 4; i++) {
      const wx = ((time * 0.1 + i * 200) % (VIEWPORT_WIDTH + 200)) - 100;
      const wy = 100 + i * 60;
      ctx.beginPath();
      ctx.moveTo(wx, wy);
      ctx.lineTo(wx + 80, wy - 3);
      ctx.stroke();
    }
  }

  // ===== SWAMP: murky green, fog, vines =====
  private drawSwamp(ctx: CanvasRenderingContext2D, cam: Camera, time: number) {
    // Dark green gradient
    const grad = ctx.createLinearGradient(0, 0, 0, VIEWPORT_HEIGHT);
    grad.addColorStop(0, '#060e06');
    grad.addColorStop(0.5, '#0a1a0a');
    grad.addColorStop(1, '#0e2a0e');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, VIEWPORT_WIDTH, VIEWPORT_HEIGHT);

    // Background trees (parallax)
    const parallax = cam.x * 0.1;
    ctx.fillStyle = '#0a150a';
    for (let i = 0; i < 15; i++) {
      const tx = (i * 100 - parallax) % (VIEWPORT_WIDTH + 200) - 100;
      const th = 80 + (i * 23) % 80;
      // Trunk
      ctx.fillRect(tx + 10, VIEWPORT_HEIGHT - th, 8, th);
      // Canopy
      ctx.beginPath();
      ctx.arc(tx + 14, VIEWPORT_HEIGHT - th - 10, 25, 0, Math.PI * 2);
      ctx.fill();
    }

    // Fireflies
    for (const p of this.particles) {
      p.x += p.vx + Math.sin(time * 0.001 + p.life) * 0.3;
      p.y += p.vy + Math.cos(time * 0.001 + p.life * 0.7) * 0.2;
      p.life++;
      if (p.life > p.maxLife) {
        p.life = 0;
        p.x = Math.random() * 2000;
        p.y = VIEWPORT_HEIGHT * 0.3 + Math.random() * VIEWPORT_HEIGHT * 0.4;
      }
      const alpha = Math.sin(p.life / p.maxLife * Math.PI) * 0.7;
      const sx = (p.x - cam.x * 0.3) % (VIEWPORT_WIDTH + 40) - 20;
      ctx.fillStyle = `rgba(150, 255, 100, ${alpha})`;
      ctx.beginPath();
      ctx.arc(sx, p.y, 2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Ground fog
    ctx.save();
    ctx.globalAlpha = 0.15 + Math.sin(time * 0.001) * 0.05;
    const fog = ctx.createLinearGradient(0, VIEWPORT_HEIGHT - 100, 0, VIEWPORT_HEIGHT);
    fog.addColorStop(0, '#00000000');
    fog.addColorStop(1, '#2a4a2a');
    ctx.fillStyle = fog;
    ctx.fillRect(0, VIEWPORT_HEIGHT - 100, VIEWPORT_WIDTH, 100);
    ctx.restore();
  }

  // ===== DESERT: sand, heat, pyramids =====
  private drawDesert(ctx: CanvasRenderingContext2D, cam: Camera, time: number) {
    // Warm sky gradient
    const grad = ctx.createLinearGradient(0, 0, 0, VIEWPORT_HEIGHT);
    grad.addColorStop(0, '#1a1000');
    grad.addColorStop(0.3, '#3a2010');
    grad.addColorStop(0.6, '#5a3818');
    grad.addColorStop(1, '#7a5030');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, VIEWPORT_WIDTH, VIEWPORT_HEIGHT);

    // Sun
    const sunX = VIEWPORT_WIDTH * 0.3 - cam.x * 0.01;
    ctx.fillStyle = '#ff8800';
    ctx.beginPath();
    ctx.arc(sunX, 60, 35, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffaa22';
    ctx.beginPath();
    ctx.arc(sunX, 60, 25, 0, Math.PI * 2);
    ctx.fill();
    // Sun glow
    ctx.save();
    ctx.globalAlpha = 0.08;
    const sunGlow = ctx.createRadialGradient(sunX, 60, 35, sunX, 60, 150);
    sunGlow.addColorStop(0, '#ffaa00');
    sunGlow.addColorStop(1, '#00000000');
    ctx.fillStyle = sunGlow;
    ctx.fillRect(sunX - 150, -90, 300, 300);
    ctx.restore();

    // Distant pyramids (parallax)
    const parallax = cam.x * 0.06;
    ctx.fillStyle = '#4a3420';
    // Pyramid 1
    const p1x = 200 - parallax;
    ctx.beginPath();
    ctx.moveTo(p1x, VIEWPORT_HEIGHT - 50);
    ctx.lineTo(p1x + 60, VIEWPORT_HEIGHT - 130);
    ctx.lineTo(p1x + 120, VIEWPORT_HEIGHT - 50);
    ctx.fill();
    // Pyramid 2
    const p2x = 500 - parallax;
    ctx.fillStyle = '#3a2818';
    ctx.beginPath();
    ctx.moveTo(p2x, VIEWPORT_HEIGHT - 50);
    ctx.lineTo(p2x + 80, VIEWPORT_HEIGHT - 160);
    ctx.lineTo(p2x + 160, VIEWPORT_HEIGHT - 50);
    ctx.fill();

    // Heat shimmer particles
    for (const p of this.particles) {
      p.y += p.vy;
      p.x += Math.sin(time * 0.002 + p.life * 0.1) * 0.3;
      p.life++;
      if (p.life > p.maxLife) {
        p.life = 0;
        p.y = VIEWPORT_HEIGHT * 0.5 + Math.random() * VIEWPORT_HEIGHT * 0.3;
        p.x = Math.random() * 2000;
      }
      const sx = (p.x - cam.x * 0.2) % (VIEWPORT_WIDTH + 40) - 20;
      ctx.fillStyle = `rgba(255, 200, 100, ${0.08 * Math.sin(p.life / p.maxLife * Math.PI)})`;
      ctx.fillRect(sx, p.y, 20, 1);
    }

    // Sand dunes (foreground parallax)
    const sp = cam.x * 0.12;
    ctx.fillStyle = '#6a4828';
    ctx.beginPath();
    ctx.moveTo(0, VIEWPORT_HEIGHT);
    for (let x = 0; x <= VIEWPORT_WIDTH; x += 20) {
      ctx.lineTo(x, VIEWPORT_HEIGHT - 15 + Math.sin((x + sp) * 0.015) * 8);
    }
    ctx.lineTo(VIEWPORT_WIDTH, VIEWPORT_HEIGHT);
    ctx.fill();
  }

  // ===== MOON: starfield, earth, low gravity feel =====
  private drawMoon(ctx: CanvasRenderingContext2D, cam: Camera, time: number) {
    // Deep space gradient
    const grad = ctx.createLinearGradient(0, 0, 0, VIEWPORT_HEIGHT);
    grad.addColorStop(0, '#010108');
    grad.addColorStop(0.5, '#030316');
    grad.addColorStop(1, '#060620');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, VIEWPORT_WIDTH, VIEWPORT_HEIGHT);

    // Stars
    for (const s of this.stars) {
      const sx = (s.x - cam.x * 0.03) % (VIEWPORT_WIDTH + 100) - 50;
      const alpha = 0.4 + Math.sin(time * s.twinkleSpeed + s.brightness * 10) * 0.3 + s.brightness * 0.3;
      ctx.fillStyle = `rgba(200, 200, 255, ${Math.max(0, Math.min(1, alpha))})`;
      ctx.fillRect(sx, s.y, s.size, s.size);
    }

    // Earth in the sky
    const earthX = VIEWPORT_WIDTH * 0.6 - cam.x * 0.015;
    const earthY = 70;
    // Earth glow
    ctx.save();
    ctx.globalAlpha = 0.05;
    const eg = ctx.createRadialGradient(earthX, earthY, 20, earthX, earthY, 70);
    eg.addColorStop(0, '#4488ff');
    eg.addColorStop(1, '#00000000');
    ctx.fillStyle = eg;
    ctx.fillRect(earthX - 70, earthY - 70, 140, 140);
    ctx.restore();
    // Earth body
    ctx.fillStyle = '#2244aa';
    ctx.beginPath();
    ctx.arc(earthX, earthY, 22, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#44aa44';
    ctx.beginPath();
    ctx.arc(earthX - 5, earthY - 3, 7, 0.3, 2);
    ctx.arc(earthX + 8, earthY + 5, 5, 0, 1.5);
    ctx.fill();
    ctx.fillStyle = '#ffffff33';
    ctx.beginPath();
    ctx.arc(earthX - 8, earthY - 8, 5, 0, Math.PI * 2);
    ctx.arc(earthX + 3, earthY + 10, 4, 0, Math.PI * 2);
    ctx.fill();

    // Floating cosmic dust
    for (const p of this.particles) {
      p.x += p.vx;
      p.y += p.vy;
      p.life++;
      if (p.life > p.maxLife) {
        p.life = 0;
        p.x = Math.random() * 2500;
        p.y = Math.random() * VIEWPORT_HEIGHT;
      }
      const sx = (p.x - cam.x * 0.15) % (VIEWPORT_WIDTH + 40) - 20;
      const alpha = Math.sin(p.life / p.maxLife * Math.PI) * 0.3;
      ctx.fillStyle = `rgba(180, 160, 255, ${alpha})`;
      ctx.beginPath();
      ctx.arc(sx, p.y, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Nebula haze
    ctx.save();
    ctx.globalAlpha = 0.04;
    ctx.fillStyle = '#6644aa';
    ctx.beginPath();
    ctx.ellipse(300 - cam.x * 0.02, 180, 200, 60, 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#4466cc';
    ctx.beginPath();
    ctx.ellipse(550 - cam.x * 0.025, 120, 160, 50, -0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}
