import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

// Snapshot del estado original para restaurar luego
const ORIGINAL_IMPORT_META_ENV = { ...import.meta.env };
const ORIGINAL_WINDOW = globalThis.window;
const ORIGINAL_LOCALSTORAGE = globalThis.localStorage;

function resetGlobals() {
  // restaurar import.meta.env
  Object.keys(import.meta.env).forEach((k) => {
    // @ts-expect-error mutación controlada para test
    delete import.meta.env[k];
  });
  Object.assign(import.meta.env, ORIGINAL_IMPORT_META_ENV);

  // restaurar window y localStorage
  // @ts-expect-error asignación controlada para test
  globalThis.window = ORIGINAL_WINDOW;
  // @ts-expect-error asignación controlada para test
  globalThis.localStorage = ORIGINAL_LOCALSTORAGE;
}

async function importEnvModule() {
  vi.resetModules();
  return await import("@shared/config/env");
}

describe("shared/config/env", () => {
  beforeEach(() => {
    resetGlobals();
  });

  afterEach(() => {
    resetGlobals();
    vi.restoreAllMocks();
  });

  it("usa VITE_BASE_URL cuando está definida", async () => {
    Object.assign(import.meta.env, {
      VITE_BASE_URL: "https://api.ejemplo.com///",
      DEV: false,
    });

    const { resolveApiBaseUrl, ENV } = await importEnvModule();
    expect(resolveApiBaseUrl()).toBe("https://api.ejemplo.com");
    expect(ENV.apiBaseUrl).toBe("https://api.ejemplo.com");
  });

  it("usa window.__API_BASE_URL__ cuando no hay VITE_BASE_URL", async () => {
    Object.assign(import.meta.env, {
      VITE_BASE_URL: "",
      DEV: false,
    });

    // @ts-expect-error stub mínimo
    globalThis.window = { __API_BASE_URL__: "https://mi.api.local/" };

    const { resolveApiBaseUrl } = await importEnvModule();
    expect(resolveApiBaseUrl()).toBe("https://mi.api.local");
  });

  it("en DEV, sin fuentes previas, retorna la URL por defecto y hace console.warn", async () => {
    Object.assign(import.meta.env, {
      VITE_BASE_URL: "",
      DEV: true,
    });

    // Sin window ni localStorage
    // @ts-expect-error limpieza controlada
    globalThis.window = undefined;

    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    const { resolveApiBaseUrl } = await importEnvModule();

    // Llamada explícita en el test
    expect(resolveApiBaseUrl()).toBe(
      "https://mp50271d8ae9b4bcffea.free.beeceptor.com"
    );

    // Se espera 2 avisos: uno por la eval de ENV al importar y otro por la llamada anterior.
    expect(warnSpy).toHaveBeenCalledTimes(2);
  });

  it("en no-DEV, sin fuentes previas, lee localStorage('api_base_url') y sanitiza", async () => {
    Object.assign(import.meta.env, {
      VITE_BASE_URL: "",
      DEV: false,
    });

    const store = new Map<string, string>();
    store.set("api_base_url", "https://persistida.example.com///");
    // @ts-expect-error stub de API Web
    globalThis.localStorage = {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => {
        store.set(k, v);
      },
      removeItem: (k: string) => store.delete(k),
      clear: () => store.clear(),
      key: (i: number) => Array.from(store.keys())[i] ?? null,
      length: 1,
    };

    // @ts-expect-error limpieza controlada
    globalThis.window = undefined;

    const { resolveApiBaseUrl } = await importEnvModule();
    expect(resolveApiBaseUrl()).toBe("https://persistida.example.com");
  });
});
