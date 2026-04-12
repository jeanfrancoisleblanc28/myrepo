"use client";

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "@/components/layout/theme-provider";
import { cn } from "@/lib/cn";

interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon: ReactNode;
  group: string;
  keywords?: string[];
  action: () => void;
}

// SVG icons for command items
const NavIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

const DashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect width="7" height="9" x="3" y="3" rx="1" /><rect width="7" height="5" x="14" y="3" rx="1" /><rect width="7" height="9" x="14" y="12" rx="1" /><rect width="7" height="5" x="3" y="16" rx="1" />
  </svg>
);

const SunIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
  </svg>
);

const MoonIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
  </svg>
);

const ToolIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
  </svg>
);

const FileIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" />
  </svg>
);

const GithubIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" /><path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { resolved, setTheme } = useTheme();

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setActiveIndex(0);
  }, []);

  const items: CommandItem[] = useMemo(
    () => [
      {
        id: "nav-home",
        label: "Accueil",
        description: "Retourner à la page d'accueil",
        icon: <NavIcon />,
        group: "Navigation",
        keywords: ["home", "accueil", "page"],
        action: () => { router.push("/"); close(); },
      },
      {
        id: "nav-dashboard",
        label: "Dashboard",
        description: "Ouvrir le tableau de bord MCP",
        icon: <DashIcon />,
        group: "Navigation",
        keywords: ["dashboard", "tableau", "bord", "mcp"],
        action: () => { router.push("/dashboard"); close(); },
      },
      {
        id: "theme-toggle",
        label: resolved === "dark" ? "Mode clair" : "Mode sombre",
        description: "Basculer le thème de l'interface",
        icon: resolved === "dark" ? <SunIcon /> : <MoonIcon />,
        group: "Apparence",
        keywords: ["theme", "dark", "light", "sombre", "clair", "mode"],
        action: () => { setTheme(resolved === "dark" ? "light" : "dark"); close(); },
      },
      {
        id: "mcp-tools",
        label: "Outils MCP",
        description: "Voir les outils disponibles sur le serveur",
        icon: <ToolIcon />,
        group: "MCP",
        keywords: ["tools", "outils", "serveur", "mcp", "invoke"],
        action: () => { router.push("/dashboard#tools-heading"); close(); },
      },
      {
        id: "mcp-pdf",
        label: "Analyser un PDF",
        description: "Ouvrir la zone d'upload de documents",
        icon: <FileIcon />,
        group: "MCP",
        keywords: ["pdf", "document", "analyser", "upload", "fichier"],
        action: () => { router.push("/dashboard#pdf-heading"); close(); },
      },
      {
        id: "github",
        label: "Voir sur GitHub",
        description: "Ouvrir le repository dans un nouvel onglet",
        icon: <GithubIcon />,
        group: "Liens",
        keywords: ["github", "repo", "code", "source"],
        action: () => { window.open("https://github.com/jeanfrancoisleblanc28/myrepo", "_blank"); close(); },
      },
    ],
    [resolved, setTheme, router, close],
  );

  // Filter items by query
  const filtered = useMemo(() => {
    if (!query.trim()) return items;
    const q = query.toLowerCase();
    return items.filter(
      (item) =>
        item.label.toLowerCase().includes(q) ||
        item.description?.toLowerCase().includes(q) ||
        item.keywords?.some((k) => k.includes(q)),
    );
  }, [items, query]);

  // Group filtered items
  const groups = useMemo(() => {
    const map = new Map<string, CommandItem[]>();
    for (const item of filtered) {
      const existing = map.get(item.group) || [];
      existing.push(item);
      map.set(item.group, existing);
    }
    return map;
  }, [filtered]);

  // Flatten for index-based navigation
  const flatItems = useMemo(() => filtered, [filtered]);

  // Reset active index when query changes
  useEffect(() => setActiveIndex(0), [query]);

  // Global keyboard shortcut
  useEffect(() => {
    function handler(e: globalThis.KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === "Escape" && open) {
        close();
      }
    }
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, close]);

  // Auto-focus input when opening
  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  // Scroll active item into view
  useEffect(() => {
    if (!listRef.current) return;
    const active = listRef.current.querySelector("[data-active='true']");
    active?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, flatItems.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && flatItems[activeIndex]) {
      e.preventDefault();
      flatItems[activeIndex].action();
    }
  };

  if (!open) return null;

  let globalIndex = -1;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[400] flex items-start justify-center bg-black/50 backdrop-blur-sm pt-[20vh] animate-fade-in"
      onClick={(e) => e.target === overlayRef.current && close()}
      role="dialog"
      aria-modal="true"
      aria-label="Palette de commandes"
    >
      <div className="w-full max-w-lg mx-4 overflow-hidden rounded-xl border bg-card shadow-2xl animate-fade-in">
        {/* Search input */}
        <div className="flex items-center gap-3 border-b px-4">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-muted-foreground" aria-hidden="true">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            placeholder="Rechercher une commande..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none"
            role="combobox"
            aria-expanded="true"
            aria-controls="command-list"
            aria-activedescendant={flatItems[activeIndex] ? `cmd-${flatItems[activeIndex].id}` : undefined}
          />
          <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] text-muted-foreground">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div
          ref={listRef}
          id="command-list"
          role="listbox"
          className="max-h-72 overflow-y-auto p-2"
        >
          {flatItems.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Aucun résultat pour &quot;{query}&quot;
            </p>
          ) : (
            Array.from(groups.entries()).map(([group, groupItems]) => (
              <div key={group}>
                <p className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                  {group}
                </p>
                {groupItems.map((item) => {
                  globalIndex++;
                  const isActive = globalIndex === activeIndex;
                  const idx = globalIndex;
                  return (
                    <div
                      key={item.id}
                      id={`cmd-${item.id}`}
                      role="option"
                      aria-selected={isActive}
                      data-active={isActive}
                      onClick={item.action}
                      onMouseEnter={() => setActiveIndex(idx)}
                      className={cn(
                        "flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                        isActive
                          ? "bg-accent text-accent-foreground"
                          : "text-foreground hover:bg-accent/50",
                      )}
                    >
                      <span className="shrink-0 text-muted-foreground">{item.icon}</span>
                      <div className="flex-1 min-w-0">
                        <span className="font-medium">{item.label}</span>
                        {item.description && (
                          <span className="ml-2 text-xs text-muted-foreground">{item.description}</span>
                        )}
                      </div>
                      {isActive && (
                        <kbd className="hidden sm:inline-flex shrink-0 h-5 items-center rounded border bg-muted px-1.5 font-mono text-[10px] text-muted-foreground">
                          Enter
                        </kbd>
                      )}
                    </div>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t px-4 py-2 text-xs text-muted-foreground">
          <div className="flex gap-2">
            <span className="inline-flex items-center gap-1">
              <kbd className="rounded border bg-muted px-1 font-mono">&#8593;&#8595;</kbd> naviguer
            </span>
            <span className="inline-flex items-center gap-1">
              <kbd className="rounded border bg-muted px-1 font-mono">Enter</kbd> sélectionner
            </span>
          </div>
          <span className="inline-flex items-center gap-1">
            <kbd className="rounded border bg-muted px-1 font-mono">Ctrl</kbd>+<kbd className="rounded border bg-muted px-1 font-mono">K</kbd>
          </span>
        </div>
      </div>
    </div>
  );
}
