"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { secretCodes } from '@/lib/codes';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Heart, KeyRound } from 'lucide-react';

const formSchema = z.object({
  code: z.string().min(1, { message: 'El código no puede estar vacío.' }),
});

export function CodeGate() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

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

  return (
    <Card className="w-full max-w-md bg-card/80 backdrop-blur-sm shadow-2xl">
      <CardHeader className="text-center">
        <div className="mx-auto bg-primary/10 p-3 rounded-full mb-4 border border-primary/20">
          <Heart className="h-10 w-10 text-primary" />
        </div>
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
