import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { render, screen, within, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import phrasesReducer from "@app/store/slices/phrasesSlice";
import Home from "@pages/Home";

// Mock de backend
const listMock = vi.fn();
vi.mock("@entities/phrases/api/phraseHttp", () => {
  return {
    phraseHttpApi: {
      list: (...args: unknown[]) => listMock(...args),
    },
  };
});

// Dataset base
const FIXTURES = [
  { id: "1", text: "Canción de sol", createdAt: Date.now() - 1_000 },
  { id: "2", text: "Árbol azul", createdAt: Date.now() - 2_000 },
  { id: "3", text: "código (regex)", createdAt: Date.now() - 3_000 },
];

// Helper para renderizar Home con Redux
function renderHome() {
  const store = configureStore({ reducer: { phrases: phrasesReducer } });
  return render(
    <Provider store={store}>
      <Home />
    </Provider>
  );
}

/** Encuentra el input de búsqueda de forma robusta. */
function getSearchInput(): HTMLInputElement {
  const bySearchRoleNamed = screen.queryByRole("searchbox", {
    name: /buscar/i,
  });
  if (bySearchRoleNamed) return bySearchRoleNamed as HTMLInputElement;

  const byTextboxNamed = screen.queryByRole("textbox", { name: /buscar/i });
  if (byTextboxNamed) return byTextboxNamed as HTMLInputElement;

  const byPlaceholder = screen.queryByPlaceholderText?.(/buscar/i);
  if (byPlaceholder) return byPlaceholder as HTMLInputElement;

  const anySearch = screen.queryByRole("searchbox");
  if (anySearch) return anySearch as HTMLInputElement;

  const allTextboxes = screen.queryAllByRole("textbox");
  const fallback = allTextboxes.at(-1);
  if (fallback) return fallback as HTMLInputElement;

  throw new Error("Search input not found");
}

/** Cuenta celdas actuales en la grilla. */
function getGridCount(): number {
  const grid = screen.getByRole("grid");
  const cells = within(grid).queryAllByRole("gridcell");
  return cells.length;
}

/** Espera hasta que la grilla tenga cierta cantidad de items. */
async function waitForGridUpdate(expectedCount: number) {
  await waitFor(
    () => {
      expect(getGridCount()).toBe(expectedCount);
    },
    { timeout: 3_000 }
  );
}

describe("pages/Home e2e", () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    vi.useRealTimers();
    listMock.mockReset();
    listMock.mockResolvedValue(FIXTURES);
    user = userEvent.setup();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("aplica debounce, respeta minLength y entradas solo con espacios", async () => {
    renderHome();
    await screen.findByRole("grid");
    expect(listMock).toHaveBeenCalled();
    await waitForGridUpdate(3);
    const search = getSearchInput();

    // minLength: 1 carácter => no filtra
    await user.clear(search);
    await user.type(search, "a");
    await user.keyboard("{Enter}");
    await waitForGridUpdate(3);

    // Solo espacios => no filtra
    await user.clear(search);
    await user.type(search, "    ");
    await user.keyboard("{Enter}");
    await waitForGridUpdate(3);

    // Búsqueda válida => filtra a 1
    await user.clear(search);
    await user.type(search, "sol");
    await user.keyboard("{Enter}");
    await waitForGridUpdate(1);
    expect(screen.getByText(/canci[oó]n de sol/i)).toBeInTheDocument();
  }, 20_000);

  it("busca ignorando acentos y escapando caracteres especiales", async () => {
    renderHome();

    await screen.findByRole("grid");
    await waitForGridUpdate(3);

    const search = getSearchInput();

    // Ignora acentos
    await user.clear(search);
    await user.type(search, "cancion");
    await user.keyboard("{Enter}");
    await waitForGridUpdate(1);
    expect(screen.getByText(/canci[oó]n de sol/i)).toBeInTheDocument();

    // Escapa caracteres especiales
    await user.clear(search);
    await user.type(search, "(regex");
    await user.keyboard("{Enter}");
    await waitForGridUpdate(1);
    expect(screen.getByText(/c[oó]digo \(regex\)/i)).toBeInTheDocument();

    // Limpiar vuelve al total
    await user.clear(search);
    await user.keyboard("{Enter}");
    await waitForGridUpdate(3);
  }, 20_000);
});
