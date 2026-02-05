


"use client";
import React, { useEffect, useRef, useState } from 'react';

interface Tile {
  sx: number;      // source x in image
  sy: number;      // source y in image
  slotX: number;   // current slot column
  slotY: number;   // current slot row
  correctX: number; // correct slot column
  correctY: number; // correct slot row
  w: number;
  h: number;
  index: number;
}

export default function AmorPuzzle({ onComplete }: { onComplete: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [cols] = useState(3);
  const [rows] = useState(3);
  const [tiles, setTiles] = useState<Tile[]>([]);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const dragging = useRef<number | null>(null);
  const dragOffset = useRef({ x: 0, y: 0 });
  const dragPos = useRef({ x: 0, y: 0 });
  const tileSize = useRef({ w: 0, h: 0 });
  const canvasSize = useRef({ w: 0, h: 0 });

  useEffect(() => {
    const img = new Image();
    img.src = '/amor.png';
    img.onload = () => {
      imgRef.current = img;
      initTiles(img);
    };
    img.onerror = () => {
      console.error('Error cargando imagen /amor.png - asegúrate de que existe en public/');
    };
  }, []);

  function initTiles(img: HTMLImageElement) {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    
    // Responsive canvas size - fit in viewport
    const maxW = Math.min(500, window.innerWidth - 60);
    const maxH = window.innerHeight - 280; // Reserve space for header, instructions, button
    const scaleW = maxW / img.width;
    const scaleH = maxH / img.height;
    const scale = Math.min(1, scaleW, scaleH);
    const w = Math.floor(img.width * scale);
    const h = Math.floor(img.height * scale);
    canvas.width = w;
    canvas.height = h;
    canvasSize.current = { w, h };

    const tileW = Math.floor(w / cols);
    const tileH = Math.floor(h / rows);
    tileSize.current = { w: tileW, h: tileH };

    // Create tiles with correct positions
    const baseTiles: Tile[] = [];
    let idx = 0;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        baseTiles.push({
          sx: c * tileW,
          sy: r * tileH,
          slotX: c,
          slotY: r,
          correctX: c,
          correctY: r,
          w: tileW,
          h: tileH,
          index: idx,
        });
        idx++;
      }
    }

    // Shuffle: assign random slots
    const usedSlots = new Set<string>();
    const shuffled = baseTiles.map((tile) => {
      let slotX, slotY;
      do {
        slotX = Math.floor(Math.random() * cols);
        slotY = Math.floor(Math.random() * rows);
      } while (usedSlots.has(`${slotX},${slotY}`));
      usedSlots.add(`${slotX},${slotY}`);
      return { ...tile, slotX, slotY };
    });

    setTiles(shuffled);
    draw(ctx, img, shuffled);
  }

  function draw(ctx: CanvasRenderingContext2D, img: HTMLImageElement, arr: Tile[]) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    
    // Draw background grid
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 1;
    for (let r = 0; r <= rows; r++) {
      ctx.beginPath();
      ctx.moveTo(0, r * tileSize.current.h);
      ctx.lineTo(canvasSize.current.w, r * tileSize.current.h);
      ctx.stroke();
    }
    for (let c = 0; c <= cols; c++) {
      ctx.beginPath();
      ctx.moveTo(c * tileSize.current.w, 0);
      ctx.lineTo(c * tileSize.current.w, canvasSize.current.h);
      ctx.stroke();
    }

    // Draw tiles
    arr.forEach((t, idx) => {
      const isBeingDragged = dragging.current === idx;
      const x = isBeingDragged ? dragPos.current.x : t.slotX * t.w;
      const y = isBeingDragged ? dragPos.current.y : t.slotY * t.h;
      
      // Draw tile image
      ctx.drawImage(img, t.sx, t.sy, t.w, t.h, x, y, t.w, t.h);
      
      // Check if in correct position
      const isCorrect = t.slotX === t.correctX && t.slotY === t.correctY;
      
      // Draw border
      ctx.strokeStyle = isCorrect ? 'rgba(50,255,50,0.6)' : 'rgba(0,0,0,0.5)';
      ctx.lineWidth = isBeingDragged ? 4 : 2;
      ctx.strokeRect(x + 1, y + 1, t.w - 2, t.h - 2);
      
      // Highlight if being dragged
      if (isBeingDragged) {
        ctx.fillStyle = 'rgba(255,255,255,0.2)';
        ctx.fillRect(x, y, t.w, t.h);
      }
    });
  }

  function getSlotAtPos(px: number, py: number): { col: number; row: number } | null {
    const col = Math.floor(px / tileSize.current.w);
    const row = Math.floor(py / tileSize.current.h);
    if (col >= 0 && col < cols && row >= 0 && row < rows) {
      return { col, row };
    }
    return null;
  }

  function getTileAtSlot(col: number, row: number): number {
    return tiles.findIndex(t => t.slotX === col && t.slotY === row);
  }

  function handlePointerDown(e: React.PointerEvent) {
    if (!canvasRef.current || !imgRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const slot = getSlotAtPos(x, y);
    if (!slot) return;
    
    const idx = getTileAtSlot(slot.col, slot.row);
    if (idx === -1) return;
    
    dragging.current = idx;
    const tileX = tiles[idx].slotX * tileSize.current.w;
    const tileY = tiles[idx].slotY * tileSize.current.h;
    dragOffset.current = { x: x - tileX, y: y - tileY };
    dragPos.current = { x: tileX, y: tileY };
    
    (e.target as Element).setPointerCapture(e.pointerId);
    redraw();
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (dragging.current === null || !canvasRef.current || !imgRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - dragOffset.current.x;
    const y = e.clientY - rect.top - dragOffset.current.y;
    
    // Constrain to canvas bounds
    dragPos.current = {
      x: Math.max(0, Math.min(canvasSize.current.w - tileSize.current.w, x)),
      y: Math.max(0, Math.min(canvasSize.current.h - tileSize.current.h, y))
    };
    
    redraw();
  }

  function swapTiles(i: number, j: number) {
    const newTiles = [...tiles];
    const tempSlot = { x: newTiles[i].slotX, y: newTiles[i].slotY };
    newTiles[i] = { ...newTiles[i], slotX: newTiles[j].slotX, slotY: newTiles[j].slotY };
    newTiles[j] = { ...newTiles[j], slotX: tempSlot.x, slotY: tempSlot.y };
    setTiles(newTiles);
    redraw();
    checkComplete(newTiles);
  }

  function handlePointerUp(e: React.PointerEvent) {
    if (dragging.current === null || !canvasRef.current || !imgRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Find target slot
    const targetSlot = getSlotAtPos(x, y);
    
    if (targetSlot) {
      const targetTileIdx = getTileAtSlot(targetSlot.col, targetSlot.row);
      
      if (targetTileIdx !== -1 && targetTileIdx !== dragging.current) {
        // Swap with another tile
        swapTiles(dragging.current, targetTileIdx);
      } else if (targetTileIdx === -1) {
        // Move to empty slot
        const newTiles = [...tiles];
        newTiles[dragging.current] = {
          ...newTiles[dragging.current],
          slotX: targetSlot.col,
          slotY: targetSlot.row
        };
        setTiles(newTiles);
        checkComplete(newTiles);
      }
    }
    
    dragging.current = null;
    (e.target as Element).releasePointerCapture(e.pointerId);
    redraw();
  }

  function redraw() {
    if (!canvasRef.current || !imgRef.current) return;
    const ctx = canvasRef.current.getContext('2d')!;
    draw(ctx, imgRef.current, tiles);
  }

  function checkComplete(arr: Tile[]) {
    const allCorrect = arr.every(t => t.slotX === t.correctX && t.slotY === t.correctY);
    if (allCorrect) {
      setTimeout(() => {
        if (canvasRef.current && imgRef.current) {
          const ctx = canvasRef.current.getContext('2d')!;
          ctx.clearRect(0, 0, canvasSize.current.w, canvasSize.current.h);
          ctx.drawImage(imgRef.current, 0, 0, canvasSize.current.w, canvasSize.current.h);
          
          // Victory effect
          ctx.fillStyle = 'rgba(50,255,50,0.3)';
          ctx.fillRect(0, 0, canvasSize.current.w, canvasSize.current.h);
        }
        setTimeout(() => onComplete(), 800);
      }, 200);
    }
  }

  return (
    <div className="flex flex-col items-center gap-2 sm:gap-3">
      <canvas
        ref={canvasRef}
        className="border-2 sm:border-4 border-[#4a3b59] shadow-2xl rounded-lg cursor-pointer"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        style={{ touchAction: 'none', maxWidth: '100%', height: 'auto' }}
      />
      <div className="text-xs sm:text-sm text-gray-700 text-center max-w-md px-2">
        <p className="font-semibold">🧩 Arrastra las piezas para intercambiarlas</p>
        <p className="text-[10px] sm:text-xs text-gray-600 mt-0.5">Las correctas se resaltan en verde</p>
      </div>
    </div>
  );
}
