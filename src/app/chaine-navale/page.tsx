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
import { SupplierMapLoader } from "@/components/chaine-navale/supplier-map-loader";
import { CiteRef } from "@/components/chaine-navale/cite-ref";
import { cn } from "@/lib/cn";
import {
  analyseStrategique,
  atoutsRegionaux,
  contexte,
  fournisseursGeoreferences,
  friseSNCN,
  niveaux,
  objectifsStrategiques,
  planAction,
  recommandations,
  sources,
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
      data-tier={tier.code}
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

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
                          <CiteRef refs={entreprise.sourceRefs} />
                        </p>
                        <Badge
                          variant={statusBadgeVariant[entreprise.statut]}
                          className="shrink-0"
                        >
                          {statusLabels[entreprise.statut]}
                        </Badge>
                      </div>

                      {(entreprise.anneeFondation ||
                        entreprise.effectifApprox) && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          {entreprise.anneeFondation && (
                            <span>
                              Fondée en {entreprise.anneeFondation.valeur}
                              {entreprise.anneeFondation.estime && " (est.)"}
                            </span>
                          )}
                          {entreprise.anneeFondation &&
                            entreprise.effectifApprox &&
                            " • "}
                          {entreprise.effectifApprox && (
                            <span>
                              {entreprise.effectifApprox.valeur} employés
                              {entreprise.effectifApprox.estime && " (est.)"}
                            </span>
                          )}
                        </p>
                      )}

                      {entreprise.apercu && (
                        <p className="mt-2 text-sm text-muted-foreground">
                          {entreprise.apercu}
                        </p>
                      )}

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

                      {entreprise.certifications &&
                        entreprise.certifications.length > 0 && (
                          <p className="mt-2 text-xs text-muted-foreground">
                            <span className="font-medium text-foreground">
                              Certifications :
                            </span>{" "}
                            {entreprise.certifications.map((c, i) => (
                              <span key={c.nom}>
                                {i > 0 && " • "}
                                {c.nom}
                                {c.statut === "typique-du-secteur" && (
                                  <span className="text-muted-foreground/70">
                                    {" "}
                                    (typique du secteur)
                                  </span>
                                )}
                              </span>
                            ))}
                          </p>
                        )}

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
    <div className="chaine-navale-print flex flex-col gap-12">
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
            <CardDescription>
              Contrat initial SNCN
              <CiteRef refs={["davie-pr-2023"]} />
            </CardDescription>
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
              <CiteRef refs={["davie-pr-2023"]} />
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
            <CardDescription>
              Engagement PME canadiennes
              <CiteRef refs={["davie-pme-200m"]} />
            </CardDescription>
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
        <div className="grid gap-4 sm:grid-cols-2">
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

      {/* Analyse stratégique */}
      <section
        data-pdf-newpage
        aria-labelledby="analyse-heading"
        className="flex flex-col gap-4"
      >
        <h2 id="analyse-heading" className="text-2xl font-bold">
          Analyse stratégique
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {analyseStrategique.map((bloc) => (
            <Card key={bloc.id}>
              <CardHeader>
                <CardTitle className="text-lg">
                  {bloc.titre}
                  <CiteRef refs={bloc.sourceRefs} />
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3 text-sm leading-relaxed text-muted-foreground">
                {bloc.paragraphes.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Carte géographique */}
      <section
        aria-labelledby="map-heading"
        data-pdf-hide
        className="flex flex-col gap-4 print:hidden"
      >
        <div>
          <h2 id="map-heading" className="text-2xl font-bold">
            Carte géographique des fournisseurs
          </h2>
          <p className="mt-1 text-muted-foreground">
            {fournisseursGeoreferences.length} entreprises géoréférencées,
            positionnées sur les zones M-1 (industriel léger) et M-2
            (industrialo-portuaire). Cliquez un marqueur pour le détail.
          </p>
        </div>
        <SupplierMapLoader />
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span
              aria-hidden="true"
              className="inline-block h-3 w-3 rounded-sm border border-red-700"
              style={{ backgroundColor: "rgba(220,38,38,0.15)" }}
            />
            Zone M-2 — Industrialo-portuaire
          </span>
          <span className="flex items-center gap-1.5">
            <span
              aria-hidden="true"
              className="inline-block h-3 w-3 rounded-sm border border-blue-700"
              style={{ backgroundColor: "rgba(37,99,235,0.15)" }}
            />
            Zone M-1 — Industriel léger
          </span>
          <span className="flex items-center gap-1.5">
            <span
              aria-hidden="true"
              className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-slate-900 text-[8px] font-bold text-white"
            >
              T1
            </span>
            Niveau 1 (Fournisseurs directs)
          </span>
          <span className="flex items-center gap-1.5">
            <span
              aria-hidden="true"
              className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-slate-600 text-[8px] font-bold text-white"
            >
              T3
            </span>
            Niveau 3 (Formation et support)
          </span>
        </div>
      </section>

      {/* Carte des niveaux */}
      <section
        data-pdf-newpage
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

      {/* Frise chronologique SNCN */}
      <section
        data-pdf-newpage
        aria-labelledby="frise-heading"
        className="flex flex-col gap-4"
      >
        <div>
          <h2 id="frise-heading" className="text-2xl font-bold">
            Frise chronologique — SNCN et Sorel-Tracy
          </h2>
          <p className="mt-1 text-muted-foreground">
            Jalons publics et internes structurant l&apos;arrivée de Davie
            dans le programme fédéral et la réponse régionale.
          </p>
        </div>
        <ol className="relative ml-3 flex flex-col gap-5 border-l border-muted pl-6" role="list">
          {friseSNCN.map((event) => {
            const statutColor =
              event.statut === "passe"
                ? "bg-emerald-500"
                : event.statut === "en-cours"
                  ? "bg-amber-500"
                  : "bg-muted-foreground/60";
            return (
              <li key={event.triLabel} className="relative">
                <span
                  aria-hidden="true"
                  className={cn(
                    "absolute -left-[31px] top-1.5 inline-block h-3 w-3 rounded-full ring-4 ring-background",
                    statutColor,
                  )}
                />
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {event.date}
                </p>
                <p className="mt-1 font-medium leading-tight">
                  {event.titre}
                  <CiteRef refs={event.sourceRefs} />
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {event.description}
                </p>
              </li>
            );
          })}
        </ol>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span aria-hidden="true" className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-500" />
            Passé
          </span>
          <span className="flex items-center gap-1.5">
            <span aria-hidden="true" className="inline-block h-2.5 w-2.5 rounded-full bg-amber-500" />
            En cours
          </span>
          <span className="flex items-center gap-1.5">
            <span aria-hidden="true" className="inline-block h-2.5 w-2.5 rounded-full bg-muted-foreground/60" />
            À venir
          </span>
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
          <a href="tel:+14507432703">
            <Button variant="outline">450-743-2703</Button>
          </a>
        </div>
      </section>

      {/* Sources & références */}
      <section
        data-pdf-newpage
        id="sources"
        aria-labelledby="sources-heading"
        className="flex flex-col gap-4"
      >
        <div>
          <h2 id="sources-heading" className="text-2xl font-bold">
            Sources et références
          </h2>
          <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
            Les chiffres et énoncés étiquetés{" "}
            <sup className="text-foreground">[n]</sup> renvoient à cette
            bibliographie. Les estimations sont marquées explicitement (« est. »
            ou « typique du secteur ») lorsque la source primaire n&apos;a pas
            pu être confirmée.
          </p>
        </div>
        <ol
          className="flex flex-col gap-2 text-sm"
          role="list"
        >
          {[...sources]
            .sort((a, b) => a.numero - b.numero)
            .map((src) => (
              <li
                key={src.id}
                id={`source-${src.numero}`}
                className="flex gap-3 rounded-md border bg-card p-3 scroll-mt-20"
              >
                <span className="shrink-0 font-mono text-xs font-semibold text-muted-foreground">
                  [{src.numero}]
                </span>
                <div className="flex flex-col gap-0.5">
                  <p className="font-medium leading-snug">{src.organisation}</p>
                  <p className="text-muted-foreground">
                    {src.titre}
                    {src.date && (
                      <span className="text-muted-foreground/70">
                        {" "}
                        — {src.date}
                      </span>
                    )}
                  </p>
                  {src.url && (
                    <a
                      href={src.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline"
                    >
                      {src.url.replace(/^https?:\/\//, "")}
                    </a>
                  )}
                </div>
              </li>
            ))}
        </ol>
        <p className="text-xs italic text-muted-foreground">
          Note méthodologique : les sources [1]–[10] sont publiques. La source
          [11] est une note interne DÉPS communiquée au comité de direction.
          Toute donnée non sourcée doit être considérée comme une estimation
          de travail à valider avec les organisations concernées.
        </p>
      </section>
    </div>
  );
}
