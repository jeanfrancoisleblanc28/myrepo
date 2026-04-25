"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { generateKit, getSkillsByIds, type Skill } from "@/lib/skills-data";
import { PresentationSlide, type PresentationTheme } from "@/components/skills/PresentationSlide";
import { DepsParticles } from "@/components/skills/DepsParticles";
import { Modal } from "@/components/ui/modal";
import { cn } from "@/lib/cn";

function PresentInner() {
  const router = useRouter();
  const params = useSearchParams();
  const rootRef = useRef<HTMLDivElement>(null);

  const kit: Skill[] = useMemo(() => {
    const idsParam = params.get("ids");
    if (idsParam) {
      const fromIds = getSkillsByIds(idsParam.split(","));
      if (fromIds.length > 0) return fromIds;
    }
    return generateKit({ count: 5 });
  }, [params]);

  const theme: PresentationTheme = params.get("theme") === "deps" ? "deps" : "default";
  const isDeps = theme === "deps";

  const kitIds = useMemo(() => kit.map((s) => s.id).join(","), [kit]);

  // URL helpers that preserve the current theme.
  const buildUrl = useCallback(
    (base: string, withIds: boolean) => {
      const qs = new URLSearchParams();
      if (withIds && kitIds) qs.set("ids", kitIds);
      if (isDeps) qs.set("theme", "deps");
      const s = qs.toString();
      return s ? `${base}?${s}` : base;
    },
    [kitIds, isDeps],
  );

  const toggleTheme = useCallback(() => {
    const qs = new URLSearchParams();
    if (kitIds) qs.set("ids", kitIds);
    if (!isDeps) qs.set("theme", "deps");
    const s = qs.toString();
    router.replace(s ? `/skills/present?${s}` : "/skills/present", { scroll: false });
  }, [router, kitIds, isDeps]);


  // Slides: intro + skills + outro
  const totalSlides = kit.length + 2;
  const [index, setIndex] = useState(0);
  const [autoplay, setAutoplay] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

  // Keep index in range when the kit (and therefore totalSlides) changes,
  // e.g. via back/forward navigation that swaps `?ids=...`.
  useEffect(() => {
    setIndex((current) => Math.max(0, Math.min(totalSlides - 1, current)));
  }, [totalSlides]);

  const goTo = useCallback(
    (next: number) => {
      const clamped = Math.max(0, Math.min(totalSlides - 1, next));
      const run = () => setIndex(clamped);
      const doc = document as Document & {
        startViewTransition?: (cb: () => void) => { finished: Promise<void> };
      };
      if (typeof doc.startViewTransition === "function" &&
          !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        doc.startViewTransition!(run);
      } else {
        run();
      }
    },
    [totalSlides],
  );

  const next = useCallback(() => goTo(index + 1), [goTo, index]);
  const prev = useCallback(() => goTo(index - 1), [goTo, index]);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (helpOpen && e.key !== "?" && e.key !== "Escape") return;
      // Don't hijack keys when the user is typing or interacting with a control.
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName;
      if (
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        tag === "SELECT" ||
        target?.isContentEditable
      ) {
        return;
      }
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      // Space is the default activator for buttons; don't steal it from focused buttons.
      if (e.key === " " && tag === "BUTTON") return;
      switch (e.key) {
        case "ArrowRight":
        case " ":
          e.preventDefault();
          next();
          break;
        case "ArrowLeft":
          e.preventDefault();
          prev();
          break;
        case "Escape":
          if (helpOpen) setHelpOpen(false);
          else router.push(buildUrl("/skills", true));
          break;
        case "f":
        case "F":
          e.preventDefault();
          toggleFullscreen();
          break;
        case "p":
        case "P":
          e.preventDefault();
          setAutoplay((a) => !a);
          break;
        case "?":
          e.preventDefault();
          setHelpOpen((o) => !o);
          break;
        case "Home":
          goTo(0);
          break;
        case "End":
          goTo(totalSlides - 1);
          break;
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [next, prev, router, helpOpen, goTo, totalSlides, buildUrl]);

  // Autoplay: timeout keyed on `index` so each user nav resets the delay
  // and uses goTo() so transitions stay in sync. Stops at the last slide
  // (no looping) to match manual navigation behavior.
  useEffect(() => {
    if (!autoplay) return;
    if (index >= totalSlides - 1) {
      setAutoplay(false);
      return;
    }
    const id = setTimeout(() => {
      goTo(index + 1);
    }, 6000);
    return () => clearTimeout(id);
  }, [autoplay, index, totalSlides, goTo]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      rootRef.current?.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const variant: "intro" | "skill" | "outro" =
    index === 0 ? "intro" : index === totalSlides - 1 ? "outro" : "skill";
  const currentSkill = variant === "skill" ? kit[index - 1] : undefined;
  const progress = ((index + 1) / totalSlides) * 100;

  return (
    <div
      ref={rootRef}
      className="fixed inset-0 z-[200] bg-black text-white"
      role="region"
      aria-label={isDeps ? "Présentation UI/UX — keynote DÉPS" : "Présentation UI/UX"}
      aria-roledescription="carrousel"
    >
      {/* Slide container */}
      <div className="absolute inset-0">
        <PresentationSlide
          key={index}
          skill={currentSkill}
          skillIndex={variant === "skill" ? index - 1 : 0}
          total={kit.length}
          variant={variant}
          kitSize={kit.length}
          theme={theme}
        />
        {isDeps && <DepsParticles />}
      </div>

      {/* Progress bar */}
      <div
        className={cn(
          "pointer-events-none absolute left-0 right-0 top-0 h-1",
          isDeps ? "bg-deps-navy-deep" : "bg-white/10",
        )}
      >
        <div
          className={cn(
            "h-full transition-[width] duration-500",
            isDeps ? "bg-deps-teal-soft" : "bg-white",
          )}
          style={{ width: `${progress}%` }}
          aria-hidden="true"
        />
      </div>

      {/* Controls (bottom) */}
      <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1 rounded-full border border-white/20 bg-black/40 p-1 backdrop-blur">
        <ControlButton onClick={prev} disabled={index === 0} label="Précédent">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </ControlButton>
        <div className="px-3 font-mono text-xs text-white/80">
          {String(index + 1).padStart(2, "0")} / {String(totalSlides).padStart(2, "0")}
        </div>
        <ControlButton onClick={next} disabled={index === totalSlides - 1} label="Suivant">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </ControlButton>
        <div className="mx-1 h-5 w-px bg-white/20" />
        <ControlButton onClick={() => setAutoplay((a) => !a)} label={autoplay ? "Pause" : "Lecture"}>
          {autoplay ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
          )}
        </ControlButton>
        <ControlButton onClick={toggleFullscreen} label="Plein écran">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
          </svg>
        </ControlButton>
        <ControlButton
          onClick={toggleTheme}
          label={isDeps ? "Désactiver le thème DÉPS" : "Activer le thème DÉPS"}
          active={isDeps}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
        </ControlButton>
        <ControlButton onClick={() => setHelpOpen(true)} label="Raccourcis clavier">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><path d="M12 17h.01" />
          </svg>
        </ControlButton>
      </div>

      {/* Close (top-right) */}
      <button
        onClick={() => router.push(buildUrl("/skills", true))}
        className="absolute right-4 top-4 z-10 rounded-full border border-white/20 bg-black/40 p-2 text-white/80 backdrop-blur transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
        aria-label="Fermer la présentation"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>

      {/* Help modal */}
      <Modal
        open={helpOpen}
        onClose={() => setHelpOpen(false)}
        title="Raccourcis clavier"
        description="Navigue la présentation sans quitter le clavier."
      >
        <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-3 text-sm">
          {[
            ["→ / Space", "Slide suivante"],
            ["←", "Slide précédente"],
            ["Home / End", "Première / dernière slide"],
            ["F", "Plein écran"],
            ["P", "Play / Pause auto-advance"],
            ["?", "Afficher cette aide"],
            ["Esc", "Quitter la présentation"],
          ].map(([k, label]) => (
            <div key={k} className="contents">
              <kbd className="justify-self-start rounded border bg-muted px-2 py-0.5 font-mono text-xs text-foreground">
                {k}
              </kbd>
              <dd className="text-muted-foreground">{label}</dd>
            </div>
          ))}
        </dl>
      </Modal>
    </div>
  );
}

function ControlButton({
  onClick,
  disabled,
  label,
  children,
  active,
}: {
  onClick: () => void;
  disabled?: boolean;
  label: string;
  children: React.ReactNode;
  /** Pass a boolean to mark this as a toggle button (exposes aria-pressed). Omit for one-shot actions. */
  active?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      aria-pressed={active}
      title={label}
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-full transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white",
        "disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent",
        active
          ? "bg-deps-teal-soft/20 text-deps-teal-soft hover:bg-deps-teal-soft/30"
          : "text-white/80 hover:bg-white/10 hover:text-white",
      )}
    >
      {children}
    </button>
  );
}

export default function PresentPage() {
  return (
    <Suspense fallback={<div className="fixed inset-0 bg-black" aria-hidden="true" />}>
      <PresentInner />
    </Suspense>
  );
}
