"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { PartyPopper } from 'lucide-react';

interface Piece {
  id: number;
  bgPosition: string;
}

interface JigsawPuzzleProps {
  imageUrl: string;
  imageHint: string;
  gridSize: number;
  puzzleSolvedMessage: string;
}

export function JigsawPuzzle({ imageUrl, imageHint, gridSize, puzzleSolvedMessage }: JigsawPuzzleProps) {
  const [pieces, setPieces] = useState<Piece[]>([]);
  const [solved, setSolved] = useState(false);
  const [shuffling, setShuffling] = useState(true);
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  const pieceSize = 100 / gridSize;
  const puzzleSize = 450;
  const pieceDimension = puzzleSize / gridSize;

  const createPieces = (shuffled: boolean) => {
    const newPieces: Piece[] = [];
    for (let i = 0; i < gridSize * gridSize; i++) {
      const row = Math.floor(i / gridSize);
      const col = i % gridSize;
      newPieces.push({
        id: i,
        bgPosition: `${col * pieceSize}% ${row * pieceSize}%`,
      });
    }

    if (shuffled) {
      // Fisher-Yates shuffle
      for (let i = newPieces.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newPieces[i], newPieces[j]] = [newPieces[j], newPieces[i]];
      }
    }
    setPieces(newPieces);
    setSolved(false);
    setShuffling(true);
    setTimeout(() => setShuffling(false), 500);
  };
  
  useEffect(() => {
    createPieces(true);
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageUrl, gridSize]);
  
  const handleDragStart = (index: number) => {
    dragItem.current = index;
  };

  const handleDragEnter = (index: number) => {
    dragOverItem.current = index;
  };
  
  const handleDragEnd = () => {
    if (dragItem.current !== null && dragOverItem.current !== null && dragItem.current !== dragOverItem.current) {
      const copyPieces = [...pieces];
      const dragItemContent = copyPieces[dragItem.current];
      copyPieces.splice(dragItem.current, 1);
      copyPieces.splice(dragOverItem.current, 0, dragItemContent);
      dragItem.current = null;
      dragOverItem.current = null;
      setPieces(copyPieces);
    }
  };

  useEffect(() => {
    if (!shuffling && pieces.length > 0) {
        const isSolved = pieces.every((p, index) => p.id === index);
        if (isSolved) {
            setSolved(true);
        }
    }
  }, [pieces, shuffling]);
  
  return (
    <Card className="p-2 sm:p-4 bg-card/80 backdrop-blur-sm shadow-2xl">
      <CardContent className="p-0">
        <div
          id="puzzle-board"
          className="grid gap-1 relative"
          style={{ 
            gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
            width: `${puzzleSize}px`,
            height: `${puzzleSize}px`,
           }}
        >
          {solved ? (
            <div className="absolute inset-0 bg-background/90 flex flex-col items-center justify-center z-20 text-center p-4 rounded-lg">
              <PartyPopper className="h-16 w-16 text-primary mb-4 animate-bounce" />
              <h2 className="text-2xl font-headline text-accent">{puzzleSolvedMessage}</h2>
              <Button onClick={() => createPieces(true)} className="mt-6">Jugar de Nuevo</Button>
            </div>
          ) : null}

          {pieces.map((piece, index) => (
            <div
              key={`${piece.id}-${index}`}
              draggable={!solved}
              onDragStart={() => handleDragStart(index)}
              onDragEnter={() => handleDragEnter(index)}
              onDragEnd={handleDragEnd}
              onDragOver={(e) => e.preventDefault()}
              className={cn(
                'bg-cover cursor-grab active:cursor-grabbing transition-all duration-300 ease-in-out rounded-md',
                solved ? 'border-2 border-accent' : 'border border-transparent hover:border-primary/50'
              )}
              style={{
                width: `${pieceDimension}px`,
                height: `${pieceDimension}px`,
                backgroundImage: `url(${imageUrl})`,
                backgroundPosition: piece.bgPosition,
                backgroundSize: `${puzzleSize}px ${puzzleSize}px`,
                '--data-ai-hint': imageHint,
              } as React.CSSProperties}
              data-ai-hint={imageHint}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
