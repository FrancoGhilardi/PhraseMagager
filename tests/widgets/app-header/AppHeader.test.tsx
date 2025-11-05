import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import AppHeader from "@widgets/app-header/ui/AppHeader";

describe("widgets/app-header/ui/AppHeader", () => {
  it("renderiza el header con role='banner' y aria-label", () => {
    render(<AppHeader />);
    const header = screen.getByRole("banner", { name: /application header/i });
    expect(header).toBeInTheDocument();
    expect(screen.getByTestId("app-header")).toBe(header);
  });

  it("muestra el título y subtítulo esperados", () => {
    render(<AppHeader />);
    // h1 accesible
    expect(
      screen.getByRole("heading", { level: 1, name: /gestor de frases/i })
    ).toBeInTheDocument();

    // subtítulo
    expect(
      screen.getByText(/recopila y organiza tus frases favoritas\./i)
    ).toBeInTheDocument();
  });

  it("combina las clases base con el className recibido por props", () => {
    render(<AppHeader className="bg-red-500 custom-cls" />);
    const header = screen.getByTestId("app-header");
    // clases base del componente
    expect(header).toHaveClass("w-full");
    expect(header).toHaveClass("py-6");
    // clases inyectadas
    expect(header).toHaveClass("bg-red-500");
    expect(header).toHaveClass("custom-cls");
  });
});
