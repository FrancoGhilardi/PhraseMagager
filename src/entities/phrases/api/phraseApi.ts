import type { Phrase } from "../model/Phrases";

export type PhraseListParams = {
  signal?: AbortSignal;
};

export interface PhraseApi {
  /**
   * Obtiene el listado completo de frases desde la fuente de datos.
   * @param params Parámetros opcionales.
   * @returns Promesa con la colección de `Phrase`.
   * @throws Error si la operación no puede completarse de forma útil.
   */
  list(params?: PhraseListParams): Promise<Phrase[]>;
}
