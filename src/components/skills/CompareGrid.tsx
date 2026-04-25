import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/cn";
import {
  getCategory,
  levelLabels,
  type Skill,
} from "@/lib/skills-data";

interface CompareGridProps {
  skills: Skill[];
}

const ROW_LABELS = {
  category: "Catégorie",
  level: "Niveau",
  description: "Description",
  tags: "Tags",
} as const;

export function CompareGrid({ skills }: CompareGridProps) {
  if (skills.length === 0) return null;

  return (
    <div className="overflow-x-auto rounded-xl border bg-card animate-fade-in">
      <table
        className="w-full table-fixed border-collapse text-left"
        style={{ minWidth: skills.length === 2 ? "640px" : "880px" }}
      >
        <caption className="sr-only">
          Comparaison de {skills.length} compétence{skills.length > 1 ? "s" : ""} UI/UX
        </caption>
        <colgroup>
          <col style={{ width: "120px" }} />
          {skills.map((s) => (
            <col key={s.id} />
          ))}
        </colgroup>

        <thead>
          <tr className="border-b">
            <th scope="col" className="sr-only">
              Attribut
            </th>
            {skills.map((skill) => {
              const category = getCategory(skill.categoryId);
              return (
                <th
                  key={skill.id}
                  scope="col"
                  className="relative overflow-hidden p-5 align-top"
                >
                  <div
                    aria-hidden="true"
                    className={cn(
                      "absolute inset-x-0 top-0 h-1 bg-gradient-to-r",
                      category?.gradient ?? "from-primary to-primary",
                    )}
                  />
                  <div className="flex items-start gap-3">
                    <span className="text-3xl leading-none" aria-hidden="true">
                      {category?.emoji}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p
                        className={cn(
                          "text-[10px] font-semibold uppercase tracking-wider",
                          category?.accentText,
                        )}
                      >
                        {(category?.title ?? "").split(" ")[0]}
                      </p>
                      <h2 className="mt-1 text-balance text-lg font-semibold leading-tight text-foreground">
                        {skill.title}
                      </h2>
                    </div>
                  </div>
                </th>
              );
            })}
          </tr>
        </thead>

        <tbody>
          <tr className="border-b">
            <th
              scope="row"
              className="bg-muted/40 p-5 align-top text-xs font-semibold uppercase tracking-wider text-muted-foreground"
            >
              {ROW_LABELS.category}
            </th>
            {skills.map((skill) => {
              const category = getCategory(skill.categoryId);
              return (
                <td key={skill.id} className="p-5 align-top text-sm text-foreground">
                  <span className={cn("font-medium", category?.accentText)}>
                    {category?.emoji} {category?.title}
                  </span>
                </td>
              );
            })}
          </tr>

          <tr className="border-b">
            <th
              scope="row"
              className="bg-muted/40 p-5 align-top text-xs font-semibold uppercase tracking-wider text-muted-foreground"
            >
              {ROW_LABELS.level}
            </th>
            {skills.map((skill) => (
              <td key={skill.id} className="p-5 align-top">
                <Badge variant="outline">{levelLabels[skill.level]}</Badge>
              </td>
            ))}
          </tr>

          <tr className="border-b">
            <th
              scope="row"
              className="bg-muted/40 p-5 align-top text-xs font-semibold uppercase tracking-wider text-muted-foreground"
            >
              {ROW_LABELS.description}
            </th>
            {skills.map((skill) => (
              <td
                key={skill.id}
                className="text-balance p-5 align-top text-sm leading-relaxed text-muted-foreground"
              >
                {skill.description}
              </td>
            ))}
          </tr>

          <tr>
            <th
              scope="row"
              className="bg-muted/40 p-5 align-top text-xs font-semibold uppercase tracking-wider text-muted-foreground"
            >
              {ROW_LABELS.tags}
            </th>
            {skills.map((skill) => (
              <td key={skill.id} className="p-5 align-top">
                <div className="flex flex-wrap gap-1.5">
                  {skill.tags.map((t) => (
                    <span
                      key={t}
                      className="inline-flex items-center rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}
