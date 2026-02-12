"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Home, Music, Heart, Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { AquariumBackground } from '@/components/AquariumBackground';

// -----------------------------------------------------------------------
// SUBTÍTULOS SINCRONIZADOS — "I Think They Call This Love" (3:13)
// Cada línea: tiempo en segundos, texto inglés, texto español
// -----------------------------------------------------------------------
interface LyricLine {
  time: number;
  en: string;
  es: string;
}

const LYRICS: LyricLine[] = [
  // Intro/Verso 1
  { time: 8.0, en: "They say", es: "Dicen" },
  { time: 10.5, en: "You know when you know", es: "Que lo sabes cuando lo sabes" },
  { time: 12.5, en: "So let's face it", es: "Así que seamos honestos" },
  { time: 15.0, en: "You had me at hello", es: "Me tuviste desde el hola" },
  { time: 18.5, en: "Hesitation never helps", es: "Dudar nunca ayuda" },
  { time: 22.0, en: "How could this be anything", es: "¿Cómo podría ser otra cosa" },
  { time: 25.0, en: "Anything else?", es: "Cualquier otra cosa?" },

  // Pre-Coro
  { time: 28.0, en: "When all I dream of", es: "Cuando todo lo que sueño" },
  { time: 30.5, en: "Is your eyes", es: "Son tus ojos" },
  { time: 32.5, en: "All I long for", es: "Todo lo que anhelo" },
  { time: 35.0, en: "Is your touch", es: "Es tu contacto" },
  { time: 37.5, en: "And, darling, something tells me", es: "Y, cariño, algo me dice" },
  { time: 40.5, en: "That's enough, mmm", es: "Que eso es suficiente" },

  // Coro 1
  { time: 43.5, en: "You can say that I'm a fool", es: "Puedes decir que soy un tonto" },
  { time: 47.0, en: "And I don't know very much", es: "Y que no sé mucho" },
  { time: 50.5, en: "But I think they call this love", es: "Pero creo que a esto lo llaman amor" },

  // Verso 2
  { time: 56.0, en: "One smile, one kiss", es: "Una sonrisa, un beso" },
  { time: 59.0, en: "Two lonely hearts", es: "Dos corazones solitarios" },
  { time: 61.5, en: "Is all that it takes", es: "Es todo lo que hace falta" },
  { time: 64.5, en: "Now, baby, you're on my mind", es: "Ahora, cariño, estás en mi mente" },
  { time: 68.0, en: "Every night, every day", es: "Cada noche, cada día" },
  { time: 71.0, en: "Good vibrations getting loud", es: "Las buenas vibras se hacen más fuertes" },
  { time: 74.5, en: "How could this be anything", es: "¿Cómo podría ser otra cosa" },
  { time: 77.0, en: "Anything else?", es: "Cualquier otra cosa?" },

  // Pre-Coro 2
  { time: 80.0, en: "When all I dream of", es: "Cuando todo lo que sueño" },
  { time: 82.5, en: "Is your eyes", es: "Son tus ojos" },
  { time: 84.5, en: "All I long for", es: "Todo lo que anhelo" },
  { time: 87.0, en: "Is your touch", es: "Es tu contacto" },
  { time: 89.5, en: "And darling something tells me", es: "Y cariño, algo me dice" },
  { time: 92.5, en: "That's enough, mmm", es: "Que eso es suficiente" },

  // Coro 2
  { time: 95.5, en: "You can say that I'm a fool", es: "Puedes decir que soy un tonto" },
  { time: 99.0, en: "And I don't know very much", es: "Y que no sé mucho" },
  { time: 102.5, en: "But I think they call this love", es: "Pero creo que a esto lo llaman amor" },
  { time: 108.0, en: "Oh, I think they call this love", es: "Oh, creo que a esto lo llaman amor" },

  // Puente
  { time: 116.0, en: "What could this be?", es: "¿Qué podría ser esto?" },
  { time: 122.0, en: "Between you and me", es: "Entre tú y yo" },

  // Coro Final (más lento/emotivo)
  { time: 131.0, en: "All I dream of", es: "Todo lo que sueño" },
  { time: 134.0, en: "Is your eyes", es: "Son tus ojos" },
  { time: 137.0, en: "All I long for", es: "Todo lo que anhelo" },
  { time: 139.5, en: "Is your touch", es: "Es tu contacto" },
  { time: 142.0, en: "And, darling, something tells me", es: "Y, cariño, algo me dice" },
  { time: 146.0, en: "Tells me it's enough, mmm", es: "Me dice que es suficiente" },
  { time: 150.0, en: "You could say that I'm a fool", es: "Puedes decir que soy un tonto" },
  { time: 153.5, en: "And I don't know very much", es: "Y que no sé mucho" },
  { time: 157.0, en: "But I think they call", es: "Pero creo que lo llaman" },
  { time: 161.0, en: "Oh, I think they call", es: "Oh, creo que lo llaman" },
  { time: 165.0, en: "Yes, I think they call this love", es: "Sí, creo que a esto lo llaman amor" },
  { time: 172.0, en: "This love", es: "Este amor" },
];

