import React, {
  createRef,
  forwardRef,
  useImperativeHandle,
  useState,
  type Ref,
} from "react";
import { act, render } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  useDebouncedValue,
  type UseDebouncedValueOptions,
} from "@shared/lib/hooks/useDebouncedVaule";

type HarnessRef = {
  set: (v: string) => void;
  get: () => { value: string; isDebouncing: boolean };
  flush: () => void;
  cancel: () => void;
};

type HarnessProps = {
  initial?: string;
  options?: number | UseDebouncedValueOptions;
};

/**
 * Componente de prueba que encapsula el hook
 */
const Harness = forwardRef(function Harness(
  { initial = "a", options = { delay: 300 } }: HarnessProps,
  ref: Ref<HarnessRef>
) {
  const [raw, setRaw] = useState(initial);
  const { value, isDebouncing, flush, cancel } = useDebouncedValue(
    raw,
    options
  );

  useImperativeHandle(ref, () => ({
    set: setRaw,
    get: () => ({ value, isDebouncing }),
    flush,
    cancel,
  }));

  return (
    <div>
      <output data-testid="value">{value}</output>
      <output data-testid="debouncing">{String(isDebouncing)}</output>
    </div>
  );
});

describe("useDebouncedValue", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it("debe mantener el valor anterior hasta cumplir el delay, luego entregar el nuevo", () => {
    const ref = createRef<HarnessRef>();
    render(<Harness ref={ref} options={{ delay: 300 }} />);

    // Estado inicial
    expect(ref.current!.get()).toEqual({ value: "a", isDebouncing: false });

    // Cambio de valor, inicia debounce
    act(() => {
      ref.current!.set("b");
    });
    expect(ref.current!.get()).toEqual({ value: "a", isDebouncing: true });

    // Aún no se cumplió el delay
    act(() => {
      vi.advanceTimersByTime(299);
    });
    expect(ref.current!.get()).toEqual({ value: "a", isDebouncing: true });

    // Se cumple el delay, se actualiza
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(ref.current!.get()).toEqual({ value: "b", isDebouncing: false });
  });

  it("flush(): debe entregar inmediatamente el último valor y detener el debounce", () => {
    const ref = createRef<HarnessRef>();
    render(<Harness ref={ref} options={{ delay: 300 }} />);

    act(() => {
      ref.current!.set("b");
      vi.advanceTimersByTime(100);
      ref.current!.set("c");
      vi.advanceTimersByTime(50);
    });
    // Aún debouncing con valor previo
    expect(ref.current!.get()).toEqual({ value: "a", isDebouncing: true });

    // Forzamos entrega inmediata
    act(() => {
      ref.current!.flush();
    });
    expect(ref.current!.get()).toEqual({ value: "c", isDebouncing: false });

    // No debe haber actualizaciones posteriores
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(ref.current!.get()).toEqual({ value: "c", isDebouncing: false });
  });

  it("cancel(): debe cancelar timers y mantener el valor debounced sin actualizar", () => {
    const ref = React.createRef<HarnessRef>();
    render(<Harness ref={ref} options={{ delay: 300 }} />);

    act(() => {
      ref.current!.set("b");
      vi.advanceTimersByTime(150);
    });
    // Aún sin actualizar
    expect(ref.current!.get()).toEqual({ value: "a", isDebouncing: true });

    // Cancelamos, el valor no debe cambiar
    act(() => {
      ref.current!.cancel();
    });
    expect(ref.current!.get()).toEqual({ value: "a", isDebouncing: false });

    // Avances de tiempo no deberían aplicar cambios
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(ref.current!.get()).toEqual({ value: "a", isDebouncing: false });
  });

  it("maxWait: debe entregar el último valor aunque se siga tipeando antes de 'delay'", () => {
    const ref = React.createRef<HarnessRef>();
    render(<Harness ref={ref} options={{ delay: 200, maxWait: 500 }} />);

    act(() => {
      ref.current!.set("b");
      vi.advanceTimersByTime(150);
      ref.current!.set("c");
      vi.advanceTimersByTime(150);
      ref.current!.set("d");
    });

    act(() => {
      vi.advanceTimersByTime(200);
      vi.runOnlyPendingTimers();
    });

    expect(ref.current!.get()).toEqual({ value: "d", isDebouncing: false });
  });

  it("enabled=false: debe comportarse sin debounce", () => {
    const ref = React.createRef<HarnessRef>();
    render(<Harness ref={ref} options={{ delay: 300, enabled: false }} />);

    // Cambio debería reflejarse inmediato
    act(() => {
      ref.current!.set("b");
    });
    expect(ref.current!.get()).toEqual({ value: "b", isDebouncing: false });

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(ref.current!.get()).toEqual({ value: "b", isDebouncing: false });
  });

  it("delay <= 0: debe actualizar inmediatamente y no entrar en debouncing", () => {
    const ref = React.createRef<HarnessRef>();
    render(<Harness ref={ref} options={0} />);

    act(() => {
      ref.current!.set("z");
    });
    expect(ref.current!.get()).toEqual({ value: "z", isDebouncing: false });
  });
});
