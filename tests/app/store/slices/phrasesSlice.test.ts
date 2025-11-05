import {
  addPhraseLocal,
  clearError,
  deletePhraseLocal,
  setQuery,
  selectAllItems,
  selectFilteredItems,
  selectIsFiltered,
  selectCounts,
  selectQuery,
} from "@app/store/slices/phrasesSlice";
import phrasesReducer from "@app/store/slices/phrasesSlice";
import type { AnyAction } from "@reduxjs/toolkit";
import { describe, expect, it } from "vitest";

/**
 * Crea un estado raíz mínimo para seleccionar desde el slice.
 * @param partial Slice parcial de `phrases` a combinar con el inicial.
 */
function makeRootState(
  partial: Partial<ReturnType<typeof phrasesReducer>> = {}
) {
  const initial = phrasesReducer(undefined, { type: "@@INIT" } as AnyAction);
  return {
    phrases: { ...initial, ...partial },
  } as { phrases: typeof initial };
}

describe("app/store/slices/phrasesSlice", () => {
  describe("reducers puros", () => {
    it("addPhraseLocal: debe agregar una phrase", () => {
      const state1 = phrasesReducer(undefined, { type: "@@INIT" } as AnyAction);

      const added = phrasesReducer(
        state1,
        addPhraseLocal({ id: "3", text: "Nuevo ítem", createdAt: 30 })
      );

      expect(added.items.some((p) => p.id === "3")).toBe(true);
      expect(added.error).toBeFalsy();
    });

    it("deletePhraseLocal: debe eliminar por id", () => {
      const base = makeRootState({
        items: [
          { id: "1", text: "Hola", createdAt: 10 },
          { id: "2", text: "Adiós", createdAt: 20 },
        ],
      }).phrases;

      const next = phrasesReducer(base, deletePhraseLocal("1"));
      expect(next.items.map((p) => p.id)).toEqual(["2"]);
    });

    it("setQuery: debe actualizar la consulta de búsqueda", () => {
      const base = phrasesReducer(undefined, { type: "@@INIT" } as AnyAction);
      const next = phrasesReducer(base, setQuery("  HoL "));
      expect(next.query).toBe("  HoL ");
    });

    it("clearError: debe limpiar el error", () => {
      const base = makeRootState({
        error: "algo salió mal",
      }).phrases;

      const next = phrasesReducer(base, clearError());
      expect(next.error).toBeNull();
    });
  });

  describe("selectores memoizados", () => {
    const items = [
      { id: "1", text: "Hola mundo", createdAt: 10 },
      { id: "2", text: "Adiós sol", createdAt: 20 },
      { id: "3", text: "Holístico enfoque", createdAt: 15 },
    ];

    it("selectAllItems: debe devolver items ordenados por createdAt desc", () => {
      const root = makeRootState({ items });
      const all = selectAllItems(root);
      expect(all.map((p) => p.id)).toEqual(["2", "3", "1"]);
    });

    it("selectQuery y selectIsFiltered: coherencia del estado de búsqueda", () => {
      const root = makeRootState({ items, query: "  hol " });
      expect(selectQuery(root)).toBe("  hol ");
      expect(selectIsFiltered(root)).toBe(true);

      const root2 = makeRootState({ items, query: "   " });
      expect(selectIsFiltered(root2)).toBe(false);
    });

    it("selectFilteredItems: debe filtrar case-insensitive por substring y mantener orden desc", () => {
      const root = makeRootState({ items, query: "HOL" });
      const filtered = selectFilteredItems(root);
      expect(filtered.map((p) => p.id)).toEqual(["3", "1"]);
    });

    it("selectCounts: debe reflejar total vs filtrados", () => {
      const root = makeRootState({ items, query: "hol" });
      const counts = selectCounts(root);
      const filtered = selectFilteredItems(root);

      expect(counts.total).toBe(items.length);
      expect(counts.filtered).toBe(filtered.length);
    });

    it("selectFilteredItems: sin resultados debe retornar arreglo vacío", () => {
      const root = makeRootState({ items, query: "xyz" });
      expect(selectFilteredItems(root)).toEqual([]);
      const counts = selectCounts(root);
      expect(counts.filtered).toBe(0);
    });
  });
});
