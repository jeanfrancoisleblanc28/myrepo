"use client";

import { useEffect, useState } from "react";
import { healthCheck } from "@/lib/mcp-client";
import { Badge } from "@/components/ui/badge";

type Status = "checking" | "online" | "offline";

export function ServerStatus() {
  const [status, setStatus] = useState<Status>("checking");

  useEffect(() => {
    const controller = new AbortController();

    async function check() {
      const res = await healthCheck(controller.signal);
      if (!controller.signal.aborted) {
        setStatus(res.ok ? "online" : "offline");
      }
    }

    check();
    const interval = setInterval(check, 30_000);
    return () => {
      controller.abort();
      clearInterval(interval);
    };
  }, []);

  const labels: Record<Status, { text: string; variant: "success" | "destructive" | "secondary" }> = {
    checking: { text: "Connexion...", variant: "secondary" },
    online: { text: "MCP En ligne", variant: "success" },
    offline: { text: "MCP Hors ligne", variant: "destructive" },
  };

  const { text, variant } = labels[status];

  return (
    <Badge variant={variant} aria-live="polite" aria-atomic="true">
      <span
        className={`mr-1.5 inline-block h-2 w-2 rounded-full ${
          status === "online"
            ? "bg-emerald-500"
            : status === "offline"
              ? "bg-red-500"
              : "bg-gray-400 animate-pulse"
        }`}
        aria-hidden="true"
      />
      {text}
    </Badge>
  );
}
