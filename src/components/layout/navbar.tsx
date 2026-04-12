"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "./theme-toggle";
import { cn } from "@/lib/cn";

const links = [
  { href: "/", label: "Accueil" },
  { href: "/dashboard", label: "Dashboard" },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-[100] w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8" aria-label="Navigation principale">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-lg font-bold tracking-tight text-foreground">
            MyRepo
          </Link>
          <ul className="flex items-center gap-1" role="list">
            {links.map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  className={cn(
                    "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    pathname === href
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                  )}
                  aria-current={pathname === href ? "page" : undefined}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", ctrlKey: true }))}
            className={cn(
              "hidden sm:inline-flex items-center gap-2 rounded-md border bg-muted/50 px-3 py-1.5 text-sm text-muted-foreground",
              "hover:bg-accent hover:text-accent-foreground transition-colors",
            )}
            aria-label="Ouvrir la palette de commandes"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
            </svg>
            Rechercher...
            <kbd className="ml-2 rounded border bg-background px-1.5 py-0.5 font-mono text-[10px]">Ctrl K</kbd>
          </button>
          <ThemeToggle />
        </div>
      </nav>
    </header>
  );
}
