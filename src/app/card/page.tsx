import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import { Flower2, Gift, Home } from 'lucide-react';

export default function CardPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 sm:p-8">
       <div className="text-center mb-8">
        <div className="flex justify-center items-center gap-4 mb-2">
            <Gift className="w-8 h-8 text-accent" />
            <Flower2 className="w-8 h-8 text-accent" />
        </div>
        <h1 className="text-4xl font-headline text-primary">Una Tarjeta Digital para Ti</h1>
        <p className="text-lg text-foreground/80 mt-2">Con tus flores favoritas.</p>
      </div>

      <Card className="w-full max-w-lg aspect-[3/4] relative overflow-hidden shadow-2xl border-accent/20 border-4 bg-card/80">
        <Image 
          src="https://placehold.co/600x800.png"
          alt="Hydrangeas background"
          fill
          objectFit="cover"
          className="opacity-20 blur-sm"
          data-ai-hint="hydrangea background"
        />

        <CardContent className="relative z-10 flex flex-col items-center justify-center h-full p-8 text-center">
            <div className="absolute top-4 left-4 transform -rotate-12">
                <Image src="https://placehold.co/150x150.png" width={100} height={100} alt="Hortensia" data-ai-hint="hydrangea flower" className="opacity-80" />
            </div>
            <div className="absolute bottom-4 right-4 transform rotate-12">
                 <Image src="https://placehold.co/120x120.png" width={80} height={80} alt="Baby's breath" data-ai-hint="babys breath" className="opacity-80" />
            </div>

            <div className="space-y-6">
                <h2 className="text-3xl font-headline text-primary-foreground drop-shadow-lg">Para Mi Amor Secreto</h2>
                <p className="text-lg text-primary-foreground/90 drop-shadow-md">
                    Como estas flores, nuestro amor florece en cada estación. Eres mi otoño y mi primavera.
                </p>
                <p className="font-bold text-xl text-primary-foreground drop-shadow-lg">- Tuyo siempre</p>
            </div>
        </CardContent>
      </Card>
      <Button asChild variant="link" className="mt-8 text-foreground/80">
        <Link href="/" className="flex items-center gap-2">
            <Home className="w-4 h-4" />
            Volver al inicio
        </Link>
      </Button>
    </div>
  );
}
