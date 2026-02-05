"use client";
import React, { useEffect } from 'react';

export default function SpecialCard({ onClose }: { onClose?: () => void }) {
  useEffect(() => {
    // optional: play a little sound or run side effects
  }, []);

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
      <div className="relative w-full max-w-lg bg-gradient-to-b from-[#fff5e6] to-[#ffdede] border-4 border-[#d4af37] p-6 rounded-lg shadow-2xl animate-cardEntry">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-[#5b214b]">Carta Especial</h2>
          <p className="mt-4 text-sm text-[#2b1b2b]">Gracias por completar el rompecabezas. Aquí tienes una carta hecha con cariño.</p>

          <div className="mt-6 bg-white p-4 rounded-md shadow-inner">
            <p className="italic text-sm">"A veces el amor llega en pequeñas piezas... gracias por armarlas conmigo."</p>
            <p className="mt-3 text-xs text-[#5b214b]">— Tu admirador secreto</p>
          </div>

          <button
            onClick={() => onClose && onClose()}
            className="mt-6 bg-[#d4af37] text-[#1a1025] px-4 py-2 rounded font-bold shadow"
          >
            Cerrar carta
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes cardEntry {
          0% { transform: translateY(30px) scale(0.96); opacity: 0 }
          60% { transform: translateY(-8px) scale(1.02); opacity: 1 }
          100% { transform: translateY(0) scale(1); opacity: 1 }
        }
        .animate-cardEntry { animation: cardEntry 700ms cubic-bezier(.2,.9,.3,1); }
      `}</style>
    </div>
  );
}
