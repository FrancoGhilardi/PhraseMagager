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
  error?: string | null;
};

export type WithPhrasesSlice = {
  phrases: PhrasesState;
};

const initialState: PhrasesState = {
  items: [],
  query: "",
  status: "idle",
  error: null,
};

const MIN_QUERY_LENGTH = 2;

/**
 * Elimina solo los acentos. Mantiene las mayúsculas y minúsculas para que RegExp /i lo gestione.
 */
function stripDiacritics(text: string): string {
  return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

/**
 * Recortar y colapsar los espacios en blanco internos
 */
function sanitizeQuery(raw: string): string {
  return raw.replace(/\s+/g, " ").trim();
}

/**
 * Escapa una cadena para que se utilice como literal seguro dentro de una expresión regular.
 */
function escapeRegExp(literal: string): string {
  return literal.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

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

      const exists = state.items.some((item) => item.id === phrase.id);
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
      state.items = state.items.filter((item) => item.id !== id);

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
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPhrases.pending, (state) => {
        state.status = "pending";
        state.error = null;
      })
      .addCase(fetchPhrases.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.error = null;
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
export const selectQuery = createSelector(
  selectPhrasesState,
  (select) => select.query
);

/**
 * Devuelve todos los items ordenados por `createdAt` desc.
 */
export const selectAllItems = createSelector(selectPhrasesState, (select) => {
  if (select.items.length <= 1) return select.items;
  return [...select.items].sort(compareByCreatedAtDesc);
});

/**
 * Indica si hay búsqueda activa.
 */
export const selectIsFiltered = createSelector(selectQuery, (query) => {
  const sanitized = sanitizeQuery(query);
  return sanitized.length >= MIN_QUERY_LENGTH;
});

/**
 * Items filtrados por `query`, con:
 * - sanitización
 * - minLength
 * - RegExp escapada y memoizada en el selector
 * - comparación case-insensitive y sin acentos
 */
export const selectFilteredItems = createSelector(
  [selectAllItems, selectQuery],
  (items, query) => {
    const sanitized = sanitizeQuery(query);
    if (sanitized.length < MIN_QUERY_LENGTH) return items;
    const safeLiteral = escapeRegExp(stripDiacritics(sanitized));
    const pattern = new RegExp(safeLiteral, "i");
    return items.filter((p) => pattern.test(stripDiacritics(p.text)));
  }
);

export const selectCounts = createSelector(
  [selectAllItems, selectFilteredItems],
  (all, filtered) => ({
    total: all.length,
    filtered: filtered.length,
  })
);
