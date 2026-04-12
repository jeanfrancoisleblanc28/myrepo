"use client";

import { useCallback, useState, useRef, useEffect, type DragEvent } from "react";
import { analyzePdf } from "@/lib/mcp-client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

interface PdfResult {
  id: string;
  pages: number;
  text: string;
}

export function PdfDropzone() {
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PdfResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Abort in-flight request on unmount
  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  const handleFile = useCallback(async (file: File) => {
    if (file.type !== "application/pdf") {
      setError("Seuls les fichiers PDF sont acceptés.");
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      setError("Le fichier dépasse la limite de 50 Mo.");
      return;
    }

    // Cancel any previous in-flight request
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setError(null);
    setResult(null);
    setFileName(file.name);
    setLoading(true);

    const res = await analyzePdf(file, controller.signal);

    if (controller.signal.aborted) return;
    setLoading(false);

    if (res.ok && res.data) {
      setResult(res.data);
    } else {
      setError(res.error || "Erreur inattendue lors de l'analyse.");
    }
  }, []);

  const onDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  const onDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(true);
  }, []);

  const onDragLeave = useCallback(() => setDragging(false), []);

  return (
    <div className="flex flex-col gap-4">
      {/* Drop zone */}
      <div
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
        role="button"
        tabIndex={0}
        aria-label="Zone de dépôt de fichier PDF. Cliquez ou glissez-déposez un fichier."
        aria-busy={loading}
        aria-describedby={error ? "pdf-dropzone-error" : undefined}
        className={cn(
          "flex min-h-[200px] cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed p-8 transition-colors",
          dragging
            ? "border-primary bg-primary/5"
            : error
              ? "border-destructive/50 hover:border-destructive"
              : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50",
        )}
      >
        {/* Upload icon */}
        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground" aria-hidden="true">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>

        {loading ? (
          <p className="text-sm text-muted-foreground">
            Analyse de <strong>{fileName}</strong> en cours...
          </p>
        ) : (
          <>
            <p className="text-sm font-medium text-foreground">
              Glissez-déposez un PDF ici
            </p>
            <p className="text-xs text-muted-foreground">ou cliquez pour parcourir (max 50 Mo)</p>
          </>
        )}

        {loading && (
          <div className="h-1 w-48 overflow-hidden rounded-full bg-muted">
            <div className="h-full w-1/2 animate-slide-in rounded-full bg-primary" />
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          className="sr-only"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
          aria-hidden="true"
          tabIndex={-1}
        />
      </div>

      {/* Error */}
      {error && (
        <div id="pdf-dropzone-error" role="alert" className="flex items-center justify-between rounded-md border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          <span>{error}</span>
          <Button variant="outline" size="sm" onClick={() => { setError(null); setFileName(null); }}>
            Réessayer
          </Button>
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="animate-fade-in rounded-lg border bg-card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold text-foreground">{fileName}</h3>
            <span className="text-sm text-muted-foreground">{result.pages} page{result.pages > 1 ? "s" : ""}</span>
          </div>
          <pre className="max-h-80 overflow-auto rounded-md bg-muted p-4 text-sm leading-relaxed">
            {result.text}
          </pre>
          <div className="mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setResult(null);
                setFileName(null);
              }}
            >
              Analyser un autre fichier
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
