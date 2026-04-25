"use client";

import { cn } from "@/lib/cn";
import type { Skill } from "@/lib/skills-data";
import { getCategory, levelLabels } from "@/lib/skills-data";

export type PresentationTheme = "default" | "deps";

interface PresentationSlideProps {
  skill?: Skill;
  /** 0-based skill position within the kit; only meaningful when variant === "skill" */
  skillIndex: number;
  /** total number of content slides (excluding intro/outro) */
  total: number;
  variant: "intro" | "skill" | "outro";
  kitSize: number;
  /** Visual identity. "deps" = navy + teal institutional theme. */
  theme?: PresentationTheme;
}

export function PresentationSlide({
  skill,
  skillIndex,
  total,
  variant,
  kitSize,
  theme = "default",
}: PresentationSlideProps) {
  const category = skill ? getCategory(skill.categoryId) : undefined;
  const isDeps = theme === "deps";
  const gradient = category?.gradient ?? "from-violet-500 via-fuchsia-500 to-pink-500";

  return (
    <div
      className={cn(
        "relative flex h-full w-full items-center justify-center overflow-hidden",
        "animate-slide-fade-in",
      )}
      // Constant name lets the View Transitions API treat the active slide
      // as the same element across navigations, enabling smooth crossfades.
      style={{ viewTransitionName: "active-slide" }}
    >
      {/* Background — DÉPS theme uses a single navy gradient regardless of category */}
      {isDeps ? (
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-br from-[#0B1336] via-[#141F4E] to-[#060A24]"
        />
      ) : (
        <div
          aria-hidden="true"
          className={cn("absolute inset-0 bg-gradient-to-br opacity-90", gradient)}
        />
      )}

      {/* Soft accent halos */}
      <div
        aria-hidden="true"
        className={cn(
          "absolute inset-0",
          isDeps
            ? "bg-[radial-gradient(circle_at_85%_110%,rgba(43,196,212,0.18),transparent_55%)]"
            : "bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.18),transparent_60%)]",
        )}
      />
      <div
        aria-hidden="true"
        className={cn(
          "absolute inset-0",
          isDeps
            ? "bg-[radial-gradient(circle_at_15%_-10%,rgba(111,223,234,0.10),transparent_50%)]"
            : "bg-[radial-gradient(circle_at_70%_80%,rgba(0,0,0,0.25),transparent_60%)]",
        )}
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
            <span
              className={cn(
                "inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-medium backdrop-blur",
                isDeps
                  ? "border-[#6FDFEA]/40 bg-[#141F4E]/40 tracking-[0.2em] uppercase text-[#6FDFEA]"
                  : "border-white/30 bg-white/10",
              )}
            >
              <span
                className={cn(
                  "h-2 w-2 rounded-full animate-pulse",
                  isDeps ? "bg-[#6FDFEA]" : "bg-white",
                )}
              />
              {isDeps ? "DÉPS — Keynote institutionnel" : "UI/UX Skills Kit"}
            </span>
            <h1
              className={cn(
                "leading-[0.95] tracking-tight text-balance",
                isDeps ? "font-light" : "font-bold",
              )}
              style={{ fontSize: "clamp(3rem, 9vw, 7rem)" }}
            >
              {isDeps ? (
                <>
                  Une présentation
                  <br />
                  <span className="italic font-normal text-[#6FDFEA]">préparée pour vous.</span>
                </>
              ) : (
                <>
                  Des présentations
                  <br />
                  <span className="italic">incroyables.</span>
                </>
              )}
            </h1>
            <p
              className={cn(
                "max-w-2xl text-lg sm:text-xl",
                isDeps ? "text-white/85" : "text-white/90",
              )}
            >
              {kitSize} compétences UI/UX retenues pour cette session.
            </p>
            <p
              className={cn(
                "mt-auto text-sm",
                isDeps ? "text-[#B8C1DB]" : "text-white/70",
              )}
            >
              Appuie sur{" "}
              <kbd
                className={cn(
                  "rounded border px-1.5 py-0.5 font-mono text-xs",
                  isDeps ? "border-[#B8C1DB]/40" : "border-white/40",
                )}
              >
                →
              </kbd>{" "}
              ou{" "}
              <kbd
                className={cn(
                  "rounded border px-1.5 py-0.5 font-mono text-xs",
                  isDeps ? "border-[#B8C1DB]/40" : "border-white/40",
                )}
              >
                Space
              </kbd>{" "}
              pour commencer.
            </p>
          </>
        )}

        {variant === "skill" && skill && (
          <>
            <div className="flex items-center gap-3 text-sm text-white/90">
              <span className="text-4xl sm:text-5xl" aria-hidden="true">
                {category?.emoji}
              </span>
              <span
                className={cn(
                  "rounded-full border px-3 py-1 text-xs font-medium backdrop-blur",
                  isDeps
                    ? "border-[#6FDFEA]/40 bg-[#141F4E]/50 text-[#6FDFEA]"
                    : "border-white/30 bg-white/10",
                )}
              >
                {category?.title}
              </span>
              <span
                className={cn(
                  "rounded-full border px-3 py-1 text-xs font-medium backdrop-blur",
                  isDeps
                    ? "border-[#B8C1DB]/40 bg-[#141F4E]/50 text-white/95"
                    : "border-white/30 bg-white/10",
                )}
              >
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
                  className={cn(
                    "rounded-full border px-3 py-1 font-mono text-xs backdrop-blur",
                    isDeps
                      ? "border-[#6FDFEA]/30 bg-[#0B1336]/50 text-[#6FDFEA]/90"
                      : "border-white/30 bg-white/10 text-white/90",
                  )}
                >
                  #{t}
                </span>
              ))}
            </div>
          </>
        )}

        {variant === "outro" && (
          <>
            <span
              className={cn(
                "inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-medium backdrop-blur",
                isDeps
                  ? "border-[#6FDFEA]/40 bg-[#141F4E]/40 tracking-[0.2em] uppercase text-[#6FDFEA]"
                  : "border-white/30 bg-white/10",
              )}
            >
              {isDeps ? "Fin de la session" : "Fin du kit"}
            </span>
            <h2
              className={cn(
                "leading-[0.95] tracking-tight text-balance",
                isDeps ? "font-light" : "font-bold",
              )}
              style={{ fontSize: "clamp(2.5rem, 8vw, 6rem)" }}
            >
              Merci.
              <br />
              <span
                className={cn("italic", isDeps ? "text-[#6FDFEA]" : "text-white/80")}
              >
                {isDeps ? "À l'écoute pour la suite." : "À toi de jouer."}
              </span>
            </h2>
            <p
              className={cn(
                "max-w-2xl text-lg",
                isDeps ? "text-white/85" : "text-white/90",
              )}
            >
              Appuie sur{" "}
              <kbd
                className={cn(
                  "rounded border px-1.5 py-0.5 font-mono text-xs",
                  isDeps ? "border-[#B8C1DB]/40" : "border-white/40",
                )}
              >
                Esc
              </kbd>{" "}
              pour revenir au catalogue.
            </p>
          </>
        )}
      </div>

      {/* Footer wordmark on skill slides */}
      {variant === "skill" && (
        <div
          className={cn(
            "absolute bottom-6 left-6 right-6 flex items-center justify-between font-mono text-xs",
            isDeps ? "text-[#B8C1DB]" : "text-white/70",
          )}
        >
          <span>
            {String(skillIndex + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
          </span>
          {isDeps ? (
            <span className="hidden font-sans tracking-[0.25em] uppercase text-[10px] text-[#B8C1DB]/80 sm:inline">
              DÉPS · Direction de l&apos;expérience patient et soignant
            </span>
          ) : (
            <span className="hidden sm:inline">UI/UX Skills Generator</span>
          )}
        </div>
      )}
    </div>
  );
}
