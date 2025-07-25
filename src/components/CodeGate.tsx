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
import { Heart, KeyRound, LockKeyhole, ShieldQuestion } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

const formSchema = z.object({
  code: z.string().min(1, { message: 'El código no puede estar vacío.' }),
});

const LOCAL_STORAGE_KEY = 'unlocked_secret_codes';

export function CodeGate() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [revealClickCount, setRevealClickCount] = useState(0);
  const [unlockedCodes, setUnlockedCodes] = useState<string[]>([]);

  useEffect(() => {
    // This runs only on the client, after hydration
    const storedCodes = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (storedCodes) {
      setUnlockedCodes(JSON.parse(storedCodes));
    }
  }, []);
  
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
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newUnlockedCodes));
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

  const handleHeartClick = () => {
    setRevealClickCount(prev => prev + 1);
  };
  
  const visibleUnlockedCodes = unlockedCodes.filter(code => secretCodes[code]);

  return (
    <Card className="w-full max-w-md bg-card/80 backdrop-blur-sm shadow-2xl">
      <CardHeader className="text-center">
        <Popover open={revealClickCount >= 5} onOpenChange={(isOpen) => !isOpen && setRevealClickCount(0)}>
            <PopoverTrigger asChild>
                <div 
                    className="mx-auto bg-primary/10 p-3 rounded-full mb-4 border border-primary/20 cursor-pointer"
                    onClick={handleHeartClick}
                    title="Un secreto te espera..."
                >
                    <Heart className="h-10 w-10 text-primary" />
                </div>
            </PopoverTrigger>
            <PopoverContent side="top" className="w-80">
                <div className="grid gap-4">
                    <div className="space-y-2">
                        <h4 className="font-medium leading-none">Recuerdos Desbloqueados</h4>
                        <p className="text-sm text-muted-foreground">
                            Aquí están los secretos que hemos descubierto juntos.
                        </p>
                    </div>
                    <div className="grid gap-2">
                        {visibleUnlockedCodes.length > 0 ? (
                            visibleUnlockedCodes.map((code) => (
                                <Link href={secretCodes[code]} key={code} className="group grid grid-cols-[auto_1fr_auto] items-center gap-4 rounded-md p-2 transition-colors hover:bg-accent hover:text-accent-foreground">
                                    <LockKeyhole className="h-4 w-4 text-muted-foreground" />
                                    <span className="font-mono text-sm">{code}</span>
                                    <Button variant="link" size="sm" className="h-auto p-0">Ir</Button>
                                </Link>
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center text-center text-sm text-muted-foreground py-4">
                                <ShieldQuestion className="h-8 w-8 mb-2" />
                                <p>Aún no has desbloqueado ningún recuerdo. ¡La aventura recién comienza!</p>
                            </div>
                        )}
                    </div>
                </div>
            </PopoverContent>
        </Popover>

        <CardTitle className="font-headline text-3xl">Amor Secreto</CardTitle>
        <CardDescription>Un lugar especial solo para nosotros.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Código Secreto</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input 
                        placeholder="Introduce tu código aquí" 
                        {...field}
                        className="pl-10"
                        disabled={loading}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Descubriendo...' : 'Entrar'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
