
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { secretCodes } from '@/lib/codes';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Heart, KeyRound, BookHeart, Music, Video, Mail, Puzzle, BookOpen, ArrowRight, Gamepad2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Countdown } from './Countdown';

const formSchema = z.object({
  code: z.string().min(1, { message: 'El código no puede estar vacío.' }),
});

const UNLOCKED_CODES_KEY = 'unlocked_secret_codes';
const COUNTDOWN_TARGET_DATE_KEY = 'countdown_target_date';
const COUNTDOWN_COMPLETED_KEY = 'countdown_completed';
const GAME_CODE = 'NUNTIUS AD DILECTUM MEUM';

// Metadata de cada código con descripción e ícono
const codeMetadata: Record<string, { description: string; icon: any }> = {
  'OTOÑO': { description: 'Historia interactiva generada con IA', icon: BookOpen },
  'AMOR': { description: 'Rompecabezas de una imagen especial', icon: Puzzle },
  'TODO MAL SIN TI': { description: 'Carta de amor con poema', icon: BookHeart },
  'CANCION': { description: 'Playlist de canciones especiales', icon: Music },
  'TAMMV': { description: 'Video especial', icon: Video },
  'NUNTIUS AD DILECTUM MEUM': { description: 'La Búsqueda de los Tulipanes - Juego', icon: Gamepad2 },
};

