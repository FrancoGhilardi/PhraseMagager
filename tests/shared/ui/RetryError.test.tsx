import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import RetryError from "@shared/ui/RetryError";

describe("shared/ui/RetryError", () => {
  it("no renderiza nada si `message` es vacío", () => {
    const { container, rerender } = render(<RetryError message="" />);
    expect(container.firstChild).toBeNull();

    rerender(<RetryError message="   " />);
    expect(container.firstChild).toBeNull();
  });

  it("renderiza un alert con el texto del mensaje", () => {
    render(<RetryError message="Hubo un problema" />);
    const alert = screen.getByRole("alert");
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveTextContent("Hubo un problema");
  });

  it("muestra botón 'Ocultar' solo si se provee `onDismiss` y lo dispara al click", async () => {
    const user = userEvent.setup();
    const onDismiss = vi.fn();

    render(<RetryError message="Error" onDismiss={onDismiss} />);
    const hideBtn = screen.getByRole("button", { name: /ocultar/i });
    expect(hideBtn).toBeInTheDocument();

    // No debe existir 'Reintentar' si no se pasa handler
    expect(screen.queryByRole("button", { name: /reintentar/i })).toBeNull();

    await user.click(hideBtn);
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it("muestra botón 'Reintentar' solo si se provee `onRetry` y lo dispara al click", async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();

    render(<RetryError message="Error" onRetry={onRetry} />);
    const retryBtn = screen.getByRole("button", { name: /reintentar/i });
    expect(retryBtn).toBeInTheDocument();

    // No debe existir 'Ocultar' si no se pasa handler
    expect(screen.queryByRole("button", { name: /ocultar/i })).toBeNull();

    await user.click(retryBtn);
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("muestra ambos botones cuando se proveen ambos handlers", () => {
    render(
      <RetryError message="Error" onRetry={() => {}} onDismiss={() => {}} />
    );
    expect(
      screen.getByRole("button", { name: /ocultar/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /reintentar/i })
    ).toBeInTheDocument();
  });

  it("combina las clases base con `className` adicional", () => {
    render(<RetryError message="Error" className="extra-cls" />);
    const alert = screen.getByRole("alert");
    expect(alert).toHaveClass("extra-cls");
    expect(alert).toHaveClass("rounded-lg");
  });
});
