import { cx } from "@shared/lib/cx";
import React, { forwardRef } from "react";

export type InputProps = {
  id?: string;
  name?: string;
  value?: string;
  placeholder?: string;
  ariaLabel?: string;
  type?: "text" | "search";
  disabled?: boolean;
  autoFocus?: boolean;
  className?: string;
  leftAdornment?: React.ReactNode;
  rightAdornment?: React.ReactNode;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      id,
      name,
      value,
      placeholder,
      ariaLabel,
      type = "text",
      disabled = false,
      autoFocus = false,
      className = "",
      leftAdornment,
      rightAdornment,
      onChange,
      onKeyDown,
    },
    ref
  ) => {
    const basePaddingX =
      leftAdornment && rightAdornment
        ? "pl-10 pr-10"
        : leftAdornment
        ? "pl-10 pr-3"
        : rightAdornment
        ? "pl-3 pr-10"
        : "px-3";

    return (
      <div
        className={`relative w-full ${className}`}
        role="group"
        aria-disabled={disabled || undefined}
      >
        {leftAdornment && (
          <div
            className={
              "pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"
            }
          >
            {leftAdornment}
          </div>
        )}

        <input
          ref={ref}
          id={id}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          aria-label={ariaLabel}
          disabled={disabled}
          autoFocus={autoFocus}
          className={cx(
            "block w-full rounded-xl h-11",
            basePaddingX,
            "bg-white/95 text-zinc-900 placeholder-zinc-400",
            "shadow-sm ring-1 ring-zinc-300/70 dark:ring-zinc-700",
            "focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-0",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "transition-shadow"
          )}
        />

        {rightAdornment && (
          <div className={"absolute inset-y-0 right-0 flex items-center pr-3"}>
            <div className="pointer-events-auto">{rightAdornment}</div>
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
