import Link from "next/link";
import { getSkillsByIds, type Skill } from "@/lib/skills-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AuroraBackground } from "@/components/skills/AuroraBackground";
import { CompareGrid } from "@/components/skills/CompareGrid";
import { CompareToolbar } from "@/components/skills/CompareToolbar";

const MAX_COLUMNS = 3;

export const metadata = {
  title: "Comparer des compétences UI/UX",
  description:
    "Mettez 2 à 3 compétences UI/UX en regard pour arbitrer côté design system, accessibilité, performance et plus.",
};

interface ComparePageProps {
  searchParams?: { ids?: string };
}

export default function ComparePage({ searchParams }: ComparePageProps) {
  const raw = searchParams?.ids?.trim();
  const requested: Skill[] = raw ? getSkillsByIds(raw.split(",")) : [];
  const visible = requested.slice(0, MAX_COLUMNS);
  const hiddenCount = Math.max(0, requested.length - MAX_COLUMNS);

  const idsForLinks = visible.map((s) => s.id).join(",");
  const shareHref = idsForLinks ? `/skills/compare?ids=${idsForLinks}` : "/skills/compare";
  const backHref = idsForLinks ? `/skills?ids=${idsForLinks}` : "/skills";
  const presentHref = idsForLinks ? `/skills/present?ids=${idsForLinks}` : "/skills/present";

  const enoughToCompare = visible.length >= 2;

  return (
    <main className="relative min-h-screen overflow-hidden">
      <AuroraBackground intensity="subtle" />
      <div className="relative mx-auto max-w-6xl px-6 py-12 sm:py-16">
        <header className="mb-8 flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Badge variant="secondary">Comparaison</Badge>
            {hiddenCount > 0 && (
              <Badge variant="outline" title={`${hiddenCount} compétence(s) après les 3 premières ont été ignorées`}>
                +{hiddenCount} ignoré{hiddenCount > 1 ? "s" : ""}
              </Badge>
            )}
          </div>
          <h1
            className="text-balance font-bold leading-[1.05] tracking-tight"
            style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)" }}
          >
            Comparer 2 à 3 compétences UI/UX
          </h1>
          <p className="max-w-2xl text-pretty text-base text-muted-foreground sm:text-lg">
            Place les compétences-clés côte à côte pour aider une équipe à arbitrer entre des
            priorités design, accessibilité, performance ou contenu.
          </p>
          {enoughToCompare && (
            <CompareToolbar
              shareHref={shareHref}
              backHref={backHref}
              presentHref={presentHref}
            />
          )}
        </header>

        {enoughToCompare ? (
          <CompareGrid skills={visible} />
        ) : (
          <EmptyState fewIds={visible.length === 1} />
        )}
      </div>
    </main>
  );
}

function EmptyState({ fewIds }: { fewIds: boolean }) {
  return (
    <div className="flex flex-col items-start gap-4 rounded-xl border bg-card p-8 sm:p-10 animate-fade-in">
      <h2 className="text-xl font-semibold tracking-tight">
        {fewIds
          ? "Il faut au moins 2 compétences pour comparer."
          : "Choisis 2 à 3 compétences à comparer."}
      </h2>
      <p className="max-w-prose text-sm text-muted-foreground">
        Génère un kit dans le catalogue, puis utilise le bouton « Comparer » pour arriver ici avec
        les compétences déjà sélectionnées. Tu peux aussi composer une URL directe :
        <code className="ml-1 rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
          /skills/compare?ids=ds-tokens,a11y-wcag,perf-vitals
        </code>
        .
      </p>
      <div className="flex flex-wrap gap-2">
        <Link href="/skills?generate=1#generator">
          <Button size="sm">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
            </svg>
            Générer un kit
          </Button>
        </Link>
        <Link href="/skills">
          <Button variant="outline" size="sm">
            Catalogue complet
          </Button>
        </Link>
      </div>
    </div>
  );
}