const SONG_TITLE = "I Think They Call This Love";
const ARTIST = "Elliot James Reay";
const SPOTIFY_EMBED = "https://open.spotify.com/embed/track/4oHQ8n9OKQ3599e8noCrDX?utm_source=generator&theme=0";
const AUDIO_FILE = "/Elliot James Reay - I Think They Call This Love.mp3";
const SONG_DURATION = 193; // 3:13

export default function CancionesPage() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [activeLineIndex, setActiveLineIndex] = useState(-1);
  const [showSpotify, setShowSpotify] = useState(false);
  const [muted, setMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lyricsContainerRef = useRef<HTMLDivElement>(null);
  const lineRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Determinar la línea activa según el tiempo actual
  useEffect(() => {
    let idx = -1;
    for (let i = LYRICS.length - 1; i >= 0; i--) {
      if (currentTime >= LYRICS[i].time) {
        idx = i;
        break;
      }
    }
    setActiveLineIndex(idx);
  }, [currentTime]);

  // Auto-scroll al subtítulo activo
  useEffect(() => {
    if (activeLineIndex >= 0 && lineRefs.current[activeLineIndex] && lyricsContainerRef.current) {
      lineRefs.current[activeLineIndex]?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [activeLineIndex]);

  // Inicializar audio
  useEffect(() => {
    audioRef.current = new Audio(AUDIO_FILE);
    audioRef.current.loop = false;
    audioRef.current.volume = muted ? 0 : 0.7;
    
    const handleTimeUpdate = () => {
      if (audioRef.current) {
        setCurrentTime(audioRef.current.currentTime);
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    const handleLoadedData = () => {
      console.log("Audio loaded successfully");
    };

    const audio = audioRef.current;
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('loadeddata', handleLoadedData);

    return () => {
      if (audio) {
        audio.removeEventListener('timeupdate', handleTimeUpdate);
        audio.removeEventListener('ended', handleEnded);
        audio.removeEventListener('loadeddata', handleLoadedData);
        audio.pause();
      }
    };
  }, [muted]);

  const handlePlayPause = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      setShowSpotify(true);
      audioRef.current.play().catch(e => console.log("Audio play failed:", e));
      setIsPlaying(true);
    }
  };

  const handleRestart = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      setCurrentTime(0);
      setActiveLineIndex(-1);
    }
  };

  // Manejar mute
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = muted ? 0 : 0.7;
    }
  }, [muted]);

  // Formato mm:ss
  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = Math.floor(s % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const audioDuration = audioRef.current?.duration || SONG_DURATION;
  const progress = (currentTime / audioDuration) * 100;

  return (
    <div className="relative h-screen w-full overflow-hidden">
      <AquariumBackground />

      <main className="relative z-10 flex flex-col items-center h-full p-2 sm:p-3 py-3 sm:py-4">
        {/* Header — mismo estilo que puzzle, card, etc. */}
        <div className="text-center flex-shrink-0 mb-2">
          <div className="flex justify-center items-center gap-2 mb-1">
            <Music className="w-4 h-4 sm:w-5 sm:h-5 text-pink-300" />
            <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-pink-300 fill-pink-300" />
          </div>
          <h1 className="text-lg sm:text-xl md:text-2xl font-headline text-white drop-shadow-lg">
            {SONG_TITLE}
          </h1>
          <p className="text-xs sm:text-sm text-white/80 mt-0.5">{ARTIST}</p>
        </div>

        {/* Contenido principal */}
        <div className="flex-1 w-full max-w-lg flex flex-col min-h-0 gap-2 sm:gap-3">

          {/* Reproductor Spotify (compacto, aparece al darle play) */}
          <div className={cn(
            "flex-shrink-0 transition-all duration-700 overflow-hidden rounded-xl sm:rounded-2xl",
            showSpotify ? "max-h-[90px] opacity-100" : "max-h-0 opacity-0"
          )}>
            <iframe
              src={SPOTIFY_EMBED}
              width="100%"
              height="80"
              frameBorder="0"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
              style={{ borderRadius: '12px' }}
            />
          </div>

          {/* Panel de subtítulos */}
          <div className="flex-1 bg-white/90 backdrop-blur-md rounded-xl sm:rounded-2xl shadow-2xl border border-pink-200/30 overflow-hidden flex flex-col min-h-0">

            {/* Barra de progreso */}
            <div className="px-4 pt-3 pb-1 flex-shrink-0">
              <div className="flex items-center justify-between text-[10px] sm:text-xs text-slate-400 mb-1">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(audioDuration)}</span>
              </div>
              <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-pink-400 to-rose-500 rounded-full transition-all duration-100"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Controles */}
            <div className="flex justify-center items-center gap-4 py-2 flex-shrink-0 border-b border-pink-100/50">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRestart}
                className="text-slate-400 hover:text-rose-500 text-xs"
              >
                Reiniciar
              </Button>
              <Button
                onClick={handlePlayPause}
                className="bg-rose-500 hover:bg-rose-600 text-white rounded-full w-10 h-10 p-0 shadow-lg shadow-rose-200/50"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMuted(!muted)}
                className="text-slate-400 hover:text-rose-500"
              >
                {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </Button>
            </div>

            {/* Letras sincronizadas con scroll automático */}
            <div
              ref={lyricsContainerRef}
              className="flex-1 overflow-y-auto px-3 sm:px-5 py-4 space-y-3 sm:space-y-4 scroll-smooth"
            >
              {/* Indicador de espera al inicio */}
              {activeLineIndex < 0 && isPlaying && (
                <div className="flex items-center justify-center py-8">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-rose-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-rose-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-rose-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}

              {LYRICS.map((line, i) => {
                const isActive = i === activeLineIndex;
                const isPast = i < activeLineIndex;
                const isFuture = i > activeLineIndex;

                return (
                  <div
                    key={i}
                    ref={el => { lineRefs.current[i] = el; }}
                    className={cn(
                      "text-center py-2 px-2 rounded-lg transition-all duration-500",
                      isActive && "bg-rose-50 scale-105",
                      isPast && "opacity-40",
                      isFuture && !isPlaying && "opacity-30",
                      isFuture && isPlaying && "opacity-20",
                    )}
                  >
                    {/* Texto en inglés */}
                    <p className={cn(
                      "font-medium transition-all duration-500 leading-relaxed",
                      isActive
                        ? "text-rose-600 text-base sm:text-lg md:text-xl"
                        : "text-slate-700 text-sm sm:text-base",
                    )}>
                      {line.en}
                    </p>
                    {/* Traducción al español */}
                    <p className={cn(
                      "italic transition-all duration-500 mt-0.5 leading-relaxed",
                      isActive
                        ? "text-rose-400 text-sm sm:text-base"
                        : "text-slate-400 text-xs sm:text-sm",
                    )}>
                      {line.es}
                    </p>
                  </div>
                );
              })}

              {/* Espacio final para scroll */}
              <div className="h-20" />
            </div>
          </div>
        </div>

        {/* Botón volver — misma estructura que las demás páginas */}
        <Button asChild variant="ghost" size="sm" className="text-white hover:bg-white/20 hover:text-white flex-shrink-0 mt-2">
          <Link href="/" className="flex items-center gap-1.5">
            <Home className="w-3.5 h-3.5" />
            <span className="text-xs sm:text-sm">Volver al inicio</span>
          </Link>
        </Button>
      </main>
    </div>
  );
}
