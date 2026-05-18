/**
 * Tests pour le client MCP — couche réseau unique du frontend.
 *
 * Couvre les cas que CLAUDE.md §5 signale comme risqués :
 *  - `analyzePdf` ne DOIT PAS définir `Content-Type` (sinon le boundary
 *    multipart/form-data est cassé).
 *  - Toutes les erreurs (HTTP non-2xx, réseau, abort) doivent retourner
 *    `{ ok: false, error: string }` sans throw.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { analyzePdf, healthCheck, invokeTool, listTools } from "./mcp-client";

type FetchInit = RequestInit & { headers?: Record<string, string> };

describe("mcp-client", () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  // -------------------------------------------------------------------------
  // healthCheck
  // -------------------------------------------------------------------------

  describe("healthCheck", () => {
    it("retourne ok=true et data sur 200", async () => {
      fetchMock.mockResolvedValue({
        ok: true,
        status: 200,
        statusText: "OK",
        json: async () => ({ status: "healthy" }),
      });

      const res = await healthCheck();

      expect(res.ok).toBe(true);
      expect(res.data).toEqual({ status: "healthy" });
      expect(res.error).toBeUndefined();
    });

    it("retourne ok=false avec le statut HTTP en cas d'erreur 5xx", async () => {
      fetchMock.mockResolvedValue({
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
      });

      const res = await healthCheck();

      expect(res.ok).toBe(false);
      expect(res.error).toContain("500");
      expect(res.error).toContain("Internal Server Error");
    });

    it("retourne ok=false sur erreur réseau (serveur MCP injoignable)", async () => {
      fetchMock.mockRejectedValue(new Error("ECONNREFUSED"));

      const res = await healthCheck();

      expect(res.ok).toBe(false);
      expect(res.error).toContain("Cannot reach MCP server");
      expect(res.error).toContain("ECONNREFUSED");
    });

    it("retourne 'Request cancelled' quand la requête est abort", async () => {
      const abortErr = new DOMException("aborted", "AbortError");
      fetchMock.mockRejectedValue(abortErr);

      const res = await healthCheck();

      expect(res.ok).toBe(false);
      expect(res.error).toBe("Request cancelled");
    });

    it("transmet le signal d'abort à fetch", async () => {
      fetchMock.mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ status: "healthy" }),
      });
      const controller = new AbortController();

      await healthCheck(controller.signal);

      const init = fetchMock.mock.calls[0][1] as FetchInit;
      expect(init.signal).toBe(controller.signal);
    });
  });

  // -------------------------------------------------------------------------
  // analyzePdf — pièges multipart (CLAUDE.md §5)
  // -------------------------------------------------------------------------

  describe("analyzePdf", () => {
    it("POST un FormData et NE définit PAS Content-Type (boundary multipart)", async () => {
      fetchMock.mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ id: "abc", pages: 3, text: "..." }),
      });
      const file = new File(["%PDF-1.4 fake"], "doc.pdf", { type: "application/pdf" });

      await analyzePdf(file);

      expect(fetchMock).toHaveBeenCalledOnce();
      const [url, init] = fetchMock.mock.calls[0] as [string, FetchInit];

      expect(url).toContain("/analyze/pdf");
      expect(init.method).toBe("POST");
      expect(init.body).toBeInstanceOf(FormData);
      // Régression critique : si Content-Type est défini ici, le navigateur ne
      // peut pas générer le boundary multipart et le serveur rejette le PDF.
      expect(init.headers).toEqual({});
      expect((init.headers as Record<string, string>)["Content-Type"]).toBeUndefined();
    });

    it("attache le fichier sous le champ 'file'", async () => {
      fetchMock.mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ id: "x", pages: 1, text: "" }),
      });
      const file = new File(["data"], "report.pdf", { type: "application/pdf" });

      await analyzePdf(file);

      const init = fetchMock.mock.calls[0][1] as FetchInit;
      const fd = init.body as FormData;
      const attached = fd.get("file");
      expect(attached).toBeInstanceOf(File);
      expect((attached as File).name).toBe("report.pdf");
    });

    it("propage le résultat data sur succès", async () => {
      fetchMock.mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ id: "abc", pages: 7, text: "extracted" }),
      });
      const file = new File(["x"], "a.pdf", { type: "application/pdf" });

      const res = await analyzePdf(file);

      expect(res.ok).toBe(true);
      expect(res.data).toEqual({ id: "abc", pages: 7, text: "extracted" });
    });
  });

  // -------------------------------------------------------------------------
  // listTools
  // -------------------------------------------------------------------------

  describe("listTools", () => {
    it("retourne la liste sur 200", async () => {
      fetchMock.mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ tools: ["pdf", "summarize"] }),
      });

      const res = await listTools();

      expect(res.ok).toBe(true);
      expect(res.data?.tools).toEqual(["pdf", "summarize"]);
    });
  });

  // -------------------------------------------------------------------------
  // invokeTool
  // -------------------------------------------------------------------------

  describe("invokeTool", () => {
    it("sérialise le body JSON avec { tool, params }", async () => {
      fetchMock.mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ result: 42 }),
      });

      await invokeTool("compute", { x: 1, y: 2 });

      const [url, init] = fetchMock.mock.calls[0] as [string, FetchInit];
      expect(url).toContain("/tools/invoke");
      expect(init.method).toBe("POST");
      expect(JSON.parse(init.body as string)).toEqual({
        tool: "compute",
        params: { x: 1, y: 2 },
      });
    });

    it("définit Content-Type: application/json (différent de analyzePdf)", async () => {
      fetchMock.mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({}),
      });

      await invokeTool("noop", {});

      const init = fetchMock.mock.calls[0][1] as FetchInit;
      expect((init.headers as Record<string, string>)["Content-Type"]).toBe("application/json");
    });

    it("retourne ok=false si le serveur répond 400", async () => {
      fetchMock.mockResolvedValue({
        ok: false,
        status: 400,
        statusText: "Bad Request",
      });

      const res = await invokeTool("bad", {});

      expect(res.ok).toBe(false);
      expect(res.error).toContain("400");
    });
  });
});
