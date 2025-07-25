import { StoryPlayer } from "@/components/StoryPlayer";
import { Leaf, Waves } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

export default function StoryPage() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      <div className="absolute inset-0 z-0">
          <div className="absolute top-1/4 left-1/4 h-32 w-32 bg-accent/10 rounded-full animate-pulse blur-2xl"></div>
          <div className="absolute bottom-1/4 right-1/4 h-32 w-32 bg-primary/10 rounded-full animate-pulse delay-1000 blur-2xl"></div>
      </div>
      <main className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4 sm:p-8">
        <div className="text-center mb-8">
            <div className="flex justify-center items-center gap-4 mb-2">
                <Leaf className="w-8 h-8 text-accent" />
                <Waves className="w-8 h-8 text-accent" />
            </div>
            <h1 className="text-4xl font-headline text-primary">Nuestra Historia Interactiva</h1>
            <p className="text-lg text-foreground/80 mt-2">Elige el camino y veamos a dónde nos lleva.</p>
        </div>
        <StoryPlayer />
        <Button asChild variant="link" className="mt-8 text-foreground/80">
            <Link href="/" className="flex items-center gap-2">
                <Home className="w-4 h-4" />
                Volver al inicio
            </Link>
        </Button>
      </main>
    </div>
  );
}
