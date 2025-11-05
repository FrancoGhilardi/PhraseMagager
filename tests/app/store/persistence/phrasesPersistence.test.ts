import { describe, it, expect, beforeEach, vi } from "vitest";
import * as persistence from "@app/store/persistence/phrasesPersistence";
import { type Phrase } from "@entities/phrases/model/Phrases";

/** Mock mínimo de Storage in-memory. */
class MemoryStorage implements Storage {
  private map = new Map<string, string>();
  get length() {
    return this.map.size;
  }
  clear(): void {
    this.map.clear();
  }
  getItem(key: string): string | null {
    return this.map.has(key) ? this.map.get(key)! : null;
  }
  key(index: number): string | null {
    return Array.from(this.map.keys())[index] ?? null;
  }
  removeItem(key: string): void {
    this.map.delete(key);
  }
  setItem(key: string, value: string): void {
    this.map.set(key, value);
  }
}

/** Creador de un "store" mínimo con subscribe y getState mutables. */
function createFakeStore(initial: Phrase[] = []) {
  let items = initial;
  let listener: (() => void) | null = null;

  const store = {
    getState: () => ({
      phrases: { items },
    }),
    subscribe: (fn: () => void) => {
      listener = fn;
      return () => {
        listener = null;
      };
    },
  };

  return {
    store,
    /** Reemplaza items y notifica. */
    setItems(next: Phrase[]) {
      items = next;
      listener?.();
    },
    /** Re-emite notificación con los mismos items. */
    notifySame() {
      listener?.();
    },
    /** Lee copia actual de items. */
    getItems() {
      return items;
    },
  };
}

describe("app/store/persistence/phrasesPersistence", () => {
  let storage: MemoryStorage;

  beforeEach(() => {
    storage = new MemoryStorage();
  });

  it("loadPhrasesFromStorage: sin datos retorna []", () => {
    const result = persistence.loadPhrasesFromStorage(storage);
    expect(result).toEqual([]);
  });

  it("loadPhrasesFromStorage: JSON inválido retorna []", () => {
    storage.setItem("phrases.items", "{no-json");
    const result = persistence.loadPhrasesFromStorage(storage);
    expect(result).toEqual([]);
  });

  it("loadPhrasesFromStorage: si el parseo no es array retorna []", () => {
    storage.setItem("phrases.items", JSON.stringify({ foo: "bar" }));
    const result = persistence.loadPhrasesFromStorage(storage);
    expect(result).toEqual([]);
  });

  it("loadPhrasesFromStorage: mezcla válidos/ inválidos", () => {
    const valid1: Phrase = { id: "1", text: "A", createdAt: 1 };
    const valid2: Phrase = { id: "2", text: "B", createdAt: 2 };
    const invalids = [
      null,
      123,
      {},
      { id: "", text: "sin id", createdAt: 3 },
      { id: "x", text: "", createdAt: 3 },
    ];
    storage.setItem(
      "phrases.items",
      JSON.stringify([valid1, ...invalids, valid2])
    );

    const result = persistence.loadPhrasesFromStorage(storage);
    expect(result).toEqual([valid1, valid2]);
  });

  it("savePhrasesToStorage: persiste JSON con la clave esperada", () => {
    const items: Phrase[] = [
      { id: "1", text: "Hola", createdAt: 10 },
      { id: "2", text: "Chau", createdAt: 20 },
    ];
    persistence.savePhrasesToStorage(items, storage);

    const raw = storage.getItem("phrases.items");
    expect(raw).toBe(JSON.stringify(items));
  });

  it("savePhrasesToStorage: tolera items undefined y persiste '[]'", () => {
    // @ts-expect-error forzamos undefined para probar el fallback
    persistence.savePhrasesToStorage(undefined, storage);
    const raw = storage.getItem("phrases.items");
    expect(raw).toBe("[]");
  });

  it("attachPhrasesPersistence: persiste solo cuando cambia `items`", () => {
    const { store, setItems, notifySame } = createFakeStore([
      { id: "1", text: "A", createdAt: 1 },
    ]);

    const setItemSpy = vi.spyOn(storage, "setItem");

    const unsubscribe = persistence.attachPhrasesPersistence(store as any, {
      storage,
    });

    // Primer cambio
    const next1 = [
      { id: "1", text: "A", createdAt: 1 },
      { id: "2", text: "B", createdAt: 2 },
    ];
    setItems(next1);
    expect(setItemSpy).toHaveBeenCalledTimes(1);
    expect(setItemSpy).toHaveBeenLastCalledWith(
      "phrases.items",
      JSON.stringify(next1)
    );

    // Notificación con el mismo contenido serializado
    notifySame();
    expect(setItemSpy).toHaveBeenCalledTimes(1);

    // Cambio real
    const next2 = [{ id: "3", text: "C", createdAt: 3 }];
    setItems(next2);
    expect(setItemSpy).toHaveBeenCalledTimes(2);
    expect(setItemSpy).toHaveBeenLastCalledWith(
      "phrases.items",
      JSON.stringify(next2)
    );

    unsubscribe();
    setItemSpy.mockRestore();
  });

  it("attachPhrasesPersistence: usa el `storage` provisto en options al guardar", () => {
    const { store, setItems } = createFakeStore([]);
    const custom = new MemoryStorage();
    const customSpy = vi.spyOn(custom, "setItem");

    persistence.attachPhrasesPersistence(store as any, { storage: custom });

    const payload = [{ id: "9", text: "Z", createdAt: 9 }];
    setItems(payload);

    expect(customSpy).toHaveBeenCalledTimes(1);
    expect(customSpy).toHaveBeenCalledWith(
      "phrases.items",
      JSON.stringify(payload)
    );

    customSpy.mockRestore();
  });
});
