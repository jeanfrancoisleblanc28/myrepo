import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import {
  atoutsRegionaux,
  contexte,
  niveaux,
  objectifsStrategiques,
  planAction,
  recommandations,
  statusBadgeVariant,
  statusLabels,
  totalEntreprisesCartographiees,
  type SupplyChainTier,
  type TierColor,
} from "@/lib/naval-supply-chain";

export const metadata = {
  title: "Chaîne d'approvisionnement navale — MRC Pierre-De Saurel",
  description:
    "Cartographie des fournisseurs niveaux 1, 2 et 3 de la région de Sorel-Tracy pour la Stratégie nationale de construction navale (Chantier Davie).",
};

const tierAccent: Record<TierColor, string> = {
  primary: "border-primary/40 bg-primary/5",
  secondary: "border-secondary-foreground/30 bg-secondary/30",
  muted: "border-muted-foreground/20 bg-muted/40",
};

const tierBadge: Record<TierColor, "default" | "secondary" | "outline"> = {
  primary: "default",
  secondary: "secondary",
  muted: "outline",
};

function TierSection({ tier }: { tier: SupplyChainTier }) {
  return (
    <section
      aria-labelledby={`tier-${tier.code}-heading`}
      className={cn(
        "rounded-lg border p-6 sm:p-8",
        tierAccent[tier.couleur],
      )}
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Badge variant={tierBadge[tier.couleur]} className="mb-2">
            {tier.code}
          </Badge>
          <h3
            id={`tier-${tier.code}-heading`}
            className="text-2xl font-semibold tracking-tight"
          >
            {tier.nom}
          </h3>
          <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
            {tier.description}
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {tier.categories.map((category) => (
          <Card key={category.id} className="flex flex-col">
            <CardHeader>
              <CardTitle className="text-lg">{category.nom}</CardTitle>
              {category.entreprises.length === 0 &&
                category.competencesRecherchees && (
                  <CardDescription>
                    Compétences ciblées — recensement DÉPS en cours
                  </CardDescription>
                )}
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {category.entreprises.length > 0 && (
                <ul className="flex flex-col gap-3" role="list">
                  {category.entreprises.map((entreprise) => (
                    <li
                      key={entreprise.nom}
                      className="rounded-md border bg-background p-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-medium leading-tight">
                          {entreprise.nom}
                        </p>
                        <Badge
                          variant={statusBadgeVariant[entreprise.statut]}
                          className="shrink-0"
                        >
                          {statusLabels[entreprise.statut]}
                        </Badge>
                      </div>
                      <ul
                        className="mt-2 flex flex-wrap gap-1.5"
                        role="list"
                        aria-label={`Spécialités de ${entreprise.nom}`}
                      >
                        {entreprise.specialites.map((s) => (
                          <li key={s}>
                            <Badge variant="outline" className="font-normal">
                              {s}
                            </Badge>
                          </li>
                        ))}
                      </ul>
                      {entreprise.partenariatStrategique && (
                        <p className="mt-2 text-xs text-muted-foreground">
                          {entreprise.partenariatStrategique}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              )}

              {category.competencesRecherchees && (
                <ul
                  className="flex flex-col gap-1.5 text-sm text-muted-foreground"
                  role="list"
                >
                  {category.competencesRecherchees.map((c) => (
                    <li key={c} className="flex gap-2">
                      <span aria-hidden="true" className="text-primary">
                        •
                      </span>
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

export default function ChaineNavalePage() {
  return (
    <div className="flex flex-col gap-12">
      {/* Header */}
      <header className="flex flex-col gap-4">
        <Badge variant="outline" className="w-fit">
          Note stratégique — DÉPS, mai 2026
        </Badge>
        <h1 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">
          Chaîne d&apos;approvisionnement navale — Sorel-Tracy
        </h1>
        <p className="max-w-3xl text-lg text-muted-foreground">
          Cartographie des capacités industrielles de la MRC Pierre-De Saurel
          en appui à la Stratégie nationale de construction navale et au
          carnet de commandes de Chantier Davie.
        </p>
      </header>

      {/* Contexte chiffres-clés */}
      <section
        aria-labelledby="contexte-heading"
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        <h2 id="contexte-heading" className="sr-only">
          Contexte stratégique
        </h2>
        <Card>
          <CardHeader>
            <CardDescription>Contrat initial SNCN</CardDescription>
            <CardTitle className="text-3xl">
              {contexte.contratInitialMilliards} G$
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Brise-glaces lourds et traversiers hybrides
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>
              Retombées prévues d&apos;ici {contexte.horizonRetombees}
            </CardDescription>
            <CardTitle className="text-3xl">
              {contexte.retombeesPrevuesMilliards} G$
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Estimation publique de Chantier Davie
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Engagement PME canadiennes</CardDescription>
            <CardTitle className="text-3xl">
              {contexte.engagementPmeMillions} M$
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Cible Davie pour la sous-traitance régionale
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Fournisseurs cartographiés</CardDescription>
            <CardTitle className="text-3xl">
              {totalEntreprisesCartographiees}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Entreprises recensées sur le territoire
          </CardContent>
        </Card>
      </section>

      {/* Objectifs stratégiques */}
      <section
        aria-labelledby="objectifs-heading"
        className="flex flex-col gap-4"
      >
        <h2 id="objectifs-heading" className="text-2xl font-bold">
          Pourquoi cartographier l&apos;écosystème naval ?
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          {objectifsStrategiques.map((obj) => (
            <Card key={obj.id}>
              <CardHeader>
                <CardTitle className="text-lg">{obj.titre}</CardTitle>
                <CardDescription>{obj.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      {/* Carte des niveaux */}
      <section
        aria-labelledby="niveaux-heading"
        className="flex flex-col gap-6"
      >
        <div>
          <h2 id="niveaux-heading" className="text-2xl font-bold">
            Cartographie des fournisseurs
          </h2>
          <p className="mt-1 text-muted-foreground">
            Trois niveaux selon la méthodologie Optchain (OPTEL, 2024).
          </p>
        </div>
        <div className="flex flex-col gap-6">
          {niveaux.map((tier) => (
            <TierSection key={tier.code} tier={tier} />
          ))}
        </div>
      </section>

      {/* Plan d'action */}
      <section
        aria-labelledby="plan-heading"
        className="flex flex-col gap-4"
      >
        <h2 id="plan-heading" className="text-2xl font-bold">
          Plan d&apos;action en 4 étapes
        </h2>
        <ol className="flex flex-col gap-4" role="list">
          {planAction.map((etape) => (
            <li key={etape.ordre}>
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <span
                      aria-hidden="true"
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground"
                    >
                      {etape.ordre}
                    </span>
                    <CardTitle className="text-lg">{etape.nom}</CardTitle>
                    <Badge variant="outline" className="ml-auto">
                      {etape.echeance}
                    </Badge>
                  </div>
                  <CardDescription className="pt-1">
                    {etape.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            </li>
          ))}
        </ol>
      </section>

      {/* Recommandations + atouts */}
      <section className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 flex flex-col gap-4">
          <h2 className="text-2xl font-bold">Prochaines étapes</h2>
          <ul className="flex flex-col gap-3" role="list">
            {recommandations.map((rec) => (
              <li key={rec.id}>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">{rec.titre}</CardTitle>
                    <CardDescription>{rec.description}</CardDescription>
                  </CardHeader>
                </Card>
              </li>
            ))}
          </ul>
        </div>
        <aside className="flex flex-col gap-4">
          <h2 className="text-2xl font-bold">Atouts régionaux</h2>
          <Card>
            <CardContent className="pt-6">
              <ul
                className="flex flex-col gap-2 text-sm"
                role="list"
                aria-label="Atouts régionaux"
              >
                {atoutsRegionaux.map((a) => (
                  <li key={a} className="flex gap-2">
                    <span aria-hidden="true" className="text-primary">
                      ✓
                    </span>
                    <span>{a}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </aside>
      </section>

      {/* CTA */}
      <section
        aria-labelledby="cta-heading"
        className="rounded-lg border bg-muted/30 p-6 sm:p-8"
      >
        <h2 id="cta-heading" className="text-xl font-semibold">
          Vous êtes une PME manufacturière ?
        </h2>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Le DÉPS bâtit un registre des capacités régionales en lien avec la
          chaîne navale. Faites-vous connaître pour intégrer les rencontres
          B2B avec Davie et Naval Québec.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href="/dashboard">
            <Button>Ouvrir le dashboard</Button>
          </Link>
          <a href="tel:4507432703">
            <Button variant="outline">450-743-2703</Button>
          </a>
        </div>
      </section>
    </div>
  );
}
