import { sources } from "@/lib/naval-supply-chain";
import { cn } from "@/lib/cn";

/**
 * Inline citation marker `[n]` that links to a source entry in the
 * bibliography (section `#sources`). Silent on prepublication PDF if
 * the source is missing.
 */
export function CiteRef({
  refs,
  className,
}: {
  refs?: string[];
  className?: string;
}) {
  if (!refs || refs.length === 0) return null;
  const numeros = refs
    .map((id) => sources.find((s) => s.id === id)?.numero)
    .filter((n): n is number => typeof n === "number")
    .sort((a, b) => a - b);
  if (numeros.length === 0) return null;
  return (
    <sup className={cn("ml-0.5 text-[10px] text-muted-foreground", className)}>
      {numeros.map((n, i) => (
        <span key={n}>
          {i > 0 && ","}
          <a
            href={`#source-${n}`}
            className="hover:text-foreground hover:underline"
            aria-label={`Source ${n}`}
          >
            [{n}]
          </a>
        </span>
      ))}
    </sup>
  );
}
