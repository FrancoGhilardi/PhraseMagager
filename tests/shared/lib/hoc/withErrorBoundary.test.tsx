import React, { type ComponentType } from "react";
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import withErrorBoundary, {
  ErrorBoundary,
  type ErrorBoundaryOptions,
} from "@shared/lib/hoc/withErrorBoundary";

function silenceConsoleError() {
  return vi.spyOn(console, "error").mockImplementation(() => {});
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("ErrorBoundary (componente)", () => {
  it("renderiza los hijos cuando no hay error", () => {
    render(
      <ErrorBoundary>
        <div data-testid="ok">OK</div>
      </ErrorBoundary>
    );

    expect(screen.getByTestId("ok")).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("muestra el fallback por defecto cuando el hijo lanza y permite reintentar (remonta)", async () => {
    const user = userEvent.setup();
    const mockConsole = silenceConsoleError();
    const onError = vi.fn();

    let shouldThrow = true;
    function ControlledBoom() {
      if (shouldThrow) throw new Error("Boom!");
      return <div data-testid="recuperado">Recuperado</div>;
    }

    render(
      <ErrorBoundary
        onError={onError}
        onReset={() => {
          shouldThrow = false;
        }}
      >
        <ControlledBoom />
      </ErrorBoundary>
    );

    // Fallback por defecto visible
    const alert = screen.getByRole("alert");
    expect(alert).toBeInTheDocument();
    expect(screen.getByText(/Ocurrió un error/i)).toBeInTheDocument();
    expect(screen.getByText("Boom!")).toBeInTheDocument();

    // Se registró el error en componentDidCatch
    expect(mockConsole).toHaveBeenCalled();
    expect(onError).toHaveBeenCalledTimes(1);

    // Click en "Reintentar"
    await user.click(screen.getByRole("button", { name: /reintentar/i }));

    // Ahora el hijo ya no lanza y se renderiza normalmente
    expect(screen.getByTestId("recuperado")).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("respeta un fallback estático provisto vía `fallback`", () => {
    silenceConsoleError();

    function SiempreFalla() {
      throw new Error("Siempre");
    }

    render(
      <ErrorBoundary fallback={<div data-testid="custom">Custom</div>}>
        <SiempreFalla />
      </ErrorBoundary>
    );

    expect(screen.getByTestId("custom")).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("soporta `fallbackRender` con acceso a error y `reset`", async () => {
    const user = userEvent.setup();
    const mockConsole = silenceConsoleError();

    let shouldThrow = true;
    function QuizasFalla() {
      if (shouldThrow) throw new Error("Dinámico");
      return <div data-testid="ok-after-retry">OK tras reintento</div>;
    }

    render(
      <ErrorBoundary
        fallbackRender={({ error, reset }) => (
          <div role="alert">
            <span data-testid="err-msg">{error.message}</span>
            <button
              onClick={() => {
                shouldThrow = false;
                reset();
              }}
            >
              Reintentar ahora
            </button>
          </div>
        )}
      >
        <QuizasFalla />
      </ErrorBoundary>
    );

    expect(mockConsole).toHaveBeenCalled();
    expect(screen.getByTestId("err-msg")).toHaveTextContent("Dinámico");

    await user.click(screen.getByRole("button", { name: /reintentar ahora/i }));
    expect(screen.getByTestId("ok-after-retry")).toBeInTheDocument();
  });
});

describe("withErrorBoundary", () => {
  it("envuelve el componente, preserva estáticos y asigna un displayName descriptivo", () => {
    const Base: ComponentType<{ label: string }> & {
      customStatic?: string;
    } = ({ label }) => <div data-testid="base">{label}</div>;
    Base.displayName = "Base";
    Base.customStatic = "keep-me";

    const Wrapped = withErrorBoundary(Base, {
      fallback: <div data-testid="fallback">Fallback</div>,
    } as ErrorBoundaryOptions) as typeof Base;

    expect(Wrapped.customStatic).toBe("keep-me");
    expect(Wrapped.displayName).toBe("withErrorBoundary(Base)");

    render(<Wrapped label="Hola" />);
    expect(screen.getByTestId("base")).toHaveTextContent("Hola");
  });

  it("renderiza el fallback del HOC cuando el componente envuelto lanza", () => {
    silenceConsoleError();

    const Explota: React.FC = () => {
      throw new Error("wrapped boom");
    };
    Explota.displayName = "Explota";

    const Wrapped = withErrorBoundary(Explota, {
      fallback: <div data-testid="hoc-fallback">HOC Fallback</div>,
    });

    render(<Wrapped />);
    expect(screen.getByTestId("hoc-fallback")).toBeInTheDocument();
  });
});
