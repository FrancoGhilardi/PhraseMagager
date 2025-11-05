import { useState } from "react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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

// Mezcla para cubrir nextIdFrom
const SEEDS_MIXED = [
  { id: "xyz", text: "X", createdAt: 1 },
  { id: "10", text: "T", createdAt: 2 },
  { id: "2", text: "B", createdAt: 3 },
  { id: "5a", text: "C", createdAt: 4 },
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

// Harness con acciones para ejercitar early returns / nextIdFrom
function FacadeActionsHarness() {
  const f = usePhrasesFacade();
  return (
    <div>
      <output data-testid="status">{f.status}</output>
      <output data-testid="ids">{f.items.map((i) => i.id).join(",")}</output>
      <button
        type="button"
        data-testid="btn-update-same"
        onClick={() => f.updateQuery(f.query)}
      >
        update-same
      </button>
      <button
        type="button"
        data-testid="btn-reset"
        onClick={() => f.resetQuery()}
      >
        reset
      </button>
      <button
        type="button"
        data-testid="btn-add-empty"
        onClick={() => f.addPhrase("   ")}
      >
        add-empty
      </button>
      <button
        type="button"
        data-testid="btn-add-valid"
        onClick={() => f.addPhrase("Nueva frase")}
      >
        add-valid
      </button>
      <button
        type="button"
        data-testid="btn-remove-empty"
        onClick={() => f.removeById("   ")}
      >
        remove-empty
      </button>
      <button
        type="button"
        data-testid="btn-dismiss"
        onClick={() => f.dismissError()}
      >
        dismiss
      </button>
    </div>
  );
}

// Harness imperativo para verificar retorno de addPhrase(null/empty)
function FacadeResultHarness() {
  const f = usePhrasesFacade();
  const [result, setResult] = useState<any>("none");
  return (
    <div>
      <output data-testid="ids">{f.items.map((i) => i.id).join(",")}</output>
      <output data-testid="add-result">{String(result)}</output>
      <button
        data-testid="add-empty-call"
        onClick={() => setResult(f.addPhrase("   "))}
      >
        add-empty-call
      </button>
      <button
        data-testid="remove-empty-call"
        onClick={() => f.removeById("   ")}
      >
        remove-empty-call
      </button>
      <button
        data-testid="update-same-call"
        onClick={() => f.updateQuery(f.query)}
      >
        update-same-call
      </button>
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

    await waitFor(() =>
      expect(["pending", "succeeded"]).toContain(getText("status"))
    );
    await waitFor(() => expect(getText("status")).toBe("succeeded"));

    expect(getText("total")).toBe(String(FIXTURES.length));
    expect(getText("filtered")).toBe(String(FIXTURES.length));
    expect(getText("isFiltered")).toBe("false");
    expect(listMock).toHaveBeenCalledTimes(1);
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

    await waitFor(() => expect(getText("status")).toBe("succeeded"));
    expect(listMock).toHaveBeenCalledTimes(1);

    store.dispatch(setQuery("hol"));

    await waitFor(() => expect(getText("isFiltered")).toBe("true"));
    expect(getText("filtered")).toBe("2");
    expect(listMock).toHaveBeenCalledTimes(1);

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

    expect(listMock).toHaveBeenCalledTimes(1);
  });

  it("cubre early returns y generación de IDs incrementales", async () => {
    const user = userEvent.setup();
    listMock.mockResolvedValueOnce(SEEDS_MIXED);

    const store = makeStore();

    render(
      <Provider store={store}>
        <FacadeActionsHarness />
      </Provider>
    );

    await waitFor(() => expect(getText("status")).toBe("succeeded"));
    const beforeIds = getText("ids");

    // updateQuery con el mismo valor
    await user.click(screen.getByTestId("btn-update-same"));

    // resetQuery con query vacío
    await user.click(screen.getByTestId("btn-reset"));

    // addPhrase con texto vacío
    await user.click(screen.getByTestId("btn-add-empty"));
    expect(getText("ids")).toBe(beforeIds);

    // addPhrase válido
    await user.click(screen.getByTestId("btn-add-valid"));
    const idsAfterAdd = getText("ids").split(",").filter(Boolean);
    expect(idsAfterAdd).toContain("11");

    // removeById con id vacío
    await user.click(screen.getByTestId("btn-remove-empty"));

    // dismissError con error nulo
    await user.click(screen.getByTestId("btn-dismiss"));
  });

  it("cancela la petición en curso", async () => {
    let aborted = false;
    listMock.mockImplementationOnce((params?: { signal?: AbortSignal }) => {
      params?.signal?.addEventListener("abort", () => {
        aborted = true;
      });
      return new Promise(() => {});
    });

    const store = makeStore();

    const { unmount } = render(
      <Provider store={store}>
        <FacadeHarness />
      </Provider>
    );

    // Debe entrar en pending
    await waitFor(() => {
      expect(["pending", "succeeded"]).toContain(getText("status"));
      expect(getText("status")).toBe("pending");
    });

    // Al desmontar debe disparar abort sobre la señal
    unmount();
    expect(aborted).toBe(true);
  });

  it("addPhrase('   ') retorna null y removeById('   ') no altera items", async () => {
    const user = userEvent.setup();
    listMock.mockResolvedValueOnce([]);

    const store = makeStore();

    render(
      <Provider store={store}>
        <FacadeResultHarness />
      </Provider>
    );

    const beforeIds = getText("ids");
    await user.click(screen.getByTestId("add-empty-call"));
    expect(screen.getByTestId("add-result").textContent).toBe("null");
    expect(getText("ids")).toBe(beforeIds);

    await user.click(screen.getByTestId("remove-empty-call"));
    expect(getText("ids")).toBe(beforeIds);

    // updateQuery con el mismo valor
    await user.click(screen.getByTestId("update-same-call"));
  });
});
