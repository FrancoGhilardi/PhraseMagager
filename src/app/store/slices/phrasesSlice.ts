import {
  createAsyncThunk,
  createSelector,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import {
  compareByCreatedAtDesc,
  type Phrase,
} from "@entities/phrases/model/Phrases";
import { phraseHttpApi } from "@entities/phrases/api/phraseHttp";

export type PhrasesState = {
  items: Phrase[];
  query: string;
  status: "idle" | "pending" | "succeeded" | "failed";
  error?: string;
};

export type WithPhrasesSlice = {
  phrases: PhrasesState;
};

const initialState: PhrasesState = {
  items: [],
  query: "",
  status: "idle",
  error: undefined,
};

/**
 * Obtiene frases desde la API remota.
 * Usa `thunkAPI.signal` para soportar cancelación.
 */
export const fetchPhrases = createAsyncThunk<
  Phrase[],
  void,
  { rejectValue: string }
>("phrases/fetchPhrases", async (_: void, thunkAPI) => {
  try {
    const items = await phraseHttpApi.list({ signal: thunkAPI.signal });
    return items;
  } catch (err: any) {
    if (err?.name === "AbortError") {
      return thunkAPI.rejectWithValue("Operación cancelada.");
    }
    const message =
      (typeof err?.message === "string" && err.message) ||
      "No se pudo cargar el listado de frases.";
    return thunkAPI.rejectWithValue(message);
  }
});

/**
 * Utilidad interna: normaliza cadenas para búsqueda:
 * - trim
 * - toLowerCase
 * - remoción de acentos/diacríticos
 * @param s Cadena de entrada.
 * @returns Cadena normalizada.
 */
function norm(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

const phrasesSlice = createSlice({
  name: "phrases",
  initialState,
  reducers: {
    /**
     * Setea el término de búsqueda.
     * Mantiene el string sin normalizar para mostrar al usuario.
     */
    setQuery(state, action: PayloadAction<string>) {
      state.query = action.payload;
    },

    /**
     * Agrega una frase localmente.
     * Si ya existe una con el mismo `id`, se omite.
     * Se mantiene el orden por `createdAt` desc.
     */
    addPhraseLocal(state, action: PayloadAction<Phrase>) {
      const phrase = action.payload;
      if (!phrase?.id) return;

      const exists = state.items.some((p) => p.id === phrase.id);
      if (exists) return;

      state.items.push(phrase);
      state.items.sort(compareByCreatedAtDesc);
    },

    /**
     * Elimina una frase por `id` localmente.
     * Si el `id` no existe, no hace nada.
     */
    deletePhraseLocal(state, action: PayloadAction<string>) {
      const id = action.payload?.trim();
      if (!id) return;

      const prevLen = state.items.length;
      state.items = state.items.filter((p) => p.id !== id);

      if (state.items.length === prevLen) return;
    },

    /**
     * Reemplaza completamente la colección local.
     */
    setAllLocal(state, action: PayloadAction<Phrase[]>) {
      const incoming = Array.isArray(action.payload)
        ? action.payload.slice()
        : [];
      if (incoming.length === 0) {
        state.items = [];
        return;
      }
      incoming.sort(compareByCreatedAtDesc);
      state.items = incoming;
    },

    /**
     * Limpia errores transitorios.
     */
    clearError(state) {
      state.error = undefined;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPhrases.pending, (state) => {
        state.status = "pending";
        state.error = undefined;
      })
      .addCase(fetchPhrases.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.error = undefined;
        state.items = action.payload;
      })
      .addCase(fetchPhrases.rejected, (state, action) => {
        state.status = "failed";
        state.error =
          action.payload || "No se pudo cargar el listado de frases.";
      });
  },
});

export const {
  setQuery,
  addPhraseLocal,
  deletePhraseLocal,
  setAllLocal,
  clearError,
} = phrasesSlice.actions;

export default phrasesSlice.reducer;

/**
 * Selector base del slice.
 * @param state Raíz que contiene `phrases`.
 * @returns Subestado `PhrasesState`.
 */
export const selectPhrasesState = (state: WithPhrasesSlice) => state.phrases;

/**
 * Devuelve el término de búsqueda actual.
 */
export const selectQuery = createSelector(selectPhrasesState, (s) => s.query);

/**
 * Devuelve la lista completa de items del store.
 */
export const selectAllItems = createSelector(
  selectPhrasesState,
  (s) => s.items
);

/**
 * Indica si hay búsqueda activa.
 */
export const selectIsFiltered = createSelector(
  selectQuery,
  (q) => norm(q).length > 0
);

/**
 * Items filtrados en vivo por `query`.
 */
export const selectFilteredItems = createSelector(
  [selectAllItems, selectQuery],
  (items, query) => {
    const q = norm(query);
    if (q.length === 0) return items;

    return items.filter((p) => norm(p.text).includes(q));
  }
);

export const selectCounts = createSelector(
  [selectAllItems, selectFilteredItems],
  (all, filtered) => ({
    total: all.length,
    filtered: filtered.length,
  })
);
