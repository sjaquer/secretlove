import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import { Flower2, Gift, Home } from 'lucide-react';
import { AquariumBackground } from '@/components/AquariumBackground';

export default function CardPage() {
  return (
    <div className="relative h-screen w-full overflow-hidden">
      <AquariumBackground />
      <main className="relative z-10 flex flex-col items-center justify-center h-full p-3 sm:p-4 md:p-6 gap-2 md:gap-3">
        <div className="text-center">
          <div className="flex justify-center items-center gap-2 md:gap-3 mb-1">
              <Gift className="w-5 h-5 md:w-6 md:h-6 text-pink-300" />
              <Flower2 className="w-5 h-5 md:w-6 md:h-6 text-pink-300" />
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-headline text-white drop-shadow-lg">Una Tarjeta Digital para Ti</h1>
          <p className="text-xs sm:text-sm md:text-base text-white/80 mt-1">Con tus flores favoritas.</p>
        </div>

        <Card className="w-full max-w-xs md:max-w-md aspect-[3/4] relative overflow-hidden shadow-2xl border-pink-300/40 border-4 bg-gradient-to-br from-pink-100 to-rose-200">
          <Image 
            src="https://placehold.co/600x800.png"
            alt="Hydrangeas background"
            fill
            objectFit="cover"
            className="opacity-25 blur-sm"
            data-ai-hint="hydrangea background"
          />

          <CardContent className="relative z-10 flex flex-col items-center justify-center h-full p-4 md:p-6 text-center">
              <div className="absolute top-2 md:top-3 left-2 md:left-3 transform -rotate-12">
                  <Image src="https://placehold.co/150x150.png" width={80} height={80} alt="Hortensia" data-ai-hint="hydrangea flower" className="opacity-80 w-12 md:w-20" />
              </div>
              <div className="absolute bottom-2 md:bottom-3 right-2 md:right-3 transform rotate-12">
                   <Image src="https://placehold.co/120x120.png" width={60} height={60} alt="Baby's breath" data-ai-hint="babys breath" className="opacity-80 w-10 md:w-16" />
              </div>

              <div className="space-y-3 md:space-y-4">
                  <h2 className="text-xl md:text-2xl font-headline text-rose-700 drop-shadow-sm">Para Mi Amor Secreto</h2>
                  <p className="text-sm md:text-base text-rose-600/90">
                      Como estas flores, nuestro amor florece en cada estación. Eres mi otoño y mi primavera.
                  </p>
                  <p className="font-bold text-base md:text-lg text-rose-700">- Tuyo siempre ❤️</p>
              </div>
          </CardContent>
        </Card>
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
