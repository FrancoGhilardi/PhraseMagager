import { ensurePhrase, type Phrase } from "@entities/phrases/model/Phrases";
import type { WithPhrasesSlice } from "../slices/phrasesSlice";

const STORAGE_KEY = "phrases.items";

/**
 * Carga segura de frases desde `localStorage`.
 * @param storage Implementación de `Storage`.
 * @returns Lista validada de `Phrase`. Si no hay datos válidos, retorna `[]`.
 */
export function loadPhrasesFromStorage(storage?: Storage): Phrase[] {
  if (typeof window === "undefined") return [];
  const store = storage ?? window.localStorage;
  try {
    const raw = store.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    const acc: Phrase[] = [];
    for (const candidate of parsed) {
      try {
        acc.push(ensurePhrase(candidate));
      } catch {
        continue;
      }
    }
    return acc;
  } catch {
    return [];
  }
}

/**
 * Guarda de forma segura la lista de frases en `localStorage`.
 * @param items Colección actual de frases.
 * @param storage Implementación de `Storage`.
 */
export function savePhrasesToStorage(items: Phrase[], storage?: Storage): void {
  if (typeof window === "undefined") return;
  const store = storage ?? window.localStorage;
  try {
    store.setItem(STORAGE_KEY, JSON.stringify(items ?? []));
  } catch {}
}

/**
 * Conecta la persistencia al `store` suscribiéndose a cambios.
 * Persiste solamente `phrases.items` en cada actualización.
 * @param store Instancia Redux con `getState` y `subscribe`.
 * @param options Opciones.
 * @returns Función para desuscribirse (cleanup).
 */
export function attachPhrasesPersistence(
  store: {
    getState: () => WithPhrasesSlice;
    subscribe: (listener: () => void) => () => void;
  },
  options?: { storage?: Storage }
): () => void {
  let lastSerialized = "";

  const unsubscribe = store.subscribe(() => {
    const items = store.getState().phrases.items;
    const nextSerialized = safeStringify(items);
    if (nextSerialized === lastSerialized) return;

    lastSerialized = nextSerialized;
    savePhrasesToStorage(items, options?.storage);
  });
  return unsubscribe;
}

/**
 * Serializa a JSON de forma estable y segura.
 * Si falla, retorna "[]", evitando romper la persistencia.
 * @param value Valor a serializar.
 * @returns Cadena JSON estable.
 */
function safeStringify(value: unknown): string {
  try {
    return JSON.stringify(value ?? []);
  } catch {
    return "[]";
  }
}
