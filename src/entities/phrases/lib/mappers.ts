import { ensurePhrase, type Phrase } from "../model/Phrases";

export type PhraseDto = {
  id: string;
  text: string;
  createdAt: number | string;
};

export type GetPhrasesResponseDto = {
  phrases: PhraseDto[];
};

/**
 * Convierte un `PhraseDto` en `Phrase` del dominio.
 * @param dto Objeto crudo recibido de la API (o similar).
 * @throws Error si el dto no contiene los campos mínimos requeridos.
 * @returns `Phrase` normalizada para el dominio.
 */
export function toPhrase(dto: PhraseDto): Phrase {
  if (!dto) throw new Error("DTO inválido: objeto nulo/indefinido.");

  const id = String(dto.id ?? "").trim();
  if (!id) throw new Error("DTO inválido: 'id' es requerido.");

  const text = String(dto.text ?? "").trim();
  if (!text) throw new Error("DTO inválido: 'text' es requerido.");

  const createdRaw = dto.createdAt;
  const createdAt =
    typeof createdRaw === "number"
      ? createdRaw
      : typeof createdRaw === "string"
      ? Number(createdRaw)
      : NaN;

  if (!Number.isFinite(createdAt)) {
    throw new Error("DTO inválido: 'createdAt' debe ser numérico.");
  }
  return ensurePhrase({ id, text, createdAt });
}

/**
 * Extrae y mapea la lista de frases desde la respuesta del endpoint.
 * @param payload Carga útil JSON deserializada.
 * @returns Lista de `Phrase` válida; si no hay `phrases`, retorna `[]`.
 */
export function toPhraseListFromResponse(payload: unknown): Phrase[] {
  if (!isObject(payload)) return [];

  const items = payload.phrases;
  if (!Array.isArray(items)) return [];

  const acc: Phrase[] = [];

  for (const candidate of items) {
    try {
      acc.push(toPhrase(candidate as PhraseDto));
    } catch {
      continue;
    }
  }

  return acc;
}

/**
 * Convierte una entidad del dominio a DTO.
 * @param phrase Entidad `Phrase` ya validada.
 * @returns Objeto `PhraseDto` listo para transportar.
 */
export function toPhraseDto(phrase: Phrase): PhraseDto {
  if (!phrase) throw new Error("Phrase inválida: objeto nulo/indefinido.");
  const { id, text, createdAt } = phrase;

  if (!id?.trim()) throw new Error("Phrase inválida: 'id' es requerido.");
  if (!text?.trim()) throw new Error("Phrase inválida: 'text' es requerido.");
  if (!Number.isFinite(createdAt))
    throw new Error("Phrase inválida: 'createdAt' debe ser numérico.");

  return { id: String(id), text: String(text), createdAt };
}

/**
 * Construye un DTO nuevo para crear una frase.
 * @param input Texto y `createdAt`. Si no se provee, se usa `Date.now()`.
 * @returns DTO mínimo para creación remota.
 */
export function toNewPhraseDto(input: {
  text: string;
  createdAt?: number;
}): Omit<PhraseDto, "id"> {
  const text = String(input?.text ?? "").trim();
  if (!text) throw new Error("Nuevo DTO inválido: 'text' es requerido.");

  const createdAt =
    typeof input?.createdAt === "number" && Number.isFinite(input.createdAt)
      ? input.createdAt
      : Date.now();

  return { text, createdAt };
}

/**
 * Chequea si un valor parece un objeto plano no nulo.
 * @param v Valor desconocido.
 * @returns `true` si es objeto; `false` en caso contrario.
 */
function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}
