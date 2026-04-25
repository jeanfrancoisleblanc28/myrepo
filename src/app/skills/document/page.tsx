import { Suspense } from "react";
import { generateKit, getSkillsByIds, type Skill } from "@/lib/skills-data";
import {
  CoverPage,
  SummaryPage,
  SkillDocPage,
  ClosingPage,
} from "@/components/skills/DocumentPages";
import { DocumentToolbar } from "@/components/skills/DocumentToolbar";
import "@/styles/print.css";

export const metadata = {
  title: "Playbook UI/UX — Document",
  description:
    "Document d'engagement A4 haute précision — cover, résumé exécutif, compétences détaillées, signature.",
};

interface DocPageProps {
  searchParams?: {
    ids?: string;
    client?: string;
    author?: string;
    title?: string;
    subtitle?: string;
    accent?: string;
    date?: string;
  };
}

const DEFAULTS = {
  title: "UI/UX Playbook",
  subtitle:
    "Un document d'engagement détaillé présentant les compétences UI/UX retenues pour cette collaboration.",
  clientName: "Client",
  authorName: "MyRepo · UI/UX Practice",
  accent: "#7c3aed",
};

function formatToday(explicit?: string) {
  const d = explicit ? new Date(explicit) : new Date();
  const valid = !isNaN(d.getTime()) ? d : new Date();
  return new Intl.DateTimeFormat("fr-CA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(valid);
}

function kitIdFromIds(ids: string[]): string {
  // Tiny deterministic hash for display only (not cryptographic).
  let h = 0;
  for (const id of ids.join("|")) {
    h = (h * 31 + id.charCodeAt(0)) | 0;
  }
  const hex = (h >>> 0).toString(16).padStart(6, "0").slice(0, 6).toUpperCase();
  return `UIUX-${hex}`;
}

export default function DocumentPage({ searchParams }: DocPageProps) {
  const raw = searchParams?.ids;
  const kit: Skill[] = raw ? getSkillsByIds(raw.split(",")) : [];
  const finalKit = kit.length > 0 ? kit : generateKit({ count: 5, seed: 42 });

  const brand = {
    title: (searchParams?.title || DEFAULTS.title).slice(0, 80),
    subtitle: (searchParams?.subtitle || DEFAULTS.subtitle).slice(0, 280),
    clientName: (searchParams?.client || DEFAULTS.clientName).slice(0, 60),
    authorName: (searchParams?.author || DEFAULTS.authorName).slice(0, 60),
    accent: sanitizeColor(searchParams?.accent) || DEFAULTS.accent,
    dateLabel: formatToday(searchParams?.date),
    kitId: kitIdFromIds(finalKit.map((s) => s.id)),
  };

  // Total pages = cover + summary + N skills + closing
  const total = 1 + 1 + finalKit.length + 1;

  const shareHref = `/skills/document?ids=${finalKit
    .map((s) => s.id)
    .join(",")}${searchParams?.client ? `&client=${encodeURIComponent(searchParams.client)}` : ""}${
    searchParams?.author ? `&author=${encodeURIComponent(searchParams.author)}` : ""
  }${searchParams?.accent ? `&accent=${encodeURIComponent(searchParams.accent)}` : ""}`;
  const backHref = `/skills?ids=${finalKit.map((s) => s.id).join(",")}`;

  return (
    <div className="doc-canvas">
      <Suspense fallback={null}>
        <DocumentToolbar
          backHref={backHref}
          shareHref={shareHref}
          clientName={brand.clientName}
          kitSize={finalKit.length}
        />
      </Suspense>

      <div className="mx-auto max-w-[calc(210mm+48px)] px-6">
        <CoverPage brand={brand} skillsCount={finalKit.length} totalPages={total} />
        <SummaryPage brand={brand} kit={finalKit} page={2} total={total} />
        {finalKit.map((skill, i) => (
          <SkillDocPage
            key={skill.id}
            brand={brand}
            skill={skill}
            order={i + 1}
            page={3 + i}
            total={total}
          />
        ))}
        <ClosingPage brand={brand} page={total} total={total} />
      </div>
    </div>
  );
}

/** Accept only #hex, basic color names, or safe CSS color functions. */
function sanitizeColor(input?: string): string | null {
  if (!input) return null;
  const trimmed = input.trim();
  if (/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(trimmed)) return trimmed;
  if (/^[a-z]{3,20}$/i.test(trimmed)) return trimmed;
  return null;
}
