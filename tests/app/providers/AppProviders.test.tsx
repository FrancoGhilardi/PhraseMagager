import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect } from "vitest";
import AppProviders from "@app/providers/AppProviders";
import { useDispatch, useSelector } from "react-redux";
import { setQuery } from "@app/store/slices/phrasesSlice";

/** Hijo de prueba que interactúa con el store Redux. */
const ReduxProbe: React.FC = () => {
  const query = useSelector((selector: any) => selector.phrases?.query ?? "");
  const dispatch = useDispatch();
  return (
    <div>
      <output data-testid="query">{query}</output>
      <button
        type="button"
        aria-label="set-query"
        onClick={() => dispatch(setQuery("hola"))}
      >
        Set Query
      </button>
    </div>
  );
};

describe("app/providers/AppProviders", () => {
  it("retorna null si no se proveen children", () => {
    const { container } = render(
      <AppProviders>{undefined as any}</AppProviders>
    );
    expect(container.firstChild).toBeNull();
  });

  it("provee el store de Redux a los hijos (lectura y escritura)", async () => {
    const user = userEvent.setup();

    render(
      <AppProviders>
        <ReduxProbe />
      </AppProviders>
    );

    // Estado inicial del slice
    expect(screen.getByTestId("query")).toHaveTextContent("");

    // Despachamos una acción y verificamos que el hijo observe el cambio
    await user.click(screen.getByRole("button", { name: /set-query/i }));
    expect(screen.getByTestId("query")).toHaveTextContent("hola");
  });
});
