"use client";

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';
import Link from 'next/link';

export default function JuegoPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [flowersCollected, setFlowersCollected] = useState(0);
  const [message, setMessage] = useState('');
  const [isPaused, setIsPaused] = useState(false);
  const gameStateRef = useRef({
    running: false,
    player: null as any,
    map: null as any,
    camera: null as any,
    inputs: { left: false, right: false, up: false },
    audioCtx: null as any,
    nextNoteTime: 0,
    currentNoteIndex: 0,
    animationFrameId: null as number | null,
    isFading: false,
    fadeOpacity: 0,
    lastCheckpoint: { x: 50, y: 0 },
    isPausedForFlower: false,
    flowerPauseStartTime: 0,
    messageTimeoutId: null as number | null
  });

  useEffect(() => {
    if (!canvasRef.current || !gameStarted) return;

    const canvas = canvasRef.current;
    const rawCtx = canvas.getContext('2d');
    if (!rawCtx) return;
    const ctx = rawCtx as CanvasRenderingContext2D;

    const VIEWPORT_WIDTH = 800;
    const VIEWPORT_HEIGHT = 450;
    const TILE_SIZE = 32;

    const FLOWER_MESSAGES = [
      "La valentía no es la ausencia de miedo.",
      "Tu corazón brilla más que la oscuridad.",
      "Cada paso cuenta, no te detengas.",
      "La esperanza florece en la piedra.",
      "Eres la dueña de tu propio destino.",
      "La bondad es la verdadera nobleza.",
      "Respira... lo estás haciendo bien.",
      "Tu fuerza interior es inquebrantable.",
      "La noche es más oscura antes del alba.",
      "Cree en la magia de tus sueños.",
      "Ya casi llegas, noble princesa.",
      "El amor lo conquista todo."
    ];

    // Audio Context
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    gameStateRef.current.audioCtx = audioCtx;

    const melodyInterior = [
      {note: 220, dur: 0.2}, {note: 0, dur: 0.1}, {note: 329.6, dur: 0.2}, {note: 440, dur: 0.4},
      {note: 392, dur: 0.2}, {note: 349, dur: 0.2}, {note: 329.6, dur: 0.4},
      {note: 293.7, dur: 0.2}, {note: 261.6, dur: 0.2}, {note: 246.9, dur: 0.2}, {note: 220, dur: 0.6}
    ];

    const melodyExterior = [
      {note: 523.25, dur: 0.2}, {note: 0, dur: 0.1}, {note: 659.25, dur: 0.2}, {note: 783.99, dur: 0.4},
      {note: 698.46, dur: 0.2}, {note: 659.25, dur: 0.2}, {note: 587.33, dur: 0.4},
      {note: 523.25, dur: 0.2}, {note: 493.88, dur: 0.2}, {note: 440, dur: 0.6}
    ];

    function playSound(type: string) {
      try {
        if (audioCtx.state === 'suspended') audioCtx.resume();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);

        if (type === 'jump') {
          osc.type = 'square';
          osc.frequency.setValueAtTime(150, audioCtx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(300, audioCtx.currentTime + 0.1);
          gain.gain.setValueAtTime(0.05, audioCtx.currentTime); // Lower volume
          gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);
          osc.start();
          osc.stop(audioCtx.currentTime + 0.1);
        } else if (type === 'coin') {
          osc.type = 'sine';
          osc.frequency.setValueAtTime(600, audioCtx.currentTime);
          osc.frequency.setValueAtTime(900, audioCtx.currentTime + 0.1);
          gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
          osc.start();
          osc.stop(audioCtx.currentTime + 0.3);
        } else if (type === 'win') {
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(220, audioCtx.currentTime);
          osc.frequency.linearRampToValueAtTime(880, audioCtx.currentTime + 1);
          gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
          gain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 2);
          osc.start();
          osc.stop(audioCtx.currentTime + 2);
        } else if (type === 'fall') {
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(200, audioCtx.currentTime);
          osc.frequency.linearRampToValueAtTime(50, audioCtx.currentTime + 0.5);
          gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
          gain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.5);
          osc.start();
          osc.stop(audioCtx.currentTime + 0.5);
        }
      } catch (e) {
        console.log('Audio error:', e);
      }
    }

    function updateMusic() {
      if (!gameStateRef.current.running) return;
      try {
        if (audioCtx.currentTime >= gameStateRef.current.nextNoteTime) {
          // Choose melody based on location (Castle vs Outside)
          const playerX = gameStateRef.current.player?.x || 0;
          const currentMelody = (playerX > 150 * TILE_SIZE && playerX < 300 * TILE_SIZE) || playerX > 450 * TILE_SIZE 
            ? melodyExterior 
            : melodyInterior;
            
          const noteData = currentMelody[gameStateRef.current.currentNoteIndex % currentMelody.length];
          
          if (noteData.note > 0) {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = 'triangle';
            osc.frequency.value = noteData.note;
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            gain.gain.setValueAtTime(0.02, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + noteData.dur);
            osc.start();
            osc.stop(audioCtx.currentTime + noteData.dur);
          }
          gameStateRef.current.nextNoteTime += noteData.dur + 0.05;
          gameStateRef.current.currentNoteIndex++;
        }
      } catch (e) {
        // Silent fail for audio
      }
    }

    class Camera {
      x = 0;
      y = 0;
      constructor(public width: number, public height: number) {}
      follow(target: { x: number }, mapWidth: number) {
        this.x = target.x - this.width / 2;
        if (this.x < 0) this.x = 0;
        if (this.x + this.width > mapWidth) this.x = mapWidth - this.width;
      }
    }

    class Player {
      width = 24;
      height = 30;
      velX = 0;
      velY = 0;
      speed = 6; // Max speed
      acceleration = 0.8; // Suavidad de aceleración
      friction = 0.85; // Desaceleración suave
      jumpForce = 14; // Salto optimizado
      grounded = false;
      facingRight = true;
      coyoteTime = 0;
      wasJumpPressed = false;
      runFrame = 0;

      constructor(public x: number, public y: number) {}

      update(mapWidth: number, map: GameMap) {
        const inputs = gameStateRef.current.inputs;
        
        // Horizontal Movement - Con aceleración suave
        if (inputs.left) { 
          this.velX -= this.acceleration;
          if (this.velX < -this.speed) this.velX = -this.speed;
          this.facingRight = false; 
          this.runFrame++;
        }
        else if (inputs.right) { 
          this.velX += this.acceleration;
          if (this.velX > this.speed) this.velX = this.speed;
          this.facingRight = true; 
          this.runFrame++;
        }
        else { 
          // Desaceleración suave en lugar de parada instantánea
          this.velX *= this.friction;
          if (Math.abs(this.velX) < 0.1) this.velX = 0;
          this.runFrame = 0;
        }

        // Physics: Coyote Time
        if (this.grounded) {
          this.coyoteTime = 10; // Mayor perdón para mejor sensación
        } else if (this.coyoteTime > 0) {
          this.coyoteTime--;
        }

        // Jump Physics (Long Jump Mechanic)
        // Holding down the jump button counteracts gravity slightly, allowing longer airtime/distance
        if (inputs.up) {
           if (!this.wasJumpPressed && this.coyoteTime > 0) {
             this.velY = -this.jumpForce;
             this.grounded = false;
             this.coyoteTime = 0;
             playSound('jump');
           }
           
           // Floating mechanic: If moving up and holding jump, apply less gravity
           if (this.velY < 0) {
             this.velY += 0.28; // Gravedad reducida ascendiendo
           } else {
             // Glide/Slow Fall mechanic
             this.velY += 0.25; // Caída lenta al mantener presionado
           }
        } else {
           // Cut short if released (salto variable)
           if (this.velY < -3) {
             this.velY *= 0.6; // Corte más suave
           }
           this.velY += 0.65; // Gravedad normal ligeramente ajustada
        }
        this.wasJumpPressed = inputs.up;

        this.x += this.velX;
        this.checkCollisions(true, map);
        this.y += this.velY;
        this.checkCollisions(false, map);

        if (this.x < 0) this.x = 0;
        
        // Void Death Logic (Fall to lose)
        if (this.y > VIEWPORT_HEIGHT + 50 && !gameStateRef.current.isFading) {
          gameStateRef.current.isFading = true;
          playSound('fall');
        }
        
        if (this.x > mapWidth - this.width) this.x = mapWidth - this.width;
      }

      checkCollisions(isX: boolean, map: GameMap) {
        const startX = Math.floor(this.x / TILE_SIZE);
        const endX = Math.floor((this.x + this.width) / TILE_SIZE);
        const startY = Math.floor(this.y / TILE_SIZE);
        const endY = Math.floor((this.y + this.height) / TILE_SIZE);
        this.grounded = false;

        for (let y = startY; y <= endY; y++) {
          for (let x = startX; x <= endX; x++) {
            const tile = map.getTile(x, y);
            if (tile === 1 || tile === 2) {
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
        const drawX = Math.floor(this.x - camX);
        const drawY = Math.floor(this.y);
        const bob = (this.runFrame % 10 > 5) ? 1 : 0;

        // Princess Sprite
        // Dress (Base)
        ctx.fillStyle = '#ff69b4'; // Pink
        ctx.beginPath();
        ctx.moveTo(drawX + 4, drawY + 30);
        ctx.lineTo(drawX + 20, drawY + 30);
        ctx.lineTo(drawX + 16, drawY + 12);
        ctx.lineTo(drawX + 8, drawY + 12);
        ctx.fill();

        // Dress (Details)
        ctx.fillStyle = '#db2777'; // Darker Pink
        ctx.fillRect(drawX + 10, drawY + 12, 4, 18);

        // Head
        ctx.fillStyle = '#ffccaa'; // Skin
        ctx.fillRect(drawX + 8, drawY + 2 + bob, 8, 8);
        
        // Eyes
        ctx.fillStyle = '#000';
        if (this.facingRight) {
          ctx.fillRect(drawX + 13, drawY + 5 + bob, 2, 2);
        } else {
          ctx.fillRect(drawX + 9, drawY + 5 + bob, 2, 2);
        }

        // Hair (Long brown hair)
        ctx.fillStyle = '#8b4513';
        ctx.fillRect(drawX + 7, drawY + 1 + bob, 10, 3); // Top
        if (this.facingRight) {
          ctx.fillRect(drawX + 6, drawY + 2 + bob, 3, 10); // Back hair
        } else {
          ctx.fillRect(drawX + 15, drawY + 2 + bob, 3, 10); // Back hair
        }

        // Crown
        ctx.fillStyle = '#ffd700';
        ctx.fillRect(drawX + 8, drawY - 1 + bob, 8, 2);
        ctx.fillRect(drawX + 9, drawY - 2 + bob, 2, 2);
        ctx.fillRect(drawX + 13, drawY - 2 + bob, 2, 2);
      }
    }

    interface Flower {
      x: number;
      y: number;
      id: number;
      active: boolean;
      animOffset: number;
    }

    interface Castle {
      x: number;
      y: number;
      width: number;
      height: number;
    }

    class GameMap {
      width = 600; // Increased for 4 distinct sections
      height = 20; // Increased height for verticality
      data: Uint8Array;
      flowers: Flower[] = [];
      castle: Castle;
      torches: {x: number, y: number}[] = [];
      checkpoints: {x: number, y: number}[] = [];

      constructor() {
        this.data = new Uint8Array(this.width * this.height);
        this.castle = { x: 0, y: 0, width: 120, height: 160 };
        this.generate();
      }

      generate() {
        // Initialize air
        for (let i = 0; i < this.data.length; i++) this.data[i] = 0;

        // SECTION 1: The Dark Garden (0 - 150) - Tutorial fácil con saltos cortos
        for (let x = 0; x < 150; x++) {
           // Plataforma inicial extendida
           if (x < 35) {
              for(let y=11; y<this.height; y++) this.setTile(x, y, 1);
              if (x === 20) this.checkpoints.push({x: 20 * 32, y: 10 * 32});
           } 
           // Plataformas tutorial (progresión gradual)
           else if (x >= 35 && x < 90) {
              // Cada 8 tiles, plataforma de 5 de ancho
              if ((x - 35) % 8 === 0) {
                 this.createPlatform(x, 11, 5);
                 if ((x - 35) % 24 === 0) this.checkpoints.push({x: x * 32, y: 10 * 32});
              }
           }
           // Islas intermedias (más espaciadas pero alcanzables)
           else if (x >= 90 && x < 150) {
              if ((x - 90) % 10 === 0) {
                 let h = 9 + ((x - 90) / 10) % 3; // Altura varía entre 9-11
                 this.createPlatform(x, h, 4);
                 if ((x - 90) % 30 === 0) this.checkpoints.push({x: x * 32, y: (h - 1) * 32});
              }
           }
        }

        // SECTION 2: The Castle Walls (150 - 300) - Torres alcanzables
        for (let x = 150; x < 300; x++) {
           // Torres cada 15 tiles (más espacio, más manejable)
           if ((x - 150) % 15 === 0) {
              // Pilares
              for (let y = 9; y < 16; y++) this.setTile(x, y, 2); 
              for (let y = 9; y < 16; y++) this.setTile(x+1, y, 2);
              // Plataforma superior ancha
              this.createPlatform(x, 9, 5);
              this.torches.push({x: (x+1)*32, y: 8*32});
              if ((x - 150) % 45 === 0) this.checkpoints.push({x: x * 32, y: 8 * 32});
           }
           // Plataformas de conexión (altura consistente)
           else if ((x - 150) % 15 === 7) {
              this.createPlatform(x, 10, 3);
           }
        }

        // SECTION 3: The Inner Sanctum (300 - 450) - Plataformas predecibles
        for (let x = 300; x < 450; x++) {
           // Cada 12 tiles, plataforma consistente
           if ((x - 300) % 12 === 0) {
              // Altura oscilante pero predecible
              let yStart = 8 + Math.floor(((x - 300) / 12) % 3);
              // Pilares
              for(let y=yStart; y<yStart+6; y++) this.setTile(x, y, 2);
              for(let y=yStart; y<yStart+6; y++) this.setTile(x+1, y, 2);
              // Plataforma
              this.createPlatform(x-1, yStart, 6);
              if ((x - 300) % 36 === 0) this.checkpoints.push({x: x * 32, y: (yStart - 1) * 32});
           }
        }

        // SECTION 4: The High Tower (450 - 600) - Escaleras consistentes
        let stairHeight = 12;
        for (let x = 450; x < 560; x++) {
           // Escaleras cada 7 tiles
           if ((x - 450) % 7 === 0) {
              stairHeight = 12 - Math.floor((x - 450) / 20); // Subida gradual
              if (stairHeight < 5) stairHeight = 5;
              this.createPlatform(x, stairHeight, 6);
              if ((x - 450) % 21 === 0) {
                 this.checkpoints.push({x: x * 32, y: (stairHeight - 1) * 32});
                 this.torches.push({x: (x+2)*32, y: (stairHeight-2)*32});
              }
           }
        }

        // Distribute Flowers (3 per section)
        this.placeFlowersInSection(20, 140, 3);
        this.placeFlowersInSection(160, 290, 3);
        this.placeFlowersInSection(310, 440, 3);
        this.placeFlowersInSection(460, 550, 3);

        // Castle at end
        this.castle = { 
          x: (this.width - 30) * 32,
          y: 4 * 32,
          width: 120, 
          height: 160 
        };
        // Castle platform (grande y segura)
        for(let x = 560; x < 600; x++) {
           for(let y=8; y<20; y++) this.setTile(x, y, 1);
        }
      }

      createPlatform(x: number, y: number, w: number) {
         for(let i=0; i<w; i++) this.setTile(x+i, Math.floor(y), 2);
      }

      placeFlowersInSection(startX: number, endX: number, count: number) {
         for(let i=0; i<count; i++) {
            let tryCount = 0;
            while(tryCount < 100) {  // Increased attempts
               let tx = Math.floor(startX + Math.random() * (endX - startX));
               // Raycast down to find ground
               let ty = 0;
               for(let y=0; y<this.height; y++) {
                  if(this.getTile(tx, y) !== 0) {
                     ty = y - 1;
                     break;
                  }
               }
               // Check if it's a valid spot AND ensure it's a platform (higher than ground level)
               // Ground usually at 14-16. Platforms are usually 6-12.
               if(ty > 0 && ty < 13) { 
                  this.flowers.push({
                     x: tx * 32 + 8,
                     y: ty * 32 + 8,
                     id: this.flowers.length,
                     active: true,
                     animOffset: Math.random() * Math.PI
                  });
                  break;
               }
               tryCount++;
            }
         }
      }

      getTile(x: number, y: number) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) return 0;
        return this.data[y * this.width + x];
      }

      setTile(x: number, y: number, type: number) {
        if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
          this.data[y * this.width + x] = type;
        }
      }

      update(player: Player) {
        // Update checkpoint if player is near one
        this.checkpoints.forEach(cp => {
          if (Math.abs(player.x - cp.x) < 64 && Math.abs(player.y - cp.y) < 64) {
            gameStateRef.current.lastCheckpoint = { x: cp.x, y: cp.y };
          }
        });

        let collected = 0;
        this.flowers.forEach(flower => {
          if (!flower.active) return;
          if (player.x < flower.x + 16 && player.x + player.width > flower.x &&
              player.y < flower.y + 16 && player.y + player.height > flower.y) {
            flower.active = false;
            collected++;
            playSound('coin');
            // Mostrar mensaje de flor y PAUSAR sin auto-clear
            showMessage(FLOWER_MESSAGES[flower.id], { autoClear: false });
            gameStateRef.current.isPausedForFlower = true;
            gameStateRef.current.flowerPauseStartTime = Date.now();
            setIsPaused(true);
          }
        });
        
        if (collected > 0) {
          const newTotal = this.flowers.filter(f => !f.active).length;
          setFlowersCollected(newTotal);
        }

        if (player.x > this.castle.x + 40 && player.x < this.castle.x + 80) {
          const flowersCount = this.flowers.filter(f => !f.active).length;
          if (flowersCount >= 1) endGame(flowersCount);
          else showMessage("Necesito flores para entrar...");
        }
      }

      draw(ctx: CanvasRenderingContext2D, camX: number) {
        const startCol = Math.floor(camX / TILE_SIZE);
        const endCol = startCol + (VIEWPORT_WIDTH / TILE_SIZE) + 1;

        // Draw Torches (Background Layer)
        this.torches.forEach(t => {
           if (t.x - camX > -50 && t.x - camX < VIEWPORT_WIDTH + 50) {
               this.drawTorch(ctx, t.x - camX, t.y);
           }
        });

        for (let y = 0; y < this.height; y++) {
          for (let x = startCol; x <= endCol; x++) {
            const tile = this.getTile(x, y);
            const drawX = Math.floor(x * TILE_SIZE - camX);
            const drawY = y * TILE_SIZE;
            if (tile === 1 || tile === 2) {
              // Castle Brick Texture
              ctx.fillStyle = '#2d2a3d'; // Dark base
              ctx.fillRect(drawX, drawY, TILE_SIZE, TILE_SIZE);
              
              ctx.fillStyle = '#4a4559'; // Lighter brick
              ctx.fillRect(drawX + 1, drawY + 1, TILE_SIZE - 2, 14);
              ctx.fillRect(drawX + 1, drawY + 17, TILE_SIZE - 2, 14);
              
              // Shadows
              ctx.fillStyle = '#1e1b29';
              ctx.fillRect(drawX, drawY + 15, TILE_SIZE, 2);
            }
          }
        }

        if (this.castle.x - camX < VIEWPORT_WIDTH && this.castle.x + this.castle.width - camX > 0) {
          this.drawCastle(ctx, this.castle.x - camX);
        }

        this.flowers.forEach(flower => {
          if (flower.active && flower.x - camX > -50 && flower.x - camX < VIEWPORT_WIDTH + 50) {
            const hoverY = Math.sin(Date.now() / 200 + flower.animOffset) * 3;
            this.drawTulip(ctx, flower.x - camX, flower.y + hoverY);
          }
        });
      }

      drawTorch(ctx: CanvasRenderingContext2D, x: number, y: number) {
         ctx.fillStyle = '#8b4513'; // Wood
         ctx.fillRect(x, y, 6, 14);
         ctx.fillStyle = '#444'; // Holder
         ctx.fillRect(x-1, y+10, 8, 4);

         // Flame animation
         const flicker = Math.random() * 4;
         ctx.fillStyle = '#ff4500'; // Orange
         ctx.fillRect(x - 1, y - 6 + flicker, 8, 8);
         ctx.fillStyle = '#ffd700'; // Yellow core
         ctx.fillRect(x + 1, y - 4 + flicker, 4, 6);
      }

      drawTulip(ctx: CanvasRenderingContext2D, x: number, y: number) {
        ctx.fillStyle = '#4caf50';
        ctx.fillRect(x + 6, y + 8, 4, 8);
        ctx.fillRect(x + 2, y + 12, 4, 2);
        ctx.fillRect(x + 10, y + 10, 4, 2);
        ctx.fillStyle = '#ff0055';
        ctx.fillRect(x + 4, y, 8, 8);
        ctx.fillRect(x + 2, y, 2, 4);
        ctx.fillRect(x + 12, y, 2, 4);
        ctx.fillRect(x + 6, y - 2, 2, 2);
        ctx.fillRect(x + 8, y - 2, 2, 2);
      }

      drawCastle(ctx: CanvasRenderingContext2D, x: number) {
        const baseX = x;
        const baseY = 13 * TILE_SIZE;
        ctx.fillStyle = '#111';
        ctx.fillRect(baseX, baseY - 120, 100, 120);
        ctx.fillStyle = '#222';
        ctx.fillRect(baseX - 20, baseY - 100, 40, 100);
        ctx.fillRect(baseX + 80, baseY - 100, 40, 100);
        ctx.beginPath();
        ctx.fillStyle = '#0a0a0a';
        ctx.moveTo(baseX, baseY - 120);
        ctx.lineTo(baseX - 20, baseY - 100);
        ctx.lineTo(baseX + 20, baseY - 100);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(baseX + 100, baseY - 120);
        ctx.lineTo(baseX + 80, baseY - 100);
        ctx.lineTo(baseX + 120, baseY - 100);
        ctx.fill();
        ctx.fillStyle = '#3a2010';
        ctx.beginPath();
        ctx.arc(baseX + 50, baseY, 25, Math.PI, 0);
        ctx.fill();
        ctx.fillStyle = '#ffd700';
        ctx.fillRect(baseX + 45, baseY - 80, 10, 20);
        ctx.fillRect(baseX - 10, baseY - 70, 8, 15);
        ctx.fillRect(baseX + 95, baseY - 70, 8, 15);
      }
    }

    const player = new Player(50, 100);
    const map = new GameMap();
    const camera = new Camera(VIEWPORT_WIDTH, VIEWPORT_HEIGHT);

    gameStateRef.current.player = player;
    gameStateRef.current.map = map;
    gameStateRef.current.camera = camera;
    gameStateRef.current.running = true;

    function showMessage(text: string, opts?: { autoClear?: boolean; duration?: number }) {
      // clear previous message timeout if any
      if (gameStateRef.current.messageTimeoutId) {
        clearTimeout(gameStateRef.current.messageTimeoutId as number);
        gameStateRef.current.messageTimeoutId = null;
      }
      setMessage(text);

      // By default autoClear is true unless explicitly disabled
      const autoClear = opts?.autoClear !== undefined ? opts!.autoClear : true;
      if (!autoClear) return;

      const dur = opts?.duration ?? 6500;
      gameStateRef.current.messageTimeoutId = window.setTimeout(() => {
        setMessage('');
        gameStateRef.current.messageTimeoutId = null;
      }, dur) as unknown as number;
    }

    function endGame(flowersCount: number) {
      gameStateRef.current.running = false;
      audioCtx.suspend();
      playSound('win');
      setGameWon(true);
      setFlowersCollected(flowersCount);
    }

    function gameLoop() {
      if (!gameStateRef.current.running) return;
      
      // Handle Fade In/Out
      if (gameStateRef.current.isFading) {
         gameStateRef.current.fadeOpacity += 0.05;
         if (gameStateRef.current.fadeOpacity >= 1.5) {
            // Respawn Logic when fully black - usar checkpoint
            gameStateRef.current.isFading = false;
            player.x = gameStateRef.current.lastCheckpoint.x; 
            player.y = gameStateRef.current.lastCheckpoint.y; 
            player.velY = 0;
            player.velX = 0;
            // show short-lived death message via showMessage
            showMessage("¡Cuidado con el vacío!", { autoClear: true, duration: 1000 });
         }
      } else if (gameStateRef.current.fadeOpacity > 0) {
         gameStateRef.current.fadeOpacity -= 0.05;
      }
      
      // 1. Update Logic (Skip physics update if fully faded out or paused)
      if (gameStateRef.current.fadeOpacity < 1.0 && !gameStateRef.current.isPausedForFlower) {
        player.update(map.width * TILE_SIZE, map);
        camera.follow(player, map.width * TILE_SIZE);
        map.update(player);
        updateMusic();
      }

      // 2. Draw Background (Dynamic Scenarios)
      // Section 1: Dark Garden (0-150) -> Dark Green/Blue
      // Section 2: Walls (150-300) -> Brick Red/Purple
      // Section 3: Sanctum (300-450) -> Royal Purple/Black
      // Section 4: Tower (450-600) -> Starry Blue
      
      let bgGradient;
      if (camera.x < 150 * TILE_SIZE) {
         // Garden
         ctx.fillStyle = '#0a1a0f';
         ctx.fillRect(0, 0, canvas.width, canvas.height);
         // Trees in background
         ctx.fillStyle = '#14261b';
         for(let i=0; i<10; i++) {
            let treeX = (i*100 - camera.x * 0.2) % (VIEWPORT_WIDTH + 200);
            if(treeX < -50) treeX += VIEWPORT_WIDTH + 200;
            ctx.fillRect(treeX, 100, 40, VIEWPORT_HEIGHT);
            ctx.beginPath();
            ctx.arc(treeX + 20, 100, 60, 0, Math.PI*2);
            ctx.fill();
         }
      } else if (camera.x < 300 * TILE_SIZE) {
         // Walls (Outside Plaza Night)
         ctx.fillStyle = '#101030'; // Night Blue
         ctx.fillRect(0, 0, canvas.width, canvas.height);
         // Stars
         ctx.fillStyle = '#ffffff';
         for(let i=0; i<20; i++) {
            let sx = (i * 137) % VIEWPORT_WIDTH;
            let sy = (i * 53) % 150;
            ctx.fillRect(sx, sy, 2, 2);
         }
         // Distant buildings
         ctx.fillStyle = '#1a1a40';
         for(let i=0; i<5; i++) {
             ctx.fillRect(100 + i*200 - (camera.x * 0.1)%1000, 200, 100, 300);
         }
      } else if (camera.x < 450 * TILE_SIZE) {
         // Sanctum (Inside again)
         ctx.fillStyle = '#1a101f';
         ctx.fillRect(0, 0, canvas.width, canvas.height);
         // Pillars
         ctx.fillStyle = '#0f0813';
         for(let x = 0; x < map.width * TILE_SIZE; x += 300) {
             let pX = x - camera.x * 0.5;
             if (pX > -100 && pX < VIEWPORT_WIDTH + 100) {
                ctx.fillRect(pX, 0, 60, VIEWPORT_HEIGHT);
             }
         }
      } else {
         // Tower (Starry Sky)
         const grad = ctx.createLinearGradient(0, 0, 0, VIEWPORT_HEIGHT);
         grad.addColorStop(0, '#000020');
         grad.addColorStop(1, '#201040');
         ctx.fillStyle = grad;
         ctx.fillRect(0, 0, canvas.width, canvas.height);
         ctx.fillStyle = '#ffffff';
         for(let i=0; i<50; i++) {
            let sx = (i * 1237) % VIEWPORT_WIDTH;
            let sy = (i * 653) % VIEWPORT_HEIGHT;
            ctx.globalAlpha = Math.random();
            ctx.fillRect(sx, sy, 2, 2);
         }
         ctx.globalAlpha = 1.0;
      }
      
      // Moon Window (Only in Sanctum/Tower)
      if (camera.x > 300 * TILE_SIZE) {
        ctx.save();
        ctx.translate(650, 50);
        // Glow
        ctx.fillStyle = '#fffabc';
        ctx.shadowBlur = 30;
        ctx.shadowColor = '#fffabc';
        ctx.beginPath();
        ctx.arc(50, 50, 40, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        // Bars
        ctx.fillStyle = '#1a101f';
        ctx.fillRect(45, 10, 10, 80);
        ctx.fillRect(10, 45, 80, 10);
        ctx.restore();
      }
      
      // 3. Draw Game World
      ctx.save();
      map.draw(ctx, camera.x);
      player.draw(ctx, camera.x);
      
      // Dark Overlay (Vignette)
      const gradient = ctx.createRadialGradient(VIEWPORT_WIDTH/2, VIEWPORT_HEIGHT/2, 200, VIEWPORT_WIDTH/2, VIEWPORT_HEIGHT/2, 500);
      gradient.addColorStop(0, 'rgba(0,0,0,0)');
      gradient.addColorStop(1, 'rgba(0,0,0,0.5)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, VIEWPORT_WIDTH, VIEWPORT_HEIGHT);
      
      // Fade Overlay
      if (gameStateRef.current.fadeOpacity > 0) {
         ctx.fillStyle = `rgba(0, 0, 0, ${Math.min(1, gameStateRef.current.fadeOpacity)})`;
         ctx.fillRect(0, 0, VIEWPORT_WIDTH, VIEWPORT_HEIGHT);
      }
      
      ctx.restore();
      
      gameStateRef.current.animationFrameId = requestAnimationFrame(gameLoop);
    }

    // Event Listeners
    const handleKeyDown = (e: KeyboardEvent) => {
      // Despausar si está en pausa de flor (con tiempo de gracia de 800ms)
      if (gameStateRef.current.isPausedForFlower) {
        const timeSincePause = Date.now() - gameStateRef.current.flowerPauseStartTime;
        if (timeSincePause > 800) { // 800ms de gracia para soltar teclas
          gameStateRef.current.isPausedForFlower = false;
          setIsPaused(false);
          // Clear message and any timeout
          if (gameStateRef.current.messageTimeoutId) {
            clearTimeout(gameStateRef.current.messageTimeoutId as number);
            gameStateRef.current.messageTimeoutId = null;
          }
          setMessage('');
        }
        return;
      }
      
      if (e.code === 'ArrowRight' || e.code === 'KeyD') gameStateRef.current.inputs.right = true;
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') gameStateRef.current.inputs.left = true;
      if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
        e.preventDefault();
        gameStateRef.current.inputs.up = true;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'ArrowRight' || e.code === 'KeyD') gameStateRef.current.inputs.right = false;
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') gameStateRef.current.inputs.left = false;
      if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') gameStateRef.current.inputs.up = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    audioCtx.resume();
    gameLoop();

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      gameStateRef.current.running = false;
      if (gameStateRef.current.animationFrameId) {
        cancelAnimationFrame(gameStateRef.current.animationFrameId);
      }
      if (audioCtx) {
        audioCtx.suspend();
      }
    };
  }, [gameStarted]);

  const handleTouchControl = (direction: 'left' | 'right' | 'up', pressed: boolean) => {
    // Despausar si está en pausa de flor (con tiempo de gracia de 800ms)
    if (gameStateRef.current.isPausedForFlower && pressed) {
      const timeSincePause = Date.now() - gameStateRef.current.flowerPauseStartTime;
      if (timeSincePause > 800) {
        gameStateRef.current.isPausedForFlower = false;
        setIsPaused(false);
        if (gameStateRef.current.messageTimeoutId) {
          clearTimeout(gameStateRef.current.messageTimeoutId as number);
          gameStateRef.current.messageTimeoutId = null;
        }
        setMessage('');
      }
      return;
    }
    gameStateRef.current.inputs[direction] = pressed;
  };

  return (
    <div className="relative h-screen w-full overflow-hidden bg-[#1a1025] flex flex-col items-center justify-center" style={{ fontFamily: "'Press Start 2P', cursive", touchAction: 'none' }}>
      <link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap" rel="stylesheet" />
      
      <div className="relative w-full max-w-4xl" style={{ boxShadow: '0 0 20px rgba(0,0,0,0.8)', border: '4px solid #4a3b59' }}>
        <canvas 
          ref={canvasRef} 
          width={800} 
          height={450}
          className="block w-full h-auto"
          style={{ imageRendering: 'pixelated' }}
        />
        
        {/* HUD */}
        <div className="absolute top-0 left-0 w-full p-2 md:p-3 flex justify-between text-white pointer-events-none" style={{ textShadow: '2px 2px 0 #000', fontSize: '8px' }}>
          <div className="md:text-[10px]">🌷 {flowersCollected} / 12</div>
        </div>

        {/* Message Box */}
        {message && (
          <div 
            className="absolute top-[25%] left-1/2 -translate-x-1/2 bg-gradient-to-b from-[#1a1025] to-[#2a1535] border-4 border-[#d4af37] p-4 md:p-5 text-center w-[90%] max-w-[500px] text-white text-[10px] md:text-[12px] leading-relaxed z-30 shadow-2xl"
            style={{ 
              animation: 'messageFloat 0.6s ease-out',
              boxShadow: '0 0 30px rgba(212, 175, 55, 0.6), inset 0 0 20px rgba(255, 255, 255, 0.1)'
            }}
          >
            <div className="mb-2 text-[#d4af37] text-[14px] md:text-[16px]">✿</div>
            <div className="italic">{message}</div>
            <div className="mt-2 text-[#d4af37] text-[14px] md:text-[16px]">✿</div>
          </div>
        )}

        {/* Mobile Controls - Mejorados */}
        {gameStarted && !gameWon && (
          <div className="lg:hidden absolute inset-0 pointer-events-none">
            <button
              className="absolute bottom-3 left-3 w-14 h-14 md:w-16 md:h-16 bg-white/30 rounded-full border-2 border-white/80 flex items-center justify-center text-2xl pointer-events-auto active:bg-white/60 transition-all shadow-lg"
              onTouchStart={(e) => { e.preventDefault(); handleTouchControl('left', true); }}
              onTouchEnd={(e) => { e.preventDefault(); handleTouchControl('left', false); }}
              onMouseDown={() => handleTouchControl('left', true)}
              onMouseUp={() => handleTouchControl('left', false)}
            >
              ←
            </button>
            <button
              className="absolute bottom-3 left-20 md:left-24 w-14 h-14 md:w-16 md:h-16 bg-white/30 rounded-full border-2 border-white/80 flex items-center justify-center text-2xl pointer-events-auto active:bg-white/60 transition-all shadow-lg"
              onTouchStart={(e) => { e.preventDefault(); handleTouchControl('right', true); }}
              onTouchEnd={(e) => { e.preventDefault(); handleTouchControl('right', false); }}
              onMouseDown={() => handleTouchControl('right', true)}
              onMouseUp={() => handleTouchControl('right', false)}
            >
              →
            </button>
            <button
              className="absolute bottom-3 right-3 w-14 h-14 md:w-16 md:h-16 bg-[#d4af37]/40 rounded-full border-2 border-[#d4af37] flex items-center justify-center text-2xl pointer-events-auto active:bg-[#d4af37]/70 transition-all shadow-lg font-bold"
              onTouchStart={(e) => { e.preventDefault(); handleTouchControl('up', true); }}
              onTouchEnd={(e) => { e.preventDefault(); handleTouchControl('up', false); }}
              onMouseDown={() => handleTouchControl('up', true)}
              onMouseUp={() => handleTouchControl('up', false)}
            >
              ↑
            </button>
          </div>
        )}

        {/* Start Screen */}
        {!gameStarted && (
          <div className="absolute inset-0 bg-[#1a1025]/97 flex flex-col items-center justify-center text-center p-4 z-50">
            <h1 className="text-[#ff69b4] text-sm md:text-xl lg:text-2xl mb-2 md:mb-3" style={{ textShadow: '4px 4px #000' }}>
              LA PRINCESA Y<br />LOS TULIPANES
            </h1>
            <p className="text-[#ccc] text-[7px] md:text-[8px] mb-2">Estilo Neo-Gótico Pixel Art</p>
            <p className="text-[#eee] text-[7px] md:text-[8px] max-w-[90%] leading-relaxed mb-3 md:mb-4">
              En un reino de sombras, busca los 12 tulipanes de luz.<br />
              Cada flor guarda un secreto.<br />
              Llévalas al Castillo Oscuro al final del camino.
            </p>
            <p className="text-[#d4af37] text-[7px] md:text-[8px] mb-3 md:mb-4">
              <span className="hidden md:inline">CONTROLES: FLECHAS / WASD | ESPACIO para Saltar</span>
              <span className="md:hidden">Usa los botones en pantalla para jugar</span>
            </p>
            <button
              onClick={() => setGameStarted(true)}
              className="bg-[#d4af37] text-[#1a1025] px-4 md:px-6 py-2 md:py-3 text-[10px] md:text-xs cursor-pointer border-none shadow-[4px_4px_0_#8b7222] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0_#8b7222] transition-all"
              style={{ fontFamily: "'Press Start 2P', cursive" }}
            >
              COMENZAR AVENTURA
            </button>
          </div>
        )}

        {/* Win Screen */}
        {gameWon && (
          <div className="absolute inset-0 bg-[#1a1025]/97 flex flex-col items-center justify-center text-center p-4 z-50">
            <h1 className="text-[#d4af37] text-xs md:text-lg mb-3 md:mb-4">¡CASTILLO ALCANZADO!</h1>
            <p className="text-white text-[8px] md:text-[10px] leading-relaxed mb-4 md:mb-6 max-w-[90%]">
              Has recolectado {flowersCollected} de 12 tulipanes.
              {flowersCollected === 12 ? (
                <><br /><br />¡PERFECTO! La Princesa ha restaurado la paz completa.</>
              ) : (
                <><br /><br />Bien hecho, pero hay más flores ahí fuera.</>
              )}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-[#d4af37] text-[#1a1025] px-4 md:px-6 py-2 md:py-3 text-[10px] md:text-xs cursor-pointer border-none shadow-[4px_4px_0_#8b7222] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0_#8b7222] transition-all"
              style={{ fontFamily: "'Press Start 2P', cursive" }}
            >
              JUGAR DE NUEVO
            </button>
          </div>
        )}
      </div>

      <Button 
        asChild 
        variant="ghost" 
        className="mt-4 text-white/80 hover:bg-white/10 hover:text-white z-40"
      >
        <Link href="/" className="flex items-center gap-2 text-xs">
          <Home className="w-4 h-4" />
          Volver al inicio
        </Link>
      </Button>

      <style jsx global>{`
        @keyframes messageFloat {
          0% { 
            opacity: 0; 
            transform: translate(-50%, -55%) scale(0.98); 
          }
          60% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1.02);
          }
          100% { 
            opacity: 1; 
            transform: translate(-50%, -50%) scale(1); 
          }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translate(-50%, -60%); }
          to { opacity: 1; transform: translate(-50%, -50%); }
        }
      `}</style>
    </div>
  );
}
