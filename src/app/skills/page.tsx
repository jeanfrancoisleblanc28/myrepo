import { Suspense } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AuroraBackground } from "@/components/skills/AuroraBackground";
import { SkillCard } from "@/components/skills/SkillCard";
import { KitGenerator } from "@/components/skills/KitGenerator";
import {
  categories,
  getSkillsByCategory,
  skills as allSkills,
} from "@/lib/skills-data";

export const metadata = {
  title: "UI/UX Skills Generator — MyRepo",
  description:
    "Catalogue interactif, générateur de kit UI/UX et mode présentation keynote.",
};

interface PageProps {
  searchParams?: { generate?: string; ids?: string };
}

export default function SkillsPage({ searchParams }: PageProps) {
  const autoGenerate = searchParams?.generate === "1";

  return (
    <div className="flex flex-col gap-20">
      {/* Hero */}
      <section className="relative isolate -mx-4 -mt-8 overflow-hidden rounded-b-3xl px-4 pb-16 pt-16 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <AuroraBackground />
        <div className="relative mx-auto flex max-w-5xl flex-col items-center gap-6 text-center">
          <Badge variant="secondary" className="px-4 py-1 text-sm">
            UI/UX Pro Max — {allSkills.length} compétences · {categories.length} catégories
          </Badge>
          <h1
            className="text-balance font-bold tracking-tight"
            style={{ fontSize: "clamp(2.5rem, 6vw, 5rem)" }}
          >
            UI/UX Skills Generator
            <br />
            <span className="bg-gradient-to-r from-fuchsia-500 via-violet-500 to-cyan-500 bg-clip-text text-transparent">
              avec présentations incroyables
            </span>
          </h1>
          <p className="max-w-2xl text-pretty text-lg text-muted-foreground">
            Explore le catalogue, génère un kit sur mesure, puis lance un mode
            présentation plein-écran digne d&apos;un keynote — raccourcis clavier,
            transitions fluides et aurora animée inclus.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="#generator">
              <Button size="lg">Générer mon kit</Button>
            </Link>
            <Link href="/skills/present">
              <Button variant="outline" size="lg">
                Mode présentation
              </Button>
            </Link>
            <Link href="/skills/document">
              <Button variant="outline" size="lg">
                Document client
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Generator */}
      <div id="generator">
        <Suspense fallback={<div className="h-96 animate-pulse rounded-xl bg-muted/50" />}>
          <KitGenerator autoGenerate={autoGenerate} />
        </Suspense>
      </div>

      {/* Full catalog */}
      <section aria-labelledby="catalog-heading" className="flex flex-col gap-10">
        <div>
          <h2 id="catalog-heading" className="text-3xl font-bold tracking-tight sm:text-4xl">
            Catalogue complet
          </h2>
          <p className="mt-2 text-muted-foreground">
            Toutes les compétences UI/UX, regroupées par catégorie.
          </p>
        </div>

        {categories.map((category) => {
          const categorySkills = getSkillsByCategory(category.id);
          return (
            <div key={category.id} className="flex flex-col gap-4">
              <div className="flex items-baseline justify-between gap-4">
                <h3 className="flex items-center gap-3 text-xl font-semibold sm:text-2xl">
                  <span aria-hidden="true">{category.emoji}</span>
                  {category.title}
                </h3>
                <span className="font-mono text-xs text-muted-foreground">
                  {categorySkills.length} compétences
                </span>
              </div>
              <div
                className={`h-1 w-24 rounded-full bg-gradient-to-r ${category.gradient}`}
                aria-hidden="true"
              />
              <p className="text-sm text-muted-foreground">{category.blurb}</p>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {categorySkills.map((skill, i) => (
                  <SkillCard key={skill.id} skill={skill} index={i} />
                ))}
              </div>
            </div>
          );
        })}
      </section>
    </div>
  );
}
