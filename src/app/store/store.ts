import { configureStore } from "@reduxjs/toolkit";
import {
  attachPhrasesPersistence,
  loadPhrasesFromStorage,
} from "./persistence/phrasesPersistence";
import type { PhrasesState } from "./slices/phrasesSlice";
import phrasesReducer from "./slices/phrasesSlice";
/**
 * Crea el store principal de la aplicación.
 * - Rehidrata `phrases.items` desde `localStorage`.
 * - Adjunta persistencia sin acoplar al slice.
 */
const preloadedState: { phrases: PhrasesState } = {
  phrases: {
    items: loadPhrasesFromStorage(),
    query: "",
    status: "idle",
    error: undefined,
  },
};

export const store = configureStore({
  reducer: {
    phrases: phrasesReducer,
  },
  preloadedState,
});

// Conecta persistencia local una vez inicializado el store.
attachPhrasesPersistence(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
