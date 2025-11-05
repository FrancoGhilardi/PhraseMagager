import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Loading from "@shared/ui/Loading";

describe("shared/ui/Loading", () => {
  it("no renderiza nada si `text` es vacío o solo espacios", () => {
    const { container, rerender } = render(<Loading text="" />);
    expect(container.firstChild).toBeNull();

    rerender(<Loading text="   " />);
    expect(container.firstChild).toBeNull();
  });

  it("render por defecto con role='status', aria-live='polite' y texto 'Cargando…'", () => {
    render(<Loading />);
    const status = screen.getByRole("status");
    expect(status).toHaveAttribute("aria-live", "polite");
    expect(screen.getByText("Cargando…")).toBeInTheDocument();
    const textEl = screen.getByText("Cargando…");
    expect(textEl).toHaveClass("text-center");
  });

  it("cuando center=false no aplica la clase 'text-center' y combina className extra", () => {
    render(
      <Loading text="Cargando frases…" center={false} className="extra-cls" />
    );

    const status = screen.getByRole("status");
    expect(status).toHaveClass("extra-cls");
    const textEl = screen.getByText("Cargando frases…");
    expect(textEl).not.toHaveClass("text-center");
  });
});
