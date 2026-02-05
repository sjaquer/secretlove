"use client";

import React, { useState, useEffect, useCallback } from 'react';

interface SwimmingFish {
  id: number;
  emoji: string;
  top: number;
  size: number;
  duration: number;
  delay: number;
  direction: 'left' | 'right';
  layer: number;
}

interface Coral {
  id: number;
  emoji: string;
  left: number;
  size: number;
  delay: number;
}

interface Bubble {
  id: number;
  left: number;
  size: number;
  duration: number;
  delay: number;
  opacity: number;
}

export function AquariumBackground() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [fish, setFish] = useState<SwimmingFish[]>([]);
  const [corals, setCorals] = useState<Coral[]>([]);
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [particles, setParticles] = useState<Array<{ id: number; left: number; top: number; size: number; duration: number; delay: number }>>([]);
  const [sparkles, setSparkles] = useState<Array<{ id: number; left: number; top: number; delay: number }>>([]);
  const [isMobile, setIsMobile] = useState(false);
  const targetRef = React.useRef({ x: 0, y: 0 });
  const rafRef = React.useRef<number | null>(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);

    // Peces nadando - gran variedad de especies marinas
    const fishEmojis = ['🐠', '🐟', '🐡', '🐬', '🐳', '🦈', '🐙', '🦑', '🐢', '🦭', '🐋', '🦐', '🦞', '🦀', '🪼'];
    const generatedFish: SwimmingFish[] = Array.from({ length: 22 }, (_, i) => ({
      id: i,
      emoji: fishEmojis[Math.floor(Math.random() * fishEmojis.length)],
      top: 8 + Math.random() * 65,
      size: 28 + Math.random() * 45,
      duration: 18 + Math.random() * 30,
      delay: Math.random() * 25,
      direction: Math.random() > 0.5 ? 'left' : 'right',
      layer: Math.floor(Math.random() * 3),
    }));
    setFish(generatedFish);

    // Corales y plantas en el fondo del mar
    const coralEmojis = ['🪸', '🌿', '🌾', '🍃', '🪨', '🐚', '⭐', '🦪', '🌱', '🪸', '🌿', '🐚'];
    const generatedCorals: Coral[] = Array.from({ length: 25 }, (_, i) => ({
      id: i,
      emoji: coralEmojis[Math.floor(Math.random() * coralEmojis.length)],
      left: i * 4.2 + Math.random() * 2,
      size: 25 + Math.random() * 55,
      delay: Math.random() * 4,
    }));
    setCorals(generatedCorals);

    // Burbujas subiendo
    const generatedBubbles: Bubble[] = Array.from({ length: 70 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      size: 3 + Math.random() * 22,
      duration: 6 + Math.random() * 18,
      delay: Math.random() * 18,
      opacity: 0.15 + Math.random() * 0.55,
    }));
    setBubbles(generatedBubbles);

    // Generar partículas y destellos solo una vez (después del montaje)
    const generatedParticles = Array.from({ length: 35 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: 2 + Math.random() * 5,
      duration: 12 + Math.random() * 18,
      delay: Math.random() * 8,
    }));
    setParticles(generatedParticles);

    const generatedSparkles = Array.from({ length: 12 }, (_, i) => ({
      id: i,
      left: 8 + Math.random() * 84,
      top: 8 + Math.random() * 75,
      delay: Math.random() * 4,
    }));
    setSparkles(generatedSparkles);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleMouseMove = useCallback((event: MouseEvent) => {
    const x = (event.clientX / window.innerWidth) * 2 - 1;
    const y = (event.clientY / window.innerHeight) * 2 - 1;
    targetRef.current = { x, y };
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);

    // Suavizado con requestAnimationFrame para evitar saltos al mover rápido el mouse
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    const tick = () => {
      setMousePos((prev) => {
        const nx = lerp(prev.x, targetRef.current.x, 0.08);
        const ny = lerp(prev.y, targetRef.current.y, 0.08);
        return { x: nx, y: ny };
      });
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [handleMouseMove]);

  const getParallax = (layer: number) => {
    if (isMobile) return {};
    // factor reducido y estable; usamos suavizado en mousePos para evitar picos
    const base = (layer + 1) * 3; // menos movimiento por capa
    const max = 30; // limitar desplazamiento máximo en px
    const tx = Math.max(-max, Math.min(max, mousePos.x * base * 20));
    const ty = Math.max(-max, Math.min(max, mousePos.y * base * 12));
    return {
      transform: `translateX(${tx}px) translateY(${ty}px)`,
      // evitar transiciones largas que causan sensación de velocidad
      transition: 'transform 160ms linear',
    };
  };

  const getLayerStyles = (layer: number) => {
    switch (layer) {
      case 0: return 'blur-md opacity-45';
      case 1: return 'blur-sm opacity-70';
      case 2: return 'blur-none opacity-95';
      default: return '';
    }
  };

  return (
    <div className="absolute inset-0 -z-10 h-full w-full overflow-hidden bg-gradient-to-b from-[#064273] via-[#0077a8] to-[#00b4d8]">
      
      {/* Efecto de profundidad superior */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-black/20 z-[1]" />
      
      {/* Rayos de luz desde la superficie */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-[2] pointer-events-none">
        <div className="absolute top-0 left-[15%] w-[120px] md:w-[180px] h-[130%] bg-gradient-to-b from-white/25 via-white/8 to-transparent rotate-[12deg] blur-2xl" />
        <div className="absolute top-0 left-[45%] w-[80px] md:w-[120px] h-[110%] bg-gradient-to-b from-white/20 via-white/5 to-transparent rotate-[-5deg] blur-2xl" />
        <div className="absolute top-0 right-[18%] w-[100px] md:w-[150px] h-[120%] bg-gradient-to-b from-white/22 via-white/6 to-transparent rotate-[8deg] blur-2xl" />
        <div className="absolute top-0 left-[70%] w-[60px] md:w-[90px] h-[100%] bg-gradient-to-b from-white/18 via-white/3 to-transparent rotate-[-10deg] blur-2xl" />
      </div>

      {/* Burbujas animadas subiendo */}
      <div className="absolute inset-0 z-[3] pointer-events-none">
        {bubbles.map((bubble) => (
          <div
            key={`bubble-${bubble.id}`}
            className="absolute bottom-0 rounded-full bg-white/50 backdrop-blur-sm border border-white/30"
            style={{
              left: `${bubble.left}%`,
              width: `${bubble.size}px`,
              height: `${bubble.size}px`,
              opacity: bubble.opacity,
              animation: `bubbles ${bubble.duration}s ease-in ${bubble.delay}s infinite`,
            }}
          />
        ))}
      </div>

      {/* Partículas flotantes */}
      <div className="absolute inset-0 z-[3] pointer-events-none">
        {particles.map((p) => (
          <div
            key={`particle-${p.id}`}
            className="absolute rounded-full bg-white/40"
            style={{
              width: `${p.size}px`,
              height: `${p.size}px`,
              left: `${p.left}%`,
              top: `${p.top}%`,
              animation: `float ${p.duration}s ease-in-out ${p.delay}s infinite alternate`,
            }}
          />
        ))}
      </div>

      {/* Capa de peces - FONDO (layer 0) - más borrosos y lentos */}
      <div className="absolute inset-0 z-[4]" style={getParallax(0)}>
        {fish.filter(f => f.layer === 0).map((f) => (
          <div
            key={`fish-bg-${f.id}`}
            className={`absolute ${getLayerStyles(0)}`}
            style={{
              top: `${f.top}%`,
              fontSize: `${f.size * 0.65}px`,
              animation: `swim-${f.direction} ${f.duration * 1.4}s linear ${f.delay}s infinite`,
            }}
          >
            {f.emoji}
          </div>
        ))}
      </div>

      {/* Capa de peces - MEDIO (layer 1) */}
      <div className="absolute inset-0 z-[5]" style={getParallax(1)}>
        {fish.filter(f => f.layer === 1).map((f) => (
          <div
            key={`fish-mid-${f.id}`}
            className={`absolute ${getLayerStyles(1)}`}
            style={{
              top: `${f.top}%`,
              fontSize: `${f.size * 0.82}px`,
              animation: `swim-${f.direction} ${f.duration}s linear ${f.delay}s infinite`,
            }}
          >
            {f.emoji}
          </div>
        ))}
      </div>

      {/* Capa de peces - FRENTE (layer 2) - nítidos y rápidos */}
      <div className="absolute inset-0 z-[6]" style={getParallax(2)}>
        {fish.filter(f => f.layer === 2).map((f) => (
          <div
            key={`fish-front-${f.id}`}
            className={`absolute ${getLayerStyles(2)} hover:scale-125 transition-transform duration-300 cursor-pointer`}
            style={{
              top: `${f.top}%`,
              fontSize: `${f.size}px`,
              animation: `swim-${f.direction} ${f.duration * 0.75}s linear ${f.delay}s infinite`,
            }}
          >
            {f.emoji}
          </div>
        ))}
      </div>

      {/* Destellos de luz */}
      <div className="absolute inset-0 z-[7] pointer-events-none">
        {sparkles.map((s) => (
          <div
            key={`sparkle-${s.id}`}
            className="absolute text-base md:text-xl"
            style={{
              left: `${s.left}%`,
              top: `${s.top}%`,
              animation: `pulse-glow 3.5s ease-in-out ${s.delay}s infinite`,
            }}
          >
            ✨
          </div>
        ))}
      </div>

      {/* Fondo del mar con corales y plantas */}
      <div className="absolute bottom-0 left-0 w-full h-36 md:h-44 z-[8]" style={getParallax(0)}>
        {/* Gradiente del fondo marino */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#053f5e]/90 via-[#065a82]/50 to-transparent" />
        
        {/* Corales y plantas animados */}
        {corals.map((coral) => (
          <div
            key={`coral-${coral.id}`}
            className="absolute bottom-0 origin-bottom hover:scale-110 transition-transform duration-500 cursor-pointer"
            style={{
              left: `${coral.left}%`,
              fontSize: `${coral.size}px`,
              animation: `sway 5s ease-in-out ${coral.delay}s infinite`,
            }}
          >
            {coral.emoji}
          </div>
        ))}
      </div>

      {/* Efecto de olas en la superficie */}
      <div className="absolute top-0 left-0 w-full h-16 z-[9] overflow-hidden pointer-events-none">
        <div 
          className="absolute inset-0 opacity-25"
          style={{
            background: 'linear-gradient(180deg, rgba(255,255,255,0.15) 0%, transparent 100%)',
            animation: 'float 5s ease-in-out infinite',
          }}
        />
      </div>

      {/* Efecto de profundidad extrema en el fondo */}
      <div className="absolute bottom-0 left-0 w-full h-56 bg-gradient-to-t from-[#032b3d] via-[#054a6a]/60 to-transparent z-[0]" />
    </div>
  );
}