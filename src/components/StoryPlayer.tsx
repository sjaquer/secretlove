"use client";

import { useState, useEffect } from 'react';
import { generateInteractiveStory, type InteractiveStoryOutput } from '@/ai/flows/generate-interactive-story';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function StoryPlayer() {
  const [story, setStory] = useState<InteractiveStoryOutput | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [previousNarrative, setPreviousNarrative] = useState('');

  const fetchStory = async (userChoice?: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await generateInteractiveStory({
        userChoice: userChoice,
        previousNarrative: previousNarrative,
      });
      setStory(result);
      setPreviousNarrative(result.narrative);
    } catch (e) {
      console.error(e);
      setError('Hubo un error al generar la historia. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStory('Comenzar la historia');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleOptionClick = (option: string) => {
    fetchStory(option);
  };

  const restartStory = () => {
    setPreviousNarrative('');
    fetchStory('Comenzar la historia');
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
        <Card className="bg-card/80 backdrop-blur-sm shadow-2xl">
        <CardHeader>
            {loading && !story && (
                <div className="flex flex-col items-center justify-center space-y-4 min-h-[200px]">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    <p className="text-muted-foreground">Creando nuestro mundo...</p>
                </div>
            )}
        </CardHeader>

        <CardContent className={cn("transition-opacity duration-500 min-h-[150px]", loading ? 'opacity-50' : 'opacity-100')}>
            {error && <p className="text-destructive text-center">{error}</p>}
            {story?.narrative && (
              <p className="text-lg leading-relaxed whitespace-pre-wrap">{story.narrative}</p>
            )}
        </CardContent>

        <CardFooter className="flex flex-col gap-4 justify-center pt-6">
            <div className='flex flex-col sm:flex-row gap-4 justify-center w-full'>
              {loading && story && (
                  <Button disabled className='w-full sm:w-auto'>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Pensando...
                  </Button>
              )}
              {!loading && story?.options.map((option, index) => (
              <Button
                  key={index}
                  onClick={() => handleOptionClick(option)}
                  className="w-full sm:w-auto"
                  variant="outline"
              >
                  {option}
              </Button>
              ))}
            </div>
            {!loading && <Button onClick={restartStory} variant="ghost" size="sm">Reiniciar Historia</Button>}
        </CardFooter>
        </Card>
    </div>
  );
}
