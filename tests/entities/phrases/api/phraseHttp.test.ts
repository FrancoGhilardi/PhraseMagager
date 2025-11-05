import { describe, it, expect, beforeEach, vi } from "vitest";
import type { GetPhrasesResponseDto } from "@entities/phrases/lib/mappers";

// Mock del módulo HTTP
const getMock = vi.fn();
vi.mock("@shared/lib/http/axios", () => {
  return {
    get: getMock,
  };
});

describe("entities/phrases/api/phraseHttp", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("list(): obtiene datos, los mapea y devuelve ordenado por createdAt desc", async () => {
    const payload: GetPhrasesResponseDto = {
      phrases: [
        { id: "a", text: "uno", createdAt: 1 },
        { id: "b", text: "dos", createdAt: 5 },
        { id: "c", text: "tres", createdAt: 3 },
      ],
    };
    getMock.mockResolvedValueOnce(payload);

    const { PhraseHttp } = await import("@entities/phrases/api/phraseHttp");
    const api = new PhraseHttp("/custom");
    const result = await api.list();

    expect(getMock).toHaveBeenCalledWith("/custom", { signal: undefined });
    expect(result.map((p) => p.id)).toEqual(["b", "c", "a"]);
  });

  it("list(): si el signal ya está abortado, rechaza con AbortError y no llama a get()", async () => {
    const { PhraseHttp } = await import("@entities/phrases/api/phraseHttp");
    const ctrl = new AbortController();
    ctrl.abort();

    const api = new PhraseHttp("/any");
    await expect(api.list({ signal: ctrl.signal })).rejects.toMatchObject({
      name: "AbortError",
      message: "Operación cancelada por el solicitante.",
    });

    expect(getMock).not.toHaveBeenCalled();
  });

  it("list(): si get() rechaza con cancelación Axios-like, traduce a AbortError", async () => {
    getMock.mockRejectedValueOnce({ name: "CanceledError" });

    const { PhraseHttp } = await import("@entities/phrases/api/phraseHttp");
    const api = new PhraseHttp("/data");
    await expect(api.list()).rejects.toMatchObject({
      name: "AbortError",
      message: "Operación cancelada por el solicitante.",
    });
  });

  it("list(): errores genéricos se envuelven con prefijo legible", async () => {
    getMock.mockRejectedValueOnce(new Error("Falla servidor X"));

    const { PhraseHttp } = await import("@entities/phrases/api/phraseHttp");
    const api = new PhraseHttp("/data");
    await expect(api.list()).rejects.toThrow(
      "No se pudo obtener el listado de frases. Falla servidor X"
    );
  });

  it("createPhraseHttpApi(): respeta el path provisto al invocar get()", async () => {
    const payload: GetPhrasesResponseDto = { phrases: [] };
    getMock.mockResolvedValueOnce(payload);

    const { createPhraseHttpApi } = await import(
      "@entities/phrases/api/phraseHttp"
    );
    const api = createPhraseHttpApi("/frases");
    await api.list();

    expect(getMock).toHaveBeenCalledWith("/frases", { signal: undefined });
  });

  it("phraseHttpApi: usa path por defecto '/data'", async () => {
    const payload: GetPhrasesResponseDto = { phrases: [] };
    getMock.mockResolvedValueOnce(payload);

    const { phraseHttpApi } = await import("@entities/phrases/api/phraseHttp");
    await phraseHttpApi.list();

    expect(getMock).toHaveBeenCalledWith("/data", { signal: undefined });
  });

  it("list(): si el error ya contiene el prefijo, no lo duplica", async () => {
    getMock.mockRejectedValueOnce(
      new Error("No se pudo obtener el listado de frases. Backend caído")
    );

    const { PhraseHttp } = await import("@entities/phrases/api/phraseHttp");
    const api = new PhraseHttp("/data");
    await expect(api.list()).rejects.toThrow(
      "No se pudo obtener el listado de frases. Backend caído"
    );
  });
});
