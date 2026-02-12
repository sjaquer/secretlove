"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Heart, Home, Volume2, VolumeX, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { AquariumBackground } from '@/components/AquariumBackground';

// ----------------------------------------------------------------------
// CONFIGURACIÓN DE RECUERDOS
// Sustituye los 'src' por tus fotos reales en /public
// ----------------------------------------------------------------------
const MEMORIES = [
  { id: 1, src: "/collage-1.jpg", text: "Cada momento contigo es un tesoro..." },
  { id: 2, src: "/collage-2.jpg", text: "Te amo con todo mi corazón" },
  { id: 3, src: "/collage-3.jpg", text: "Tu sonrisa ilumina todo mi mundo" },
  { id: 4, src: "/collage-4.jpg", text: "Contigo, todo es simplemente mejor" },
  { id: 5, src: "/collage-5.jpg", text: "Eres la razón de cada una de mis sonrisas" },
  { id: 6, src: "/collage-6.jpg", text: "Prometo amarte hoy, mañana y siempre" },
];

const AUDIO_FILE = "/Kikuo - Hizashi wa Tsukanoma.mp3";

// Componente de revelación progresiva al hacer scroll
function RevealSection({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={cn(
        "transition-all duration-1000 ease-out",
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
      )}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

export default function CollagePage() {
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio(AUDIO_FILE);
    audioRef.current.loop = true;
    audioRef.current.volume = 0.5;
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const toggleAudio = () => {
    if (!audioRef.current) return;
    if (audioPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(e => console.log("Audio:", e));
    }
    setAudioPlaying(!audioPlaying);
  };

  return (
    <div className="relative min-h-screen w-full">
      {/* Fondo de acuario fijo — solo burbujas y fondo del mar */}
      <div className="fixed inset-0 -z-10">
        <AquariumBackground bubblesOnly />
      </div>

      {/* Header — mismo estilo que canciones, puzzle, card */}
      <main className="relative z-10 flex flex-col min-h-screen">
        <header className="sticky top-0 z-40 bg-[#064273]/50 backdrop-blur-md border-b border-white/10 px-4 sm:px-6 py-3 flex justify-between items-center">
          <Button asChild variant="ghost" size="sm" className="text-white hover:bg-white/20 hover:text-white">
            <Link href="/" className="flex items-center gap-1.5">
              <Home className="w-3.5 h-3.5" />
              <span className="text-xs sm:text-sm">Volver</span>
            </Link>
          </Button>

          <div className="flex items-center gap-2">
            <Camera className="w-4 h-4 sm:w-5 sm:h-5 text-pink-300" />
            <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-pink-300 fill-pink-300" />
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleAudio}
            className="rounded-full text-pink-300 hover:bg-white/20 hover:text-pink-200"
          >
            {audioPlaying ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </Button>
        </header>

        {/* Sección hero */}
        <section className="flex flex-col items-center justify-center min-h-[50vh] px-4 text-center">
          <RevealSection>
            <div className="flex justify-center items-center gap-2 mb-2">
              <Camera className="w-4 h-4 sm:w-5 sm:h-5 text-pink-300" />
              <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-pink-300 fill-pink-300" />
            </div>
            <h1 className="text-lg sm:text-xl md:text-2xl font-headline text-white drop-shadow-lg">
              Nuestros Recuerdos
            </h1>
            <p className="text-xs sm:text-sm text-white/80 mt-0.5 max-w-md mx-auto">
              Cada foto guarda un pedazo de nosotros. Baja despacio y revívelos.
            </p>
          </RevealSection>
        </section>

        {/* Recuerdos progresivos — aparecen al hacer scroll */}
        <div className="px-3 sm:px-6 md:px-8 pb-16 max-w-xl mx-auto space-y-16 sm:space-y-24">
          {MEMORIES.map((memory, index) => (
            <RevealSection key={memory.id} delay={100}>
              <div className="flex flex-col items-center gap-3 sm:gap-5">
                {/* Card de imagen — mismo estilo que puzzle/card */}
                <div className="w-full bg-white/90 backdrop-blur-md rounded-xl sm:rounded-2xl shadow-2xl border border-pink-200/30 overflow-hidden p-2 sm:p-3">
                  <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-slate-100">
                    {/* Placeholder si no hay imagen */}
                    <div className="absolute inset-0 flex items-center justify-center bg-[#064273]/20">
                      <Heart className="w-10 h-10 text-pink-300/30" />
                    </div>
                    {/* Imagen real */}
                    {!imageErrors.has(memory.id) && (
                      <Image
                        src={memory.src}
                        alt={memory.text}
                        fill
                        className="object-cover relative z-10"
                        onError={() => setImageErrors(prev => new Set(prev).add(memory.id))}
                        sizes="(max-width: 768px) 100vw, 576px"
                      />
                    )}
                  </div>
                </div>

                {/* Frase emotiva */}
                <p className="text-center text-white font-headline text-base sm:text-lg md:text-xl drop-shadow-lg px-2">
                  {memory.text}
                </p>

                {/* Separador */}
                {index < MEMORIES.length - 1 && (
                  <div className="flex items-center gap-2 mt-4 opacity-40">
                    <div className="w-8 h-px bg-white/50" />
                    <Heart className="w-3 h-3 text-pink-300" fill="currentColor" />
                    <div className="w-8 h-px bg-white/50" />
                  </div>
                )}
              </div>
            </RevealSection>
          ))}
        </div>

        {/* Footer */}
        <footer className="py-16 sm:py-20 text-center mt-auto">
          <RevealSection>
            <Heart className="w-6 h-6 text-pink-300 mx-auto mb-4 animate-bounce-slow" fill="currentColor" />
            <p className="text-white/60 tracking-widest text-xs sm:text-sm uppercase">
              Y esto es solo el principio
            </p>
          </RevealSection>
        </footer>
      </main>
    </div>
  );
}
