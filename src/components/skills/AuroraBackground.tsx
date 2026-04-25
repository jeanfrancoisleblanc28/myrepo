"use client";

import { cn } from "@/lib/cn";

interface AuroraBackgroundProps {
  className?: string;
  /** Tailwind gradient direction (default radial-gradient via blobs) */
  intensity?: "subtle" | "vivid";
}

export function AuroraBackground({ className, intensity = "vivid" }: AuroraBackgroundProps) {
  const opacity = intensity === "subtle" ? "opacity-30" : "opacity-60";
  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden",
        className,
      )}
    >
      <div
        className={cn(
          "absolute -left-1/4 -top-1/4 h-[60vmax] w-[60vmax] rounded-full blur-3xl",
          "bg-gradient-to-br from-fuchsia-500 via-violet-500 to-indigo-500",
          "mix-blend-screen dark:mix-blend-plus-lighter animate-aurora-a",
          opacity,
        )}
      />
      <div
        className={cn(
          "absolute -right-1/4 top-1/3 h-[55vmax] w-[55vmax] rounded-full blur-3xl",
          "bg-gradient-to-br from-cyan-500 via-sky-500 to-emerald-500",
          "mix-blend-screen dark:mix-blend-plus-lighter animate-aurora-b",
          opacity,
        )}
      />
      <div
        className={cn(
          "absolute left-1/3 bottom-0 h-[45vmax] w-[45vmax] rounded-full blur-3xl",
          "bg-gradient-to-br from-amber-400 via-rose-500 to-pink-500",
          "mix-blend-screen dark:mix-blend-plus-lighter animate-aurora-c",
          opacity,
        )}
      />
    </div>
  );
}
