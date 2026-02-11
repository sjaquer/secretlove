"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Home, Heart, Music, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AquariumBackground } from '@/components/AquariumBackground';

// ---- AUDIO SYSTEM (Simple Synth) ----
const playSound = (type: 'open' | 'type' | 'bgm') => {
  if (typeof window === 'undefined') return;
  const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioContext) return;
  
  const ctx = new AudioContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  
  osc.connect(gain);
  gain.connect(ctx.destination);

  const now = ctx.currentTime;

  if (type === 'open') {
    // A magical chime chord
    osc.type = 'sine';
    osc.frequency.setValueAtTime(523.25, now); // C5
    osc.frequency.exponentialRampToValueAtTime(1046.5, now + 0.5);
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.3, now + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 1.5);
    osc.start(now);
    osc.stop(now + 1.5);

    // Add a second tone for harmony
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(659.25, now); // E5
    gain2.gain.setValueAtTime(0, now);
    gain2.gain.linearRampToValueAtTime(0.2, now + 0.1);
    gain2.gain.exponentialRampToValueAtTime(0.01, now + 1.5);
    osc2.start(now);
    osc2.stop(now + 1.5);
  } 
  else if (type === 'type') {
    // Soft paper writing sound
    osc.type = 'triangle';
    // Random pitch variation for natural feel
    const freq = 200 + Math.random() * 100;
    osc.frequency.setValueAtTime(freq, now);
    gain.gain.setValueAtTime(0.05, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
    osc.start(now);
    osc.stop(now + 0.05);
  }
};


