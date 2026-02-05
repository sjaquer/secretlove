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
      <main className="relative z-10 flex flex-col items-center justify-between h-full p-2 sm:p-3 py-3 sm:py-4">
        <div className="text-center flex-shrink-0">
          <div className="flex justify-center items-center gap-2 mb-1">
              <Gift className="w-4 h-4 sm:w-5 sm:h-5 text-pink-300" />
              <Flower2 className="w-4 h-4 sm:w-5 sm:h-5 text-pink-300" />
          </div>
          <h1 className="text-lg sm:text-xl md:text-2xl font-headline text-white drop-shadow-lg">Una Tarjeta Digital para Ti</h1>
          <p className="text-xs sm:text-sm text-white/80 mt-0.5">Con tus flores favoritas.</p>
        </div>

        <Card className="w-full max-w-xs sm:max-w-sm aspect-[3/4] relative overflow-hidden shadow-2xl border-pink-300/40 border-2 sm:border-4 bg-gradient-to-br from-pink-100 to-rose-200 flex-shrink min-h-0">
          <Image 
            src="https://placehold.co/600x800.png"
            alt="Hydrangeas background"
            fill
            objectFit="cover"
            className="opacity-25 blur-sm"
            data-ai-hint="hydrangea background"
          />

          <CardContent className="relative z-10 flex flex-col items-center justify-center h-full p-3 sm:p-4 md:p-6 text-center">
              <div className="absolute top-2 left-2 transform -rotate-12">
                  <Image src="https://placehold.co/150x150.png" width={80} height={80} alt="Hortensia" data-ai-hint="hydrangea flower" className="opacity-80 w-10 sm:w-12 md:w-16" />
              </div>
              <div className="absolute bottom-2 right-2 transform rotate-12">
                   <Image src="https://placehold.co/120x120.png" width={60} height={60} alt="Baby's breath" data-ai-hint="babys breath" className="opacity-80 w-8 sm:w-10 md:w-14" />
              </div>

              <div className="space-y-2 sm:space-y-3">
                  <h2 className="text-base sm:text-lg md:text-xl font-headline text-rose-700 drop-shadow-sm">Para Mi Amor Secreto</h2>
                  <p className="text-xs sm:text-sm md:text-base text-rose-600/90">
                      Como estas flores, nuestro amor florece en cada estación. Eres mi otoño y mi primavera.
                  </p>
                  <p className="font-bold text-sm sm:text-base text-rose-700">- Tuyo siempre ❤️</p>
              </div>
          </CardContent>
        </Card>
        <Button asChild variant="ghost" size="sm" className="text-white hover:bg-white/20 hover:text-white flex-shrink-0">
          <Link href="/" className="flex items-center gap-1.5">
              <Home className="w-3.5 h-3.5" />
              <span className="text-xs sm:text-sm">Volver al inicio</span>
          </Link>
        </Button>
      </main>
    </div>
  );
}
