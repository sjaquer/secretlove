
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Home, Video } from 'lucide-react';
import Link from 'next/link';

export default function VideoPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 sm:p-8">
      <div className="text-center mb-8">
        <div className="flex justify-center items-center gap-4 mb-2">
            <Video className="w-8 h-8 text-accent" />
        </div>
        <h1 className="text-4xl font-headline text-primary">Un Video Para Recordar</h1>
        <p className="text-lg text-foreground/80 mt-2">Un momento especial capturado para ti.</p>
      </div>

      <Card className="w-full max-w-lg bg-card/80 backdrop-blur-sm shadow-xl">
        <CardHeader>
            <CardTitle>Nuestro Momento</CardTitle>
        </CardHeader>
        <CardContent>
            <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                <p className="text-muted-foreground">Próximamente...</p>
            </div>
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
