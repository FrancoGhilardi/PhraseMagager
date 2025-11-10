import React from "react";
import AddPhraseForm from "@features/add-phrase/ui/AddPhraseForm";
import SearchInput from "@features/search-phrases/ui/SearchInput";
import { cx } from "@shared/lib/cx";

export type InputsSectionProps = {
  className?: string;
  searchValue?: string;
  searchDefaultValue?: string;
  onSearchChange?: (value: string) => void;
  onAddSubmit?: (text: string) => void;
  addAutoFocus?: boolean;
  searchAutoFocus?: boolean;
  searchDebounceMs?: number;
};

export const InputsSection: React.FC<InputsSectionProps> = ({
  className = "",
  searchValue,
  searchDefaultValue,
  onSearchChange,
  onAddSubmit,
  addAutoFocus = false,
  searchAutoFocus = false,
  searchDebounceMs = 300,
}) => {
  return (
    <section
      aria-label="Controles de frases"
      className={cx(
        "w-full",
        "space-y-3 md:space-y-4",
        "print:space-y-2",
        className
      )}
    >
      <AddPhraseForm autoFocus={addAutoFocus} onSubmit={onAddSubmit} />
      <SearchInput
        value={searchValue}
        defaultValue={searchDefaultValue}
        onChange={onSearchChange}
        debounceMs={searchDebounceMs}
        autoFocus={searchAutoFocus}
        className="w-full"
      />
    </section>
  );
};

export default InputsSection;
