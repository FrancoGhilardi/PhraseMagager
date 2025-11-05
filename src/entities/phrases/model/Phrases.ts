export type Phrase = {
  id: string;
  text: string;
  createdAt: number;
};

/**
 * Verifica de manera segura si un valor es un `Phrase` válido.
 * @param value Valor desconocido a validar.
 * @returns `true` si cumple la forma de `Phrase`; `false` en caso contrario.
 */
export function isPhrase(value: unknown): value is Phrase {
  if (value == null || typeof value !== "object") return false;

  const val = value as Record<string, unknown>;
  const hasId = typeof val.id === "string" && val.id.trim().length > 0;
  const hasText = typeof val.text === "string" && val.text.trim().length > 0;

  const created =
    typeof val.createdAt === "number"
      ? val.createdAt
      : typeof val.createdAt === "string"
      ? Number(val.createdAt)
      : NaN;

  if (!hasId || !hasText) return false;
  if (!Number.isFinite(created)) return false;

  return true;
}

/**
 * Intenta construir una `Phrase` a partir de un valor desconocido.
 * Aplica normalizaciones ligeras (trim y coerción numérica de `createdAt`).
 * @param input Valor desconocido.
 * @throws Error si la forma mínima no es válida.
 * @returns `Phrase` normalizada.
 */
export function ensurePhrase(input: unknown): Phrase {
  if (!isLikelyObject(input)) {
    throw new Error("Phrase inválida: se esperaba un objeto.");
  }

  const id = String(input.id ?? "").trim();
  const text = String(input.text ?? "").trim();
  const createdRaw = input.createdAt;

  if (!id) throw new Error("Phrase inválida: 'id' es requerido.");
  if (!text) throw new Error("Phrase inválida: 'text' es requerido.");

  const createdAt =
    typeof createdRaw === "number"
      ? createdRaw
      : typeof createdRaw === "string"
      ? Number(createdRaw)
      : NaN;

  if (!Number.isFinite(createdAt)) {
    throw new Error("Phrase inválida: 'createdAt' debe ser un número (ms).");
  }

  return { id, text, createdAt };
}

/**
 * Orden natural de frases por fecha de creación.
 * @param a Primer elemento.
 * @param b Segundo elemento.
 * @returns Número para `Array.prototype.sort`.
 */
export function compareByCreatedAtDesc(a: Phrase, b: Phrase): number {
  return b.createdAt - a.createdAt;
}

/**
 * guard para objetos planos.
 * @param value Valor desconocido.
 * @returns `true` si parece un objeto no nulo; `false` en caso contrario.
 */
function isLikelyObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
