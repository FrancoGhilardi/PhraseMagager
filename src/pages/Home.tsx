import React, { useMemo, useState } from "react";
import InputsSection from "@widgets/inputs/InputsSection";
import PhrasesGrid, {
  type PhrasesGridItem,
} from "@widgets/phrases/PhrasesGrid";

/**
 * Datos de ejemplo para la maquetación.
 */
const INITIAL_ITEMS: PhrasesGridItem[] = [
  {
    id: "1",
    text: "La práctica hace al maestro.",
    createdAt: Date.now() - 60 * 60 * 1000,
  },
  {
    id: "2",
    text: "Más vale tarde que nunca.",
    createdAt: Date.now() - 24 * 60 * 60 * 1000,
  },
  {
    id: "3",
    text: "El que no arriesga, no gana.",
    createdAt: Date.now() - 2 * 24 * 60 * 60 * 1000,
  },
  {
    id: "4",
    text: "A mal tiempo, buena cara.",
    createdAt: Date.now() - 30 * 60 * 1000,
  },
  {
    id: "5",
    text: "No dejes para mañana lo que puedes hacer hoy.",
    createdAt: Date.now() - 5 * 60 * 1000,
  },
];

export const Home: React.FC = () => {
  const [search, setSearch] = useState<string>("");

  // Filtrado básico solo para visualizar el estado "no results".
  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return INITIAL_ITEMS;
    return INITIAL_ITEMS.filter((it) => it.text.toLowerCase().includes(q));
  }, [search]);

  return (
    <main role="main" aria-label="Contenido principal">
      <div className="container mx-auto max-w-5xl px-4 py-6 md:py-8">
        {/* Controles principales (Add + Search) */}
        <InputsSection
          onSearchChange={setSearch}
          searchValue={search}
          addAutoFocus={false}
          searchAutoFocus={false}
          className="mb-4 md:mb-6"
        />

        <PhrasesGrid
          items={filteredItems}
          isFiltered={search.trim().length > 0}
          className=""
        />
      </div>
    </main>
  );
};

export default Home;
