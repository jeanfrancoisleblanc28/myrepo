"use client";

import { useEffect, useRef } from "react";

interface ConfettiProps {
  /** Key that, when changed, triggers a new burst. */
  triggerKey: number | string;
  /** Number of particles (default 80). */
  count?: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  rot: number;
  vr: number;
  color: string;
  life: number;
}

const PALETTE = [
  "#f472b6", // pink-400
  "#a78bfa", // violet-400
  "#60a5fa", // blue-400
  "#34d399", // emerald-400
  "#facc15", // yellow-400
  "#fb923c", // orange-400
];

export function Confetti({ triggerKey, count = 80 }: ConfettiProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const firstRun = useRef(true);

  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    const canvas = canvasRef.current;
    if (!canvas) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const originX = rect.width / 2;
    const originY = rect.height * 0.25;
    const particles: Particle[] = Array.from({ length: count }, () => {
      const angle = Math.random() * Math.PI * 2;
      const speed = 4 + Math.random() * 7;
      return {
        x: originX,
        y: originY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 3,
        size: 4 + Math.random() * 6,
        rot: Math.random() * Math.PI * 2,
        vr: (Math.random() - 0.5) * 0.3,
        color: PALETTE[Math.floor(Math.random() * PALETTE.length)],
        life: 1,
      };
    });

    let raf = 0;
    let start = performance.now();

    const tick = (now: number) => {
      const elapsed = now - start;
      ctx.clearRect(0, 0, rect.width, rect.height);

      for (const p of particles) {
        p.vy += 0.18; // gravity
        p.vx *= 0.995;
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vr;
        p.life = Math.max(0, 1 - elapsed / 1800);

        ctx.save();
        ctx.globalAlpha = p.life;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.4);
        ctx.restore();
      }

      if (elapsed < 1800) {
        raf = requestAnimationFrame(tick);
      } else {
        ctx.clearRect(0, 0, rect.width, rect.height);
      }
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [triggerKey, count]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[450] h-screen w-screen"
    />
  );
}
