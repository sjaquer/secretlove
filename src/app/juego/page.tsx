"use client";

import { useEffect, useRef, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';
import Link from 'next/link';
import {
  AudioSystem, Camera, Player, GameMap, BackgroundRenderer, EnemyManager, LEVELS,
  VIEWPORT_WIDTH, VIEWPORT_HEIGHT, TILE_SIZE,
} from '@/game';
import type { GameState } from '@/game';

export default function JuegoPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // UI state
  const [showMenu, setShowMenu] = useState(true);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [showRecap, setShowRecap] = useState(false);
  const [flowersCollected, setFlowersCollected] = useState(0);
  const [message, setMessage] = useState('');
  const [isPaused, setIsPaused] = useState(false);
  const [showPauseMenu, setShowPauseMenu] = useState(false);
  const [currentLevel, setCurrentLevel] = useState(0);
  const [showLevelIntro, setShowLevelIntro] = useState(false);
  const [lives, setLives] = useState(3);
  const [timeRemaining, setTimeRemaining] = useState(150);
  const [score, setScore] = useState(0);
  const [enemiesKilled, setEnemiesKilled] = useState(0);
  
  // Level-by-level stats tracking
  const levelStatsRef = useRef<Array<{
    level: number;
    flowers: number;
    enemies: number;
    timeBonus: number;
    completed: boolean;
  }>>([]);

  const msgTimeoutRef = useRef<number | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const showPauseMenuRef = useRef(false);

  const gameState = useRef<GameState>({
    running: false,
    inputs: { left: false, right: false, up: false },
    isFading: false,
    fadeOpacity: 0,
    lastCheckpoint: { x: 50, y: 0 },
    isPausedForFlower: false,
    flowerPauseStartTime: 0,
    deathMessageShown: false,
    currentLevel: 0,
    lives: 3,
    timeRemaining: 150,
    lastTimeTick: 0,
    totalFlowers: 0,
    score: 0,
    levelTransitioning: false,
    enemiesKilled: 0,
  });

  // Game object refs
  const audioRef = useRef<AudioSystem | null>(null);
  const playerRef = useRef<Player | null>(null);
  const mapRef = useRef<GameMap | null>(null);
  const cameraRef = useRef<Camera | null>(null);
  const bgRef = useRef<BackgroundRenderer | null>(null);
  const enemyRef = useRef<EnemyManager | null>(null);

  useEffect(() => { showPauseMenuRef.current = showPauseMenu; }, [showPauseMenu]);

  // -- helpers --
  const showMsg = useCallback((text: string, opts?: { autoClear?: boolean; duration?: number }) => {
    if (msgTimeoutRef.current) clearTimeout(msgTimeoutRef.current);
    setMessage(text);
    if (opts?.autoClear === false) return;
    msgTimeoutRef.current = window.setTimeout(() => { setMessage(''); msgTimeoutRef.current = null; }, opts?.duration ?? 5000);
  }, []);

  const syncUI = useCallback((s: GameState) => {
    setLives(s.lives);
    setTimeRemaining(Math.ceil(s.timeRemaining));
    setScore(s.score);
    setFlowersCollected(s.totalFlowers);
    setEnemiesKilled(s.enemiesKilled);
    setCurrentLevel(s.currentLevel);
  }, []);

  // -- Load a specific level into the engine objects --
  const loadLevel = useCallback((levelIdx: number, audio: AudioSystem, player: Player, map: GameMap, camera: Camera, bg: BackgroundRenderer, enemies: EnemyManager, state: GameState) => {
    const def = LEVELS[levelIdx];
    if (!def) return;
    const data = def.build();

    map.loadLevel(data, def.theme, levelIdx * 3); // flowerOffset ~ 3 per level
    map.setCallbacks(
      (total: number) => setFlowersCollected(total),
      (text: string, opts?: { autoClear?: boolean; duration?: number }) => {
        showMsg(text, opts);
        if (opts?.autoClear === false) {
          state.isPausedForFlower = true;
          state.flowerPauseStartTime = Date.now();
          setIsPaused(true);
        }
      },
      () => {
        // Level complete → transition
        state.levelTransitioning = true;
        audio.stopMusic();
        audio.playSound('portal');
        
        // Save level stats
        const levelFlowers = state.totalFlowers - (state.levelStartFlowers || 0);
        const levelEnemies = state.enemiesKilled - (state.levelStartEnemies || 0);
        const timeBonus = Math.max(0, state.timeRemaining * 10);
        state.score += timeBonus;
        
        levelStatsRef.current[levelIdx] = {
          level: levelIdx + 1,
          flowers: levelFlowers,
          enemies: levelEnemies,
          timeBonus,
          completed: true,
        };

        if (levelIdx >= LEVELS.length - 1) {
          // Game complete! → Show recap first
          state.running = false;
          audio.playSound('win');
          syncUI(state);
          setShowRecap(true);
        } else {
          // Show next level intro
          setShowLevelIntro(true);
          setTimeout(() => {
            const next = levelIdx + 1;
            state.currentLevel = next;
            state.levelTransitioning = false;
            state.deathMessageShown = false;
            state.lives = 3;
            state.timeRemaining = LEVELS[next].timeLimit;
            state.lastTimeTick = Date.now();
            setShowLevelIntro(false);
            loadLevel(next, audio, player, map, camera, bg, enemies, state);
            syncUI(state);
          }, 3000);
        }
      },
    );

    bg.setTheme(def.theme);
    player.setGravity(def.gravity);
    player.reset(data.startX, data.startY);
    camera.reset();

    // Enemies
    enemies.spawn(data.enemies);

    state.currentLevel = levelIdx;
    state.lastCheckpoint = { x: data.startX, y: data.startY };
    state.isFading = false;
    state.fadeOpacity = 0;
    state.timeRemaining = def.timeLimit;
    state.lastTimeTick = Date.now();
    state.levelTransitioning = false;
    
    // Initialize level stats tracking
    state.levelStartFlowers = state.totalFlowers;
    state.levelStartEnemies = state.enemiesKilled;

    audio.playMusic(levelIdx);
    syncUI(state);
  }, [showMsg, syncUI]);

  const startGame = useCallback(() => {
    setShowMenu(false);
    setGameStarted(true);
    setShowPauseMenu(false);
    setGameWon(false);
    // Resume audio context on user interaction (browser autoplay policy)
    audioRef.current?.resume();
  }, []);

  const togglePause = useCallback(() => {
    if (gameWon) return;
    setShowPauseMenu(p => !p);
    setIsPaused(p => !p);
  }, [gameWon]);

  // ===== MAIN GAME LOOP =====
  useEffect(() => {
    if (!canvasRef.current || !gameStarted || showMenu) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d')!;
    if (!ctx) return;

    const audio = new AudioSystem();
    audio.init();
    audio.resume();
    audioRef.current = audio;

    const player = new Player();
    playerRef.current = player;

    const map = new GameMap();
    mapRef.current = map;

    const camera = new Camera();
    cameraRef.current = camera;

    const bg = new BackgroundRenderer();
    bgRef.current = bg;

    const enemies = new EnemyManager();
    enemyRef.current = enemies;

    const state = gameState.current;
    state.running = true;
    state.lives = 3;
    state.totalFlowers = 0;
    state.score = 0;
    state.enemiesKilled = 0;
    state.currentLevel = 0;
    state.deathMessageShown = false;
    state.levelStartFlowers = 0;
    state.levelStartEnemies = 0;
    
    // Reset level stats
    levelStatsRef.current = [];

    loadLevel(0, audio, player, map, camera, bg, enemies, state);

    let uiSyncTimer = 0;

    function loop() {
      if (!state.running) return;
      const now = Date.now();

      // === FADE (death) ===
      if (state.isFading) {
        state.fadeOpacity += 0.04;
        if (state.fadeOpacity >= 1.4) {
          state.isFading = false;
          state.lives--;
          if (state.lives <= 0) {
            // Game over – restart level
            state.lives = 3;
            state.score = Math.max(0, state.score - 500);
            const def = LEVELS[state.currentLevel];
            state.timeRemaining = def.timeLimit;
            const data = def.build();
            state.lastCheckpoint = { x: data.startX, y: data.startY };
          }
          player.reset(state.lastCheckpoint.x, state.lastCheckpoint.y);
          if (!state.deathMessageShown) {
            showMsg("¡Cuidado!", { autoClear: true, duration: 800 });
            state.deathMessageShown = true;
          }
        }
      } else if (state.fadeOpacity > 0) {
        state.fadeOpacity -= 0.05;
      }

      // === UPDATE ===
      const paused = state.isPausedForFlower || showPauseMenuRef.current || state.levelTransitioning;
      if (state.fadeOpacity < 1.0 && !paused) {
        player.update(state.inputs, map.width * TILE_SIZE, map, state, audio);
        camera.follow(player, map.width * TILE_SIZE);
        enemies.update(map);
        map.update(player, audio, state);

        // Enemy collision
        const hit = enemies.checkPlayerCollision(player.x, player.y, player.width, player.height, player.velY);
        if (hit && !player.invincible) {
          if (hit.result === 'stomp') {
            enemies.killEnemy(hit.enemy);
            player.triggerStompBounce();
            audio.playSound('stomp');
            state.score += 100;
            state.enemiesKilled++;
          } else {
            if (!state.isFading) {
              state.isFading = true;
              audio.playSound('hurt');
            }
          }
        }

        // Timer
        if (now - state.lastTimeTick >= 1000) {
          state.timeRemaining -= (now - state.lastTimeTick) / 1000;
          state.lastTimeTick = now;
          if (state.timeRemaining <= 10 && state.timeRemaining > 0 && Math.ceil(state.timeRemaining) % 2 === 0) {
            audio.playSound('timeWarn');
          }
          if (state.timeRemaining <= 0) {
            state.timeRemaining = 0;
            if (!state.isFading) {
              state.isFading = true;
              audio.playSound('hurt');
            }
          }
        }
      }

      // Sync UI periodically
      uiSyncTimer++;
      if (uiSyncTimer % 10 === 0) syncUI(state);

      // === DRAW ===
      const time = now;
      bg.draw(ctx, camera, time);
      ctx.save();
      map.draw(ctx, camera.x);
      enemies.draw(ctx, camera.x);
      player.draw(ctx, camera.x);

      // Vignette
      const vig = ctx.createRadialGradient(VIEWPORT_WIDTH / 2, VIEWPORT_HEIGHT / 2, 180, VIEWPORT_WIDTH / 2, VIEWPORT_HEIGHT / 2, 480);
      vig.addColorStop(0, 'rgba(0,0,0,0)');
      vig.addColorStop(1, 'rgba(0,0,0,0.5)');
      ctx.fillStyle = vig;
      ctx.fillRect(0, 0, VIEWPORT_WIDTH, VIEWPORT_HEIGHT);

      // Fade overlay
      if (state.fadeOpacity > 0) {
        ctx.fillStyle = `rgba(0,0,0,${Math.min(1, state.fadeOpacity)})`;
        ctx.fillRect(0, 0, VIEWPORT_WIDTH, VIEWPORT_HEIGHT);
      }
      ctx.restore();

      animFrameRef.current = requestAnimationFrame(loop);
    }

    // === INPUT ===
    const handleKeyDown = (e: KeyboardEvent) => {
      // Resume audio on first user interaction (browser autoplay policy)
      audio.resume();
      
      if (e.code === 'Escape' || e.code === 'KeyP') { e.preventDefault(); togglePause(); return; }
      if (showPauseMenuRef.current || state.levelTransitioning) return;
      if (state.isPausedForFlower) {
        if (Date.now() - state.flowerPauseStartTime > 800) {
          state.isPausedForFlower = false;
          setIsPaused(false);
          if (msgTimeoutRef.current) clearTimeout(msgTimeoutRef.current);
          setMessage('');
        }
        return;
      }
      if (e.code === 'ArrowRight' || e.code === 'KeyD') state.inputs.right = true;
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') state.inputs.left = true;
      if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') { e.preventDefault(); state.inputs.up = true; }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'ArrowRight' || e.code === 'KeyD') state.inputs.right = false;
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') state.inputs.left = false;
      if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') state.inputs.up = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    loop();

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      state.running = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      audio.stopMusic();
      audio.suspend();
    };
  }, [gameStarted, showMenu, togglePause, showMsg, loadLevel, syncUI]);

  // Touch controls helper
  const handleTouch = useCallback((dir: 'left' | 'right' | 'up', pressed: boolean) => {
    const s = gameState.current;
    if (s.isPausedForFlower && pressed) {
      if (Date.now() - s.flowerPauseStartTime > 800) {
        s.isPausedForFlower = false;
        setIsPaused(false);
        if (msgTimeoutRef.current) clearTimeout(msgTimeoutRef.current);
        setMessage('');
      }
      return;
    }
    s.inputs[dir] = pressed;
  }, []);

  const levelDef = LEVELS[currentLevel];
  const timerPct = levelDef ? (timeRemaining / levelDef.timeLimit) * 100 : 100;
  const timerColor = timerPct > 30 ? '#44cc44' : timerPct > 15 ? '#ccaa22' : '#ff4444';

  // ===== RENDER =====
  return (
    <div className="relative h-screen w-full overflow-hidden bg-[#0d0a14] flex flex-col items-center justify-center"
      style={{ fontFamily: "'Press Start 2P', cursive", touchAction: 'none' }}>
      <link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap" rel="stylesheet" />

      <div className="relative w-full max-w-4xl" style={{ boxShadow: '0 0 30px rgba(0,0,0,0.9)', border: '4px solid #4a3b59' }}>
        <canvas ref={canvasRef} width={800} height={450} className="block w-full h-auto" style={{ imageRendering: 'pixelated' }} />

        {/* ===== HUD ===== */}
        {gameStarted && !showMenu && !gameWon && !showRecap && (
          <div className="absolute top-0 left-0 w-full pointer-events-none z-20">
            {/* Top bar */}
            <div className="flex items-center justify-between px-2 py-1 bg-black/50">
              {/* Level name */}
              <span className="text-[6px] md:text-[8px] text-white/80 truncate max-w-[120px]" style={{ textShadow: '1px 1px #000' }}>
                {levelDef?.name ?? ''}
              </span>
              {/* Timer bar */}
              <div className="flex-1 mx-2 h-2 md:h-3 bg-black/60 rounded overflow-hidden border border-white/20">
                <div className="h-full transition-all duration-1000 rounded" style={{ width: `${timerPct}%`, backgroundColor: timerColor }} />
              </div>
              {/* Pause button */}
              <button
                onClick={togglePause}
                className="pointer-events-auto bg-black/40 hover:bg-black/60 border border-white/40 px-2 py-0.5 text-[8px] text-white rounded active:scale-95 transition-all"
                style={{ fontFamily: "'Press Start 2P', cursive" }}>
                {showPauseMenu ? '▶' : '⏸'}
              </button>
            </div>
            {/* Stats row */}
            <div className="flex items-center justify-between px-2 py-0.5 text-[6px] md:text-[8px] text-white" style={{ textShadow: '1px 1px #000' }}>
              <span>🌷 {flowersCollected}/12</span>
              <span>💀 {enemiesKilled}</span>
              <span>⭐ {score}</span>
              <span className="flex gap-0.5">
                {Array.from({ length: 3 }).map((_, i) => (
                  <span key={i} className={i < lives ? 'text-red-400' : 'text-gray-600'}>♥</span>
                ))}
              </span>
            </div>
          </div>
        )}

        {/* Message overlay */}
        {message && (
          <div className="absolute top-[22%] left-1/2 -translate-x-1/2 bg-gradient-to-b from-[#1a1025ee] to-[#2a1535ee] border-4 border-[#d4af37] p-4 md:p-5 text-center w-[90%] max-w-[500px] text-white text-[10px] md:text-[12px] leading-relaxed z-30"
            style={{ animation: 'messageFloat 0.5s ease-out', boxShadow: '0 0 40px rgba(212,175,55,0.5)' }}>
            <div className="mb-2 text-[#d4af37] text-[14px] md:text-[16px]">✿</div>
            <div className="italic">{message}</div>
            <div className="mt-3 text-[6px] md:text-[8px] text-[#d4af37]/60">Presiona cualquier tecla</div>
          </div>
        )}

        {/* Level intro overlay */}
        {showLevelIntro && (
          <div className="absolute inset-0 bg-[#0d0a14] flex flex-col items-center justify-center z-40" style={{ animation: 'fadeInOut 3s ease' }}>
            <div className="text-[#d4af37] text-xs md:text-lg mb-3" style={{ textShadow: '3px 3px #000' }}>
              Nivel {(gameState.current.currentLevel) + 1}
            </div>
            <div className="text-white text-[10px] md:text-sm mb-2">{LEVELS[(gameState.current.currentLevel)]?.name}</div>
            <div className="text-white/60 text-[7px] md:text-[10px] italic">{LEVELS[(gameState.current.currentLevel)]?.subtitle}</div>
          </div>
        )}

        {/* Mobile controls */}
        {gameStarted && !gameWon && !showRecap && !showPauseMenu && !showMenu && !showLevelIntro && (
          <div className="lg:hidden absolute inset-0 pointer-events-none" style={{ userSelect: 'none', WebkitUserSelect: 'none' }}>
            <button className="absolute bottom-3 left-3 w-14 h-14 bg-black/40 rounded-full border-2 border-white/50 flex items-center justify-center text-xl text-white pointer-events-auto active:bg-white/30 transition-all select-none"
              onTouchStart={e => { e.preventDefault(); handleTouch('left', true); }}
              onTouchEnd={e => { e.preventDefault(); handleTouch('left', false); }}
              onTouchCancel={e => { e.preventDefault(); handleTouch('left', false); }}
              onMouseDown={() => handleTouch('left', true)} onMouseUp={() => handleTouch('left', false)}
              onContextMenu={e => e.preventDefault()} style={{ touchAction: 'none' }}>◀</button>
            <button className="absolute bottom-3 left-20 w-14 h-14 bg-black/40 rounded-full border-2 border-white/50 flex items-center justify-center text-xl text-white pointer-events-auto active:bg-white/30 transition-all select-none"
              onTouchStart={e => { e.preventDefault(); handleTouch('right', true); }}
              onTouchEnd={e => { e.preventDefault(); handleTouch('right', false); }}
              onTouchCancel={e => { e.preventDefault(); handleTouch('right', false); }}
              onMouseDown={() => handleTouch('right', true)} onMouseUp={() => handleTouch('right', false)}
              onContextMenu={e => e.preventDefault()} style={{ touchAction: 'none' }}>▶</button>
            <button className="absolute bottom-3 right-3 w-16 h-16 bg-[#d4af37]/30 rounded-full border-2 border-[#d4af37]/70 flex items-center justify-center text-xl text-[#d4af37] pointer-events-auto active:bg-[#d4af37]/60 transition-all font-bold select-none"
              onTouchStart={e => { e.preventDefault(); handleTouch('up', true); }}
              onTouchEnd={e => { e.preventDefault(); handleTouch('up', false); }}
              onTouchCancel={e => { e.preventDefault(); handleTouch('up', false); }}
              onMouseDown={() => handleTouch('up', true)} onMouseUp={() => handleTouch('up', false)}
              onContextMenu={e => e.preventDefault()} style={{ touchAction: 'none' }}>▲</button>
          </div>
        )}

        {/* ===== MAIN MENU ===== */}
        {showMenu && (
          <div className="absolute inset-0 bg-[#0d0a14]/98 flex flex-col items-center justify-start md:justify-center text-center p-3 md:p-5 z-50 overflow-y-auto">
            <div className="w-full max-w-2xl mt-2 md:mt-0">
              <h1 className="text-[#d4af37] text-sm md:text-2xl mb-4 md:mb-5 animate-pulse" style={{ textShadow: '3px 3px #000' }}>
                LA BÚSQUEDA DE<br />LOS TULIPANES
              </h1>

              <div className="bg-[#1a1025]/90 border-2 border-[#d4af37]/40 p-3 md:p-4 mb-3 rounded-lg">
                <h2 className="text-[#ff69b4] text-[9px] md:text-xs mb-2">✿ LA HISTORIA ✿</h2>
                <p className="text-[#ccc] text-[7px] md:text-[9px] leading-relaxed">
                  Una valiente aventurera emprende un viaje épico a través de cinco reinos fantásticos:
                  las mazmorras ardientes de un castillo antiguo, las torres azotadas por el viento,
                  una ciénaga mística, un desierto olvidado, y finalmente las estrellas en un jardín lunar.
                  En cada rincón se esconden tulipanes que guardan mensajes de amor eterno.
                </p>
              </div>

              <div className="bg-[#1a1025]/90 border-2 border-[#d4af37]/40 p-3 md:p-4 mb-3 rounded-lg">
                <h2 className="text-[#ff69b4] text-[9px] md:text-xs mb-2">✿ CÓMO JUGAR ✿</h2>
                <div className="text-[#ccc] text-[7px] md:text-[9px] leading-relaxed space-y-1">
                  <p>🎮 Flechas / WASD para moverte · Espacio para saltar</p>
                  <p>👟 ¡Pisa a los enemigos para eliminarlos! (Estilo Mario)</p>
                  <p>🌷 Encuentra los 12 tulipanes en los 5 niveles</p>
                  <p>🔥 Evita la lava, el agua, la arena movediza y el vacío</p>
                  <p>🌙 ¡En la luna la gravedad es más baja!</p>
                  <p>⏱️ Cada nivel tiene tiempo límite</p>
                  <p>🏰 Llega al portal para avanzar al siguiente nivel</p>
                </div>
              </div>

              <div className="grid grid-cols-5 gap-1 mb-3">
                {LEVELS.map((l: { name: string }, i: number) => (
                  <div key={i} className="bg-[#1a1025]/80 border border-[#d4af37]/30 p-1 rounded text-center">
                    <div className="text-[6px] md:text-[7px] text-[#d4af37]">Nivel {i + 1}</div>
                    <div className="text-[5px] md:text-[6px] text-white/60 truncate">{l.name.split(' ').slice(-1)}</div>
                  </div>
                ))}
              </div>

              <button onClick={startGame}
                className="bg-[#d4af37] text-[#1a1025] px-5 md:px-8 py-2 md:py-3 text-[10px] md:text-sm cursor-pointer border-none shadow-[4px_4px_0_#8b7222] hover:shadow-[6px_6px_0_#8b7222] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0_#8b7222] transition-all font-bold"
                style={{ fontFamily: "'Press Start 2P', cursive" }}>
                ⚔️ COMENZAR ⚔️
              </button>
            </div>
          </div>
        )}

        {/* ===== PAUSE MENU ===== */}
        {showPauseMenu && !gameWon && !showRecap && (
          <div className="absolute inset-0 bg-[#0d0a14]/95 flex flex-col items-center justify-center text-center p-4 z-50">
            <h2 className="text-[#d4af37] text-sm md:text-xl mb-4" style={{ textShadow: '3px 3px #000' }}>⏸️ PAUSA</h2>
            <div className="mb-4 text-[8px] md:text-[10px] text-white/60">
              <p>Nivel {currentLevel + 1}: {levelDef?.name}</p>
              <p className="mt-1">🌷 {flowersCollected} · ⭐ {score} · ♥ {lives}</p>
            </div>
            <div className="space-y-3">
              <button onClick={togglePause}
                className="bg-[#d4af37] text-[#1a1025] px-5 py-2 text-[10px] md:text-sm border-none shadow-[4px_4px_0_#8b7222] active:translate-x-[2px] active:translate-y-[2px] transition-all block w-full"
                style={{ fontFamily: "'Press Start 2P', cursive" }}>
                ▶️ CONTINUAR
              </button>
              <button onClick={() => window.location.reload()}
                className="bg-[#ff69b4] text-white px-5 py-2 text-[10px] md:text-sm border-none shadow-[4px_4px_0_#8b2252] active:translate-x-[2px] active:translate-y-[2px] transition-all block w-full"
                style={{ fontFamily: "'Press Start 2P', cursive" }}>
                🔄 REINICIAR
              </button>
            </div>
          </div>
        )}

        {/* ===== WIN SCREEN ===== */}
        {/* Recap Screen */}
        {showRecap && !gameWon && (
          <div className="absolute inset-0 bg-[#0d0a14]/97 flex flex-col items-center justify-center p-4 z-50 overflow-y-auto">
            <h1 className="text-[#d4af37] text-xs md:text-base mb-4" style={{ textShadow: '3px 3px #000', fontFamily: "'Press Start 2P', cursive" }}>
              📜 RECOPILATORIO DE TU AVENTURA 📜
            </h1>
            
            <div className="w-full max-w-2xl space-y-3 mb-6">
              {levelStatsRef.current.map((stats, idx) => {
                const levelInfo = LEVELS[idx];
                return (
                  <div key={idx} 
                    className="bg-[#1a1025]/90 border-2 border-[#d4af37]/40 p-3 rounded-lg text-white"
                    style={{ animation: `fadeIn ${0.5 + idx * 0.2}s ease` }}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[10px] md:text-xs font-bold" style={{ fontFamily: "'Press Start 2P', cursive" }}>
                        NIVEL {stats.level}: {levelInfo?.name || ''}
                      </span>
                    </div>
                    <div className="text-[8px] md:text-[10px] space-y-1 pl-2">
                      <p>🌷 Flores recolectadas: {stats.flowers}</p>
                      <p>💀 Enemigos derrotados: {stats.enemies}</p>
                      <p>⏱️ Bonus de tiempo: +{stats.timeBonus} pts</p>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="bg-[#d4af37]/20 border-2 border-[#d4af37] p-4 rounded-lg mb-4">
              <p className="text-[#d4af37] text-[10px] md:text-xs mb-2" style={{ fontFamily: "'Press Start 2P', cursive" }}>
                TOTALES
              </p>
              <div className="text-white text-[8px] md:text-[10px] space-y-1">
                <p>🌷 Total Flores: {flowersCollected} / 12</p>
                <p>💀 Total Enemigos: {enemiesKilled}</p>
                <p>⭐ Puntuación Final: {score}</p>
              </div>
            </div>
            
            <button 
              onClick={() => { setShowRecap(false); setGameWon(true); }}
              className="bg-[#d4af37] text-[#1a1025] px-6 py-2 text-[10px] md:text-xs border-none shadow-[4px_4px_0_#8b7222] hover:shadow-[2px_2px_0_#8b7222] active:translate-x-[2px] active:translate-y-[2px] transition-all"
              style={{ fontFamily: "'Press Start 2P', cursive" }}>
              CONTINUAR →
            </button>
          </div>
        )}
        
        {/* Victory Screen */}
        {gameWon && (
          <div className="absolute inset-0 bg-[#0d0a14]/97 flex flex-col items-center justify-center text-center p-4 z-50" style={{ animation: 'fadeIn 1s ease' }}>
            <h1 className="text-[#d4af37] text-xs md:text-lg mb-3" style={{ textShadow: '3px 3px #000' }}>
              🏆 ¡AVENTURA COMPLETADA! 🏆
            </h1>
            <div className="bg-[#1a1025]/90 border-2 border-[#d4af37]/40 p-4 rounded-lg mb-4 text-white text-[8px] md:text-[10px] space-y-2">
              <p>🌷 Tulipanes: {flowersCollected} / 12</p>
              <p>💀 Enemigos: {enemiesKilled}</p>
              <p>⭐ Puntuación: {score}</p>
              <p>🗺️ 5 reinos conquistados</p>
            </div>
            {flowersCollected === 12 && (
              <p className="text-[#ff69b4] text-[8px] md:text-[10px] mb-3 italic">¡PERFECTO! Has encontrado todos los mensajes de amor 💕</p>
            )}
            <button onClick={() => window.location.reload()}
              className="bg-[#d4af37] text-[#1a1025] px-4 md:px-6 py-2 text-[10px] md:text-xs border-none shadow-[4px_4px_0_#8b7222] active:translate-x-[2px] active:translate-y-[2px] transition-all"
              style={{ fontFamily: "'Press Start 2P', cursive" }}>
              JUGAR DE NUEVO
            </button>
          </div>
        )}
      </div>

      <Button asChild variant="ghost" className="mt-4 text-white/80 hover:bg-white/10 hover:text-white z-40">
        <Link href="/" className="flex items-center gap-2 text-xs">
          <Home className="w-4 h-4" /> Volver al inicio
        </Link>
      </Button>

      <style jsx global>{`
        @keyframes messageFloat { 0% { opacity:0; transform:translate(-50%,-55%) scale(0.98); } 60% { opacity:1; transform:translate(-50%,-50%) scale(1.02); } 100% { opacity:1; transform:translate(-50%,-50%) scale(1); } }
        @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
        @keyframes fadeInOut { 0% { opacity:0; } 20% { opacity:1; } 80% { opacity:1; } 100% { opacity:0; } }
      `}</style>
    </div>
  );
}
