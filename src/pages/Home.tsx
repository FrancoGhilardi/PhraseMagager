import React, { useEffect } from "react";
import InputsSection from "@widgets/inputs/InputsSection";
import PhrasesGrid from "@widgets/phrases/PhrasesGrid";
import { usePhrasesFacade } from "@features/phrases/usecases/usePhrasesFacade";

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
  console.log({ flags });
  return (
    <main role="main" aria-label="Contenido principal">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <InputsSection
          onSearchChange={updateQuery}
          searchValue={query}
          addAutoFocus={false}
          searchAutoFocus={false}
          className="mb-4 md:mb-6"
        />

        <PhrasesGrid
          items={filteredItems}
          isFiltered={isFiltered}
          onDelete={removeById}
          loading={flags.isLoading || !flags.isLoaded}
          isError={flags.isError}
          error={error}
          onDismiss={dismissError}
          onRetry={load}
        />
      </div>
    </main>
  );
};

export default Home;
