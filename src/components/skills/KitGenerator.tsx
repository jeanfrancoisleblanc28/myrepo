"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  categories,
  generateKit,
  getSkillsByIds,
  levelLabels,
  levelOrder,
  type Skill,
  type SkillLevel,
} from "@/lib/skills-data";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/cn";
import { SkillCard } from "./SkillCard";
import { CategoryTile } from "./CategoryTile";
import { Confetti } from "./Confetti";

const DEFAULT_COUNT = 5;
const MIN_COUNT = 1;
const MAX_COUNT = 9;

export function KitGenerator({ autoGenerate = false }: { autoGenerate?: boolean }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const idsParam = searchParams.get("ids");
  const seededKit = useMemo(
    () => (idsParam ? getSkillsByIds(idsParam.split(",")) : null),
    [idsParam],
  );

  const [count, setCount] = useState(DEFAULT_COUNT);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedLevels, setSelectedLevels] = useState<SkillLevel[]>([]);
  const [kit, setKit] = useState<Skill[]>(seededKit ?? []);
  const [confettiKey, setConfettiKey] = useState(0);
  const [generationCount, setGenerationCount] = useState(0);

  const generate = useCallback(() => {
    const next = generateKit({
      count,
      categoryIds: selectedCategories.length ? selectedCategories : undefined,
      levels: selectedLevels.length ? selectedLevels : undefined,
    });
    setKit(next);
    setConfettiKey((k) => k + 1);
    setGenerationCount((g) => g + 1);
    toast({
      title: "Kit généré !",
      description: `${next.length} compétence${next.length > 1 ? "s" : ""} UI/UX prête${next.length > 1 ? "s" : ""} à présenter.`,
      variant: "success",
      duration: 3200,
    });
    // Sync URL so the kit is shareable / reloadable
    const params = new URLSearchParams();
    params.set("ids", next.map((s) => s.id).join(","));
    router.replace(`/skills?${params.toString()}`, { scroll: false });
  }, [count, selectedCategories, selectedLevels, router, toast]);

  // Auto-generate on mount if requested (e.g. ?generate=1)
  useEffect(() => {
    if (autoGenerate && kit.length === 0) {
      generate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoGenerate]);

  const toggleCategory = (id: string) => {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
    );
  };

  const toggleLevel = (lv: SkillLevel) => {
    setSelectedLevels((prev) =>
      prev.includes(lv) ? prev.filter((l) => l !== lv) : [...prev, lv],
    );
  };

  const copyShareLink = async () => {
    if (kit.length === 0) return;
    const url = `${window.location.origin}/skills?ids=${kit.map((s) => s.id).join(",")}`;
    try {
      await navigator.clipboard.writeText(url);
      toast({ title: "Lien copié", description: "Partage ton kit en un clic.", variant: "success", duration: 2500 });
    } catch {
      toast({ title: "Copie impossible", description: "Ton navigateur a refusé l'accès au presse-papiers.", variant: "error", duration: 3000 });
    }
  };

  const presentHref = useMemo(() => {
    if (kit.length === 0) return "/skills/present";
    return `/skills/present?ids=${kit.map((s) => s.id).join(",")}`;
  }, [kit]);

  const documentHref = useMemo(() => {
    if (kit.length === 0) return "/skills/document";
    return `/skills/document?ids=${kit.map((s) => s.id).join(",")}`;
  }, [kit]);

  return (
    <section aria-labelledby="generator-heading" className="flex flex-col gap-8">
      <Confetti triggerKey={confettiKey} />

      <div>
        <h2 id="generator-heading" className="text-3xl font-bold tracking-tight sm:text-4xl">
          Générateur de kit UI/UX
        </h2>
        <p className="mt-2 text-muted-foreground">
          Choisis tes filtres, tire un kit, et lance une présentation qui envoie.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-6 rounded-xl border bg-card p-6">
        {/* Categories */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <label className="text-sm font-semibold">Catégories</label>
            <button
              type="button"
              onClick={() => setSelectedCategories([])}
              className="text-xs text-muted-foreground underline-offset-2 hover:underline disabled:opacity-50"
              disabled={selectedCategories.length === 0}
            >
              Réinitialiser
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-3">
            {categories.map((cat, i) => (
              <CategoryTile
                key={cat.id}
                category={cat}
                selected={selectedCategories.includes(cat.id)}
                onToggle={() => toggleCategory(cat.id)}
                index={i}
              />
            ))}
          </div>
        </div>

        {/* Levels + count */}
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-semibold">Niveaux</label>
            <div className="flex flex-wrap gap-2">
              {levelOrder.map((lv) => {
                const active = selectedLevels.includes(lv);
                return (
                  <button
                    key={lv}
                    type="button"
                    onClick={() => toggleLevel(lv)}
                    aria-pressed={active}
                    className={cn(
                      "rounded-full border px-3 py-1 text-sm transition-colors",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                      active
                        ? "border-primary bg-primary text-primary-foreground"
                        : "bg-card text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                    )}
                  >
                    {levelLabels[lv]}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label htmlFor="count" className="mb-2 block text-sm font-semibold">
              Nombre de compétences : <span className="font-mono">{count}</span>
            </label>
            <input
              id="count"
              type="range"
              min={MIN_COUNT}
              max={MAX_COUNT}
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              className="w-full accent-primary"
              aria-valuemin={MIN_COUNT}
              aria-valuemax={MAX_COUNT}
              aria-valuenow={count}
            />
            <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
              <span>{MIN_COUNT}</span>
              <span>{MAX_COUNT}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-3">
          <Button onClick={generate} size="lg">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
            </svg>
            {generationCount === 0 ? "Générer mon kit" : "Re-générer"}
          </Button>
          <Link href={presentHref}>
            <Button variant="secondary" size="lg" disabled={kit.length === 0}>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polygon points="6 3 20 12 6 21 6 3" />
              </svg>
              Lancer la présentation
            </Button>
          </Link>
          <Link href={documentHref}>
            <Button variant="secondary" size="lg" disabled={kit.length === 0}>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="8" y1="13" x2="16" y2="13" />
                <line x1="8" y1="17" x2="16" y2="17" />
              </svg>
              Générer le document
            </Button>
          </Link>
          <Button variant="outline" size="lg" onClick={copyShareLink} disabled={kit.length === 0}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
            Copier le lien
          </Button>
        </div>
      </div>

      {/* Kit result */}
      <div aria-live="polite" className="min-h-[2rem]">
        {kit.length > 0 && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <h3 className="text-xl font-semibold">Ton kit</h3>
              <Badge variant="secondary">
                {kit.length} compétence{kit.length > 1 ? "s" : ""}
              </Badge>
            </div>
            <div
              key={confettiKey}
              className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
            >
              {kit.map((skill, i) => (
                <SkillCard key={`${confettiKey}-${skill.id}`} skill={skill} index={i} flipIn />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
