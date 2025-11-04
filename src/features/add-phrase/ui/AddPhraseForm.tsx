import React, { useState, type FormEvent } from "react";
import { Input } from "@shared/ui/Input";
import { PlusIcon } from "@shared/ui/icons/PlusIcon";
import { cx } from "@shared/lib/cx";

export type AddPhraseFormProps = {
  className?: string;
  autoFocus?: boolean;
  onSubmit?: (text: string) => void;
};

export const AddPhraseForm: React.FC<AddPhraseFormProps> = ({
  className = "",
  autoFocus = false,
  onSubmit,
}) => {
  const [text, setText] = useState<string>("");
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (onSubmit) onSubmit(text.trim());
    setText("");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`w-full ${className}`}
      aria-label="Agregar frase"
    >
      <p id="add-phrase-help" className={`mt-1 text-zinc-500 text-md mb-1.5`}>
        Escriba una frase y pulse Intro o haga clic en Añadir
      </p>
      <Input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Introduzca una nueva frase..."
        ariaLabel="Nueva frase"
        autoFocus={autoFocus}
        aria-describedby="add-phrase-help"
        rightAdornment={
          <button
            type="submit"
            aria-label="Agregar frase"
            className={cx(
              "inline-flex items-center gap-2 rounded-lg border",
              "h-9 px-3",
              "border-zinc-300/70 bg-zinc-100 text-zinc-900",
              "hover:bg-zinc-200 active:bg-zinc-300",
              "transition-colors cursor-pointer",
              text.trim().length === 0 ? "opacity-50 cursor-not-allowed" : ""
            )}
            disabled={text.trim().length === 0}
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
