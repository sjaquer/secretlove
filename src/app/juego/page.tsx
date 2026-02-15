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
  const [showGoodEnding, setShowGoodEnding] = useState(false);
  const [showBadEnding, setShowBadEnding] = useState(false);
  const [badEndingPhase, setBadEndingPhase] = useState(0);
  const [goodEndingPhase, setGoodEndingPhase] = useState(0);
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
        const completionBonus = 500;
        state.score += completionBonus;
        
        levelStatsRef.current[levelIdx] = {
          level: levelIdx + 1,
          flowers: levelFlowers,
          enemies: levelEnemies,
          timeBonus: completionBonus,
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
            setShowLevelIntro(false);
            loadLevel(next, audio, player, map, camera, bg, enemies, state);
            syncUI(state);
          }, 3000);
        }
      },
    );

    bg.setTheme(def.theme);
    player.setGravity(def.gravity);
    player.reset(data.startX, data.startY, 90); // ~1.5s of invincibility on level start
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
            const data = def.build();
            state.lastCheckpoint = { x: data.startX, y: data.startY };
          }
          player.reset(state.lastCheckpoint.x, state.lastCheckpoint.y, 60); // ~1s invincibility after death
          const deathMsgs = [
            "Las sombras me atraparon... pero sigo aquí.",
            "Caer duele, pero quedarse en el suelo duele más.",
            "Esta oscuridad es familiar... demasiado familiar.",
            "¿Cuántas veces más tendré que recorrer este camino?",
            "Tropecé de nuevo... como siempre.",
          ];
          if (state.lives <= 1 || !state.deathMessageShown) {
            const msg = state.lives <= 1 
              ? "No queda casi nada de mí... pero algo me dice que siga."
              : deathMsgs[Math.floor(Math.random() * deathMsgs.length)];
            showMsg(msg, { autoClear: true, duration: 1500 });
            state.deathMessageShown = true;
          } else {
            showMsg(deathMsgs[Math.floor(Math.random() * deathMsgs.length)], { autoClear: true, duration: 800 });
          }
        }
      } else if (state.fadeOpacity > 0) {
        state.fadeOpacity -= 0.05;
      }

      // === UPDATE ===
      const paused = state.isPausedForFlower || showPauseMenuRef.current || state.levelTransitioning;
      if (state.fadeOpacity < 1.0 && !paused && !state.isFading) {
        player.update(state.inputs, map.width * TILE_SIZE, map, state, audio);
        camera.follow(player, map.width * TILE_SIZE);
        enemies.update(map);
        map.update(player, audio, state);

        // Enemy collision – only when NOT fading and NOT invincible
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

  // ===== RENDER =====
  return (
    <div className="relative h-screen w-full overflow-hidden bg-[#0d0a14] flex flex-col items-center justify-center"
      style={{ fontFamily: "'Press Start 2P', cursive", touchAction: 'none' }}>
      <link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap" rel="stylesheet" />

      <div className="relative w-full max-w-4xl" style={{ boxShadow: '0 0 30px rgba(0,0,0,0.9)', border: '4px solid #4a3b59' }}>
        <canvas ref={canvasRef} width={800} height={450} className="block w-full h-auto" style={{ imageRendering: 'pixelated' }} />

        {/* ===== HUD ===== */}
        {gameStarted && !showMenu && !gameWon && !showRecap && !showGoodEnding && !showBadEnding && (
          <div className="absolute top-0 left-0 w-full pointer-events-none z-20">
            {/* Top bar */}
            <div className="flex items-center justify-between px-2 py-1 bg-black/50">
              {/* Level name */}
              <span className="text-[6px] md:text-[8px] text-white/80 truncate" style={{ textShadow: '1px 1px #000' }}>
                {levelDef?.name ?? ''}
              </span>
              <div className="flex-1" />
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
          <div className="absolute top-[22%] left-1/2 bg-gradient-to-b from-[#1a1025ee] to-[#2a1535ee] border-4 border-[#d4af37] p-4 md:p-5 text-center w-[90%] max-w-[500px] text-white text-[10px] md:text-[12px] leading-relaxed z-30"
            style={{ transform: 'translateX(-50%)', opacity: 1, boxShadow: '0 0 40px rgba(212,175,55,0.5)' }}>
            <div className="mb-2 text-[#d4af37] text-[14px] md:text-[16px]">✿</div>
            <div className="italic">{message}</div>
            <div className="mt-3 text-[6px] md:text-[8px] text-[#d4af37]/60">Presiona cualquier tecla</div>
          </div>
        )}

        {/* Level intro overlay */}
        {showLevelIntro && (
          <div className="absolute inset-0 bg-[#0d0a14] flex flex-col items-center justify-center z-40" style={{ animation: 'fadeInOut 3s ease' }}>
            <div className="text-[#d4af37] text-xs md:text-lg mb-3" style={{ textShadow: '3px 3px #000' }}>
              Nivel {(gameState.current.currentLevel) + 2}
            </div>
            <div className="text-white text-[10px] md:text-sm mb-2">{LEVELS[(gameState.current.currentLevel) + 1]?.name}</div>
            <div className="text-white/60 text-[7px] md:text-[10px] italic">{LEVELS[(gameState.current.currentLevel) + 1]?.subtitle}</div>
          </div>
        )}

        {/* Mobile controls */}
        {gameStarted && !gameWon && !showRecap && !showGoodEnding && !showBadEnding && !showPauseMenu && !showMenu && !showLevelIntro && (
          <div className="lg:hidden absolute inset-0 pointer-events-none z-40" style={{ userSelect: 'none', WebkitUserSelect: 'none' }}>
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
                  Una princesa despierta en un mundo que no entiende. Pasillos interminables,
                  reglas que no recuerda haber aceptado, y una soledad que crece con cada paso.
                  Dicen que hay flores escondidas en cada rincón... flores que guardan sus pensamientos
                  más profundos. ¿Podrá encontrarlos todos y despertar de este sueño?
                  ¿O está condenada a repetir el mismo camino, eternamente?
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
                  <p>🧘 Tómate tu tiempo, no hay prisa</p>
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
        {showPauseMenu && !gameWon && !showRecap && !showGoodEnding && !showBadEnding && (
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
        {showRecap && !gameWon && !showGoodEnding && !showBadEnding && (
          <div className="absolute inset-0 bg-[#0d0a14]/97 flex flex-col items-center justify-center p-4 z-50 overflow-y-auto">
            <h1 className="text-[#d4af37] text-xs md:text-base mb-4" style={{ textShadow: '3px 3px #000', fontFamily: "'Press Start 2P', cursive" }}>
              📜 TU VIAJE 📜
            </h1>
            
            <div className="w-full max-w-2xl space-y-3 mb-6">
              {levelStatsRef.current.map((stats, idx) => {
                const levelInfo = LEVELS[idx];
                return (
                  <div key={idx} 
                    className="bg-[#1a1025]/90 border-2 border-[#d4af37]/40 p-3 rounded-lg text-white"
                    style={{ animation: `fadeIn ${0.5 + idx * 0.3}s ease` }}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[10px] md:text-xs font-bold" style={{ fontFamily: "'Press Start 2P', cursive" }}>
                        {levelInfo?.name || `Nivel ${stats.level}`}
                      </span>
                    </div>
                    <div className="text-[8px] md:text-[10px] space-y-1 pl-2 text-white/80">
                      <p>🌷 Pensamientos encontrados: {stats.flowers}</p>
                      <p>💀 Sombras derrotadas: {stats.enemies}</p>
                      <p>✨ Bonus de nivel: +{stats.timeBonus}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="bg-[#d4af37]/20 border-2 border-[#d4af37] p-4 rounded-lg mb-4">
              <div className="text-white text-[8px] md:text-[10px] space-y-1 text-center">
                <p>🌷 Pensamientos: {flowersCollected} / 12</p>
                <p>⭐ Puntuación: {score}</p>
              </div>
            </div>
            
            <button 
              onClick={() => {
                setShowRecap(false);
                if (flowersCollected >= 12) {
                  setShowGoodEnding(true);
                  setGoodEndingPhase(0);
                } else {
                  setShowBadEnding(true);
                  setBadEndingPhase(0);
                }
              }}
              className="bg-[#d4af37] text-[#1a1025] px-6 py-2 text-[10px] md:text-xs border-none shadow-[4px_4px_0_#8b7222] hover:shadow-[2px_2px_0_#8b7222] active:translate-x-[2px] active:translate-y-[2px] transition-all"
              style={{ fontFamily: "'Press Start 2P', cursive" }}>
              CONTINUAR →
            </button>
          </div>
        )}

        {/* ===== GOOD ENDING (all flowers) ===== */}
        {showGoodEnding && (() => {
          const phases = [
            { text: "...", sub: "", bg: "#0d0a14" },
            { text: "Por un momento, todo se detiene.", sub: "El silencio ya no se siente vacío.", bg: "#0d0a14" },
            { text: "Recuerdo cada pensamiento que encontré.", sub: "Cada flor era una parte de mí que había olvidado.", bg: "#0f0e1a" },
            { text: "Creí que estaba atrapada en un juego con reglas.", sub: "Pero las reglas... siempre fueron mías.", bg: "#12101f" },
            { text: "No necesito que alguien me rescate.", sub: "Nunca lo necesité.", bg: "#1a1530" },
            { text: "La princesa abre los ojos.", sub: "El sueño termina.", bg: "#1e1a38" },
            { text: "Lo que sentía no era un defecto.", sub: "Era una señal de que necesitaba mirar hacia adentro.", bg: "#241e42" },
            { text: "Y ahora...", sub: "El mundo es mucho más grande de lo que imaginé.", bg: "#2a2250" },
          ];
          const phase = phases[goodEndingPhase] || phases[phases.length - 1];
          const isLast = goodEndingPhase >= phases.length - 1;
          
          return (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 z-50 transition-colors duration-[2000ms]"
              style={{ backgroundColor: phase.bg }}>
              
              {/* Princess waking animation - shown in later phases */}
              {goodEndingPhase >= 5 && (
                <div className="mb-6" style={{ animation: 'fadeIn 2s ease' }}>
                  <div className="relative w-20 h-24 mx-auto">
                    {/* Bed */}
                    <div className="absolute bottom-0 w-full h-8 bg-[#4a3060] rounded-lg border-2 border-[#6a4080]" />
                    {/* Blanket */}
                    <div className="absolute bottom-2 left-2 right-2 h-6 bg-[#9b59d0]/60 rounded" style={{ 
                      animation: goodEndingPhase >= 6 ? 'blanketSlide 1.5s ease forwards' : 'none' 
                    }} />
                    {/* Princess body sitting up */}
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2" style={{
                      animation: goodEndingPhase >= 6 ? 'sitUp 1.5s ease forwards' : 'none',
                      transformOrigin: 'bottom center'
                    }}>
                      {/* Head */}
                      <div className="w-8 h-8 bg-[#ffe0c0] rounded-full mx-auto border border-[#d4a070]" />
                      {/* Hair */}
                      <div className="absolute top-0 left-0 w-8 h-5 bg-[#4a2800] rounded-t-full" />
                      {/* Eyes */}
                      <div className="absolute top-3 left-2 flex gap-2">
                        <div className="w-1.5 h-1.5 bg-[#2a1500] rounded-full" style={{
                          animation: goodEndingPhase >= 6 ? 'blink 0.5s ease 0.8s' : 'none'
                        }} />
                        <div className="w-1.5 h-1.5 bg-[#2a1500] rounded-full" style={{
                          animation: goodEndingPhase >= 6 ? 'blink 0.5s ease 0.8s' : 'none'
                        }} />
                      </div>
                      {/* Smile */}
                      {goodEndingPhase >= 7 && (
                        <div className="absolute top-5 left-1/2 -translate-x-1/2 w-3 h-1.5 border-b-2 border-[#c06060] rounded-b-full" />
                      )}
                      {/* Body */}
                      <div className="w-6 h-6 bg-[#9b59d0] mx-auto rounded-b-lg mt-[-1px]" />
                    </div>
                  </div>
                </div>
              )}
              
              {/* Stars appearing in later phases */}
              {goodEndingPhase >= 7 && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                  {Array.from({ length: 20 }).map((_, i) => (
                    <div key={i} className="absolute w-1 h-1 bg-[#d4af37] rounded-full"
                      style={{
                        left: `${10 + (i * 37) % 80}%`,
                        top: `${5 + (i * 23) % 70}%`,
                        animation: `twinkle ${1 + (i % 3) * 0.5}s ease-in-out ${i * 0.15}s infinite`,
                        opacity: 0,
                      }} />
                  ))}
                </div>
              )}

              <p className="text-white text-[11px] md:text-sm mb-3 leading-relaxed max-w-md transition-opacity duration-1000"
                style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)', animation: 'fadeIn 1.5s ease' }}
                key={goodEndingPhase}>
                {phase.text}
              </p>
              {phase.sub && (
                <p className="text-white/60 text-[8px] md:text-[11px] mb-6 italic max-w-sm"
                  style={{ animation: 'fadeIn 2s ease' }}
                  key={`sub-${goodEndingPhase}`}>
                  {phase.sub}
                </p>
              )}

              {!isLast ? (
                <button onClick={() => setGoodEndingPhase(p => p + 1)}
                  className="text-[#d4af37]/70 text-[8px] md:text-[10px] hover:text-[#d4af37] transition-colors mt-4"
                  style={{ fontFamily: "'Press Start 2P', cursive", animation: 'pulse 2s ease-in-out infinite' }}>
                  ▼
                </button>
              ) : (
                <div className="mt-6 space-y-4" style={{ animation: 'fadeIn 2s ease 1s both' }}>
                  <p className="text-[#d4af37] text-[10px] md:text-xs" style={{ fontFamily: "'Press Start 2P', cursive" }}>
                    FIN
                  </p>
                  <p className="text-[#ff69b4] text-[8px] md:text-[10px] italic">
                    La princesa despertó. Y esta vez, eligió su propio camino.
                  </p>
                  <button onClick={() => window.location.reload()}
                    className="bg-[#d4af37] text-[#1a1025] px-5 py-2 text-[9px] md:text-[11px] border-none shadow-[4px_4px_0_#8b7222] active:translate-x-[2px] active:translate-y-[2px] transition-all"
                    style={{ fontFamily: "'Press Start 2P', cursive" }}>
                    DESPERTAR DE NUEVO
                  </button>
                </div>
              )}
            </div>
          );
        })()}

        {/* ===== BAD ENDING (not all flowers) ===== */}
        {showBadEnding && (() => {
          const phases = [
            { text: "...", sub: "" },
            { text: "Llegaste al final.", sub: "Pero hay algo que falta." },
            { text: "Los pensamientos que no recogiste siguen ahí.", sub: "Flotando en la oscuridad. Esperándote." },
            { text: "Creíste que podías avanzar sin mirar hacia adentro.", sub: `Solo encontraste ${flowersCollected} de 12 fragmentos.` },
            { text: "Y ahora...", sub: "El suelo desaparece." },
            { text: "FALLING", sub: "" },
          ];
          const phase = phases[badEndingPhase] || phases[phases.length - 1];
          const isFalling = badEndingPhase >= 5;
          
          return (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 z-50 overflow-hidden"
              style={{ backgroundColor: '#0d0a14' }}>
              
              {isFalling ? (
                /* Infinite falling animation */
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  {/* Falling princess pixel art */}
                  <div className="relative" style={{ animation: 'floatDown 3s ease-in-out infinite' }}>
                    <div className="w-6 h-8 relative mx-auto">
                      {/* Head */}
                      <div className="w-5 h-5 bg-[#ffe0c0] rounded-full mx-auto border border-[#d4a070]" />
                      {/* Hair flying up */}
                      <div className="absolute -top-2 left-0 w-5 h-4 bg-[#4a2800] rounded-t-full" style={{ animation: 'hairFloat 1.5s ease-in-out infinite' }} />
                      {/* Eyes (closed, sad) */}
                      <div className="absolute top-2 left-1 flex gap-1.5">
                        <div className="w-1 h-0.5 bg-[#2a1500]" />
                        <div className="w-1 h-0.5 bg-[#2a1500]" />
                      </div>
                      {/* Body */}
                      <div className="w-5 h-4 bg-[#9b59d0] mx-auto rounded-b-lg" />
                    </div>
                  </div>
                  
                  {/* Moving background lines to simulate falling */}
                  <div className="absolute inset-0 pointer-events-none">
                    {Array.from({ length: 30 }).map((_, i) => (
                      <div key={i} className="absolute w-[1px] bg-white/10"
                        style={{
                          left: `${5 + (i * 31) % 90}%`,
                          height: `${20 + (i % 4) * 15}px`,
                          animation: `fallLine ${1 + (i % 3) * 0.5}s linear ${i * 0.1}s infinite`,
                        }} />
                    ))}
                  </div>
                  
                  <p className="text-white/40 text-[8px] md:text-[10px] mt-12 italic"
                    style={{ animation: 'pulse 3s ease-in-out infinite' }}>
                    Si repetimos los mismos patrones...
                  </p>
                  <p className="text-white/30 text-[7px] md:text-[9px] mt-2 italic"
                    style={{ animation: 'pulse 3s ease-in-out 1.5s infinite' }}>
                    siempre caeremos en el mismo vacío.
                  </p>
                  
                  <button onClick={() => window.location.reload()}
                    className="mt-8 text-[#d4af37]/50 text-[8px] md:text-[10px] hover:text-[#d4af37] transition-colors border border-[#d4af37]/30 px-4 py-2 hover:border-[#d4af37]/60"
                    style={{ fontFamily: "'Press Start 2P', cursive", animation: 'fadeIn 5s ease 3s both' }}>
                    INTENTAR DE NUEVO
                  </button>
                </div>
              ) : (
                /* Text phases before falling */
                <>
                  <p className="text-white text-[11px] md:text-sm mb-3 leading-relaxed max-w-md"
                    style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)', animation: 'fadeIn 1.5s ease' }}
                    key={badEndingPhase}>
                    {phase.text}
                  </p>
                  {phase.sub && (
                    <p className="text-white/50 text-[8px] md:text-[11px] mb-6 italic max-w-sm"
                      style={{ animation: 'fadeIn 2s ease' }}
                      key={`sub-${badEndingPhase}`}>
                      {phase.sub}
                    </p>
                  )}
                  <button onClick={() => setBadEndingPhase(p => p + 1)}
                    className="text-[#666]/70 text-[8px] md:text-[10px] hover:text-white/40 transition-colors mt-4"
                    style={{ fontFamily: "'Press Start 2P', cursive", animation: 'pulse 2s ease-in-out infinite' }}>
                    ▼
                  </button>
                </>
              )}
            </div>
          );
        })()}
        
        {/* Victory Screen (legacy, kept as fallback) */}
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
        @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
        @keyframes fadeInOut { 0% { opacity:0; } 20% { opacity:1; } 80% { opacity:1; } 100% { opacity:0; } }
        @keyframes pulse { 0%, 100% { opacity: 0.5; } 50% { opacity: 1; } }
        @keyframes twinkle { 0%, 100% { opacity: 0; transform: scale(0.5); } 50% { opacity: 1; transform: scale(1.2); } }
        @keyframes floatDown { 0%, 100% { transform: translateY(-8px); } 50% { transform: translateY(8px); } }
        @keyframes hairFloat { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-3px); } }
        @keyframes fallLine { 0% { transform: translateY(-100vh); opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { transform: translateY(100vh); opacity: 0; } }
        @keyframes blanketSlide { 0% { transform: translateY(0); opacity: 1; } 100% { transform: translateY(12px); opacity: 0.3; } }
        @keyframes sitUp { 0% { transform: translateY(0) rotate(0deg); } 100% { transform: translateY(-12px) rotate(0deg); } }
        @keyframes blink { 0%, 40% { opacity: 0; } 50%, 100% { opacity: 1; } }
      `}</style>
    </div>
  );
}
