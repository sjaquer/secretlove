
"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

interface Bubble {
  id: number;
  style: React.CSSProperties;
}

export function AquariumBackground() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [bubbles, setBubbles] = useState<Bubble[]>([]);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      const { clientX, clientY } = event;
      const x = (clientX / window.innerWidth) * 2 - 1;
      const y = (clientY / window.innerHeight) * 2 - 1;
      setMousePos({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Generate bubbles only on the client-side
    const generatedBubbles = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      style: {
        left: `${Math.random() * 100}%`,
        animation: `bubbles ${8 + Math.random() * 15}s linear ${Math.random() * 8}s infinite`,
        width: `${5 + Math.random() * 20}px`,
        height: `${5 + Math.random() * 20}px`,
      },
    }));
    setBubbles(generatedBubbles);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const parallaxStyle = (factor: number) => ({
    transform: `translateX(${mousePos.x * factor}px) translateY(${mousePos.y * factor}px)`,
    transition: 'transform 0.2s ease-out',
  });

  return (
    <div className="absolute inset-0 -z-10 h-full w-full overflow-hidden bg-gradient-to-b from-[#005c9d] via-[#007cb0] to-[#2da8d1]">
      {/* Light Rays */}
       <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[200%] h-[150%] bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.2)_0%,rgba(255,255,255,0)_60%)]"></div>

      {/* Bubbles */}
      {bubbles.map((bubble) => (
        <div
          key={bubble.id}
          className="absolute bottom-0 rounded-full bg-white/20"
          style={bubble.style}
        />
      ))}

      {/* Background Fish Silhouette Layer */}
      <div style={parallaxStyle(5)} className="absolute inset-0">
          <Image src="https://placehold.co/300x150.png" alt="fish school silhouette" width={300} height={150} data-ai-hint="fish school" className="absolute top-[15%] left-[5%] opacity-10 blur-sm" />
          <Image src="https://placehold.co/200x100.png" alt="fish school silhouette" width={200} height={100} data-ai-hint="swimming fish" className="absolute top-[25%] right-[10%] opacity-10 blur-sm" />
      </div>

      {/* Parallax Layer 1 (Far) */}
      <div style={parallaxStyle(15)} className="absolute inset-0">
        <Image src="https://placehold.co/300x300.png" alt="Purple Coral" width={300} height={300} data-ai-hint="purple coral" className="absolute bottom-0 left-0 opacity-70 animate-[float_18s_ease-in-out_2s_infinite]" />
        <Image src="https://placehold.co/350x250.png" alt="Rock Arch" width={350} height={250} data-ai-hint="underwater rock arch" className="absolute bottom-0 right-[15%] opacity-80" />
      </div>
      
      {/* Parallax Layer 2 (Mid) */}
      <div style={parallaxStyle(30)} className="absolute inset-0">
         <Image src="https://placehold.co/200x200.png" alt="Orange Fish School" width={200} height={200} data-ai-hint="orange fish school" className="absolute top-[20%] left-[15%] opacity-90 animate-[float-reverse_20s_ease-in-out_infinite]" />
         <Image src="https://placehold.co/150x150.png" alt="Pink Coral" width={150} height={150} data-ai-hint="pink coral" className="absolute bottom-[5%] right-[5%] opacity-80 animate-[float_15s_ease-in-out_1s_infinite]" />
         <Image src="https://placehold.co/90x90.png" alt="Clownfish" width={90} height={90} data-ai-hint="cartoon clownfish" className="absolute top-1/2 right-1/3 opacity-95 animate-[float_10s_ease-in-out_1s_infinite]" />
      </div>
       
      {/* Parallax Layer 3 (Front) */}
      <div style={parallaxStyle(50)} className="absolute inset-0">
        <Image src="https://placehold.co/180x180.png" alt="Orange Coral" width={180} height={180} data-ai-hint="orange coral reef" className="absolute bottom-0 left-[25%] opacity-90 animate-[float_12s_ease-in-out_infinite]" />
        <Image src="https://placehold.co/80x80.png" alt="Crab" width={80} height={80} data-ai-hint="cartoon crab" className="absolute bottom-2 left-[10%] opacity-90" />
        <Image src="https://placehold.co/120x120.png" alt="Green Seaweed" width={120} height={120} data-ai-hint="green seaweed" className="absolute bottom-0 right-[40%] opacity-85" />
      </div>

      {/* Sandy bottom */}
      <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-[#e0cda9] to-transparent"></div>
    </div>
  );
}
