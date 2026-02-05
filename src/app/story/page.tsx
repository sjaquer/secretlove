import { StoryPlayer } from "@/components/StoryPlayer";
import { Leaf, Waves } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";
import { AquariumBackground } from "@/components/AquariumBackground";

export default function StoryPage() {
  return (
    <div className="relative h-screen w-full overflow-hidden">
      <AquariumBackground />
      <main className="relative z-10 flex flex-col items-center justify-center h-full p-3 sm:p-4 md:p-6 gap-3 md:gap-4">
        <div className="text-center">
            <div className="flex justify-center items-center gap-2 md:gap-3 mb-1">
                <Leaf className="w-5 h-5 md:w-6 md:h-6 text-pink-300" />
                <Waves className="w-5 h-5 md:w-6 md:h-6 text-pink-300" />
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-headline text-white drop-shadow-lg">Miremos algo...</h1>
            <p className="text-xs sm:text-sm md:text-base text-white/80 mt-1 max-w-md mx-auto">Tienes rienda suelta para continuar la historia. No hay restricciones.</p>
        </div>
        <div className="w-full max-w-2xl bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl p-3 md:p-5 max-h-[60vh] overflow-y-auto">
          <StoryPlayer />
        </div>
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
