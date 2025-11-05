import {
  addPhraseLocal,
  clearError,
  deletePhraseLocal,
  fetchPhrases,
  selectAllItems,
  selectCounts,
  selectFilteredItems,
  selectIsFiltered,
  selectPhrasesState,
  selectQuery,
  setQuery,
} from "@app/store/slices/phrasesSlice";
import type { Phrase } from "@entities/phrases/model/Phrases";
import { useAppDispatch, useAppSelector } from "@shared/lib/redux/hooks";
import { useCallback, useEffect, useMemo, useRef } from "react";

/**
 * casos de uso para "phrases".
 */
export function usePhrasesFacade() {
  const dispatch = useAppDispatch();

  const { status, error } = useAppSelector(selectPhrasesState);
  const query = useAppSelector(selectQuery);
  const items = useAppSelector(selectAllItems);
  const filteredItems = useAppSelector(selectFilteredItems);
  const isFiltered = useAppSelector(selectIsFiltered);
  const counts = useAppSelector(selectCounts);

  // Mantiene referencia al último fetch para poder cancelarlo.
  const lastFetchRef = useRef<ReturnType<typeof dispatch> | null>(null);

  /**
   * Carga frases.
   */
  const load = useCallback(() => {
    // Cancelamos el fetch previo si sigue activo.
    const prev = lastFetchRef.current as any;
    if (prev?.abort) prev.abort();

    const promise = dispatch(fetchPhrases());
    lastFetchRef.current = promise as any;
  }, [dispatch]);

  /**
   * Cancela la petición en curso.
   */
  const cancelLoad = useCallback(() => {
    const prev = lastFetchRef.current as any;
    if (!prev?.abort) return;
    prev.abort();
  }, []);

  // Abort automático al desmontar el hook.
  useEffect(() => cancelLoad, [cancelLoad]);

  /**
   * - Evita loops usando una marca local.
   * - Solo dispara si el estado está `idle` (estado inicial típico).
   */
  const didInitRef = useRef<boolean>(false);
  useEffect(() => {
    if (didInitRef.current) return;
    didInitRef.current = true;
    if (status === "idle") {
      load();
    }
  }, [status, load]);

  /**
   * Actualiza el término de búsqueda..
   * @param value Nuevo valor de la consulta.
   */
  const updateQuery = useCallback(
    (value: string) => {
      if (value === query) return;
      dispatch(setQuery(value));
    },
    [dispatch, query]
  );

  /**
   * Resetea el término de búsqueda a vacío.
   */
  const resetQuery = useCallback(() => {
    if (!query) return;
    dispatch(setQuery(""));
  }, [dispatch, query]);

  /**
   * Agrega una nueva frase localmente.
   * Genera un `id` numérico incremental y `createdAt = Date.now()`.
   * @param text Contenido de la nueva frase.
   * @returns La `Phrase` creada o `null` si `text` es inválido.
   */
  const addPhrase = useCallback(
    (text: string): Phrase | null => {
      const t = String(text ?? "").trim();
      if (!t) return null;

      const id = nextIdFrom(items);
      const phrase: Phrase = { id, text: t, createdAt: Date.now() };
      dispatch(addPhraseLocal(phrase));
      return phrase;
    },
    [dispatch, items]
  );

  /**
   * Elimina una frase por `id` localmente.
   * @param id Identificador de la frase a eliminar.
   */
  const removeById = useCallback(
    (id: string) => {
      const clean = String(id ?? "").trim();
      if (!clean) return;
      dispatch(deletePhraseLocal(clean));
    },
    [dispatch]
  );

  /**
   * Limpia el error actual.
   */
  const dismissError = useCallback(() => {
    if (!error) return;
    dispatch(clearError());
  }, [dispatch, error]);

  const flags = useMemo(
    () => ({
      isLoading: status === "pending",
      isLoaded: status === "succeeded",
      isIdle: status === "idle",
      isError: status === "failed",
    }),
    [status]
  );

  return {
    items,
    filteredItems,
    counts,
    query,
    isFiltered,
    status,
    error,
    flags,
    load,
    cancelLoad,
    updateQuery,
    resetQuery,
    addPhrase,
    removeById,
    dismissError,
  };
}

/**
 * Calcula el próximo `id` local en formato string numérico.
 * Busca el máximo `Number(id)` entre los items válidos y suma 1.
 * Si no hay IDs numéricos, comienza en "1".
 * @param items Lista actual de frases.
 * @returns Nuevo `id` incremental como string.
 */
function nextIdFrom(items: Phrase[]): string {
  if (!Array.isArray(items) || items.length === 0) return "1";
  let max = 0;
  for (const it of items) {
    const n = Number(it?.id);
    if (Number.isFinite(n) && n > max) max = n;
  }
  const next = max + 1;
  return String(next > 0 ? next : 1);
}
