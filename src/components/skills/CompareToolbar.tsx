"use client";

import Link from "next/link";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";

interface CompareToolbarProps {
  shareHref: string;
  backHref: string;
  presentHref: string;
}

export function CompareToolbar({ shareHref, backHref, presentHref }: CompareToolbarProps) {
  const { toast } = useToast();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}${shareHref}`);
      toast({
        title: "Lien copié",
        description: "La comparaison est partageable.",
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
    <div className="flex flex-wrap items-center gap-2">
      <Link href={backHref}>
        <Button variant="outline" size="sm">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Catalogue
        </Button>
      </Link>
      <Link href={presentHref}>
        <Button variant="secondary" size="sm">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polygon points="6 3 20 12 6 21 6 3" />
          </svg>
          Présentation
        </Button>
      </Link>
      <Button variant="outline" size="sm" onClick={handleCopy}>
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
        </svg>
        Copier le lien
      </Button>
    </div>
  );
}
