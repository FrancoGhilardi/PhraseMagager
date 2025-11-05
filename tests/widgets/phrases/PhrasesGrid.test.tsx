import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { PhrasesGridItem } from "@widgets/phrases/PhrasesGrid";
import PhrasesGrid from "@widgets/phrases/PhrasesGrid";

const items: PhrasesGridItem[] = [
  { id: "1", text: "Hola mundo", createdAt: 10 },
  { id: "2", text: "Adiós sol", createdAt: 20 },
  { id: "3", text: "Holístico enfoque", createdAt: 15 },
];

describe("widgets/PhrasesGrid", () => {
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
});
