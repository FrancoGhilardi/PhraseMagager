import React, { useEffect, useMemo, useRef, useState } from "react";
import { Input } from "@shared/ui/Input";
import { SearchIcon } from "@shared/ui/icons/SearchIcon";
import { useDebouncedValue } from "@shared/lib/hooks/useDebouncedValue";

export type SearchInputProps = {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  onDebouncedChange?: (value: string) => void;
  debounceMs?: number;
  onSubmit?: (value: string) => void;
  className?: string;
  autoFocus?: boolean;
  id?: string;
  name?: string;
  placeholder?: string;
};

export const SearchInput: React.FC<SearchInputProps> = ({
  value,
  defaultValue = "",
  onChange,
  onDebouncedChange,
  debounceMs = 300,
  onSubmit,
  className = "",
  autoFocus = false,
  id,
  name,
  placeholder = "Buscar frases...",
}) => {
  const isControlled = value !== undefined;
  const [inner, setInner] = useState<string>(defaultValue);
  const rawValue = isControlled ? value! : inner;

  const {
    value: debounced,
    flush,
    cancel,
  } = useDebouncedValue(rawValue, {
    delay: debounceMs,
    enabled: debounceMs > 0,
  });

  const lastEmittedRef = useRef<string>(debounced);

  useEffect(() => {
    if (!onDebouncedChange) return;
    if (debounced === lastEmittedRef.current) return;

    lastEmittedRef.current = debounced;
    onDebouncedChange(debounced);
  }, [debounced, onDebouncedChange]);

  const handlers = useMemo(() => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const next = e.target.value;
      if (!isControlled) setInner(next);
      if (next === rawValue && isControlled) return;
      onChange?.(next);
      if (debounceMs <= 0 && onDebouncedChange) {
        lastEmittedRef.current = next;
        onDebouncedChange(next);
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        flush();
        if (onDebouncedChange) {
          lastEmittedRef.current = rawValue;
          onDebouncedChange(rawValue);
        }
        onSubmit?.(rawValue);
      } else if (e.key === "Escape") {
        if (!isControlled) setInner("");
        onChange?.("");
        cancel();
        if (onDebouncedChange) {
          lastEmittedRef.current = "";
          onDebouncedChange("");
        }
      }
    };

    return { handleChange, handleKeyDown };
  }, [
    isControlled,
    rawValue,
    onChange,
    onDebouncedChange,
    onSubmit,
    debounceMs,
    flush,
    cancel,
  ]);

  return (
    <div className={className}>
      <Input
        id={id}
        name={name}
        type="search"
        value={rawValue}
        onChange={handlers.handleChange}
        onKeyDown={handlers.handleKeyDown}
        placeholder={placeholder}
        ariaLabel="Buscar frases"
        autoFocus={autoFocus}
        leftAdornment={<SearchIcon className="w-4 h-4 text-zinc-400" />}
      />
    </div>
  );
};

export default SearchInput;
