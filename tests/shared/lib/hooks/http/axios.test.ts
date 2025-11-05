import { describe, it, expect, beforeEach, vi } from "vitest";

// Mock de ENV para baseURL conocida
vi.mock("@shared/config/env", () => ({
  ENV: { apiBaseUrl: "https://example.test/api" },
}));

type InterceptorFulfilled<T> = (value: T) => T | Promise<T>;
type InterceptorRejected = (error: unknown) => never | Promise<never>;

const hoisted = vi.hoisted(() => {
  const captured = {
    request: {
      fulfilled: null as InterceptorFulfilled<any> | null,
      rejected: null as InterceptorRejected | null,
    },
    response: {
      fulfilled: null as InterceptorFulfilled<any> | null,
      rejected: null as InterceptorRejected | null,
    },
  };

  const mockInstance = {
    get: vi.fn(),
    interceptors: {
      request: {
        use: (
          fulfilled: InterceptorFulfilled<unknown>,
          rejected?: InterceptorRejected
        ) => {
          captured.request.fulfilled = fulfilled as InterceptorFulfilled<any>;
          captured.request.rejected = (rejected ??
            null) as InterceptorRejected | null;
        },
      },
      response: {
        use: (
          fulfilled: InterceptorFulfilled<unknown>,
          rejected?: InterceptorRejected
        ) => {
          captured.response.fulfilled = fulfilled as InterceptorFulfilled<any>;
          captured.response.rejected = (rejected ??
            null) as InterceptorRejected | null;
        },
      },
    },
    __capturedInterceptors: captured,
  };

  const axiosIsAxiosError = vi.fn(
    (err: unknown) => !!(err as any)?.__isAxiosError
  );

  return { captured, mockInstance, axiosIsAxiosError };
});

// Mock del módulo axios
vi.mock("axios", () => ({
  default: {
    create: vi.fn(() => hoisted.mockInstance),
    isAxiosError: hoisted.axiosIsAxiosError,
  },
  isAxiosError: hoisted.axiosIsAxiosError,
}));

import {
  HttpError,
  isHttpError,
  toHttpError,
  http,
  get,
} from "@shared/lib/http/axios";

describe("shared/lib/http/axios", () => {
  beforeEach(() => {
    hoisted.mockInstance.get.mockReset();
    hoisted.axiosIsAxiosError.mockReset();
  });

  // Helpers
  it("isHttpError: reconoce instancias de HttpError", () => {
    const e = new HttpError({ message: "boom" });
    expect(isHttpError(e)).toBe(true);
    expect(isHttpError(new Error("x"))).toBe(false);
    expect(isHttpError(null)).toBe(false);
  });

  it("toHttpError: envuelve AxiosError priorizando mensaje del servidor", () => {
    hoisted.axiosIsAxiosError.mockReturnValueOnce(true);

    const axErr = {
      __isAxiosError: true,
      message: "Mensaje axios",
      code: "ERR_BAD_REQUEST",
      response: {
        status: 404,
        data: "Not found custom text",
      },
      config: {
        baseURL: "https://api.test",
        url: "/v1/items",
        method: "get",
      },
    };

    const e = toHttpError(axErr, "/fallback", "POST");
    expect(e).toBeInstanceOf(HttpError);
    expect(e.status).toBe(404);
    expect(e.code).toBe("ERR_BAD_REQUEST");
    expect(e.url).toBe("https://api.test/v1/items");
    expect(e.method).toBe("GET");
    expect(e.message).toMatch(/Not found custom text/);
  });

  it("toHttpError: usa data.message o data.error cuando data no es string", () => {
    hoisted.axiosIsAxiosError.mockReturnValue(true);

    const axWithDataMessage = {
      __isAxiosError: true,
      response: { status: 500, data: { message: "server-says" } },
      config: { url: "/x", method: "post" },
    };
    const e1 = toHttpError(axWithDataMessage);
    expect(e1.message).toBe("server-says");

    const axWithDataError = {
      __isAxiosError: true,
      response: { status: 400, data: { error: "bad-request" } },
      config: { url: "/y" },
    };
    const e2 = toHttpError(axWithDataError);
    expect(e2.message).toBe("bad-request");
    expect(e2.method).toBe("GET");
  });

  it("toHttpError: errores no-axios se envuelven usando fallback url/method", () => {
    hoisted.axiosIsAxiosError.mockReturnValue(false);

    const unknown = { message: "boom-unknown" };
    const e = toHttpError(unknown, "/path", "DELETE");
    expect(e).toBeInstanceOf(HttpError);
    expect(e.url).toBe("/path");
    expect(e.method).toBe("DELETE");
    expect(e.message).toBe("boom-unknown");
  });

  // Interceptores
  it("request interceptor: elimina múltiples slashes iniciales cuando hay baseURL", () => {
    const reqOk = (http as any).__capturedInterceptors?.request?.fulfilled as
      | InterceptorFulfilled<any>
      | undefined;

    expect(typeof reqOk).toBe("function");

    const cfg1 = reqOk!({
      baseURL: "https://example.test/api",
      url: "///v1/phrases",
    });
    expect((cfg1 as any).url).toBe("/v1/phrases");

    const cfg2 = reqOk!({
      url: "///v1/phrases",
      baseURL: "",
    });
    expect((cfg2 as any).url).toBe("///v1/phrases");

    const cfg3 = reqOk!({ baseURL: "https://example.test/api" });
    expect(cfg3).toEqual({ baseURL: "https://example.test/api" });
  });

  it("response interceptor: pasa OK y envuelve errores en HttpError", async () => {
    const resOk = (http as any).__capturedInterceptors?.response?.fulfilled as
      | InterceptorFulfilled<any>
      | undefined;
    const resErr = (http as any).__capturedInterceptors?.response?.rejected as
      | InterceptorRejected
      | undefined;

    expect(typeof resOk).toBe("function");
    expect(typeof resErr).toBe("function");

    const response = { data: { ok: true } };
    expect(resOk!(response)).toBe(response);

    hoisted.axiosIsAxiosError.mockReturnValueOnce(true);
    const axErr = { __isAxiosError: true, response: {}, config: {} };
    await expect(resErr!(axErr)).rejects.toBeInstanceOf(HttpError);
  });

  // get<T>
  it("get<T>: devuelve `response.data` cuando la llamada es exitosa", async () => {
    hoisted.mockInstance.get.mockResolvedValueOnce({
      data: { hello: "world" },
    });

    const data = await get<{ hello: string }>("/saludo");
    expect(data).toEqual({ hello: "world" });
    expect(hoisted.mockInstance.get).toHaveBeenCalledWith("/saludo", undefined);
  });

  it("get<T>: ante error lanza HttpError con fallback de url y método GET", async () => {
    hoisted.axiosIsAxiosError.mockReturnValue(false);
    hoisted.mockInstance.get.mockRejectedValueOnce(new Error("network down"));

    await expect(get("/cosas")).rejects.toSatisfy((e: unknown) => {
      const he = e as HttpError;
      return (
        he instanceof HttpError &&
        he.method === "GET" &&
        he.url === "/cosas" &&
        /network down|Fallo de red|error desconocido/i.test(he.message)
      );
    });
  });
});
