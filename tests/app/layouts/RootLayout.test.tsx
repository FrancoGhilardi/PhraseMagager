import React from "react";
import { render, screen, within } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

// Mock explícito del header para aislar el layout y verificar su presencia.
vi.mock("@widgets/app-header/ui/AppHeader", () => {
  const MockHeader: React.FC = () => <header data-testid="app-header-mock" />;
  return { __esModule: true, default: MockHeader };
});

import RootLayout from "@app/layouts/RootLayout";

describe("app/layouts/RootLayout", () => {
  it("renderiza el contenedor, el header y el main con rol accesible", () => {
    render(
      <RootLayout>
        <span>Contenido</span>
      </RootLayout>
    );

    const wrapper = screen.getByTestId("root-layout");
    expect(wrapper).toBeInTheDocument();
    expect(screen.getByTestId("app-header-mock")).toBeInTheDocument();
    const main = screen.getByRole("main");
    expect(main).toBeInTheDocument();
    expect(within(main).getByText("Contenido")).toBeInTheDocument();
  });

  it("aplica className al wrapper y mainClassName al main", () => {
    render(
      <RootLayout className="wrap-foo" mainClassName="main-bar">
        <span>Algo</span>
      </RootLayout>
    );

    const wrapper = screen.getByTestId("root-layout");
    expect(wrapper).toHaveClass("wrap-foo");

    const main = screen.getByRole("main");
    expect(main).toHaveClass("main-bar");
  });

  it("renderiza correctamente aunque children sea null/undefined", () => {
    const { rerender } = render(
      <RootLayout>{null as unknown as React.ReactNode}</RootLayout>
    );
    expect(screen.getByRole("main")).toBeInTheDocument();

    rerender(
      <RootLayout>{undefined as unknown as React.ReactNode}</RootLayout>
    );
    expect(screen.getByRole("main")).toBeInTheDocument();
  });
});
