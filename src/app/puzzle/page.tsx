import { JigsawPuzzle } from '@/components/JigsawPuzzle';
import { Home, Puzzle, Turtle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function PuzzlePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-background">
      <div className="text-center mb-8">
        <div className="flex justify-center items-center gap-4 mb-2">
            <Puzzle className="w-8 h-8 text-accent" />
            <Turtle className="w-8 h-8 text-accent" />
        </div>
        <h1 className="text-4xl font-headline text-primary">Un Rompecabezas para Ti</h1>
        <p className="text-lg text-foreground/80 mt-2">Ármalo para encontrar una sorpresa.</p>
      </div>
      <JigsawPuzzle
        imageUrl="https://placehold.co/450x450.png"
        imageHint="sea turtle snoopy"
        gridSize={3}
        puzzleSolvedMessage="¡Lo lograste! El próximo código es 'AMOR'."
      />
      <Button asChild variant="link" className="mt-8 text-foreground/80">
            <Link href="/" className="flex items-center gap-2">
                <Home className="w-4 h-4" />
                Volver al inicio
            </Link>
        </Button>
    </div>
  );
}
