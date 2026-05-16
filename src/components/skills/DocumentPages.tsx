import type { CSSProperties } from "react";
import { categories, getCategory, levelLabels, type Skill } from "@/lib/skills-data";

interface BrandContext {
  title: string;
  subtitle: string;
  clientName: string;
  authorName: string;
  accent: string; // hex or CSS color
  dateLabel: string;
  kitId: string;
}

// ── Cover page ─────────────────────────────────────────────────────────
export function CoverPage({
  brand,
  skillsCount,
  totalPages,
}: {
  brand: BrandContext;
  skillsCount: number;
  totalPages: number;
}) {
  return (
    <article
      className="doc-page doc-page--cover"
      style={{ "--doc-accent": brand.accent } as CSSProperties}
      aria-label="Page de couverture"
    >
      <div className="doc-cover-bg" aria-hidden="true" />
      <div className="doc-cover-inner">
        <header className="flex items-start justify-between">
          <div>
            <p className="doc-kicker">{brand.authorName}</p>
            <p className="mt-1 text-sm/[1.4] opacity-80">
              UI/UX Expertise · Playbook d&apos;engagement
            </p>
          </div>
          <div className="text-right">
            <p className="doc-kicker">Référence</p>
            <p className="mt-1 font-mono text-[10pt] opacity-90">{brand.kitId}</p>
          </div>
        </header>

        <div className="flex flex-col gap-6">
          <hr className="doc-rule-accent" />
          <h1 className="doc-title doc-title--cover">{brand.title}</h1>
          <p className="doc-subtitle max-w-[150mm]">{brand.subtitle}</p>
        </div>

        <footer className="flex items-end justify-between">
          <div>
            <p className="doc-kicker">Préparé pour</p>
            <p className="mt-1 text-[16pt] font-semibold tracking-tight">
              {brand.clientName}
            </p>
          </div>
          <div className="text-right">
            <p className="doc-kicker">Contenu</p>
            <p className="mt-1 font-mono text-[11pt] opacity-90">
              {skillsCount} compétence{skillsCount > 1 ? "s" : ""} · {totalPages} pages
            </p>
            <p className="mt-1 font-mono text-[10pt] opacity-70">{brand.dateLabel}</p>
          </div>
        </footer>
      </div>
    </article>
  );
}

// ── Shared header/footer ───────────────────────────────────────────────
function DocHeader({ brand }: { brand: BrandContext }) {
  return (
    <div className="doc-header">
      <span>{brand.authorName}</span>
      <span>{brand.title}</span>
    </div>
  );
}

function DocFooter({
  brand,
  page,
  total,
  sectionLabel,
}: {
  brand: BrandContext;
  page: number;
  total: number;
  sectionLabel?: string;
}) {
  return (
    <div className="doc-footer">
      <span>
        <strong>{brand.clientName}</strong>
        {sectionLabel ? <> · {sectionLabel}</> : null}
      </span>
      <span>
        {String(page).padStart(2, "0")} / {String(total).padStart(2, "0")}
      </span>
    </div>
  );
}

