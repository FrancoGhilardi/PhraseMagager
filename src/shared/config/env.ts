export type AppEnv = {
  apiBaseUrl: string;
};

/**
 * Resuelve la URL base de la API siguiendo un orden de prioridad.
 * @returns {string} La URL base resuelta.
 */
export function resolveApiBaseUrl(): string {
  const viteApiBase = import.meta?.env?.VITE_BASE_URL || "";

  if (isNonEmptyString(viteApiBase)) {
    return sanitizeBaseUrl(viteApiBase);
  }

  // Global en tiempo de ejecución
  const globalApiBase =
    typeof window !== "undefined" && (window as any).__API_BASE_URL__;

  if (isNonEmptyString(globalApiBase)) {
    return sanitizeBaseUrl(globalApiBase);
  }

  if (import.meta.env.DEV) {
    console.warn("Usando URL de desarrollo por defecto");
    return "https://mp50271d8ae9b4bcffea.free.beeceptor.com";
  }

  // Anulación de LocalStorage
  try {
    const lsApi = localStorage.getItem("api_base_url");
    if (isNonEmptyString(lsApi)) {
      return sanitizeBaseUrl(lsApi as string);
    }
  } catch {
    // ignorar los modos SSR / privacidad
  }
  throw new Error(
    "API Base URL no configurada. Configura VITE_BASE_URL en las variables de entorno."
  );
}

/**
 * Configuración exportada y resuelta con antelación para consumidores simples.
 */
export const ENV: AppEnv = {
  apiBaseUrl: resolveApiBaseUrl(),
};

/**
 * protección básica de cadenas.
 */
function isNonEmptyString(v: unknown): v is string {
  return typeof v === "string" && v.trim().length > 0;
}

/**
 * Normaliza una cadena URL base (elimina la barra final si está presente).
 * @param url URL base potencialmente desordenada.
 * @returns URL base limpia sin barra final.
 */
function sanitizeBaseUrl(url: string): string {
  return url.replace(/\/+$/, "");
}
