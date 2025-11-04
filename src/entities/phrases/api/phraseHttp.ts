import type { PhraseApi, PhraseListParams } from "./phraseApi";
import type { GetPhrasesResponseDto } from "../lib/mappers";
import { toPhraseListFromResponse } from "../lib/mappers";
import { compareByCreatedAtDesc, type Phrase } from "../model/Phrases";
import { get } from "@shared/lib/http/axios";

export class PhraseHttp implements PhraseApi {
  private readonly path: string;
  constructor(path = "/data") {
    this.path = path;
  }

  /**
   * Obtiene el listado de frases desde la API remota y lo mapea a `Phrase[]`.
   * @param params Parámetros opcionales
   * @returns Promesa con la colección de frases ordenada desc por fecha.
   * @throws Error si falla la red, el payload es irrecuperable o la operación es abortada.
   */
  async list(params?: PhraseListParams): Promise<Phrase[]> {
    const signal = params?.signal;
    if (signal?.aborted) throw createAbortError();

    try {
      const payload = await get<GetPhrasesResponseDto>(this.path, { signal });
      const phrases = toPhraseListFromResponse(payload);
      phrases.sort(compareByCreatedAtDesc);
      return phrases;
    } catch (err) {
      if (isAbortLike(err)) throw createAbortError(err);
      const message = toMessage(
        err,
        "No se pudo obtener el listado de frases."
      );
      throw new Error(message);
    }
  }
}

/**
 * Crea una instancia concreta de `PhraseApi` basada en HTTP.
 * @param path Ruta del recurso remoto .
 * @returns Implementación lista para usar en casos de uso/Redux.
 */
export function createPhraseHttpApi(path?: string): PhraseApi {
  return new PhraseHttp(path);
}

/**
 * Instancia por defecto que apunta a `/data`.
 */
export const phraseHttpApi: PhraseApi = createPhraseHttpApi("/data");

/**
 * Determina si un error representa una cancelación/abort compatible con Axios.
 * @param err Error desconocido capturado.
 * @returns `true` si parece cancelación; `false` en caso contrario.
 */
function isAbortLike(err: unknown): boolean {
  if (!err || typeof err !== "object") return false;
  const anyErr = err as any;
  const code = anyErr.code;
  const name = anyErr.name;
  return (
    code === "ERR_CANCELED" || name === "CanceledError" || name === "AbortError"
  );
}

/**
 * Construye un `AbortError` compatible con el entorno del navegador.
 * @param cause Error original.
 * @returns Error con `name = "AbortError"`.
 */
function createAbortError(cause?: unknown): Error {
  const e = new Error("Operación cancelada por el solicitante.");
  e.name = "AbortError";
  if (cause) e.cause = cause;
  return e;
}

/**
 * Extrae un mensaje legible desde un error desconocido
 * @param err Error desconocido.
 * @param fallback Prefijo o mensaje por defecto.
 * @returns Mensaje final para mostrar/loguear.
 */
function toMessage(err: unknown, fallback: string): string {
  const base =
    (typeof (err as any)?.message === "string" && (err as any).message) ||
    (typeof err === "string" && err) ||
    null;

  if (!base) return fallback;
  return base.includes(fallback) ? base : `${fallback} ${base}`;
}
