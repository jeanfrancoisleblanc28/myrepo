"use client";

import Link from "next/link";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";

interface DocumentToolbarProps {
  backHref: string;
  shareHref: string;
  clientName: string;
  kitSize: number;
}

export function DocumentToolbar({ backHref, shareHref, clientName, kitSize }: DocumentToolbarProps) {
  const { toast } = useToast();

  const handlePrint = () => {
    window.print();
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}${shareHref}`);
      toast({
        title: "Lien copié",
        description: "Le document est partageable.",
        variant: "success",
        duration: 2500,
      });
    } catch {
      toast({
        title: "Copie impossible",
        description: "Ton navigateur a refusé le presse-papiers.",
        variant: "error",
        duration: 3000,
      });
    }
  };

  return (
    <div className="doc-toolbar print-hide">
      <div className="doc-toolbar__inner">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            href={backHref}
            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-sm font-medium text-slate-600 hover:bg-slate-200/60"
            aria-label="Retour au catalogue"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Catalogue
          </Link>
          <span aria-hidden="true" className="text-slate-300">·</span>
          <div className="truncate">
            <span className="font-semibold text-slate-800">{clientName}</span>
            <span className="mx-2 text-slate-300">·</span>
            <span className="text-slate-500">{kitSize} compétence{kitSize > 1 ? "s" : ""}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleCopy}>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
            Copier le lien
          </Button>
          <Button size="sm" onClick={handlePrint}>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="6 9 6 2 18 2 18 9" />
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
              <rect x="6" y="14" width="12" height="8" />
            </svg>
            Imprimer / PDF
          </Button>
        </div>
      </div>
    </div>
  );
}
