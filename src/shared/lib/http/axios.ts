import { ENV } from "@shared/config/env";
import axios, { AxiosError } from "axios";
import type {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";

export class HttpError extends Error {
  readonly status?: number;
  readonly code?: string;
  readonly data?: unknown;
  readonly url?: string;
  readonly method?: string;
  constructor(params: {
    message: string;
    status?: number;
    code?: string;
    data?: unknown;
    url?: string;
    method?: string;
    cause?: unknown;
  }) {
    super(params.message);
    this.name = "HttpError";
    this.status = params.status;
    this.code = params.code;
    this.data = params.data;
    this.url = params.url;
    this.method = params.method;

    if (params.cause) this.cause = params.cause;
  }
}

/**
 * Determina si un error es un `HttpError`.
 * @param err Error desconocido.
 * @returns `true` si es instancia de `HttpError`.
 */
export function isHttpError(err: unknown): err is HttpError {
  return err instanceof HttpError;
}

/**
 * Normaliza cualquier error a `HttpError`.
 * @param err Error desconocido capturado en una operación HTTP.
 * @param fallbackUrl URL de la solicitud (si la conocemos).
 * @param fallbackMethod Método de la solicitud (si lo conocemos).
 * @returns Instancia `HttpError` con datos coherentes.
 */
export function toHttpError(
  err: unknown,
  fallbackUrl?: string,
  fallbackMethod?: string
): HttpError {
  if (isHttpError(err)) return err;

  if (axios.isAxiosError(err)) {
    const axErr = err as AxiosError;

    const status = axErr.response?.status;
    const data = axErr.response?.data;
    const url =
      (axErr.config?.baseURL ?? "") + (axErr.config?.url ?? fallbackUrl ?? "");
    const method = (
      axErr.config?.method ??
      fallbackMethod ??
      "GET"
    ).toUpperCase();

    const serverMsg =
      (typeof data === "string" && data) ||
      (data?.message as string | undefined) ||
      (data?.error as string | undefined);

    const message =
      serverMsg ||
      axErr.message ||
      `Error HTTP${status ? ` ${status}` : ""} en ${method} ${url}`;

    return new HttpError({
      message,
      status,
      code: axErr.code,
      data,
      url,
      method,
      cause: err,
    });
  }

  const unknownMessage =
    (err as any)?.message || "Fallo de red o error desconocido.";
  return new HttpError({
    message: String(unknownMessage),
    url: fallbackUrl,
    method: fallbackMethod,
    cause: err,
  });
}

/**
 * Construye la instancia Axios principal de la app.
 * Centraliza configuración y comportamiento transversal.
 * @returns Instancia `AxiosInstance` preconfigurada.
 */
function createHttpClient(): AxiosInstance {
  const instance = axios.create({
    baseURL: ENV.apiBaseUrl,
    timeout: 10_000,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  });

  // Interceptor de request
  instance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      if (!config.url) return config;

      // Quita dobles slashes accidentales entre baseURL y url
      if (config.baseURL && config.url.startsWith("/")) {
        config.url = config.url.replace(/^\/+/, "/");
      }
      return config;
    },
    (error) => Promise.reject(toHttpError(error))
  );

  // Interceptor de response
  instance.interceptors.response.use(
    (response: AxiosResponse) => response,
    (error) => Promise.reject(toHttpError(error))
  );

  return instance;
}

/**
 * Instancia HTTP compartida.
 */
export const http = createHttpClient();

/**
 * Helper GET tipado que retorna `response.data` directamente.
 * @param url Ruta relativa o absoluta.
 * @param config Configuración opcional de Axios.
 * @returns Promesa del tipo de datos esperado en `data`.
 */
export async function get<T>(
  url: string,
  config?: AxiosRequestConfig
): Promise<T> {
  try {
    const res = await http.get<T>(url, config);
    return res.data;
  } catch (err) {
    throw toHttpError(err, url, "GET");
  }
}
