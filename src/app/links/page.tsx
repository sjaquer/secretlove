import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, Music, Video, Mail, Home } from "lucide-react";
import Link from 'next/link';

const externalLinks = [
  {
    title: "Nuestra Canción",
    description: "La que siempre me recuerda a ti.",
    url: "https://www.example.com", 
    icon: Music,
  },
  {
    title: "Un Video Secreto",
    description: "Un momento que atesoro.",
    url: "https://www.example.com",
    icon: Video,
  },
  {
    title: "Una Carta Digital",
    description: "Palabras que guardo en mi corazón.",
    url: "https://www.example.com",
    icon: Mail,
  },
];

export default function LinksPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 sm:p-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-headline text-primary">Rincones Secretos</h1>
        <p className="text-lg text-foreground/80 mt-2">Pequeños tesoros que nos pertenecen.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-5xl">
        {externalLinks.map((link, index) => {
          const Icon = link.icon;
          return (
            <Card key={index} className="bg-card/80 backdrop-blur-sm shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="bg-accent/20 p-3 rounded-lg">
                    <Icon className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <CardTitle className="font-headline text-xl">{link.title}</CardTitle>
                    <CardDescription>{link.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full">
                  <a href={link.url} target="_blank" rel="noopener noreferrer">
                    Descubrir <ArrowUpRight className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

       <Button asChild variant="link" className="mt-12 text-foreground/80">
        <Link href="/" className="flex items-center gap-2">
            <Home className="w-4 h-4" />
            Volver al inicio
        </Link>
      </Button>
    </div>
  );
}
