import { describe, it, expect, vi, afterEach } from "vitest";
import { formatCreatedAt } from "@widgets/phrases/utils/utils";

describe("widgets/phrases/utils/formatCreatedAt", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("con timestamp numérico válido retorna el resultado de toLocaleString()", () => {
    const spy = vi
      .spyOn(Date.prototype, "toLocaleString")
      .mockReturnValue("LOCAL-OK");

    const ts = 1_700_000_000_000;
    const out = formatCreatedAt(ts);

    expect(out).toBe("LOCAL-OK");
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it("con fecha en string ISO válida retorna el resultado de toLocaleString()", () => {
    const spy = vi
      .spyOn(Date.prototype, "toLocaleString")
      .mockReturnValue("ISO-OK");

    const iso = "2024-01-02T03:04:05.000Z";
    const out = formatCreatedAt(iso);

    expect(out).toBe("ISO-OK");
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it("con string inválido retorna cadena vacía y NO llama a toLocaleString()", () => {
    const spy = vi.spyOn(Date.prototype, "toLocaleString");

    const out = formatCreatedAt("no-es-una-fecha");

    expect(out).toBe("");
    expect(spy).not.toHaveBeenCalled();
  });

  it("con número NaN o inválido retorna cadena vacía", () => {
    const spy = vi.spyOn(Date.prototype, "toLocaleString");

    const out = formatCreatedAt("Invalid Date");

    expect(out).toBe("");
    expect(spy).not.toHaveBeenCalled();
  });
});
