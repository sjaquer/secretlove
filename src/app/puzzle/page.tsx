import { JigsawPuzzle } from '@/components/JigsawPuzzle';
import { Home, Puzzle, Turtle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AquariumBackground } from '@/components/AquariumBackground';

export default function PuzzlePage() {
  return (
    <div className="relative h-screen w-full overflow-hidden">
      <AquariumBackground />
      <main className="relative z-10 flex flex-col items-center justify-center h-full p-3 sm:p-4 md:p-6 gap-3 md:gap-4">
        <div className="text-center">
          <div className="flex justify-center items-center gap-2 md:gap-3 mb-1">
              <Puzzle className="w-5 h-5 md:w-6 md:h-6 text-pink-300" />
              <Turtle className="w-5 h-5 md:w-6 md:h-6 text-pink-300" />
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-headline text-white drop-shadow-lg">Un Rompecabezas para Ti</h1>
          <p className="text-xs sm:text-sm md:text-base text-white/80 mt-1">Ármalo para encontrar una sorpresa.</p>
        </div>
        <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl p-3 md:p-5">
          <JigsawPuzzle
            imageUrl="https://placehold.co/450x450.png"
            imageHint="sea turtle snoopy"
            gridSize={3}
            puzzleSolvedMessage="¡Lo lograste! El próximo código es 'AMOR'."
          />
        </div>
        <Button asChild variant="ghost" className="text-white hover:bg-white/20 hover:text-white">
              <Link href="/" className="flex items-center gap-2">
                  <Home className="w-4 h-4" />
                  Volver al inicio
              </Link>
          </Button>
      </main>
    </div>
  );
}
