import {
  useDispatch,
  useSelector,
  type TypedUseSelectorHook,
  shallowEqual,
} from "react-redux";
import type { AppDispatch, RootState } from "@app/store/store";

/**
 * Hook tipado para despachar acciones de Redux.
 */
export const useAppDispatch: () => AppDispatch = useDispatch;

/**
 * Hook tipado para seleccionar estado desde el store.
 */
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

/**
 * Útil cuando el selector devuelve objetos/arrays pequeños y queremos evitar renders innecesarios.
 * @param selector Función que extrae una porción del estado.
 * @returns Valor seleccionado, comparado superficialmente.
 */
export function useShallowSelector<T>(selector: (state: RootState) => T): T {
  return useSelector(selector, shallowEqual);
}
