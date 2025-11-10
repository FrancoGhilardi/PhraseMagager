import React, { useEffect } from "react";
import { usePhrasesFacade } from "@features/phrases/usecases/usePhrasesFacade";
import PhrasesGridWithBoundary from "@widgets/phrases/PhrasesGrid.boundary";
import InputsSectionWithBoundary from "@widgets/inputs/InputSection.boundary";

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
    if (flags.isIdle) {
      load();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flags.isIdle]);
  return (
    <main role="main" aria-label="Contenido principal">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <InputsSectionWithBoundary
          onSearchChange={updateQuery}
          searchValue={query}
          searchDebounceMs={300}
          addAutoFocus={false}
          searchAutoFocus={false}
          className="mb-4 md:mb-6"
        />

        <PhrasesGridWithBoundary
          items={filteredItems}
          isFiltered={isFiltered}
          onDelete={removeById}
          loading={flags.isLoading || !flags.isLoaded}
          isError={flags.isError}
          error={error ?? ""}
          onDismiss={dismissError}
          onRetry={load}
        />
      </div>
    </main>
  );
};

export default Home;
