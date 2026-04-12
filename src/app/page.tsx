import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const features = [
  {
    title: "Analyse PDF",
    description: "Glissez-déposez un PDF et obtenez une analyse complète via le serveur MCP.",
    badge: "MCP",
    href: "/dashboard",
  },
  {
    title: "Design System",
    description: "Composants accessibles (WCAG 2.2 AA), thème clair/sombre, tokens centralisés.",
    badge: "UI",
    href: "#design-system",
  },
  {
    title: "Outils MCP",
    description: "Invoquez les outils disponibles sur votre serveur MCP directement depuis l'interface.",
    badge: "API",
    href: "/dashboard",
  },
];

export default function HomePage() {
  return (
    <div className="flex flex-col gap-16">
      {/* Hero */}
      <section className="flex flex-col items-center gap-6 pt-12 text-center">
        <Badge variant="secondary" className="px-4 py-1 text-sm">
          v0.1.0 — Early Access
        </Badge>
        <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
          Votre interface
          <span className="block text-primary"> MCP-powered</span>
        </h1>
        <p className="max-w-2xl text-lg text-muted-foreground">
          Analysez des documents, invoquez des outils et visualisez les
          résultats — le tout depuis un dashboard moderne connecté à vos
          serveurs MCP.
        </p>
        <div className="flex gap-3">
          <Link href="/dashboard">
            <Button size="lg">Ouvrir le Dashboard</Button>
          </Link>
          <Link href="https://github.com/jeanfrancoisleblanc28/myrepo" target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="lg">GitHub</Button>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section id="design-system" aria-labelledby="features-heading">
        <h2 id="features-heading" className="sr-only">
          Fonctionnalités
        </h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <Card key={f.title} className="flex flex-col">
              <CardHeader>
                <div className="mb-2">
                  <Badge variant="outline">{f.badge}</Badge>
                </div>
                <CardTitle className="text-xl">{f.title}</CardTitle>
                <CardDescription>{f.description}</CardDescription>
              </CardHeader>
              <CardContent className="mt-auto">
                <Link href={f.href}>
                  <Button variant="ghost" size="sm">En savoir plus &rarr;</Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Component showcase */}
      <section aria-labelledby="showcase-heading" className="flex flex-col gap-6">
        <h2 id="showcase-heading" className="text-2xl font-bold">
          Composants UI
        </h2>
        <div className="flex flex-wrap gap-3">
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="primary" loading>Loading...</Button>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge>Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="outline">Outline</Badge>
          <Badge variant="success">Success</Badge>
          <Badge variant="destructive">Error</Badge>
        </div>
      </section>
    </div>
  );
}
