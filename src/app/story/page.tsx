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
      <main className="relative z-10 flex flex-col items-center justify-between h-full p-2 sm:p-3 py-3 sm:py-4">
        <div className="text-center flex-shrink-0">
            <div className="flex justify-center items-center gap-2 mb-1">
                <Leaf className="w-4 h-4 sm:w-5 sm:h-5 text-pink-300" />
                <Waves className="w-4 h-4 sm:w-5 sm:h-5 text-pink-300" />
            </div>
            <h1 className="text-lg sm:text-xl md:text-2xl font-headline text-white drop-shadow-lg">Miremos algo...</h1>
            <p className="text-xs sm:text-sm text-white/80 mt-0.5 max-w-md mx-auto px-2">Tienes rienda suelta para continuar la historia.</p>
        </div>
        <div className="w-full max-w-2xl bg-white/90 backdrop-blur-md rounded-xl sm:rounded-2xl shadow-2xl p-2 sm:p-3 flex-1 overflow-hidden flex flex-col min-h-0">
          <div className="overflow-y-auto flex-1">
            <StoryPlayer />
          </div>
        </div>
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
