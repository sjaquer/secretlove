"use client";

import { useState, useEffect, useRef } from 'react';
import { generateInteractiveStory, type InteractiveStoryOutput } from '@/ai/flows/generate-interactive-story';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Send, Sparkles, RefreshCcw, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import Link from 'next/link';

const formSchema = z.object({
  userAction: z.string().min(1, { message: 'Inspiramé...' }).max(150, { message: 'Mantenlo breve y dulce.' }),
});

type FormValues = z.infer<typeof formSchema>;

// Función para parsear y formatear la narrativa
function parseNarrative(narrative: string) {
  const sections = narrative.split(/\n\s*\n/); // Separar por dobles saltos de línea
  const paragraphs: string[] = [];
  const options: string[] = [];
  let isOptionSection = false;

  for (let section of sections) {
    section = section.trim();
    if (!section) continue;

    // Detectar si llegamos a la sección de opciones
    if (section.toLowerCase().includes('opciones para la tortuga:')) {
      isOptionSection = true;
      continue;
    }

    if (isOptionSection) {
      // Parsear opciones numeradas
      const lines = section.split('\n').map(line => line.trim()).filter(line => line);
      for (const line of lines) {
        if (line.match(/^\d+\./)) {
          options.push(line);
        }
      }
    } else {
      // Es un párrafo de narrativa
      paragraphs.push(section);
    }
  }

  return { paragraphs, options };
}