// ── Summary + TOC page ─────────────────────────────────────────────────
export function SummaryPage({
  brand,
  kit,
  page,
  total,
}: {
  brand: BrandContext;
  kit: Skill[];
  page: number;
  total: number;
}) {
  const cats = new Set(kit.map((s) => s.categoryId));
  return (
    <article
      className="doc-page"
      style={{ "--doc-accent": brand.accent } as CSSProperties}
      aria-label="Résumé exécutif"
    >
      <DocHeader brand={brand} />
      <div className="flex h-full flex-col gap-8 pt-6">
        <div>
          <p className="doc-kicker">Résumé exécutif</p>
          <h2 className="doc-title mt-3">À propos de ce document</h2>
        </div>
        <hr className="doc-rule-accent" />
        <p className="doc-lead max-w-[160mm]">
          Ce playbook présente un kit sur-mesure de <strong>{kit.length} compétences UI/UX</strong>{" "}
          retenues parmi les {categories.length} catégories du référentiel{" "}
          <em>UI/UX Pro Max</em>. Il couvre {cats.size} domaine
          {cats.size > 1 ? "s" : ""} d&apos;expertise et propose, pour chaque compétence,
          un positionnement clair, un principe-clé et les leviers d&apos;application
          concrets sur lesquels l&apos;équipe peut s&apos;appuyer dans ses prochaines
          livraisons.
        </p>

        <div>
          <p className="doc-kicker mb-3">Sommaire</p>
          <ol className="doc-toc">
            {kit.map((s, i) => {
              const cat = getCategory(s.categoryId);
              return (
                <li key={s.id} className="doc-toc__item">
                  <span className="doc-toc__num">{String(i + 1).padStart(2, "0")}</span>
                  <div>
                    <span className="doc-toc__title">{s.title}</span>
                    <span className="doc-toc__cat">
                      {cat?.emoji} {cat?.title}
                    </span>
                  </div>
                  <span className="doc-toc__page">p. {String(page + 1 + i).padStart(2, "0")}</span>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
      <DocFooter brand={brand} page={page} total={total} sectionLabel="Résumé" />
    </article>
  );
}

// ── Skill page ─────────────────────────────────────────────────────────
export function SkillDocPage({
  brand,
  skill,
  order,
  page,
  total,
}: {
  brand: BrandContext;
  skill: Skill;
  order: number;
  page: number;
  total: number;
}) {
  const cat = getCategory(skill.categoryId);

  // Derive a "principe-clé" pull-quote from the description's first sentence
  // and "comment l'appliquer" bullets from the description's remaining fragments
  // if available — otherwise fall back to a single-sentence layout.
  const sentences = skill.description
    .split(/(?<=[.!?])\s+/)
    .filter((s) => s.trim().length > 0);
  const principle = sentences[0]?.replace(/\.$/, "") ?? skill.description;

  return (
    <article
      className="doc-page"
      style={{ "--doc-accent": brand.accent } as CSSProperties}
      aria-label={`Compétence ${order}: ${skill.title}`}
    >
      <DocHeader brand={brand} />
      <div className="doc-skill">
        <div>
          <span className="doc-skill__index">{String(order).padStart(2, "0")}</span>
          <div className="mt-3">
            <span className="doc-chip" aria-hidden={false}>
              <span className="doc-chip__dot" aria-hidden="true" />
              {cat?.emoji} {cat?.title}
            </span>
          </div>
        </div>

        <div>
          <h2 className="doc-title">{skill.title}</h2>
        </div>

        <div className="doc-skill__body">
          <p className="doc-skill__desc">{skill.description}</p>
          <blockquote className="doc-pullquote">
            « {principle}. »
          </blockquote>
          <dl className="doc-kv">
            <dt className="doc-kv__k">Niveau</dt>
            <dd className="doc-kv__v">{levelLabels[skill.level]}</dd>
            <dt className="doc-kv__k">Domaine</dt>
            <dd className="doc-kv__v">{cat?.title}</dd>
            <dt className="doc-kv__k">Mots-clés</dt>
            <dd className="doc-kv__v">
              <div className="doc-tagrow">
                {skill.tags.map((t) => (
                  <span key={t} className="doc-tag">
                    {t}
                  </span>
                ))}
              </div>
            </dd>
          </dl>
        </div>
      </div>
      <DocFooter brand={brand} page={page} total={total} sectionLabel={`Compétence ${order}`} />
    </article>
  );
}

// ── Closing page ───────────────────────────────────────────────────────
export function ClosingPage({
  brand,
  page,
  total,
}: {
  brand: BrandContext;
  page: number;
  total: number;
}) {
  return (
    <article
      className="doc-page"
      style={{ "--doc-accent": brand.accent } as CSSProperties}
      aria-label="Signature et prochaines étapes"
    >
      <DocHeader brand={brand} />
      <div className="doc-closing pt-6">
        <div>
          <p className="doc-kicker">Engagement</p>
          <h2 className="doc-title mt-3">Prochaines étapes</h2>
        </div>
        <hr className="doc-rule-accent" />
        <p className="doc-lead max-w-[160mm]">
          Ce playbook est vivant. Nous proposons trois jalons pour ancrer ces
          compétences dans les livrables à venir : une revue conjointe sous 7
          jours, un pilote sur un périmètre ciblé, puis une généralisation
          progressive appuyée par une mesure continue (Core Web Vitals, audits
          a11y, retours utilisateurs).
        </p>

        <dl className="doc-kv">
          <dt className="doc-kv__k">Référence</dt>
          <dd className="doc-kv__v font-mono">{brand.kitId}</dd>
          <dt className="doc-kv__k">Émis le</dt>
          <dd className="doc-kv__v">{brand.dateLabel}</dd>
          <dt className="doc-kv__k">Préparé par</dt>
          <dd className="doc-kv__v">{brand.authorName}</dd>
          <dt className="doc-kv__k">Destinataire</dt>
          <dd className="doc-kv__v">{brand.clientName}</dd>
        </dl>

        <div className="doc-signature">
          <div>
            <div className="doc-sign-box__line" aria-hidden="true" />
            <p className="doc-sign-box__label">{brand.authorName}</p>
          </div>
          <div>
            <div className="doc-sign-box__line" aria-hidden="true" />
            <p className="doc-sign-box__label">{brand.clientName}</p>
          </div>
        </div>
      </div>
      <DocFooter brand={brand} page={page} total={total} sectionLabel="Engagement" />
    </article>
  );
}
