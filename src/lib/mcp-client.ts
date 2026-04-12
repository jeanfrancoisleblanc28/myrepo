/**
 * MCP Client — communicates with the MCP server at localhost:8080.
 * Provides typed helpers for common operations (health check, PDF analysis, etc.).
 */

const MCP_BASE_URL = process.env.NEXT_PUBLIC_MCP_URL || "http://localhost:8080";

interface McpResponse<T = unknown> {
  ok: boolean;
  data?: T;
  error?: string;
}

async function mcpFetch<T>(path: string, init?: RequestInit): Promise<McpResponse<T>> {
  try {
    const res = await fetch(`${MCP_BASE_URL}${path}`, {
      headers: { "Content-Type": "application/json", ...init?.headers },
      ...init,
    });

    if (!res.ok) {
      return { ok: false, error: `MCP server error: ${res.status} ${res.statusText}` };
    }

    const data = (await res.json()) as T;
    return { ok: true, data };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { ok: false, error: `Cannot reach MCP server: ${message}` };
  }
}

/** Check if the MCP server is reachable */
export async function healthCheck(): Promise<McpResponse<{ status: string }>> {
  return mcpFetch<{ status: string }>("/health");
}

/** Send a PDF file for analysis */
export async function analyzePdf(file: File): Promise<McpResponse<{ id: string; pages: number; text: string }>> {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const res = await fetch(`${MCP_BASE_URL}/analyze/pdf`, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      return { ok: false, error: `PDF analysis failed: ${res.status}` };
    }

    const data = await res.json();
    return { ok: true, data };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { ok: false, error: `PDF analysis error: ${message}` };
  }
}

/** List available MCP tools */
export async function listTools(): Promise<McpResponse<{ tools: string[] }>> {
  return mcpFetch<{ tools: string[] }>("/tools");
}

/** Generic tool invocation */
export async function invokeTool(toolName: string, params: Record<string, unknown>): Promise<McpResponse> {
  return mcpFetch("/tools/invoke", {
    method: "POST",
    body: JSON.stringify({ tool: toolName, params }),
  });
}
