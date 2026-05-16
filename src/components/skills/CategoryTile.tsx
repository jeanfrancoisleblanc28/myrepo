"use client";

import { cn } from "@/lib/cn";
import type { SkillCategory } from "@/lib/skills-data";
import { getSkillsByCategory } from "@/lib/skills-data";

interface CategoryTileProps {
  category: SkillCategory;
  selected?: boolean;
  onToggle?: () => void;
  index?: number;
}

export function CategoryTile({ category, selected, onToggle, index = 0 }: CategoryTileProps) {
  const count = getSkillsByCategory(category.id).length;

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={selected}
      style={{ animationDelay: `${index * 50}ms` }}
      className={cn(
        "group relative flex min-h-[8rem] flex-col justify-between overflow-hidden rounded-xl border p-4 text-left",
        "transition-all duration-200 will-change-transform",
        "animate-fade-in [animation-fill-mode:both]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        selected
          ? "border-transparent ring-2 ring-offset-2 ring-offset-background shadow-lg -translate-y-0.5"
          : "border-border bg-card hover:-translate-y-0.5 hover:shadow-md",
        selected && category.accentRing,
      )}
    >
      {/* Gradient background when selected */}
      <div
        aria-hidden="true"
        className={cn(
          "absolute inset-0 opacity-0 transition-opacity duration-300 bg-gradient-to-br",
          category.gradient,
          selected ? "opacity-100" : "group-hover:opacity-10",
        )}
      />
      {/* Overlay for readability on gradient */}
      {selected && (
        <div aria-hidden="true" className="absolute inset-0 bg-background/70 backdrop-blur-[1px]" />
      )}
      <div className="relative flex items-start justify-between gap-3">
        <span className="text-3xl leading-none" aria-hidden="true">
          {category.emoji}
        </span>
        <span
          className={cn(
            "rounded-full border px-2 py-0.5 font-mono text-[10px]",
            selected ? "border-foreground/20 bg-background/60" : "bg-muted",
          )}
        >
          {count}
        </span>
      </div>
      <div className="relative mt-2">
        <h3 className="text-sm font-semibold leading-tight text-foreground">
          {category.title}
        </h3>
        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
          {category.blurb}
        </p>
      </div>
    </button>
  );
}
