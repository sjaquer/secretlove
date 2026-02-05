import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Home, Music, Heart } from 'lucide-react';
import Link from 'next/link';
import { AquariumBackground } from '@/components/AquariumBackground';

export default function CancionesPage() {
  return (
    <div className="relative h-screen w-full overflow-hidden">
      <AquariumBackground />
      <main className="relative z-10 flex flex-col items-center justify-center h-full p-3 sm:p-4 md:p-6 gap-3 md:gap-4">
        <div className="text-center">
          <div className="flex justify-center items-center gap-2 md:gap-3 mb-1">
              <Music className="w-5 h-5 md:w-6 md:h-6 text-pink-300" />
              <Heart className="w-5 h-5 md:w-6 md:h-6 text-pink-300 fill-pink-300" />
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-headline text-white drop-shadow-lg">Nuestras Canciones</h1>
          <p className="text-xs sm:text-sm md:text-base text-white/80 mt-1">La banda sonora de nuestra historia.</p>
        </div>

        <Card className="w-full max-w-sm md:max-w-lg bg-white/90 backdrop-blur-md shadow-2xl border-pink-200 rounded-2xl">
          <CardHeader className="pb-2 pt-4">
              <CardTitle className="text-lg md:text-xl text-rose-600 flex items-center gap-2">
                <Music className="w-4 h-4 md:w-5 md:h-5" />
                Para Ti 💕
              </CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
              <iframe 
                data-testid="embed-iframe" 
                style={{borderRadius: '12px'}} 
                src="https://open.spotify.com/embed/track/4oHQ8n9OKQ3599e8noCrDX?utm_source=generator" 
                width="100%" 
                height="240" 
                frameBorder="0" 
                allowFullScreen 
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
                loading="lazy"
              />
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
