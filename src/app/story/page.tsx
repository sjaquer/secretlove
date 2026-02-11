import { StoryPlayer } from "@/components/StoryPlayer";
import { Leaf, Waves, Home, Sparkles } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AquariumBackground } from "@/components/AquariumBackground";

export default function StoryPage() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#0d0a14] font-sans selection:bg-pink-500/30">
      <AquariumBackground />
      
      <main className="relative z-10 flex flex-col items-center min-h-screen p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
        
        {/* Header Section */}
        <header className="w-full text-center flex flex-col items-center mb-6 animate-fadeInDown">
            <div className="inline-flex items-center justify-center p-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-4 shadow-lg ring-1 ring-white/10">
                <div className="flex gap-3 text-pink-300">
                    <Leaf className="w-5 h-5 animate-pulse" />
                    <Sparkles className="w-5 h-5 text-yellow-200 animate-spin-slow" />
                    <Waves className="w-5 h-5 animate-bounce-slow" />
                </div>
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-headline text-transparent bg-clip-text bg-gradient-to-r from-pink-200 via-rose-100 to-indigo-200 drop-shadow-sm mb-2">
              Nuestra Historia Infinita
            </h1>
            <p className="text-sm sm:text-base text-blue-100/80 max-w-lg leading-relaxed font-light tracking-wide">
              Un universo tejido con tus palabras y mi imaginación. <br className="hidden sm:block"/>
              ¿A dónde nos llevarán tus decisiones hoy?
            </p>
        </header>

        {/* Story Container */}
        <div className="w-full flex-1 flex flex-col min-h-0 animate-fadeInUp delay-200 mb-8 max-w-4xl mx-auto">
           <StoryPlayer />
        </div>

        {/* Footer Navigation */}
        <footer className="w-full flex justify-center pb-4 sm:pb-0 animate-fadeInUp delay-500">
            <Button asChild variant="ghost" className="text-white/60 hover:text-white hover:bg-white/10 gap-2 rounded-full px-6 py-4 h-auto transition-all duration-300 hover:scale-105">
                <Link href="/">
                    <Home className="w-4 h-4" />
                    <span className="text-sm tracking-wide">Volver al refugio</span>
                </Link>
            </Button>
        </footer>

      </main>
    </div>
  );
}