export function CodeGate() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [unlockedCodes, setUnlockedCodes] = useState<string[]>([]);
  const [targetDate, setTargetDate] = useState<Date | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [countdownCompleted, setCountdownCompleted] = useState(false);
  const [showCodeReveal, setShowCodeReveal] = useState(false);

  useEffect(() => {
    // This runs only on the client, after hydration
    const storedCodes = localStorage.getItem(UNLOCKED_CODES_KEY);
    if (storedCodes) {
      setUnlockedCodes(JSON.parse(storedCodes));
    }

    // Verificar si la cuenta regresiva ya terminó
    const completed = localStorage.getItem(COUNTDOWN_COMPLETED_KEY);
    if (completed === 'true') {
      setCountdownCompleted(true);
    }

    // Fecha fija para el 14 de febrero de 2026
    const valentinesDay = new Date('2026-02-14T00:00:00');
    setTargetDate(valentinesDay);
    
    // Verificar si ya pasó la fecha
    if (new Date() >= valentinesDay) {
      setCountdownCompleted(true);
      localStorage.setItem(COUNTDOWN_COMPLETED_KEY, 'true');
    }
  }, []);

  const handleCountdownComplete = () => {
    setCountdownCompleted(true);
    localStorage.setItem(COUNTDOWN_COMPLETED_KEY, 'true');
    setShowCodeReveal(true);
    
    toast({
      title: "¡Ha llegado el momento! 💝",
      description: "El código secreto ha sido revelado...",
      className: "bg-gradient-to-r from-pink-50 to-rose-50 border-pink-300",
      duration: 5000,
    });
  };
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: '',
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    const upperCaseCode = values.code.toUpperCase();
    
    if (secretCodes[upperCaseCode]) {
      // Add to unlocked list if not already present
      if (!unlockedCodes.includes(upperCaseCode)) {
        const newUnlockedCodes = [...unlockedCodes, upperCaseCode];
        setUnlockedCodes(newUnlockedCodes);
        localStorage.setItem(UNLOCKED_CODES_KEY, JSON.stringify(newUnlockedCodes));
        
        toast({
          title: "¡Código Desbloqueado! 💖",
          description: `Has descubierto: ${codeMetadata[upperCaseCode]?.description || 'Un nuevo secreto'}`,
          className: "bg-gradient-to-r from-pink-50 to-rose-50 border-pink-300",
        });
      }
      router.push(secretCodes[upperCaseCode]);
    } else {
      toast({
        variant: "destructive",
        title: "Código Incorrecto",
        description: "Inténtalo de nuevo, mi amor.",
      });
      form.reset();
      setLoading(false);
    }
  }

  const visibleUnlockedCodes = unlockedCodes.filter(code => secretCodes[code]);

  return (
    <Card className="w-full max-w-md bg-gradient-to-br from-white/95 to-pink-50/95 backdrop-blur-md shadow-2xl border-2 border-pink-200/50 hover:shadow-pink-200/50 transition-all duration-300">
      <CardHeader className="text-center space-y-4">
         {targetDate && !countdownCompleted && <Countdown targetDate={targetDate} onComplete={handleCountdownComplete} />}
         
         {countdownCompleted && (
           <div className={`transition-all duration-1000 ${showCodeReveal ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
             <div className="bg-gradient-to-br from-pink-100 via-rose-100 to-red-100 p-6 rounded-xl border-2 border-pink-300 shadow-lg mb-4">
               <div className="text-center space-y-3">
                 <div className="flex justify-center">
                   <Gamepad2 className="h-12 w-12 text-pink-600 animate-bounce" />
                 </div>
                 <p className="text-sm font-semibold text-pink-800">¡El código ha sido revelado!</p>
                 <div className="bg-white/80 px-4 py-3 rounded-lg border-2 border-pink-200">
                   <p className="font-mono text-lg font-bold text-pink-600 tracking-wider">{GAME_CODE}</p>
                 </div>
                 <p className="text-xs text-pink-700">Úsalo para acceder al juego especial 🎮</p>
               </div>
             </div>
           </div>
         )}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
                <div 
                    className="mx-auto bg-gradient-to-br from-pink-100 to-red-100 p-4 rounded-full mb-2 border-2 border-pink-300 cursor-pointer hover:scale-110 transition-transform duration-300 shadow-lg hover:shadow-pink-300/50 active:scale-95 group relative"
                    title="Haz click para ver tus recuerdos desbloqueados..."
                >
                    <Heart className="h-12 w-12 text-red-500 fill-red-500 animate-pulse" />
                    {visibleUnlockedCodes.length > 0 && (
                      <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center border-2 border-white shadow-md animate-bounce">
                        {visibleUnlockedCodes.length}
                      </div>
                    )}
                </div>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] bg-gradient-to-br from-white via-pink-50/50 to-rose-50/50 border-2 border-pink-200">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-headline bg-gradient-to-r from-pink-600 to-red-600 bg-clip-text text-transparent flex items-center gap-2 justify-center">
                        <Heart className="h-6 w-6 fill-pink-500 text-pink-500" />
                        Recuerdos Desbloqueados
                    </DialogTitle>
                    <DialogDescription className="text-center text-gray-600">
                        Los secretos que hemos descubierto juntos 💕
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4 max-h-[400px] overflow-y-auto pr-2">
                    {visibleUnlockedCodes.length > 0 ? (
                        visibleUnlockedCodes.map((code) => {
                          const Icon = codeMetadata[code]?.icon || BookHeart;
                          const destination = secretCodes[code];
                          return (
                            <button
                              key={code}
                              onClick={() => {
                                setDialogOpen(false);
                                router.push(destination);
                              }}
                              className="group relative overflow-hidden rounded-xl border-2 border-pink-200 bg-white/95 hover:bg-gradient-to-br hover:from-pink-50 hover:to-rose-50 hover:border-pink-300 hover:shadow-lg transition-all duration-300 p-4 hover:scale-[1.02] cursor-pointer w-full text-left"
                            >
                              <div className="flex items-center gap-4 h-full">
                                <div className="bg-gradient-to-br from-pink-100 to-red-100 p-3 rounded-xl group-hover:scale-110 transition-transform duration-300 shadow-sm flex-shrink-0 flex items-center justify-center w-12 h-12">
                                  <Icon className="h-6 w-6 text-pink-600" />
                                </div>
                                <div className="flex-1 flex flex-col justify-center min-w-0 py-1">
                                  <div className="font-mono text-base font-bold text-pink-700 mb-0.5 truncate tracking-tight">{code}</div>
                                  <div className="text-sm text-gray-600 leading-snug line-clamp-2">{codeMetadata[code]?.description}</div>
                                </div>
                                <ArrowRight className="h-5 w-5 text-pink-400 group-hover:translate-x-1 transition-transform duration-300 flex-shrink-0 ml-2" />
                              </div>
                            </button>
                          );
                        })
                    ) : (
                        <div className="flex flex-col items-center justify-center text-center py-8 px-4">
                            <div className="bg-gradient-to-br from-pink-100 to-red-100 p-6 rounded-full mb-4">
                              <Heart className="h-12 w-12 text-pink-400" />
                            </div>
                            <p className="font-semibold text-gray-700 mb-2">Aún no has desbloqueado ningún recuerdo.</p>
                            <p className="text-sm text-gray-500">¡La aventura recién comienza! 🎉</p>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>

        <CardTitle className="font-headline text-4xl md:text-5xl bg-gradient-to-r from-pink-600 to-red-600 bg-clip-text text-transparent">Amor Secreto</CardTitle>
        <CardDescription className="text-base text-gray-600">Un lugar especial solo para nosotros 💕</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold text-gray-700">Código Secreto</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-pink-500" />
                      <Input 
                        placeholder="Introduce tu código aquí" 
                        {...field}
                        className="pl-10 h-12 border-2 border-pink-200 focus:border-pink-400 focus:ring-pink-300 rounded-lg text-base"
                        disabled={loading}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full h-12 text-base font-semibold bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 shadow-lg hover:shadow-pink-300/50 transition-all duration-300" disabled={loading}>
              {loading ? 'Descubriendo... 💖' : 'Entrar ✨'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
