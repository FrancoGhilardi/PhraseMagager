import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import EmptyState from "@shared/ui/EmptyState";

describe("shared/ui/EmptyState", () => {
  it("render por defecto: role='status', aria-live='polite' y título por defecto", () => {
    render(<EmptyState />);
    const section = screen.getByRole("status");
    expect(section).toBeInTheDocument();
    expect(section).toHaveAttribute("aria-live", "polite");
    expect(
      screen.getByRole("heading", { level: 3, name: /nothing here yet/i })
    ).toBeInTheDocument();
    const iconWrapper = section.querySelector('[aria-hidden="true"]');
    expect(iconWrapper).not.toBeNull();
    expect(section).toHaveClass("text-center");
  });

  it("muestra description, icon y actions personalizados y combina className", () => {
    render(
      <EmptyState
        title="Sin datos"
        description="Prueba a cargar contenido."
        icon={<span data-testid="custom-icon">☆</span>}
        actions={<button>Refrescar</button>}
        className="extra-class"
      />
    );

    expect(
      screen.getByRole("heading", { level: 3, name: /sin datos/i })
    ).toBeInTheDocument();
    expect(
      screen.getByText(/prueba a cargar contenido\./i)
    ).toBeInTheDocument();
    expect(screen.getByTestId("custom-icon")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /refrescar/i })
    ).toBeInTheDocument();

    const section = screen.getByRole("status");
    expect(section).toHaveClass("extra-class");
  });

  it("cuando centered=false no aplica 'text-center' en la sección y usa justify-start", () => {
    render(<EmptyState centered={false} />);
    const section = screen.getByRole("status");
    expect(section).not.toHaveClass("text-center");
    const inner = section.querySelector("div");
    expect(inner?.className).toMatch(/justify-start/);
    expect(inner?.className).not.toMatch(/justify-center/);
  });

  it("permite configurar role y aria-live", () => {
    render(<EmptyState role="region" ariaLive="assertive" />);
    const region = screen.getByRole("region");
    expect(region).toHaveAttribute("aria-live", "assertive");
  });

  it("si title=null no renderiza el heading; si description=null no renderiza el párrafo", () => {
    render(<EmptyState title={null} description={null} />);
    expect(screen.queryByRole("heading", { level: 3 })).not.toBeInTheDocument();
    const section = screen.getByRole("status");
    const desc = Array.from(section.querySelectorAll("p")).find((p) =>
      /text-zinc-5/.test(p.className)
    );
    expect(desc).toBeUndefined();
  });
});
