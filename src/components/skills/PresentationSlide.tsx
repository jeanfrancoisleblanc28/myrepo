"use client";

import { cn } from "@/lib/cn";
import type { Skill } from "@/lib/skills-data";
import { getCategory, levelLabels } from "@/lib/skills-data";

interface PresentationSlideProps {
  skill?: Skill;
  /** 0-based index of this slide */
  index: number;
  /** total number of content slides (excluding intro/outro) */
  total: number;
  variant: "intro" | "skill" | "outro";
  kitSize: number;
}

export function PresentationSlide({ skill, index, total, variant, kitSize }: PresentationSlideProps) {
  const category = skill ? getCategory(skill.categoryId) : undefined;
  const gradient = category?.gradient ?? "from-violet-500 via-fuchsia-500 to-pink-500";

  return (
    <div
      className={cn(
        "relative flex h-full w-full items-center justify-center overflow-hidden",
        "animate-slide-fade-in",
      )}
      style={{ viewTransitionName: `slide-${index}` }}
    >
      {/* Animated gradient background */}
      <div
        aria-hidden="true"
        className={cn(
          "absolute inset-0 bg-gradient-to-br opacity-90",
          gradient,
        )}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.18),transparent_60%)]"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(0,0,0,0.25),transparent_60%)]"
      />

      {/* Noise overlay for texture */}
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.06] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence baseFrequency='0.9' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.8'/%3E%3C/svg%3E\")",
        }}
      />

      <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-col items-start gap-6 px-8 text-white sm:px-12 lg:px-16">
        {variant === "intro" && (
          <>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-1.5 text-xs font-medium backdrop-blur">
              <span className="h-2 w-2 animate-pulse rounded-full bg-white" /> UI/UX Skills Kit
            </span>
            <h1
              className="font-bold leading-[0.95] tracking-tight text-balance"
              style={{ fontSize: "clamp(3rem, 9vw, 7rem)" }}
            >
              Des présentations
              <br />
              <span className="italic">incroyables.</span>
            </h1>
            <p className="max-w-2xl text-lg text-white/90 sm:text-xl">
              {kitSize} compétences UI/UX tirées sur mesure pour ta prochaine session.
            </p>
            <p className="mt-auto text-sm text-white/70">
              Appuie sur <kbd className="rounded border border-white/40 px-1.5 py-0.5 font-mono text-xs">→</kbd> ou{" "}
              <kbd className="rounded border border-white/40 px-1.5 py-0.5 font-mono text-xs">Space</kbd> pour commencer.
            </p>
          </>
        )}

        {variant === "skill" && skill && (
          <>
            <div className="flex items-center gap-3 text-sm text-white/90">
              <span className="text-4xl sm:text-5xl" aria-hidden="true">
                {category?.emoji}
              </span>
              <span className="rounded-full border border-white/30 bg-white/10 px-3 py-1 text-xs font-medium backdrop-blur">
                {category?.title}
              </span>
              <span className="rounded-full border border-white/30 bg-white/10 px-3 py-1 text-xs font-medium backdrop-blur">
                {levelLabels[skill.level]}
              </span>
            </div>
            <h2
              className="font-bold leading-[1.02] tracking-tight text-balance"
              style={{ fontSize: "clamp(2.25rem, 6.5vw, 5.5rem)" }}
            >
              {skill.title}
            </h2>
            <p className="max-w-3xl text-balance text-lg leading-relaxed text-white/95 sm:text-2xl">
              {skill.description}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {skill.tags.map((t) => (
                <span
                  key={t}
                  className="rounded-full border border-white/30 bg-white/10 px-3 py-1 font-mono text-xs text-white/90 backdrop-blur"
                >
                  #{t}
                </span>
              ))}
            </div>
          </>
        )}

        {variant === "outro" && (
          <>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-1.5 text-xs font-medium backdrop-blur">
              Fin du kit
            </span>
            <h2
              className="font-bold leading-[0.95] tracking-tight text-balance"
              style={{ fontSize: "clamp(2.5rem, 8vw, 6rem)" }}
            >
              Merci.
              <br />
              <span className="italic text-white/80">À toi de jouer.</span>
            </h2>
            <p className="max-w-2xl text-lg text-white/90">
              Appuie sur <kbd className="rounded border border-white/40 px-1.5 py-0.5 font-mono text-xs">Esc</kbd>{" "}
              pour revenir au catalogue.
            </p>
          </>
        )}
      </div>

      {variant === "skill" && (
        <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between text-xs font-mono text-white/70">
          <span>{String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}</span>
          <span className="hidden sm:inline">UI/UX Skills Generator</span>
        </div>
      )}
    </div>
  );
}
