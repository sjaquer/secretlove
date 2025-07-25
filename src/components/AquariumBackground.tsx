"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

export function AquariumBackground() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      const { clientX, clientY } = event;
      const x = (clientX / window.innerWidth) * 2 - 1;
      const y = (clientY / window.innerHeight) * 2 - 1;
      setMousePos({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const parallaxStyle = (factor: number) => ({
    transform: `translateX(${mousePos.x * factor}px) translateY(${mousePos.y * factor}px)`,
    transition: 'transform 0.2s ease-out',
  });

  return (
    <div className="absolute inset-0 -z-10 h-full w-full overflow-hidden bg-gradient-to-br from-blue-200 via-cyan-200 to-blue-300">
      {/* Bubbles */}
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          className="absolute bottom-0 h-4 w-4 rounded-full bg-white/30"
          style={{
            left: `${Math.random() * 100}%`,
            animation: `bubbles ${5 + Math.random() * 10}s linear ${Math.random() * 5}s infinite`,
            width: `${5 + Math.random() * 15}px`,
            height: `${5 + Math.random() * 15}px`,
          }}
        />
      ))}

      {/* Parallax Layers */}
      <div style={parallaxStyle(10)} className="absolute inset-0">
        <Image src="https://placehold.co/200x200.png" alt="Anemone" width={150} height={150} data-ai-hint="sea anemone" className="absolute bottom-5 left-10 opacity-70 animate-[float_10s_ease-in-out_infinite]" />
        <Image src="https://placehold.co/150x150.png" alt="Coral" width={100} height={100} data-ai-hint="coral reef" className="absolute bottom-2 right-2/3 opacity-60 animate-[float_12s_ease-in-out_2s_infinite]" />
      </div>

      <div style={parallaxStyle(25)} className="absolute inset-0">
         <Image src="https://placehold.co/250x250.png" alt="Sea Turtle" width={200} height={200} data-ai-hint="sea turtle" className="absolute top-1/4 right-10 opacity-80 animate-[float_15s_ease-in-out_infinite]" />
         <Image src="https://placehold.co/120x120.png" alt="Clownfish" width={80} height={80} data-ai-hint="clownfish swimming" className="absolute top-1/2 left-20 opacity-90 animate-[float-reverse_8s_ease-in-out_1s_infinite]" />
      </div>
       
      <div style={parallaxStyle(40)} className="absolute inset-0">
        <Image src="https://placehold.co/100x100.png" alt="Angelfish" width={70} height={70} data-ai-hint="angelfish cartoon" className="absolute bottom-1/3 left-1/3 opacity-80 animate-[float_9s_ease-in-out_3s_infinite]" />
        <Image src="https://placehold.co/150x150.png" alt="Jellyfish" width={90} height={90} data-ai-hint="glowing jellyfish" className="absolute top-1/2 right-1/4 opacity-70 animate-[float_13s_ease-in-out_infinite]" />
      </div>

      {/* Vignette/Overlay */}
      <div className="absolute inset-0 bg-black/10 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
    </div>
  );
}
