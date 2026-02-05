import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Home, Music, Heart } from 'lucide-react';
import Link from 'next/link';
import { AquariumBackground } from '@/components/AquariumBackground';

export default function CancionesPage() {
  return (
    <div className="relative h-screen w-full overflow-hidden">
      <AquariumBackground />
      <main className="relative z-10 flex flex-col items-center justify-between h-full p-2 sm:p-3 py-3 sm:py-4">
        <div className="text-center flex-shrink-0">
          <div className="flex justify-center items-center gap-2 mb-1">
              <Music className="w-4 h-4 sm:w-5 sm:h-5 text-pink-300" />
              <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-pink-300 fill-pink-300" />
          </div>
          <h1 className="text-lg sm:text-xl md:text-2xl font-headline text-white drop-shadow-lg">Nuestras Canciones</h1>
          <p className="text-xs sm:text-sm text-white/80 mt-0.5">La banda sonora de nuestra historia.</p>
        </div>

        <Card className="w-full max-w-sm md:max-w-lg bg-white/90 backdrop-blur-md shadow-2xl border-pink-200 rounded-xl sm:rounded-2xl flex-shrink min-h-0">
          <CardHeader className="pb-2 pt-3 sm:pt-4">
              <CardTitle className="text-base sm:text-lg text-rose-600 flex items-center gap-2">
                <Music className="w-4 h-4" />
                Para Ti 💕
              </CardTitle>
          </CardHeader>
          <CardContent className="pb-3 sm:pb-4">
              <iframe 
                data-testid="embed-iframe" 
                style={{borderRadius: '12px'}} 
                src="https://open.spotify.com/embed/track/4oHQ8n9OKQ3599e8noCrDX?utm_source=generator" 
                width="100%" 
                height="200" 
                frameBorder="0" 
                allowFullScreen 
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
                loading="lazy"
              />
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
