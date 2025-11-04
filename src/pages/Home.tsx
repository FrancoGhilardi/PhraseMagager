import React, { useEffect } from "react";
import InputsSection from "@widgets/inputs/InputsSection";
import PhrasesGrid from "@widgets/phrases/PhrasesGrid";
import { usePhrasesFacade } from "@features/phrases/usecases/usePhrasesFacade";
import Loading from "@shared/ui/Loading";
import RetryError from "@shared/ui/RetryError";

export const Home: React.FC = () => {
  const {
    filteredItems,
    isFiltered,
    query,
    error,
    flags,
    load,
    updateQuery,
    removeById,
    dismissError,
  } = usePhrasesFacade();

  useEffect(() => {
    if (flags.isIdle) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flags.isIdle]);

  return (
    <main role="main" aria-label="Contenido principal">
      <div className="container mx-auto max-w-5xl px-4 py-6 md:py-8">
        <InputsSection
          onSearchChange={updateQuery}
          searchValue={query}
          addAutoFocus={false}
          searchAutoFocus={false}
          className="mb-4 md:mb-6"
        />
        {flags.isLoading && <Loading text="Cargando frases…" />}

        {flags.isError && error && (
          <RetryError message={error} onDismiss={dismissError} onRetry={load} />
        )}

        <PhrasesGrid
          items={filteredItems}
          isFiltered={isFiltered}
          onDelete={removeById}
        />
      </div>
    </main>
  );
};

export default Home;
