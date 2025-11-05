import {
  isPhrase,
  ensurePhrase,
  compareByCreatedAtDesc,
  type Phrase,
} from "@entities/phrases/model/Phrases";
import { describe, it, expect } from "vitest";

describe("entities/phrases/model/Phrases", () => {
  describe("isPhrase", () => {
    it("debe retornar true para un objeto válido", () => {
      const ok: unknown = { id: "1", text: "hola", createdAt: 1700000000000 };
      expect(isPhrase(ok)).toBe(true);
    });

    it("debe aceptar createdAt como string numérico", () => {
      const ok: unknown = { id: "1", text: "hola", createdAt: "1700000000000" };
      expect(isPhrase(ok)).toBe(true);
    });

    it("debe retornar false si falta id o text", () => {
      expect(isPhrase({ text: "hola", createdAt: Date.now() } as unknown)).toBe(
        false
      );
      expect(isPhrase({ id: "1", createdAt: Date.now() } as unknown)).toBe(
        false
      );
      expect(
        isPhrase({ id: "", text: "", createdAt: Date.now() } as unknown)
      ).toBe(false);
    });

    it("debe retornar false si createdAt no es numérico", () => {
      expect(
        isPhrase({ id: "1", text: "hola", createdAt: "NaN" } as unknown)
      ).toBe(false);
      expect(
        isPhrase({ id: "1", text: "hola", createdAt: null } as unknown)
      ).toBe(false);
    });

    it("debe retornar false para valores no-objeto", () => {
      expect(isPhrase(null)).toBe(false);
      expect(isPhrase(undefined)).toBe(false);
      expect(isPhrase("string")).toBe(false);
      expect(isPhrase(123)).toBe(false);
      expect(isPhrase(true)).toBe(false);
    });
  });

  describe("ensurePhrase", () => {
    it("debe construir una Phrase válida y normalizada (trim + coerción)", () => {
      const raw: unknown = {
        id: "  abc  ",
        text: "  Hola mundo  ",
        createdAt: "1700000000001",
      };

      const result = ensurePhrase(raw);
      expect(result).toEqual<Phrase>({
        id: "abc",
        text: "Hola mundo",
        createdAt: 1700000000001,
      });
    });

    it("debe lanzar si el input no es un objeto", () => {
      expect(() => ensurePhrase(null)).toThrowError(
        "Phrase inválida: se esperaba un objeto."
      );
      expect(() => ensurePhrase("x")).toThrowError(
        "Phrase inválida: se esperaba un objeto."
      );
    });

    it("debe lanzar si falta id o text (vacíos tras trim)", () => {
      expect(() =>
        ensurePhrase({ id: " ", text: "hola", createdAt: Date.now() })
      ).toThrowError("Phrase inválida: 'id' es requerido.");

      expect(() =>
        ensurePhrase({ id: "1", text: "  ", createdAt: Date.now() })
      ).toThrowError("Phrase inválida: 'text' es requerido.");
    });

    it("debe lanzar si createdAt no es un número válido", () => {
      expect(() =>
        ensurePhrase({ id: "1", text: "hola", createdAt: "NaN" })
      ).toThrowError("Phrase inválida: 'createdAt' debe ser un número (ms).");

      expect(() =>
        ensurePhrase({ id: "1", text: "hola", createdAt: {} })
      ).toThrowError("Phrase inválida: 'createdAt' debe ser un número (ms).");
    });
  });

  describe("compareByCreatedAtDesc", () => {
    it("debe ordenar de más nuevo a más viejo", () => {
      const a: Phrase = { id: "a", text: "A", createdAt: 10 };
      const b: Phrase = { id: "b", text: "B", createdAt: 20 };
      const c: Phrase = { id: "c", text: "C", createdAt: 15 };

      const sorted = [a, b, c].sort(compareByCreatedAtDesc);
      expect(sorted.map((p) => p.id)).toEqual(["b", "c", "a"]);
    });

    it("debe retornar 0 si las fechas son iguales", () => {
      const x: Phrase = { id: "x", text: "X", createdAt: 100 };
      const y: Phrase = { id: "y", text: "Y", createdAt: 100 };
      expect(compareByCreatedAtDesc(x, y)).toBe(0);
    });
  });
});
