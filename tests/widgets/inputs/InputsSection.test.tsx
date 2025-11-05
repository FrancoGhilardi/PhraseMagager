import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";

vi.mock("@features/add-phrase/ui/AddPhraseForm", () => {
  type Props = {
    onSubmit?: (text: string) => void;
    autoFocus?: boolean;
  };
  const MockAdd: React.FC<Props> = ({ onSubmit, autoFocus }) => (
    <div data-testid="mock-add">
      <input aria-label="Nueva frase (mock)" autoFocus={autoFocus} />
      <button
        type="button"
        aria-label="Añadir (mock)"
        onClick={() => onSubmit?.("Hola desde mock")}
      >
        Añadir
      </button>
    </div>
  );
  return { __esModule: true, default: MockAdd };
});

vi.mock("@features/search-phrases/ui/SearchInput", () => {
  type Props = {
    value?: string;
    defaultValue?: string;
    onChange?: (v: string) => void;
    autoFocus?: boolean;
    className?: string;
  };
  const MockSearch: React.FC<Props> = ({
    value,
    defaultValue,
    onChange,
    autoFocus,
    className,
  }) => (
    <input
      data-testid="mock-search"
      type="search"
      aria-label="Buscar frases (mock)"
      value={value}
      defaultValue={defaultValue}
      onChange={(e) => onChange?.((e.target as HTMLInputElement).value)}
      autoFocus={autoFocus}
      className={className}
    />
  );
  return { __esModule: true, default: MockSearch };
});

import InputsSection from "@widgets/inputs/InputsSection";

describe("widgets/inputs/InputsSection", () => {
  it("renderiza la sección con aria-label y ambos subcomponentes", () => {
    render(<InputsSection />);
    const section = screen.getByRole("region", {
      name: /controles de frases/i,
    });
    expect(section).toBeInTheDocument();
    expect(screen.getByTestId("mock-add")).toBeInTheDocument();
    expect(screen.getByTestId("mock-search")).toBeInTheDocument();
  });

  it("propaga `onAddSubmit` y `onSearchChange` a los subcomponentes", async () => {
    const user = userEvent.setup();
    const onAddSubmit = vi.fn();
    const onSearchChange = vi.fn();

    render(
      <InputsSection
        onAddSubmit={onAddSubmit}
        onSearchChange={onSearchChange}
      />
    );

    // Click en “Añadir” debe llamar al submit con el texto del mock
    await user.click(screen.getByRole("button", { name: /añadir \(mock\)/i }));
    expect(onAddSubmit).toHaveBeenCalledTimes(1);
    expect(onAddSubmit).toHaveBeenCalledWith("Hola desde mock");

    // Tipear en el buscador debe propagar cambios a onSearchChange
    const search = screen.getByTestId("mock-search");
    await user.type(search, "hola");
    const lastArg = onSearchChange.mock.calls.at(-1)?.[0];
    expect(lastArg).toBe("hola");
  });

  it("cuando `searchValue` está definido, el buscador actúa como controlado", async () => {
    const user = userEvent.setup();
    const onSearchChange = vi.fn();

    render(<InputsSection searchValue="pre" onSearchChange={onSearchChange} />);

    const search = screen.getByTestId("mock-search");
    expect(search).toHaveValue("pre");

    // Aunque tipeemos, el valor DOM no cambia, pero se notifica el cambio
    await user.type(search, "x");
    const lastArg = onSearchChange.mock.calls.at(-1)?.[0];
    expect(lastArg).toBe("prex");
    expect(search).toHaveValue("pre");
  });

  it("cuando solo `searchDefaultValue` está definido, el buscador inicia con ese valor", () => {
    render(<InputsSection searchDefaultValue="inicio" />);
    const search = screen.getByTestId("mock-search");
    expect(search).toHaveValue("inicio");
  });

  it("respeta los flags de autoFocus en cada subcomponente", () => {
    const { unmount } = render(<InputsSection addAutoFocus />);
    const addInput = screen.getByRole("textbox", {
      name: /nueva frase \(mock\)/i,
    });
    expect(document.activeElement).toBe(addInput);

    unmount();
    render(<InputsSection searchAutoFocus />);
    const search = screen.getByTestId("mock-search");
    expect(document.activeElement).toBe(search);
  });

  it("propaga className al buscador (posee 'w-full')", () => {
    render(<InputsSection />);
    const search = screen.getByTestId("mock-search");
    expect(search).toHaveClass("w-full");
  });
});
