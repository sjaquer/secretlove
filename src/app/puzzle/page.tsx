"use client";
import React from 'react';
import AmorPuzzle from '@/components/AmorPuzzle';
import SpecialCard from '@/components/SpecialCard';
import { Home, Puzzle, Turtle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AquariumBackground } from '@/components/AquariumBackground';

export default function PuzzlePage() {
  const [showCard, setShowCard] = React.useState(false);
  return (
    <div className="relative h-screen w-full overflow-hidden">
      <AquariumBackground />
      <main className="relative z-10 flex flex-col items-center justify-between h-full p-2 sm:p-3 py-3 sm:py-4">
        <div className="text-center flex-shrink-0">
          <div className="flex justify-center items-center gap-2 mb-1">
              <Puzzle className="w-4 h-4 sm:w-5 sm:h-5 text-pink-300" />
              <Turtle className="w-4 h-4 sm:w-5 sm:h-5 text-pink-300" />
          </div>
          <h1 className="text-lg sm:text-xl md:text-2xl font-headline text-white drop-shadow-lg">Un Rompecabezas para Ti</h1>
          <p className="text-xs sm:text-sm text-white/80 mt-0.5">Ármalo para encontrar una sorpresa.</p>
        </div>
        <div className="bg-white/90 backdrop-blur-md rounded-xl sm:rounded-2xl shadow-2xl p-2 sm:p-3 md:p-4 flex-shrink min-h-0">
          <AmorPuzzle onComplete={() => setShowCard(true)} />
        </div>
        {showCard && (
          <SpecialCard onClose={() => setShowCard(false)} />
        )}
        <Button asChild variant="ghost" size="sm" className="text-white hover:bg-white/20 hover:text-white flex-shrink-0">
              <Link href="/" className="flex items-center gap-1.5">
                  <Home className="w-3.5 h-3.5" />
                  <span className="text-xs sm:text-sm">Volver al inicio</span>
              </Link>
          </Button>
      </main>
    </div>
  );
}

