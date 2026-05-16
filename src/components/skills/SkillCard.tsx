"use client";

import { useRef, type MouseEvent } from "react";
import { cn } from "@/lib/cn";
import type { Skill } from "@/lib/skills-data";
import { getCategory, levelLabels } from "@/lib/skills-data";
import { Badge } from "@/components/ui/badge";

interface SkillCardProps {
  skill: Skill;
  /** index-based stagger delay (ms) */
  index?: number;
  /** Render with a 3D flip-in entrance */
  flipIn?: boolean;
  className?: string;
}

export function SkillCard({ skill, index = 0, flipIn = false, className }: SkillCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const category = getCategory(skill.categoryId);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    const tiltX = (y - 0.5) * -8;
    const tiltY = (x - 0.5) * 10;
    card.style.transform = `perspective(800px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateZ(0)`;
    card.style.setProperty("--mx", `${x * 100}%`);
    card.style.setProperty("--my", `${y * 100}%`);
  };

  const handleMouseLeave = () => {
    const card = cardRef.current;
    if (!card) return;
    card.style.transform = "perspective(800px) rotateX(0deg) rotateY(0deg)";
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        animationDelay: flipIn ? `${index * 80}ms` : `${index * 40}ms`,
      }}
      className={cn(
        "group relative overflow-hidden rounded-xl border bg-card p-5 shadow-sm",
        "transition-transform duration-200 will-change-transform",
        "animate-fade-in [animation-fill-mode:both]",
        flipIn && "animate-flip-in",
        className,
      )}
    >
      {/* Gradient aura */}
      <div
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute -inset-px rounded-xl opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-40",
          "bg-gradient-to-br",
          category?.gradient ?? "from-primary to-primary",
        )}
      />
      {/* Spotlight (mouse) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(300px circle at var(--mx,50%) var(--my,50%), hsl(var(--foreground) / 0.08), transparent 40%)",
        }}
      />
      <div className="relative">
        <div className="mb-3 flex items-center justify-between gap-2">
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
              category?.accentText,
            )}
          >
            <span aria-hidden="true">{category?.emoji}</span>
            <span className="truncate">{category?.title.split(" ")[0]}</span>
          </span>
          <Badge variant="outline" className="shrink-0 text-[10px]">
            {levelLabels[skill.level]}
          </Badge>
        </div>
        <h3 className="mb-2 text-base font-semibold leading-tight text-foreground">
          {skill.title}
        </h3>
        <p className="mb-3 text-sm leading-relaxed text-muted-foreground">
          {skill.description}
        </p>
        <div className="flex flex-wrap gap-1.5">
          {skill.tags.map((t) => (
            <span
              key={t}
              className="inline-flex items-center rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground"
            >
              #{t}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
