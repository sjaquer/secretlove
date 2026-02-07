"use client";

import { useEffect, useRef, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';
import Link from 'next/link';
import {
  AudioSystem, Camera, Player, GameMap, BackgroundRenderer,
  VIEWPORT_WIDTH, VIEWPORT_HEIGHT, TILE_SIZE,
} from '@/game';
import type { GameState } from '@/game';

export default function JuegoPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [showMenu, setShowMenu] = useState(true);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [flowersCollected, setFlowersCollected] = useState(0);
  const [message, setMessage] = useState('');
  const [isPaused, setIsPaused] = useState(false);
  const [showPauseMenu, setShowPauseMenu] = useState(false);

  const messageTimeoutRef = useRef<number | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const gameState = useRef<GameState>({
    running: false,
    inputs: { left: false, right: false, up: false },
    isFading: false,
    fadeOpacity: 0,
    lastCheckpoint: { x: 50, y: 0 },
    isPausedForFlower: false,
    flowerPauseStartTime: 0,
    deathMessageShown: false,
  });

  // Refs for game objects (persist across renders)
  const audioRef = useRef<AudioSystem | null>(null);
  const playerRef = useRef<Player | null>(null);
  const mapRef = useRef<GameMap | null>(null);
  const cameraRef = useRef<Camera | null>(null);
  const bgRendererRef = useRef<BackgroundRenderer | null>(null);
  const showPauseMenuRef = useRef(false);

  // Keep ref in sync
  useEffect(() => {
    showPauseMenuRef.current = showPauseMenu;
  }, [showPauseMenu]);

  const showMessage = useCallback((text: string, opts?: { autoClear?: boolean; duration?: number }) => {
    if (messageTimeoutRef.current) {
      clearTimeout(messageTimeoutRef.current);
      messageTimeoutRef.current = null;
    }
    setMessage(text);
    const autoClear = opts?.autoClear !== undefined ? opts.autoClear : true;
    if (!autoClear) return;
    const dur = opts?.duration ?? 6500;
    messageTimeoutRef.current = window.setTimeout(() => {
      setMessage('');
      messageTimeoutRef.current = null;
    }, dur);
  }, []);

  const startGame = useCallback(() => {
    setShowMenu(false);
    setGameStarted(true);
    setShowPauseMenu(false);
  }, []);

  const togglePause = useCallback(() => {
    if (gameWon) return;
    setShowPauseMenu(prev => !prev);
    setIsPaused(prev => !prev);
  }, [gameWon]);

  // ===== MAIN GAME LOOP SETUP =====
  useEffect(() => {
    if (!canvasRef.current || !gameStarted || showMenu) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d')!;
    if (!ctx) return;

    // Initialize game objects
    const audio = new AudioSystem();
    audio.init();
    audioRef.current = audio;

    const player = new Player(50, 100);
    playerRef.current = player;

    const map = new GameMap();
    mapRef.current = map;

    const camera = new Camera(VIEWPORT_WIDTH, VIEWPORT_HEIGHT);
    cameraRef.current = camera;

    const bgRenderer = new BackgroundRenderer();
    bgRendererRef.current = bgRenderer;

    const state = gameState.current;
    state.running = true;
    state.isFading = false;
    state.fadeOpacity = 0;
    state.deathMessageShown = false;
    state.lastCheckpoint = { x: 50, y: 0 };

    // Set map callbacks
    map.setCallbacks(
      (total) => setFlowersCollected(total),
      (text, opts) => {
        showMessage(text, opts);
        if (opts?.autoClear === false) {
          state.isPausedForFlower = true;
          state.flowerPauseStartTime = Date.now();
          setIsPaused(true);
        }
      },
      (flowersCount) => {
        state.running = false;
        audio.suspend();
        audio.playSound('win');
        setGameWon(true);
        setFlowersCollected(flowersCount);
      },
      state
    );

    function gameLoop() {
      if (!state.running) return;

      // === FADE (death) ===
      if (state.isFading) {
        state.fadeOpacity += 0.05;
        if (state.fadeOpacity >= 1.5) {
          state.isFading = false;
          player.x = state.lastCheckpoint.x;
          player.y = state.lastCheckpoint.y;
          player.velY = 0;
          player.velX = 0;
          if (!state.deathMessageShown) {
            showMessage("¡Cuidado con el vacío!", { autoClear: true, duration: 1000 });
            state.deathMessageShown = true;
          }
        }
      } else if (state.fadeOpacity > 0) {
        state.fadeOpacity -= 0.05;
      }

      // === UPDATE (skip if paused) ===
      if (state.fadeOpacity < 1.0 && !state.isPausedForFlower && !showPauseMenuRef.current) {
        player.update(state.inputs, map.width * TILE_SIZE, map, state, audio);
        camera.follow(player, map.width * TILE_SIZE);
        map.update(player, audio);
        audio.updateMusic(player.x, state.running);
      }

      const time = Date.now();

      // === DRAW BACKGROUND ===
      bgRenderer.draw(ctx, camera, time);

      // === DRAW GAME WORLD ===
      ctx.save();
      map.draw(ctx, camera.x);
      player.draw(ctx, camera.x);

      // Vignette
      const gradient = ctx.createRadialGradient(
        VIEWPORT_WIDTH / 2, VIEWPORT_HEIGHT / 2, 180,
        VIEWPORT_WIDTH / 2, VIEWPORT_HEIGHT / 2, 480
      );
      gradient.addColorStop(0, 'rgba(0,0,0,0)');
      gradient.addColorStop(1, 'rgba(0,0,0,0.55)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, VIEWPORT_WIDTH, VIEWPORT_HEIGHT);

      // Fade overlay
      if (state.fadeOpacity > 0) {
        ctx.fillStyle = `rgba(0, 0, 0, ${Math.min(1, state.fadeOpacity)})`;
        ctx.fillRect(0, 0, VIEWPORT_WIDTH, VIEWPORT_HEIGHT);
      }
      ctx.restore();

      animFrameRef.current = requestAnimationFrame(gameLoop);
    }

    // === INPUT HANDLERS ===
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Escape' || e.code === 'KeyP') {
        e.preventDefault();
        togglePause();
        return;
      }
      if (showPauseMenuRef.current) return;

      // Unpause from flower message
      if (state.isPausedForFlower) {
        const elapsed = Date.now() - state.flowerPauseStartTime;
        if (elapsed > 800) {
          state.isPausedForFlower = false;
          setIsPaused(false);
          if (messageTimeoutRef.current) {
            clearTimeout(messageTimeoutRef.current);
            messageTimeoutRef.current = null;
          }
          setMessage('');
        }
        return;
      }

      if (e.code === 'ArrowRight' || e.code === 'KeyD') state.inputs.right = true;
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') state.inputs.left = true;
      if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
        e.preventDefault();
        state.inputs.up = true;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'ArrowRight' || e.code === 'KeyD') state.inputs.right = false;
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') state.inputs.left = false;
      if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') state.inputs.up = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    audio.resume();
    gameLoop();

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      state.running = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      audio.suspend();
    };
  }, [gameStarted, showMenu, togglePause, showMessage]);

  // === TOUCH CONTROLS ===
  const handleTouchControl = useCallback((direction: 'left' | 'right' | 'up', pressed: boolean) => {
    const state = gameState.current;
    if (state.isPausedForFlower && pressed) {
      const elapsed = Date.now() - state.flowerPauseStartTime;
      if (elapsed > 800) {
        state.isPausedForFlower = false;
        setIsPaused(false);
        if (messageTimeoutRef.current) {
          clearTimeout(messageTimeoutRef.current);
          messageTimeoutRef.current = null;
        }
        setMessage('');
      }
      return;
    }
    state.inputs[direction] = pressed;
  }, []);

  // ===== RENDER =====
  return (
    <div
      className="relative h-screen w-full overflow-hidden bg-[#0d0a14] flex flex-col items-center justify-center"
      style={{ fontFamily: "'Press Start 2P', cursive", touchAction: 'none' }}
    >
      <link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap" rel="stylesheet" />

      <div className="relative w-full max-w-4xl" style={{ boxShadow: '0 0 30px rgba(0,0,0,0.9)', border: '4px solid #4a3b59' }}>
        <canvas
          ref={canvasRef}
          width={800}
          height={450}
          className="block w-full h-auto"
          style={{ imageRendering: 'pixelated' }}
        />

        {/* HUD */}
        <div className="absolute top-0 left-0 w-full p-2 md:p-3 flex justify-between items-center text-white" style={{ textShadow: '2px 2px 0 #000' }}>
          <div className="text-[8px] md:text-[10px] pointer-events-none bg-black/30 px-2 py-1 rounded">
            🌷 {flowersCollected} / 12
          </div>
          {gameStarted && !gameWon && !showMenu && (
            <button
              onClick={togglePause}
              className="bg-black/40 hover:bg-black/60 border-2 border-white/40 px-2 py-1 md:px-3 text-[8px] md:text-[10px] rounded pointer-events-auto transition-all active:scale-95"
              style={{ fontFamily: "'Press Start 2P', cursive" }}
            >
              {showPauseMenu ? '▶' : '⏸'}
            </button>
          )}
        </div>

        {/* Message Box */}
        {message && (
          <div
            className="absolute top-[22%] left-1/2 -translate-x-1/2 bg-gradient-to-b from-[#1a1025ee] to-[#2a1535ee] border-4 border-[#d4af37] p-4 md:p-5 text-center w-[90%] max-w-[500px] text-white text-[10px] md:text-[12px] leading-relaxed z-30"
            style={{
              animation: 'messageFloat 0.5s ease-out',
              boxShadow: '0 0 40px rgba(212, 175, 55, 0.5), inset 0 0 30px rgba(255, 255, 255, 0.05)',
            }}
          >
            <div className="mb-2 text-[#d4af37] text-[14px] md:text-[16px]">✿</div>
            <div className="italic">{message}</div>
            <div className="mt-3 text-[6px] md:text-[8px] text-[#d4af37]/60">Presiona cualquier tecla para continuar</div>
          </div>
        )}

        {/* Mobile Controls */}
        {gameStarted && !gameWon && !showPauseMenu && !showMenu && (
          <div className="lg:hidden absolute inset-0 pointer-events-none" style={{ userSelect: 'none', WebkitUserSelect: 'none' }}>
            {/* Left */}
            <button
              className="absolute bottom-3 left-3 w-14 h-14 md:w-16 md:h-16 bg-black/40 rounded-full border-2 border-white/50 flex items-center justify-center text-xl text-white pointer-events-auto active:bg-white/30 transition-all shadow-lg select-none"
              onTouchStart={(e) => { e.preventDefault(); handleTouchControl('left', true); }}
              onTouchEnd={(e) => { e.preventDefault(); handleTouchControl('left', false); }}
              onTouchCancel={(e) => { e.preventDefault(); handleTouchControl('left', false); }}
              onMouseDown={() => handleTouchControl('left', true)}
              onMouseUp={() => handleTouchControl('left', false)}
              onContextMenu={(e) => e.preventDefault()}
              style={{ touchAction: 'none', WebkitTouchCallout: 'none', WebkitUserSelect: 'none', userSelect: 'none' }}
            >
              ◀
            </button>
            {/* Right */}
            <button
              className="absolute bottom-3 left-20 md:left-24 w-14 h-14 md:w-16 md:h-16 bg-black/40 rounded-full border-2 border-white/50 flex items-center justify-center text-xl text-white pointer-events-auto active:bg-white/30 transition-all shadow-lg select-none"
              onTouchStart={(e) => { e.preventDefault(); handleTouchControl('right', true); }}
              onTouchEnd={(e) => { e.preventDefault(); handleTouchControl('right', false); }}
              onTouchCancel={(e) => { e.preventDefault(); handleTouchControl('right', false); }}
              onMouseDown={() => handleTouchControl('right', true)}
              onMouseUp={() => handleTouchControl('right', false)}
              onContextMenu={(e) => e.preventDefault()}
              style={{ touchAction: 'none', WebkitTouchCallout: 'none', WebkitUserSelect: 'none', userSelect: 'none' }}
            >
              ▶
            </button>
            {/* Jump */}
            <button
              className="absolute bottom-3 right-3 w-16 h-16 md:w-20 md:h-20 bg-[#d4af37]/30 rounded-full border-2 border-[#d4af37]/70 flex items-center justify-center text-xl text-[#d4af37] pointer-events-auto active:bg-[#d4af37]/60 transition-all shadow-lg font-bold select-none"
              onTouchStart={(e) => { e.preventDefault(); handleTouchControl('up', true); }}
              onTouchEnd={(e) => { e.preventDefault(); handleTouchControl('up', false); }}
              onTouchCancel={(e) => { e.preventDefault(); handleTouchControl('up', false); }}
              onMouseDown={() => handleTouchControl('up', true)}
              onMouseUp={() => handleTouchControl('up', false)}
              onContextMenu={(e) => e.preventDefault()}
              style={{ touchAction: 'none', WebkitTouchCallout: 'none', WebkitUserSelect: 'none', userSelect: 'none' }}
            >
              ▲
            </button>
          </div>
        )}

        {/* ===== MAIN MENU ===== */}
        {showMenu && (
          <div className="absolute inset-0 bg-[#0d0a14]/98 flex flex-col items-center justify-start md:justify-center text-center p-3 md:p-6 z-50 overflow-y-auto">
            <div className="w-full max-w-2xl mt-2 md:mt-0">
              <h1 className="text-[#d4af37] text-base md:text-2xl lg:text-3xl mb-4 md:mb-6 animate-pulse" style={{ textShadow: '3px 3px #000' }}>
                LA BÚSQUEDA DE<br />LOS TULIPANES
              </h1>

              {/* Story */}
              <div className="bg-[#1a1025]/90 border-2 border-[#d4af37]/40 p-3 md:p-4 mb-3 md:mb-4 rounded-lg">
                <h2 className="text-[#ff69b4] text-[9px] md:text-xs mb-2 md:mb-3">✿ LA HISTORIA ✿</h2>
                <p className="text-[#ccc] text-[7px] md:text-[9px] leading-relaxed">
                  En las profundidades de un castillo olvidado, envuelto en sombras y ríos de lava,
                  una valiente aventurera desciende a las mazmorras en busca de los 12 tulipanes místicos.
                  Cada flor escondida entre las piedras guarda un mensaje de sabiduría y amor,
                  palabras que iluminan incluso la oscuridad más profunda.
                  Atraviesa las mazmorras, escala las murallas, cruza el santuario interior
                  y asciende la torre más alta hasta llegar al Castillo Oscuro.
                </p>
              </div>

              {/* Rules */}
              <div className="bg-[#1a1025]/90 border-2 border-[#d4af37]/40 p-3 md:p-4 mb-3 md:mb-4 rounded-lg">
                <h2 className="text-[#ff69b4] text-[9px] md:text-xs mb-2 md:mb-3">✿ CÓMO JUGAR ✿</h2>
                <div className="text-[#ccc] text-[7px] md:text-[9px] leading-relaxed space-y-1 md:space-y-2">
                  <p>🎮 <span className="hidden md:inline">Usa las FLECHAS o WASD para moverte · ESPACIO para saltar</span><span className="md:hidden">Usa los botones en pantalla para moverte y saltar</span></p>
                  <p>🌷 Encuentra los 12 tulipanes escondidos por el castillo</p>
                  <p>🔥 Cuidado con la lava y los abismos</p>
                  <p>💬 Cada tulipán revela un mensaje especial</p>
                  <p>🏰 Lleva al menos 1 tulipán al Castillo Oscuro para completar</p>
                  <p>⏸️ <span className="text-[#d4af37]">ESC</span> o <span className="text-[#d4af37]">P</span> para pausar</p>
                </div>
              </div>

              <button
                onClick={startGame}
                className="bg-[#d4af37] text-[#1a1025] px-5 md:px-8 py-2 md:py-3 text-[10px] md:text-sm cursor-pointer border-none shadow-[4px_4px_0_#8b7222] hover:shadow-[6px_6px_0_#8b7222] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0_#8b7222] transition-all font-bold"
                style={{ fontFamily: "'Press Start 2P', cursive" }}
              >
                ⚔️ COMENZAR AVENTURA ⚔️
              </button>
            </div>
          </div>
        )}

        {/* ===== PAUSE MENU ===== */}
        {showPauseMenu && !gameWon && (
          <div className="absolute inset-0 bg-[#0d0a14]/95 flex flex-col items-center justify-center text-center p-4 z-50">
            <h2 className="text-[#d4af37] text-sm md:text-xl mb-4 md:mb-6" style={{ textShadow: '3px 3px #000' }}>
              ⏸️ PAUSA ⏸️
            </h2>
            <div className="space-y-3 md:space-y-4">
              <button
                onClick={togglePause}
                className="bg-[#d4af37] text-[#1a1025] px-5 md:px-8 py-2 md:py-3 text-[10px] md:text-sm cursor-pointer border-none shadow-[4px_4px_0_#8b7222] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0_#8b7222] transition-all block w-full md:w-auto"
                style={{ fontFamily: "'Press Start 2P', cursive" }}
              >
                ▶️ CONTINUAR
              </button>
              <button
                onClick={() => window.location.reload()}
                className="bg-[#ff69b4] text-white px-5 md:px-8 py-2 md:py-3 text-[10px] md:text-sm cursor-pointer border-none shadow-[4px_4px_0_#8b2252] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0_#8b2252] transition-all block w-full md:w-auto"
                style={{ fontFamily: "'Press Start 2P', cursive" }}
              >
                🔄 REINICIAR
              </button>
            </div>
          </div>
        )}

        {/* ===== WIN SCREEN ===== */}
        {gameWon && (
          <div className="absolute inset-0 bg-[#0d0a14]/97 flex flex-col items-center justify-center text-center p-4 z-50">
            <h1 className="text-[#d4af37] text-xs md:text-lg mb-3 md:mb-4" style={{ textShadow: '3px 3px #000' }}>
              ¡CASTILLO ALCANZADO!
            </h1>
            <p className="text-white text-[8px] md:text-[10px] leading-relaxed mb-4 md:mb-6 max-w-[90%]">
              Has recolectado {flowersCollected} de 12 tulipanes.
              {flowersCollected === 12 ? (
                <><br /><br />¡PERFECTO! Has restaurado toda la luz del reino. 🌟</>
              ) : (
                <><br /><br />Bien hecho, pero aún hay más tulipanes escondidos en el castillo.</>
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
          0% { opacity: 0; transform: translate(-50%, -55%) scale(0.98); }
          60% { opacity: 1; transform: translate(-50%, -50%) scale(1.02); }
          100% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }
      `}</style>
    </div>
  );
}
