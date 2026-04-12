import { ServerStatus } from "@/components/mcp/server-status";
import { PdfDropzone } from "@/components/mcp/pdf-dropzone";
import { ToolList } from "@/components/mcp/tool-list";

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-10">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="mt-1 text-muted-foreground">
            Connecté à votre serveur MCP — analysez des documents et invoquez des outils.
          </p>
        </div>
        <ServerStatus />
      </div>

      {/* PDF Analysis */}
      <section aria-labelledby="pdf-heading" className="flex flex-col gap-4">
        <h2 id="pdf-heading" className="text-xl font-semibold">
          Analyse de documents
        </h2>
        <PdfDropzone />
      </section>

      {/* MCP Tools */}
      <section aria-labelledby="tools-heading" className="flex flex-col gap-4">
        <h2 id="tools-heading" className="text-xl font-semibold">
          Outils MCP disponibles
        </h2>
        <ToolList />
      </section>
    </div>
  );
}
