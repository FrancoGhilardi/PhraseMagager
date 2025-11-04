import React, { useRef, useState, type FormEvent } from "react";
import { Input } from "@shared/ui/Input";
import { PlusIcon } from "@shared/ui/icons/PlusIcon";
import { cx } from "@shared/lib/cx";
import { usePhrasesFacade } from "@features/phrases/usecases/usePhrasesFacade";

export type AddPhraseFormProps = {
  className?: string;
  autoFocus?: boolean;
  onSubmit?: (text: string) => void;
  placeholder?: string;
  label?: string;
};

export const AddPhraseForm: React.FC<AddPhraseFormProps> = ({
  className = "",
  autoFocus = false,
  onSubmit,
  placeholder = "Introducí una nueva frase...",
  label = "Escribí una frase y presioná Enter o hacé clic en “Añadir”.",
}) => {
  const { addPhrase } = usePhrasesFacade();
  const [text, setText] = useState<string>("");
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const clean = text.trim();
    if (!clean) return;
    if (onSubmit) {
      onSubmit(clean);
    } else {
      const created = addPhrase(clean);
      if (!created) return;
    }
    setText("");
    inputRef.current?.focus();
  };

  const isDisabled = text.trim().length === 0;

  return (
    <form
      onSubmit={handleSubmit}
      className={cx("w-full", className)}
      aria-label="Agregar frase"
    >
      <p id="add-phrase-help" className="mt-1 text-zinc-500 text-md mb-1.5">
        {label}
      </p>

      <Input
        ref={inputRef}
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={placeholder}
        ariaLabel="Nueva frase"
        autoFocus={autoFocus}
        aria-describedby="add-phrase-help"
        rightAdornment={
          <button
            type="submit"
            aria-label="Agregar frase"
            aria-disabled={isDisabled}
            className={cx(
              "inline-flex items-center gap-2 rounded-lg border",
              "h-9 px-3",
              "border-zinc-300/70 bg-zinc-100 text-zinc-900",
              "hover:bg-zinc-200 active:bg-zinc-300",
              "transition-colors cursor-pointer",
              isDisabled && "opacity-50 cursor-not-allowed"
            )}
            disabled={isDisabled}
          >
            <PlusIcon className="w-4 h-4" />
            <span>Añadir</span>
          </button>
        }
      />
    </form>
  );
};

export default AddPhraseForm;
