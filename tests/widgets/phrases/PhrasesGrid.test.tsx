import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, afterEach } from "vitest";
import type { PhrasesGridItem } from "@widgets/phrases/PhrasesGrid";
import PhrasesGrid from "@widgets/phrases/PhrasesGrid";
import * as utils from "@widgets/phrases/utils/utils";

const items: PhrasesGridItem[] = [
  { id: "1", text: "Hola mundo", createdAt: 10 },
  { id: "2", text: "Adiós sol", createdAt: 20 },
  { id: "3", text: "Holístico enfoque", createdAt: 15 },
];

describe("widgets/PhrasesGrid", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("debe renderizar todos los textos de las frases provistas", () => {
    render(<PhrasesGrid items={items} />);
    expect(screen.getByText("Hola mundo")).toBeInTheDocument();
    expect(screen.getByText("Adiós sol")).toBeInTheDocument();
    expect(screen.getByText("Holístico enfoque")).toBeInTheDocument();
  });

  it("debe mostrar el mensaje vacío cuando no hay items y no hay filtro activo", () => {
    render(
      <PhrasesGrid
        items={[]}
        isFiltered={false}
        emptyMessage={<p>Sin frases aún</p>}
      />
    );
    expect(screen.getByText("Sin frases aún")).toBeInTheDocument();
  });

  it("debe mostrar `noResultsMessage` cuando no hay resultados y hay filtro activo", () => {
    render(
      <PhrasesGrid
        items={[]}
        isFiltered
        noResultsMessage={<p>Sin resultados</p>}
      />
    );
    expect(screen.getByText("Sin resultados")).toBeInTheDocument();
  });

  it("debe invocar onDelete(id) al presionar el botón de eliminar de un ítem", async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();

    render(<PhrasesGrid items={items} onDelete={onDelete} />);

    const deleteButtons = screen.getAllByRole("button", {
      name: /eliminar frase/i,
    });
    expect(deleteButtons).toHaveLength(items.length);

    await user.click(deleteButtons[1]);

    expect(onDelete).toHaveBeenCalledTimes(1);
    expect(onDelete).toHaveBeenCalledWith("2");
  });

  it("muestra el header con el total cuando showCount=true", () => {
    render(<PhrasesGrid items={items} showCount />);
    expect(screen.getByText("3 frases en total")).toBeInTheDocument();
  });

  it("estado de carga: muestra Loading con el texto esperado", () => {
    render(<PhrasesGrid items={items} loading />);
    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.getByText("Cargando frases…")).toBeInTheDocument();
  });

  it("estado de error: renderiza RetryError y ejecuta callbacks", async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();
    const onDismiss = vi.fn();

    render(
      <PhrasesGrid
        items={[]}
        isError
        error="Fallo al cargar"
        onRetry={onRetry}
        onDismiss={onDismiss}
      />
    );

    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText("Fallo al cargar")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /reintentar/i }));
    await user.click(screen.getByRole("button", { name: /ocultar/i }));

    expect(onRetry).toHaveBeenCalledTimes(1);
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it("renderiza meta usando formatCreatedAt cuando createdAt es válido; si no lo es, no muestra meta", () => {
    // Mock estable para no depender del formato real
    const spy = vi
      .spyOn(utils, "formatCreatedAt")
      .mockReturnValue("meta-mock-123");

    const withMeta: PhrasesGridItem = {
      id: "m1",
      text: "Con meta",
      createdAt: 123,
    };
    const noMeta: PhrasesGridItem = { id: "m2", text: "Sin meta" };

    render(<PhrasesGrid items={[withMeta, noMeta]} />);

    expect(screen.getByText("meta-mock-123")).toBeInTheDocument();
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith(123);

    expect(screen.getByText("Sin meta")).toBeInTheDocument();
  });

  it("expone roles de accesibilidad del grid y sus celdas", () => {
    render(<PhrasesGrid items={items} />);
    const grid = screen.getByRole("grid");
    expect(grid).toBeInTheDocument();

    const cells = screen.getAllByRole("gridcell");
    expect(cells).toHaveLength(items.length);
  });
});
