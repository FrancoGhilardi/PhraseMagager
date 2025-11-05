import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { render, screen, waitFor } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import phrasesReducer, { setQuery } from "@app/store/slices/phrasesSlice";
import { usePhrasesFacade } from "@features/phrases/usecases/usePhrasesFacade";

const listMock = vi.fn();
vi.mock("@entities/phrases/api/phraseHttp", () => {
  return {
    phraseHttpApi: {
      list: (...args: unknown[]) => listMock(...args),
    },
  };
});

const FIXTURES = [
  { id: "1", text: "Hola mundo", createdAt: 10 },
  { id: "2", text: "Adiós sol", createdAt: 20 },
  { id: "3", text: "Holístico enfoque", createdAt: 15 },
];

function FacadeHarness() {
  const { status, items, counts, isFiltered } = usePhrasesFacade();
  return (
    <div>
      <output data-testid="status">{status}</output>
      <output data-testid="total">{counts.total}</output>
      <output data-testid="filtered">{counts.filtered}</output>
      <output data-testid="isFiltered">{String(isFiltered)}</output>
      <output data-testid="ids">{items.map((i) => i.id).join(",")}</output>
    </div>
  );
}

function makeStore() {
  return configureStore({
    reducer: { phrases: phrasesReducer },
  });
}

type TestStore = ReturnType<typeof makeStore>;

const getText = (id: string) => screen.getByTestId(id).textContent ?? "";

describe("features/usePhrasesFacade", () => {
  beforeEach(() => {
    listMock.mockReset();
  });

  it("montaje: debe llamar a la API 1 sola vez y poblar items", async () => {
    listMock.mockResolvedValueOnce(FIXTURES);

    const store = makeStore();

    render(
      <Provider store={store}>
        <FacadeHarness />
      </Provider>
    );

    // Debe pasar a pending y luego a succeeded con datos cargados
    await waitFor(() =>
      expect(["pending", "succeeded"]).toContain(getText("status"))
    );
    await waitFor(() => expect(getText("status")).toBe("succeeded"));

    // Verificaciones de datos
    expect(getText("total")).toBe(String(FIXTURES.length));
    expect(getText("filtered")).toBe(String(FIXTURES.length));
    expect(getText("isFiltered")).toBe("false");

    // No debe haber loops
    expect(listMock).toHaveBeenCalledTimes(1);

    // Los IDs deben reflejar orden por createdAt desc (2,3,1)
    expect(getText("ids")).toBe("2,3,1");
  });

  it("query externa: debe actualizar counts e isFiltered sin volver a pedir a la API", async () => {
    listMock.mockResolvedValueOnce(FIXTURES);

    const store: TestStore = makeStore();

    render(
      <Provider store={store}>
        <FacadeHarness />
      </Provider>
    );

    // Esperar data cargada
    await waitFor(() => expect(getText("status")).toBe("succeeded"));
    expect(listMock).toHaveBeenCalledTimes(1);

    // Cambiar query desde afuera
    store.dispatch(setQuery("hol"));

    // Ahora debe estar filtrado y la cantidad debe coincidir con los que contienen "hol"
    await waitFor(() => expect(getText("isFiltered")).toBe("true"));
    expect(getText("filtered")).toBe("2");

    // Asegura que no se disparó otra llamada remota
    expect(listMock).toHaveBeenCalledTimes(1);

    // Cambios de query adicionales tampoco deben disparar fetch
    store.dispatch(setQuery("xyz"));
    await waitFor(() => expect(getText("filtered")).toBe("0"));
    expect(listMock).toHaveBeenCalledTimes(1);
  });

  it("re-renderes múltiples: no deben provocar llamadas repetidas a la API", async () => {
    listMock.mockResolvedValueOnce(FIXTURES);

    const store = makeStore();

    const { rerender } = render(
      <Provider store={store}>
        <FacadeHarness />
      </Provider>
    );

    await waitFor(() => expect(getText("status")).toBe("succeeded"));
    expect(listMock).toHaveBeenCalledTimes(1);

    // Forzar varios re-renderes del árbol
    rerender(
      <Provider store={store}>
        <FacadeHarness />
      </Provider>
    );
    rerender(
      <Provider store={store}>
        <FacadeHarness />
      </Provider>
    );

    // Sigue siendo una sola llamada
    expect(listMock).toHaveBeenCalledTimes(1);
  });
});
