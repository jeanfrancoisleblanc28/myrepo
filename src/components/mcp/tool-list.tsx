"use client";

import { useEffect, useState, useCallback } from "react";
import { listTools, invokeTool } from "@/lib/mcp-client";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";

export function ToolList() {
  const [tools, setTools] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [invoking, setInvoking] = useState<string | null>(null);
  const [output, setOutput] = useState<Record<string, string>>({});
  const { toast } = useToast();

  const load = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError(null);
    const res = await listTools(signal);
    if (signal?.aborted) return;
    setLoading(false);
    if (res.ok && res.data) {
      setTools(res.data.tools);
    } else {
      setError(res.error || "Impossible de charger les outils.");
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal);
    return () => controller.abort();
  }, [load]);

  async function handleInvoke(tool: string) {
    setInvoking(tool);
    const res = await invokeTool(tool, {});
    setInvoking(null);

    if (res.ok) {
      const data = JSON.stringify(res.data, null, 2);
      setOutput((prev) => ({ ...prev, [tool]: data }));
      toast({ title: `${tool} exécuté`, description: "Résultat disponible ci-dessous.", variant: "success", duration: 3000 });
    } else {
      const err = res.error || "Erreur";
      setOutput((prev) => ({ ...prev, [tool]: err }));
      toast({ title: `Échec de ${tool}`, description: err, variant: "error", duration: 5000 });
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-3">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div role="alert" className="flex items-center justify-between rounded-md border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
        <span>{error}</span>
        <Button variant="outline" size="sm" onClick={() => load()}>
          Réessayer
        </Button>
      </div>
    );
  }

  if (tools.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Aucun outil disponible. Vérifiez que le serveur MCP est démarré.
      </p>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {tools.map((tool) => (
        <Card key={tool}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">{tool}</CardTitle>
              <Badge variant="outline" className="text-xs">MCP</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <Button
              variant="secondary"
              size="sm"
              loading={invoking === tool}
              onClick={() => handleInvoke(tool)}
            >
              Exécuter
            </Button>
            {output[tool] && (
              <pre className="mt-3 max-h-40 overflow-auto rounded-md bg-muted p-3 text-xs">
                {output[tool]}
              </pre>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
