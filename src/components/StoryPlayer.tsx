"use client";

import { useState, useEffect } from 'react';
import { generateInteractiveStory, type InteractiveStoryOutput } from '@/ai/flows/generate-interactive-story';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Send } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';


const formSchema = z.object({
  userAction: z.string().min(1, { message: 'Debes escribir una acción.' }).max(100, { message: 'Tu acción debe ser más corta.'}),
});

type FormValues = z.infer<typeof formSchema>;

export function StoryPlayer() {
  const [story, setStory] = useState<InteractiveStoryOutput | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [previousNarrative, setPreviousNarrative] = useState('');
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userAction: '',
    },
  });


  const fetchStory = async (userAction: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await generateInteractiveStory({
        userAction: userAction,
        previousNarrative: previousNarrative,
      });
      setStory(result);
      setPreviousNarrative(result.narrative);
      form.reset();
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

  const onSubmit: SubmitHandler<FormValues> = (data) => {
    fetchStory(data.userAction);
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
                 <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-4">
                        <FormField
                        control={form.control}
                        name="userAction"
                        render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <div className="relative">
                                        <Textarea
                                            placeholder="¿Qué quieres hacer ahora?"
                                            className="pr-20"
                                            disabled={loading}
                                            {...field}
                                        />
                                        <Button 
                                            type="submit" 
                                            size="icon" 
                                            className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-14" 
                                            disabled={loading}
                                        >
                                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Send className="h-4 w-4" /> <span className='sr-only'>Enviar</span></>}
                                        </Button>
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                        />
                    </form>
                </Form>
                {!loading && <Button onClick={restartStory} variant="ghost" size="sm">Reiniciar Historia</Button>}
            </CardFooter>
        </Card>
    </div>
  );
}
