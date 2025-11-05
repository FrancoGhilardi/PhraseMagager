# PhraseManager — Gestor de frases (React + TypeScript + Vite)

Aplicación **SPA** para **agregar**, **buscar/filtrar** y **eliminar** frases. Construida con **React 19**, **TypeScript estricto**, **Vite 7** y **TailwindCSS 4**. El estado global se maneja con **Redux Toolkit**. Incluye tests con **Vitest** y **Testing Library**.

---

## Tabla de contenido

- [Arquitectura y estructura](#arquitectura-y-estructura)
- [Librerías utilizadas y por qué](#librerías-utilizadas-y-por-qué)
- [Instalación y requisitos](#instalación-y-requisitos)
- [Variables de entorno / Configuración](#variables-de-entorno--configuración)
- [Estado global, rendimiento y persistencia](#estado-global-rendimiento-y-persistencia)
- [Accesibilidad y UX](#accesibilidad-y-ux)
- [Tests](#tests)
- [Scripts disponibles](#scripts-disponibles)
- [Escalabilidad](#escalabilidad)
- [Posibles mejoras](#posibles-mejoras)

---

## Arquitectura y estructura

El proyecto aplica **Clean Architecture** con un poco de **Feature-Sliced**. Se separan el **dominio** (tipos y lógica pura), los **casos de uso**, la **capa de aplicación/estado** (Redux), y la **UI** (features/widgets/shared).

```
src/
  app/
    layouts/
      RootLayout.tsx
    providers/
      AppProviders.tsx
    store/
      store.ts
      slices/
        phrasesSlice.ts
      persistence/
        phrasesPersistence.ts
  entities/
    phrases/
      model/
        Phrases.ts
      lib/
        mappers.ts
      api/
        phraseApi.ts
        phraseHttp.ts
  features/
    add-phrase/
      ui/
        AddPhraseForm.tsx
    search-phrases/
      ui/
        SearchInput.tsx
    phrases/
      usecases/
        usePhrasesFacade.ts
  widgets/
    app-header/
      ui/
        AppHeader.tsx
    inputs/
      InputsSection.tsx
    phrases/
      PhrasesGrid.tsx
      utils/
        utils.ts
  pages/
    Home.tsx
  shared/
    config/
      env.ts
    lib/
      redux/
        hooks.ts
      http/
        axios.ts
      hooks/
        useDebouncedVaule.ts
      cx.ts
    ui/
      Card.tsx
      Input.tsx
      EmptyState.tsx
      Loading.tsx
      RetryError.tsx
      icons/
        *.tsx
  assets/
    react.svg
  App.tsx
  main.tsx
  index.css
```

**Puntos clave**

- **Dominio aislado:** `entities/phrases/model` define `Phrase` y validaciones (`isPhrase`, `ensurePhrase`) más comparadores de orden.
- **Capa de datos:** `entities/phrases/api` separa **puerto** (`PhraseApi`) de su **adaptador HTTP** (`PhraseHttp`) y **mappers** DTO→dominio.
- **Estado global:** slice `phrases` centraliza `items`, `query`, `status`, `error` y el thunk `fetchPhrases`.
- **Fachada:** `usePhrasesFacade` orquesta acciones/seletores y expone una API simple a la UI.
- **Presentación:** `features` (inputs, forms) + `widgets` (grilla, header) + `shared/ui` (átomos Tailwind).
- **Aliases:** `@app`, `@entities`, `@features`, `@widgets`, `@pages`, `@shared` (ver `vite.config.ts`).

---

## Librerías utilizadas y por qué

- **React** `^19.1.1` — UI declarativa y ecosistema maduro.
- **React DOM** `^19.1.1` — Renderizado en el navegador.
- **Redux Toolkit** `^2.10.1` — Estado global predecible con slices, thunks y createSelector.
- **React Redux** `^9.2.0` — Bindings performantes entre React y Redux.
- **Axios** `^1.13.1` — Cliente HTTP configurable; interceptores y tipado.
- **Vite** `^7.1.7` — Dev server veloz y build eficiente.
- **TailwindCSS** `^4.1.16` — Estilos utilitarios consistentes; DX rápida.
- **@tailwindcss/vite** `^4.1.16` — Integración nativa de Tailwind v4 con Vite.
- **@vitejs/plugin-react-swc** `^4.2.0` — Transformaciones SWC y Fast Refresh.
- **TypeScript** `~5.9.3` — Tipado estricto y contratos claros.
- **ESLint** `^9.36.0` — Calidad de código; reglas modernas (flat config).
- **Vitest** `^3.2.4` — Runner rápido compatible con Vite.
- **Testing Library** `^16.3.0` — Tests centrados en el usuario.
- **Jest DOM** `^6.9.1` — Matchers a nivel DOM.
- **jsdom** `^27.0.1` — Entorno DOM para pruebas.

---

## Instalación y requisitos

**Pre-requisitos**

- **Node.js ≥ 20** (LTS recomendado)
- Gestor de paquetes: `npm` (o `pnpm`/`yarn`)

**Instalación**

```bash
# 1) Instalar dependencias
npm install

# 2) Entorno de desarrollo
npm run dev

# 3) Build de producción
npm run build

# 4) Previsualización del build
npm run preview
```

---

## Variables de entorno / Configuración

La base de la API se resuelve en `src/shared/config/env.ts` siguiendo este orden:

1. `import.meta.env.VITE_BASE_URL`
2. Variable global de runtime (si existiera)
3. `localStorage["app.apiBaseUrl"]`

Si ninguna está disponible, se lanza un error descriptivo.  
Configuralo en un `.env.local`:

```bash
VITE_BASE_URL=''
```

El adaptador `PhraseHttp` consulta `GET /data` sobre esa base y espera un objeto:

```json
{ "phrases": [{ "id": "1", "text": "…", "createdAt": 1730845200000 }] }
```

---

## Estado global, rendimiento y persistencia

- **Slice `phrases`**

  - Estado: `items: Phrase[]`, `query: string`, `status: "idle" | "pending" | "succeeded" | "failed"`, `error?: string`.
  - Acciones: `setQuery`, `addPhraseLocal`, `deletePhraseLocal`, `setAllLocal`, `clearError`.
  - Selectores memoizados (`createSelector`): `selectAllItems`, `selectFilteredItems`, `selectIsFiltered`, `selectCounts`, `selectQuery`.
  - `fetchPhrases` usa `thunkAPI.signal` para **cancelación** segura.

- **Fachada `usePhrasesFacade`**

  - API: `load()`, `cancelLoad()`, `addPhrase(text)`, `removeById(id)`, `updateQuery(q)`, `resetQuery()`, `dismissError()`.
  - **IDs secuenciales** string (`"1"`, `"2"`, …) calculados desde el máximo actual.
  - Abort automático al desmontar para evitar _race conditions_.

- **Persistencia ligera**

  - Rehidratación/guardado en `localStorage` con validación de dominio.

- **Rendimiento UI**
  - Búsqueda **debounced** (`useDebouncedVaule.ts` — contiene una errata en el nombre del archivo) con `300ms` por defecto.
  - Selectores memoizados y componentes pequeños; claves estables en listas.

---

## Accesibilidad y UX

- Inputs con `aria-label` y foco visible.
- Grilla con `role="grid"`, estados de _loading_, _error_, _empty_ y _no results_.
- Botones con etiquetas accesibles y feedback inmediato (limpieza de input tras agregar).

---

## Tests

Runner: **Vitest** (`jsdom`) + **Testing Library**. Setup en `tests/setup/setupTests.ts`.

**Cobertura**

- Umbrales en `vitest.config.ts`:
  - **Statements:** 70%
  - **Branches:** 70%
  - **Functions:** 70%
  - **Lines:** 70%

**Áreas cubiertas**

- **Dominio:** guards y comparadores (`entities/phrases/model/Phrases.test.ts`).
- **Mappers:** DTO → dominio (`entities/phrases/lib/mappers.test.ts`).
- **HTTP:** cliente Axios e integración (`shared/lib/http/axios.test.ts`).
- **Config:** resolución de `ENV` (`shared/config/env.test.ts`).
- **Store:** reducers, selectores, flujos async (`app/store/slices/phrasesSlice.test.ts`).
- **Persistencia:** carga/guardado en localStorage (`app/store/persistence/phrasesPersistence.test.ts`).
- **Hooks:** debounce (`shared/lib/hooks/useDebouncedValue.test.tsx`).
- **Fachada:** orquestación de casos de uso (`features/phrases/usecases/usePhrasesFacade.test.tsx`).
- **UI:** componentes y widgets principales (`features/*`, `widgets/*`, `pages/Home.test.tsx`).

**Comandos**

```bash
npm run test         # pruebas en modo CI
npm run test:watch   # modo interactivo
npm run coverage     # reporte de cobertura
```

---

## Scripts disponibles

```json
{
  "dev": "vite",
  "build": "tsc -b && vite build",
  "lint": "eslint .",
  "preview": "vite preview",
  "vitest": "vitest",
  "test": "vitest run",
  "coverage": "vitest run --coverage",
  "test:watch": "vitest"
}
```

---

## Escalabilidad

- Nuevas **entidades** en `entities/<entidad>` con `model/lib/api`.
- Nuevas **capacidades** como `features/<feature>` y su `usecases`.
- **Widgets** para componer vistas coherentes y reutilizables.
- **Datos**: el puerto `PhraseApi` permite cambiar el adaptador (HTTP, IndexedDB, etc.).
- **Rendimiento**: memoización, debounce y posibilidad de virtualizar la grilla.

---

## Posibles mejoras

1. **Refactor menor**

   - Centralizar constantes (claves de storage, rutas base) en `shared/config`.

2. **Experiencia de datos**

   - Agregar **edición** y ordenamiento configurable (por fecha/texto).

3. **Rendimiento UI**

   - Virtualización con **react-window** si la colección crece mucho.

4. **Robustez**

   - Retries/Backoff en `phraseHttp` y métricas básicas.

5. **DX/Calidad**
   - **Husky** + **lint-staged** en pre-commit.
   - **CI** (GitHub Actions) con typecheck, lint y cobertura mínima.

---

### Tipos principales

```ts
type Phrase = {
  id: string;
  text: string;
  createdAt: number;
};

type GetPhrasesResponseDto = {
  phrases: Array<{ id: string; text: string; createdAt: number | string }>;
};
```

---
