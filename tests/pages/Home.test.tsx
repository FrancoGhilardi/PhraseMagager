import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, beforeEach, vi } from "vitest";

const facade = {
  filteredItems: [] as Array<{ id: string; text: string }>,
  isFiltered: false,
  query: "",
  error: "",
  flags: {
    isIdle: true,
    isLoading: false,
    isLoaded: false,
    isError: false,
  },
  load: vi.fn(),
  updateQuery: vi.fn(),
  removeById: vi.fn(),
  dismissError: vi.fn(),
};

vi.mock("@features/phrases/usecases/usePhrasesFacade", () => {
  return {
    usePhrasesFacade: () => facade,
  };
});

// Mock de InputsSection
vi.mock("@widgets/inputs/InputsSection", () => {
  const InputsSectionMock: React.FC = (props: any) => (
    <section data-testid="inputs-mock">
      <output data-testid="searchValue">{props.searchValue ?? ""}</output>
      <button
        type="button"
        onClick={() => props.onSearchChange?.("hola")}
        aria-label="emit-search-change"
      >
        Emitir cambio búsqueda
      </button>
    </section>
  );
  return { __esModule: true, default: InputsSectionMock };
});

// Mock de PhrasesGrid: refleja flags/props y expone botones para callbacks
vi.mock("@widgets/phrases/PhrasesGrid", () => {
  const PhrasesGridMock: React.FC = (props: any) => (
    <section
      data-testid="grid-mock"
      data-loading={props.loading ? "true" : "false"}
      data-iserror={props.isError ? "true" : "false"}
    >
      <output data-testid="itemsCount">{props.items?.length ?? 0}</output>
      <output data-testid="errorText">{props.error ?? ""}</output>
      <button
        type="button"
        aria-label="delete-first"
        onClick={() => {
          const first = props.items?.[0];
          if (first) props.onDelete?.(first.id);
        }}
      >
        Eliminar primero
      </button>
      <button
        type="button"
        aria-label="retry"
        onClick={() => props.onRetry?.()}
      >
        Reintentar
      </button>
      <button
        type="button"
        aria-label="dismiss"
        onClick={() => props.onDismiss?.()}
      >
        Ocultar
      </button>
    </section>
  );
  return { __esModule: true, default: PhrasesGridMock };
});

import Home from "@pages/Home";

describe("pages/Home", () => {
  beforeEach(() => {
    facade.filteredItems = [];
    facade.isFiltered = false;
    facade.query = "";
    facade.error = "";
    facade.flags = {
      isIdle: true,
      isLoading: false,
      isLoaded: false,
      isError: false,
    };
    facade.load.mockReset();
    facade.updateQuery.mockReset();
    facade.removeById.mockReset();
    facade.dismissError.mockReset();
  });

  it("montaje con isIdle=true llama load() una sola vez y la grilla recibe loading=true", async () => {
    const user = userEvent.setup();

    render(<Home />);

    expect(
      screen.getByRole("main", { name: /contenido principal/i })
    ).toBeInTheDocument();

    expect(facade.load).toHaveBeenCalledTimes(1);

    const grid = screen.getByTestId("grid-mock");
    expect(grid).toHaveAttribute("data-loading", "true");

    await user.click(screen.getByLabelText("emit-search-change"));
    expect(facade.load).toHaveBeenCalledTimes(1);
  });

  it("propaga callbacks: updateQuery / removeById / load / dismissError y refleja props en hijos", async () => {
    const user = userEvent.setup();

    // Estado "cargado" y con datos + error visible
    facade.filteredItems = [
      { id: "10", text: "a" },
      { id: "11", text: "b" },
    ];
    facade.isFiltered = true;
    facade.query = "abc";
    facade.error = "Boom!";
    facade.flags = {
      isIdle: false,
      isLoading: false,
      isLoaded: true,
      isError: true,
    };

    render(<Home />);

    // InputsSection recibe el valor controlado de búsqueda
    expect(screen.getByTestId("searchValue")).toHaveTextContent("abc");

    // onSearchChange
    await user.click(screen.getByLabelText("emit-search-change"));
    expect(facade.updateQuery).toHaveBeenCalledTimes(1);
    expect(facade.updateQuery).toHaveBeenCalledWith("hola");

    // PhrasesGrid recibe items y no loading (isLoaded=true, isLoading=false)
    const grid = screen.getByTestId("grid-mock");
    expect(screen.getByTestId("itemsCount")).toHaveTextContent("2");
    expect(grid).toHaveAttribute("data-loading", "false");

    // PhrasesGrid muestra error y expone acciones
    expect(screen.getByTestId("errorText")).toHaveTextContent("Boom!");

    // onDelete
    await user.click(screen.getByLabelText("delete-first"));
    expect(facade.removeById).toHaveBeenCalledTimes(1);
    expect(facade.removeById).toHaveBeenCalledWith("10");

    // onRetry
    await user.click(screen.getByLabelText("retry"));
    expect(facade.load).toHaveBeenCalledTimes(1);

    // onDismiss
    await user.click(screen.getByLabelText("dismiss"));
    expect(facade.dismissError).toHaveBeenCalledTimes(1);
  });
});