export default function CardPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [textIndex, setTextIndex] = useState(0);
  const [currentLine, setCurrentLine] = useState(0);
  const [showFullText, setShowFullText] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);

  // The Poem
  const lines = [
    "No es que muera de amor, muero de ti.",
    "Muero de ti, amor, de amor de ti,",
    "de urgencia mía de mi piel, de mi alma,",
    "de ti y de mi boca",
    "y de lo insoportable que soy yo sin ti."
  ];

  // Typing effect
  useEffect(() => {
    if (!isOpen || showFullText) return;

    if (currentLine < lines.length) {
      const line = lines[currentLine];
      if (textIndex < line.length) {
        const timeout = setTimeout(() => {
          setTextIndex(prev => prev + 1);
          if (audioEnabled && textIndex % 3 === 0) playSound('type');
        }, 60); // Typing speed
        return () => clearTimeout(timeout);
      } else {
        // Line finished, wait a bit then next line
        const timeout = setTimeout(() => {
          setCurrentLine(prev => prev + 1);
          setTextIndex(0);
        }, 800);
        return () => clearTimeout(timeout);
      }
    } else {
      setShowFullText(true);
    }
  }, [isOpen, textIndex, currentLine, showFullText, audioEnabled, lines]);

  const handleOpen = () => {
    setIsOpen(true);
    if (audioEnabled) playSound('open');
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#0d0a14] selection:bg-rose-500/30 font-sans">
        <AquariumBackground />
        
        {/* Audio Toggle */}
        <button 
          onClick={() => setAudioEnabled(!audioEnabled)}
          className="fixed top-4 right-4 z-50 p-2 rounded-full bg-white/10 text-white backdrop-blur hover:bg-white/20 transition-all hover:scale-110 active:scale-95"
          title={audioEnabled ? "Silenciar" : "Activar sonido"}
        >
          {audioEnabled ? <Volume2 className="w-5 h-5 sm:w-6 sm:h-6" /> : <VolumeX className="w-5 h-5 sm:w-6 sm:h-6" />}
        </button>

        <main className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4">
          
          {/* ENVELOPE / CLOSED STATE */}
          {!isOpen && (
            <div 
              className="cursor-pointer group relative transform transition-all duration-500 hover:scale-105"
              onClick={handleOpen}
            >
              <div className="relative w-72 h-48 sm:w-80 sm:h-56 bg-gradient-to-br from-rose-100 to-rose-200 rounded-lg shadow-[0_20px_50px_rgba(244,63,94,0.3)] flex items-center justify-center overflow-hidden border-2 border-rose-300">
                {/* Envelope pattern */}
                <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(255,255,255,0.3)_10px,rgba(255,255,255,0.3)_20px)] opacity-30"></div>
                
                {/* Envelope flap simulation */}
                <div className="absolute top-0 left-0 w-full h-0 border-l-[160px] border-r-[160px] border-t-[120px] border-l-transparent border-r-transparent border-t-rose-300 filter drop-shadow-md origin-top"></div>
                
                {/* Heart Seal */}
                <div className="absolute top-[30%] z-20 bg-rose-500 text-white p-3 rounded-full shadow-lg animate-pulse ring-4 ring-rose-200">
                  <Heart className="w-8 h-8 fill-current" />
                </div>
                
                <div className="absolute bottom-6 text-rose-800 font-serif italic text-lg opacity-80 drop-shadow-sm font-medium">
                  Para ti...
                </div>
              </div>
              <p className="text-white/90 mt-8 text-center animate-bounce text-sm font-light tracking-wide uppercase">Toca para abrir la carta</p>
            </div>
          )}

          {/* LETTER / OPEN STATE */}
          {isOpen && (
            <div className="relative w-full max-w-lg perspective-1000 animate-fadeInUp">
              
              {/* Paper Background */}
              <div className="relative bg-[#fffdf5] p-8 sm:p-12 rounded-sm shadow-[0_0_50px_rgba(255,255,255,0.2)] overflow-hidden min-h-[500px] transform rotate-1 border border-[#e8dcc5]">
                
                {/* Vintage Paper texture effect */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-black" style={{ filter: 'url(#noise)' }}></div>

                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 p-6 opacity-80">
                   <div className="w-16 h-16 border-r-2 border-t-2 border-rose-200 rounded-tr-3xl"></div>
                </div>
                <div className="absolute bottom-0 left-0 p-6 opacity-80">
                   <div className="w-16 h-16 border-l-2 border-b-2 border-rose-200 rounded-bl-3xl"></div>
                </div>

                {/* Content */}
                <div className="relative z-10 flex flex-col h-full items-center">
                  
                  {/* Icon Header */}
                  <div className="mb-10 text-rose-300">
                    <Music className="w-8 h-8 animate-float" />
                  </div>

                  {/* Poem Text */}
                  <div className="w-full space-y-6 text-center">
                    {lines.map((line, i) => (
                      <p 
                        key={i} 
                        className={`text-lg sm:text-2xl leading-relaxed font-serif text-slate-800 transition-all duration-700
                          ${i > currentLine ? 'opacity-0 blur-sm translate-y-2' : 'opacity-100 blur-0 translate-y-0'} 
                          ${i === lines.length - 1 ? 'font-bold text-rose-900 mt-8 scale-105' : ''}`}
                      >
                         {/* Show full line if past it, or substring if current */}
                         {i < currentLine ? line : (i === currentLine ? line.substring(0, textIndex) : '')}
                         {i === currentLine && i < lines.length && !showFullText && <span className="inline-block w-0.5 h-6 bg-rose-400 animate-blink ml-1 align-middle"></span>}
                      </p>
                    ))}
                  </div>

                  {/* Signature (appears at end) */}
                  <div className={`mt-16 transition-all duration-1000 delay-500 flex flex-col items-center gap-3 ${showFullText ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 disabled'}`}>
                     <div className="h-px w-12 bg-rose-300/50 mb-2"></div>
                     <p className="font-serif italic text-rose-600/80 text-sm">Con todo mi amor</p>
                     
                     <div className="relative mt-2">
                       <Heart className="w-6 h-6 text-rose-500 fill-rose-500 animate-ping-slow absolute top-0 left-0 opacity-50" />
                       <Heart className="w-6 h-6 text-rose-600 fill-rose-600 relative z-10" />
                     </div>
                  </div>

                </div>
              </div>

              <div className="mt-10 flex justify-center gap-4 opacity-0 animate-[fadeIn_0.5s_ease-out_2s_forwards]">
                <Button asChild variant="ghost" className="text-white/70 hover:text-white hover:bg-white/10 transition-colors">
                  <Link href="/" className="flex items-center gap-2 text-sm">
                    <Home className="w-4 h-4" />
                    Menú Principal
                  </Link>
                </Button>
              </div>

            </div>
          )}

        </main>

        <style jsx global>{`
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(40px) scale(0.95); }
            to { opacity: 1; transform: translateY(0) scale(1); }
          }
          .animate-fadeInUp {
            animation: fadeInUp 1.2s cubic-bezier(0.22, 1, 0.36, 1) forwards;
          }
          .animate-blink {
            animation: blink 1s step-end infinite;
          }
          @keyframes blink {
            50% { opacity: 0; }
          }
          .animate-ping-slow {
             animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
          }
          @keyframes float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
          }
          .animate-float {
            animation: float 3s ease-in-out infinite;
          }
          .perspective-1000 {
            perspective: 1000px;
          }
        `}</style>
    </div>
  );
}
