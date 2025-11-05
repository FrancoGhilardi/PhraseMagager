import { describe, it, expect, vi, afterEach } from "vitest";
import {
  toPhrase,
  toPhraseListFromResponse,
  toPhraseDto,
  toNewPhraseDto,
  type PhraseDto,
} from "@entities/phrases/lib/mappers";
import type { Phrase } from "@entities/phrases/model/Phrases";

describe("toPhrase", () => {
  it("convierte un DTO válido con createdAt numérico", () => {
    const dto: PhraseDto = { id: "1", text: " Hola ", createdAt: 123 };
    const ph = toPhrase(dto);
    expect(ph).toEqual<Phrase>({ id: "1", text: "Hola", createdAt: 123 });
  });

  it("convierte un DTO válido con createdAt como string numérico", () => {
    const dto: PhraseDto = { id: "  20  ", text: " Test ", createdAt: "999" };
    const ph = toPhrase(dto);
    expect(ph).toEqual<Phrase>({ id: "20", text: "Test", createdAt: 999 });
  });

  it("lanza si el objeto es nulo/indefinido", () => {
    // @ts-expect-error forzamos entrada inválida
    expect(() => toPhrase(null)).toThrow(/objeto nulo\/indefinido/i);
    // @ts-expect-error forzamos entrada inválida
    expect(() => toPhrase(undefined)).toThrow(/objeto nulo\/indefinido/i);
  });

  it("lanza si 'id' es vacío", () => {
    const dto = { id: "   ", text: "ok", createdAt: 1 } as const;
    expect(() => toPhrase(dto)).toThrow(/'id' es requerido/i);
  });

  it("lanza si 'text' es vacío", () => {
    const dto = { id: "1", text: "  ", createdAt: 1 } as const;
    expect(() => toPhrase(dto)).toThrow(/'text' es requerido/i);
  });

  it("lanza si 'createdAt' no es numérico válido", () => {
    const dto1 = { id: "1", text: "x", createdAt: "nan" } as const;
    const dto2 = { id: "1", text: "x", createdAt: {} as any } as const;

    expect(() => toPhrase(dto1)).toThrow(/'createdAt' debe ser numérico/i);
    expect(() => toPhrase(dto2)).toThrow(/'createdAt' debe ser numérico/i);
  });
});

describe("toPhraseListFromResponse", () => {
  it("retorna [] si el payload no es objeto o si `phrases` no es array", () => {
    expect(toPhraseListFromResponse(null)).toEqual([]);
    expect(toPhraseListFromResponse("nope")).toEqual([]);
    expect(toPhraseListFromResponse({ phrases: "x" })).toEqual([]);
  });

  it("mapea solo los elementos válidos y omite los inválidos", () => {
    const payload = {
      phrases: [
        { id: "1", text: "A", createdAt: 1 },
        { id: "2", text: "B", createdAt: "2" },
        { id: "", text: "sin id", createdAt: 3 },
        { id: "4", text: "", createdAt: 4 },
        { id: "5", text: "bad created", createdAt: "nan" },
      ],
    };
    const list = toPhraseListFromResponse(payload);
    expect(list).toEqual<Phrase[]>([
      { id: "1", text: "A", createdAt: 1 },
      { id: "2", text: "B", createdAt: 2 },
    ]);
  });
});

describe("toPhraseDto", () => {
  it("convierte una entidad válida a DTO", () => {
    const p: Phrase = { id: "10", text: "Hola", createdAt: 456 };
    const dto = toPhraseDto(p);
    expect(dto).toEqual<PhraseDto>({ id: "10", text: "Hola", createdAt: 456 });
  });

  it("lanza si la entidad es nula/indefinida", () => {
    // @ts-expect-error
    expect(() => toPhraseDto(null)).toThrow(/objeto nulo\/indefinido/i);
    // @ts-expect-error
    expect(() => toPhraseDto(undefined)).toThrow(/objeto nulo\/indefinido/i);
  });

  it("lanza si 'id' está vacío", () => {
    const p = { id: "   ", text: "x", createdAt: 1 };
    expect(() => toPhraseDto(p)).toThrow(/'id' es requerido/i);
  });

  it("lanza si 'text' está vacío", () => {
    const p = { id: "1", text: "   ", createdAt: 1 };
    expect(() => toPhraseDto(p)).toThrow(/'text' es requerido/i);
  });

  it("lanza si 'createdAt' no es numérico", () => {
    const p = { id: "1", text: "ok", createdAt: NaN };
    expect(() => toPhraseDto(p)).toThrow(/'createdAt' debe ser numérico/i);
  });
});

describe("toNewPhraseDto", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("construye un DTO con Date.now() cuando no se provee createdAt", () => {
    vi.spyOn(Date, "now").mockReturnValue(1700000000000);

    const dto = toNewPhraseDto({ text: "  Nueva frase  " });
    expect(dto).toEqual<Omit<PhraseDto, "id">>({
      text: "Nueva frase",
      createdAt: 1700000000000,
    });
  });

  it("usa el createdAt provisto si es un número finito", () => {
    const dto = toNewPhraseDto({ text: "x", createdAt: 123 });
    expect(dto).toEqual<Omit<PhraseDto, "id">>({ text: "x", createdAt: 123 });
  });

  it("lanza si `text` es vacío/espacios", () => {
    expect(() => toNewPhraseDto({ text: "" })).toThrow(/'text' es requerido/i);
    expect(() => toNewPhraseDto({ text: "   " })).toThrow(
      /'text' es requerido/i
    );
  });
});
