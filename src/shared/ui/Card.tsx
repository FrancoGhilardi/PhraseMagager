import { cx } from "@shared/lib/cx";
import React from "react";
import { IconButton } from "./ButtonIcon";
import { TrashIcon } from "./icons/TrashIcon";

export type CardProps = {
  children: React.ReactNode;
  meta?: React.ReactNode;
  dense?: boolean;
  ariaLabel?: string;
  className?: string;
  onDelete?: () => void;
  deleteAriaLabel?: string;
};

export const Card: React.FC<CardProps> = ({
  children,
  meta,
  dense = false,
  ariaLabel,
  className = "",
  onDelete,
  deleteAriaLabel = "Eliminar",
}) => {
  const padding = dense ? "p-3" : "p-4";
  const textSize = dense ? "text-sm" : "text-base";
  const metaSize = dense ? "text-[11px]" : "text-sm";

  return (
    <article
      role="article"
      aria-label={ariaLabel}
      className={cx(
        "relative w-full rounded-2xl border",
        "border-zinc-200/80 bg-white/95",
        "shadow-sm hover:shadow-md transition-shadow",
        className
      )}
    >
      <div className={cx(padding, "pr-12")}>
        <div
          className={cx(
            "whitespace-pre-wrap break-words text-zinc-900",
            textSize
          )}
        >
          {children}
        </div>

        {meta && (
          <div className={cx("mt-2 text-zinc-500", metaSize)}>{meta}</div>
        )}
      </div>

      {onDelete && (
        <div className="absolute right-2 top-2">
          <IconButton
            ariaLabel={deleteAriaLabel}
            onClick={onDelete}
            dense={dense}
            title={deleteAriaLabel}
          >
            <TrashIcon className="w-4 h-4" />
          </IconButton>
        </div>
      )}
    </article>
  );
};

export default Card;
