import React, {
  Component,
  Fragment,
  type ComponentType,
  type ErrorInfo,
  type PropsWithChildren,
  type ReactNode,
} from "react";

export type ErrorBoundaryOptions = {
  fallback?: ReactNode;
  fallbackRender?: (args: { error: Error; reset: () => void }) => ReactNode;
  onError?: (error: Error, info: { componentStack: string }) => void;
  onReset?: () => void;
};

type ErrorBoundaryState = {
  hasError: boolean;
  error: Error | null;
  resetKey: number;
};

export class ErrorBoundary extends Component<
  PropsWithChildren<ErrorBoundaryOptions>,
  ErrorBoundaryState
> {
  public static displayName = "ErrorBoundary";

  public state: ErrorBoundaryState = {
    hasError: false,
    error: null,
    resetKey: 0,
  };

  /** Ciclo de vida de React para derivar el estado de error para renderizar un recurso fallback */
  public static getDerivedStateFromError(
    error: Error
  ): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  /** Ciclo de vida de React para notificar detalles de errores  */
  public componentDidCatch(error: Error, info: ErrorInfo) {
    if (process.env.NODE_ENV !== "production") {
      console.error("[ErrorBoundary] Caught error:", error, info);
    }
    this.props.onError?.(error, { componentStack: info.componentStack ?? "" });
  }

  private handleReset = () => {
    this.setState((s) => ({
      hasError: false,
      error: null,
      resetKey: s.resetKey + 1,
    }));
    this.props.onReset?.();
  };

  private renderDefaultFallback(error: Error) {
    return (
      <div
        role="alert"
        className="rounded-2xl border border-zinc-200 p-6 shadow-sm backdrop-blur-sm"
      >
        <div className="mb-3 text-sm font-medium text-zinc-900">
          Ocurrió un error al renderizar este bloque.
        </div>
        <pre className="mb-4 max-h-40 overflow-auto rounded-lg bg-zinc-50 p-3 text-xs text-zinc-600">
          {error.message}
        </pre>
        <button
          type="button"
          onClick={this.handleReset}
          className="inline-flex items-center gap-2 rounded-xl border border-zinc-300 c-700 px-4 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        >
          Reintentar
        </button>
      </div>
    );
  }

  public render(): ReactNode {
    if (this.state.hasError && this.state.error) {
      const { fallback, fallbackRender } = this.props;

      if (typeof fallbackRender === "function") {
        return fallbackRender({
          error: this.state.error,
          reset: this.handleReset,
        });
      }

      if (fallback != null) {
        return fallback;
      }

      return this.renderDefaultFallback(this.state.error);
    }

    return <Fragment key={this.state.resetKey}>{this.props.children}</Fragment>;
  }
}

/** Claves que no deben elevarse al contenedor HOC */
const REACT_STATICS = new Set<string>([
  "childContextTypes",
  "contextType",
  "contextTypes",
  "defaultProps",
  "displayName",
  "getDefaultProps",
  "getDerivedStateFromError",
  "getDerivedStateFromProps",
  "mixins",
  "propTypes",
  "type",
  "name",
  "length",
  "prototype",
]);

function hoistNonReactStatics<
  T extends ComponentType<any>,
  S extends ComponentType<any>
>(target: T, source: S): T {
  Object.getOwnPropertyNames(source).forEach((key) => {
    if (!REACT_STATICS.has(key)) {
      try {
        Object.defineProperty(
          target,
          key,
          Object.getOwnPropertyDescriptor(source, key)!
        );
      } catch {}
    }
  });
  return target;
}

/**
 * HOC para envolver widgets o pantallas críticas con un límite de error.
 * @param Wrapped - Componente para proteger con el límite.
 * @param options - Configuración para la representación alternativa y los efectos secundarios.
 * @returns Un componente que representa `Wrapped` dentro de `ErrorBoundary`.
 */
export function withErrorBoundary<P>(
  Wrapped: ComponentType<P>,
  options: ErrorBoundaryOptions = {}
): ComponentType<P> {
  const WrappedWithBoundary: ComponentType<P> = (props: P) => {
    const { fallback, fallbackRender, onError, onReset } = options;

    return (
      <ErrorBoundary
        fallback={fallback}
        fallbackRender={fallbackRender}
        onError={onError}
        onReset={onReset}
      >
        <Wrapped {...props} />
      </ErrorBoundary>
    );
  };

  const wrappedName = Wrapped.displayName || Wrapped.name || "Component";
  WrappedWithBoundary.displayName = `withErrorBoundary(${wrappedName})`;

  return hoistNonReactStatics(WrappedWithBoundary, Wrapped);
}

export default withErrorBoundary;