export function StoryPlayer() {
  const [story, setStory] = useState<InteractiveStoryOutput | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [previousNarrative, setPreviousNarrative] = useState('');
    const [hasEnded, setHasEnded] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userAction: '',
    },
  });

  const fetchStory = async (userAction: string, isRestart = false) => {
    setLoading(true);
    setError(null);
    try {
            const history = isRestart ? '' : previousNarrative;
      const result = await generateInteractiveStory({
                userAction: userAction,
                previousNarrative: history,
      });
      setStory(result);
            const combinedNarrative = history
                ? `${history}\n\n${result.narrative}`
                : result.narrative;
            setPreviousNarrative(combinedNarrative);
            const trimmed = result.narrative.trim();
            const isEnd = trimmed === 'FIN' || trimmed.endsWith('\nFIN') || trimmed.endsWith(' FIN');
            setHasEnded(isEnd);
      form.reset();
    } catch (e) {
      console.error(e);
      setError('La magia falló momentáneamente. Inténtalo de nuevo.');
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
    setStory(null);
        setHasEnded(false);
    fetchStory('Comenzar una nueva historia mágica', true);
  }

  // Auto-scroll to bottom of story content
  useEffect(() => {
    if (story && scrollRef.current) {
        // Small delay to ensure render
        setTimeout(() => {
            if (scrollRef.current) {
                scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
            }
        }, 100);
    }
  }, [story]);

  return (
    <div className="w-full h-full flex flex-col relative">
        {/* Book Container */}
        <div className="relative flex flex-col flex-1 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/40 overflow-hidden group transition-all duration-500 hover:shadow-[0_20px_60px_-15px_rgba(255,255,255,0.3)]">
            
            {/* Header / Loading State */}
            <div className="h-1 bg-gradient-to-r from-pink-300 via-purple-300 to-indigo-300 w-full" />
            
            {/* Content Area */}
            <div 
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-6 sm:p-8 md:p-10 scroll-smooth custom-scrollbar"
            >
                {/* Initial Loading */}
                {loading && !story && (
                    <div className="flex flex-col items-center justify-center h-full space-y-6 animate-pulse">
                        <div className="relative">
                             <div className="absolute inset-0 bg-pink-400 blur-xl opacity-20 rounded-full animate-ping-slow"></div>
                             <BookOpen className="h-12 w-12 text-pink-400 relative z-10" />
                        </div>
                        <p className="text-pink-800/60 text-sm font-medium tracking-widest uppercase">Escribiendo los astros...</p>
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className="flex flex-col items-center justify-center h-full text-center p-6 bg-red-50/50 rounded-xl border border-red-100">
                        <p className="text-red-400 font-medium mb-4">{error}</p>
                        <Button 
                            onClick={() => fetchStory(form.getValues().userAction || 'Continuar')} 
                            variant="outline" 
                            className="border-red-200 text-red-500 hover:bg-red-50 hover:text-red-600"
                        >
                            Reintentar
                        </Button>
                    </div>
                )}

                {/* Narrative Content */}
                {story?.narrative && !error && (
                    <div className="prose prose-pink max-w-none">
                        <div className={`transition-all duration-700 ${loading ? 'opacity-50 blur-[1px]' : 'opacity-100 blur-0'}`}>
                            {(() => {
                                const { paragraphs, options } = parseNarrative(story.narrative);
                                
                                return (
                                    <>
                                        {/* Párrafos de narrativa */}
                                        {paragraphs.map((paragraph, index) => (
                                            <div key={index} className="mb-6">
                                                <p className={`text-lg sm:text-xl leading-relaxed font-serif text-slate-700 ${
                                                    index === 0 
                                                        ? 'first-letter:float-left first-letter:text-4xl first-letter:pr-2 first-letter:font-black first-letter:text-pink-400/80 first-letter:leading-none' 
                                                        : ''
                                                }`}>
                                                    {paragraph}
                                                </p>
                                            </div>
                                        ))}

                                        {/* Opciones para la tortuga */}
                                        {options.length > 0 && (
                                            <div className="mt-8 pt-6 border-t border-pink-100/50">
                                                <h3 className="text-base font-semibold text-pink-600/80 mb-4 tracking-wide">
                                                    Opciones para la tortuga:
                                                </h3>
                                                <div className="space-y-3">
                                                    {options.map((option, index) => (
                                                        <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-pink-50/30 border border-pink-100/40 hover:bg-pink-50/50 transition-colors">
                                                            <span className="flex-shrink-0 w-6 h-6 bg-pink-200/60 text-pink-700 text-sm font-bold rounded-full flex items-center justify-center">
                                                                {option.match(/^(\d+)/)?.[1] || (index + 1)}
                                                            </span>
                                                            <p className="text-base text-slate-600 leading-relaxed">
                                                                {option.replace(/^\d+\.\s*/, '')}
                                                            </p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </>
                                );
                            })()}
                        </div>
                        {loading && (
                            <div className="flex items-center gap-2 mt-6 text-pink-300/60 animate-pulse">
                                <Sparkles className="w-4 h-4" />
                                <span className="text-xs italic">La historia continúa...</span>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Input Area */}
            <div className="relative p-4 sm:p-6 bg-gradient-to-t from-white via-white to-white/50 border-t border-pink-100/50 backdrop-blur-sm">
                 <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="w-full relative group/input">
                        <FormField
                        control={form.control}
                        name="userAction"
                        render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <div className="relative shadow-sm rounded-xl transition-shadow duration-300 focus-within:shadow-md focus-within:ring-2 focus-within:ring-pink-100">
                                        <Textarea
                                            placeholder="¿Qué quieres hacer ahora? (ej. explorar el bosque, hablar con ella...)"
                                            className="pr-14 sm:pr-20 py-4 pl-5 text-base min-h-[70px] resize-none border-pink-100 bg-pink-50/30 focus:bg-white focus:border-pink-300 rounded-xl transition-all placeholder:text-pink-300/70 text-slate-700"
                                            disabled={loading || hasEnded}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' && !e.shiftKey) {
                                                    e.preventDefault();
                                                    form.handleSubmit(onSubmit)();
                                                }
                                            }}
                                            {...field}
                                        />
                                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                                            <Button 
                                                type="submit" 
                                                size="icon" 
                                                className={cn(
                                                    "h-10 w-10 transition-all duration-300 shadow-sm",
                                                    loading ? "opacity-50 scale-95" : "bg-gradient-to-r from-pink-400 to-rose-400 hover:from-pink-500 hover:to-rose-500 scale-100"
                                                )}
                                                disabled={loading || hasEnded || !field.value.trim()}
                                            >
                                                {loading ? <Loader2 className="h-5 w-5 animate-spin text-white" /> : <Send className="h-5 w-5 text-white ml-0.5" />}
                                                <span className='sr-only'>Enviar</span>
                                            </Button>
                                        </div>
                                    </div>
                                </FormControl>
                                <FormMessage className="text-xs text-pink-500 absolute -bottom-5 left-2" />
                            </FormItem>
                        )}
                        />
                    </form>
                </Form>
                
                {/* Secondary Actions */}
                <div className="absolute top-4 right-4 sm:top-6 sm:right-6 -translate-y-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none group-hover:pointer-events-auto">
                    {!loading && story && (
                        <Button 
                            onClick={restartStory} 
                            variant="secondary" 
                            size="sm" 
                            className="bg-white/80 backdrop-blur text-xs text-slate-500 hover:text-pink-600 hover:bg-white shadow-sm gap-1.5 h-8 px-3 rounded-full border border-slate-100"
                        >
                            <RefreshCcw className="w-3 h-3" />
                            Reiniciar
                        </Button>
                    )}
                </div>
            </div>
        </div>
                {hasEnded && (
                    <div className="mt-4 flex flex-col items-center gap-2 text-center">
                        <div className="px-4 py-2 rounded-full border border-pink-200/60 bg-pink-50/40 text-pink-500 text-xs tracking-[0.35em] uppercase font-semibold">
                            FIN
                        </div>
                        <p className="text-xs sm:text-sm text-pink-100/80 max-w-sm">
                            La historia ha llegado a su final bonito. Puedes volver al refugio cuando quieras.
                        </p>
                        <Button
                            asChild
                            variant="ghost"
                            className="mt-1 text-white/80 hover:text-white hover:bg-white/10 rounded-full px-5 py-2 h-auto text-xs sm:text-sm"
                        >
                            <Link href="/">
                                Volver al refugio
                            </Link>
                        </Button>
                    </div>
                )}
        
        <style jsx global>{`
           .custom-scrollbar::-webkit-scrollbar {
               width: 6px;
           }
           .custom-scrollbar::-webkit-scrollbar-track {
               background: transparent;
           }
           .custom-scrollbar::-webkit-scrollbar-thumb {
               background-color: rgba(244, 114, 182, 0.2);
               border-radius: 10px;
           }
           .custom-scrollbar::-webkit-scrollbar-thumb:hover {
               background-color: rgba(244, 114, 182, 0.4);
           }
        `}</style>
    </div>
  );
}
