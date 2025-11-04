import React, { useState } from "react";
import { Input } from "@shared/ui/Input";
import { SearchIcon } from "@shared/ui/icons/SearchIcon";

export type SearchInputProps = {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  dense?: boolean;
  className?: string;
  autoFocus?: boolean;
  id?: string;
  name?: string;
};

export const SearchInput: React.FC<SearchInputProps> = ({
  value,
  defaultValue = "",
  onChange,
  dense = false,
  className = "",
  autoFocus = false,
  id,
  name,
}) => {
  const [inner, setInner] = useState<string>(defaultValue);
  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : inner;

  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isControlled) setInner(e.target.value);
    onChange?.(e.target.value);
  };

  return (
    <div className={className}>
      <Input
        id={id}
        name={name}
        type="search"
        value={currentValue}
        onChange={handleOnChange}
        placeholder="Frases de búsqueda..."
        ariaLabel="Buscar frases"
        dense={dense}
        autoFocus={autoFocus}
        leftAdornment={<SearchIcon className="w-4 h-4 text-zinc-400" />}
      />
    </div>
  );
};

export default SearchInput;
