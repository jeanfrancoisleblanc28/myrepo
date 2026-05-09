import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { analyzePdf, healthCheck, invokeTool, listTools } from "./mcp-client";

const BASE_URL = "http://localhost:8080";

function jsonResponse(body: unknown, init: ResponseInit = { status: 200 }): Response {
  return new Response(JSON.stringify(body), {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
}

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

  describe("healthCheck", () => {
    it("returns ok with data on 200", async () => {
      fetchMock.mockResolvedValueOnce(jsonResponse({ status: "ok" }));

      const res = await healthCheck();

      expect(res).toEqual({ ok: true, data: { status: "ok" } });
      expect(fetchMock).toHaveBeenCalledWith(
        `${BASE_URL}/health`,
        expect.objectContaining({
          headers: expect.objectContaining({ "Content-Type": "application/json" }),
        }),
      );
    });

    it("returns ok=false with status text on non-2xx", async () => {
      fetchMock.mockResolvedValueOnce(new Response("nope", { status: 503, statusText: "Service Unavailable" }));

      const res = await healthCheck();

      expect(res.ok).toBe(false);
      expect(res.error).toContain("503");
      expect(res.error).toContain("Service Unavailable");
    });

    it("returns ok=false with friendly message on network error", async () => {
      fetchMock.mockRejectedValueOnce(new Error("ECONNREFUSED"));

      const res = await healthCheck();

      expect(res.ok).toBe(false);
      expect(res.error).toBe("Cannot reach MCP server: ECONNREFUSED");
    });

    it("returns ok=false with 'Request cancelled' on AbortError", async () => {
      const abortError = new DOMException("aborted", "AbortError");
      fetchMock.mockRejectedValueOnce(abortError);

      const res = await healthCheck();

      expect(res).toEqual({ ok: false, error: "Request cancelled" });
    });

    it("forwards the abort signal to fetch", async () => {
      fetchMock.mockResolvedValueOnce(jsonResponse({ status: "ok" }));
      const controller = new AbortController();

      await healthCheck(controller.signal);

      expect(fetchMock).toHaveBeenCalledWith(
        `${BASE_URL}/health`,
        expect.objectContaining({ signal: controller.signal }),
      );
    });
  });

  describe("analyzePdf", () => {
    it("POSTs FormData to /analyze/pdf with explicit empty headers", async () => {
      // The empty headers override is intentional — see CLAUDE.md.
      // Setting Content-Type would clobber the multipart boundary that fetch
      // auto-generates for FormData bodies.
      fetchMock.mockResolvedValueOnce(jsonResponse({ id: "abc", pages: 3, text: "hello" }));
      const file = new File(["%PDF-1.4 fake"], "doc.pdf", { type: "application/pdf" });

      const res = await analyzePdf(file);

      expect(res).toEqual({ ok: true, data: { id: "abc", pages: 3, text: "hello" } });

      const [url, init] = fetchMock.mock.calls[0];
      expect(url).toBe(`${BASE_URL}/analyze/pdf`);
      expect(init.method).toBe("POST");
      expect(init.body).toBeInstanceOf(FormData);
      expect((init.body as FormData).get("file")).toBe(file);

      // Critical: headers must be empty so the browser sets multipart boundary.
      expect(init.headers).toEqual({});
      expect(init.headers).not.toHaveProperty("Content-Type");
    });

    it("returns ok=false on server error", async () => {
      fetchMock.mockResolvedValueOnce(new Response("oops", { status: 500, statusText: "Internal Server Error" }));
      const file = new File(["data"], "f.pdf", { type: "application/pdf" });

      const res = await analyzePdf(file);

      expect(res.ok).toBe(false);
      expect(res.error).toContain("500");
    });
  });

  describe("listTools", () => {
    it("GETs /tools and returns the tools array", async () => {
      fetchMock.mockResolvedValueOnce(jsonResponse({ tools: ["a", "b"] }));

      const res = await listTools();

      expect(res).toEqual({ ok: true, data: { tools: ["a", "b"] } });
      expect(fetchMock).toHaveBeenCalledWith(`${BASE_URL}/tools`, expect.any(Object));
    });
  });

  describe("invokeTool", () => {
    it("POSTs JSON {tool, params} to /tools/invoke", async () => {
      fetchMock.mockResolvedValueOnce(jsonResponse({ result: 42 }));

      const res = await invokeTool("compute", { x: 1, y: 2 });

      expect(res).toEqual({ ok: true, data: { result: 42 } });

      const [url, init] = fetchMock.mock.calls[0];
      expect(url).toBe(`${BASE_URL}/tools/invoke`);
      expect(init.method).toBe("POST");
      expect(init.headers).toMatchObject({ "Content-Type": "application/json" });
      expect(JSON.parse(init.body as string)).toEqual({
        tool: "compute",
        params: { x: 1, y: 2 },
      });
    });

    it("propagates non-Error throws as 'Unknown error'", async () => {
      fetchMock.mockRejectedValueOnce("plain string failure");

      const res = await invokeTool("noop", {});

      expect(res.ok).toBe(false);
      expect(res.error).toBe("Cannot reach MCP server: Unknown error");
    });
  });
});
