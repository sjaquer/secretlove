import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Home, Music } from 'lucide-react';
import Link from 'next/link';

export default function CancionesPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 sm:p-8">
      <div className="text-center mb-8">
        <div className="flex justify-center items-center gap-4 mb-2">
            <Music className="w-8 h-8 text-accent" />
        </div>
        <h1 className="text-4xl font-headline text-primary">Nuestras Canciones</h1>
        <p className="text-lg text-foreground/80 mt-2">La banda sonora de nuestra historia.</p>
      </div>

      <Card className="w-full max-w-lg bg-card/80 backdrop-blur-sm shadow-xl">
        <CardHeader>
            <CardTitle>Para Ti</CardTitle>
        </CardHeader>
        <CardContent>
            <iframe data-testid="embed-iframe" style={{borderRadius: '12px'}} src="https://open.spotify.com/embed/track/4oHQ8n9OKQ3599e8noCrDX?utm_source=generator" width="100%" height="352" frameBorder="0" allowFullScreen allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>
        </CardContent>
      </Card>

      <Button asChild variant="link" className="mt-12 text-foreground/80">
        <Link href="/" className="flex items-center gap-2">
            <Home className="w-4 h-4" />
            Volver al inicio
        </Link>
      </Button>
    </div>
  );
}
