import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export type UseDebouncedValueOptions = {
  delay?: number;
  maxWait?: number;
  enabled?: boolean;
};

/**
 * Hook para crear una versión debounced de un valor.
 * @template T Tipo del valor de entrada.
 * @param value Valor de entrada a debounciar.
 * @param options Opciones del debounce o número (delay directo).
 * @returns Objeto con `{ value, isDebouncing, flush, cancel }`.
 */
export function useDebouncedValue<T>(
  value: T,
  options?: number | UseDebouncedValueOptions
): {
  value: T;
  isDebouncing: boolean;
  flush: () => void;
  cancel: () => void;
} {
  const delay =
    typeof options === "number" ? options : Math.max(0, options?.delay ?? 300);
  const maxWait =
    typeof options === "number" ? undefined : options?.maxWait ?? undefined;
  const enabled = typeof options === "number" ? true : options?.enabled ?? true;

  const [debounced, setDebounced] = useState<T>(value);
  const [isDebouncing, setIsDebouncing] = useState<boolean>(false);

  const timeoutRef = useRef<number | null>(null);
  const maxTimeoutRef = useRef<number | null>(null);
  const latestRef = useRef<T>(value);

  // Mantener referencia al último valor recibido
  useEffect(() => {
    latestRef.current = value;
  }, [value]);

  const clearTimer = (ref: React.MutableRefObject<number | null>) => {
    if (ref.current != null) {
      window.clearTimeout(ref.current);
      ref.current = null;
    }
  };

  const cancel = useCallback(() => {
    clearTimer(timeoutRef);
    clearTimer(maxTimeoutRef);
    setIsDebouncing(false);
  }, []);

  const flush = useCallback(() => {
    setDebounced(latestRef.current);
    cancel();
  }, [cancel]);

  useEffect(() => {
    if (!enabled || delay <= 0) {
      setDebounced(value);
      setIsDebouncing(false);
      cancel();
      return;
    }
    // Solo aplicar debounce cuando el valor cambia respecto del último `debounced`.
    const hasChanged = !Object.is(value, debounced);
    if (!hasChanged) {
      cancel();
      return;
    }
    setIsDebouncing(true);

    clearTimer(timeoutRef);
    timeoutRef.current = window.setTimeout(() => {
      setDebounced(latestRef.current);
      setIsDebouncing(false);
      clearTimer(timeoutRef);
      clearTimer(maxTimeoutRef);
    }, delay);

    if (typeof maxWait === "number" && maxWait > 0 && !maxTimeoutRef.current) {
      maxTimeoutRef.current = window.setTimeout(() => {
        flush();
      }, maxWait);
    }

    return () => {
      clearTimer(timeoutRef);
    };
  }, [value, delay, enabled, maxWait, debounced, cancel, flush]);

  return useMemo(
    () => ({ value: debounced, isDebouncing, flush, cancel }),
    [debounced, isDebouncing, flush, cancel]
  );
}
