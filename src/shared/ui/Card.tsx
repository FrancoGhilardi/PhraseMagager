import { cx } from "@shared/lib/cx";
import React, { memo } from "react";
import { IconButton } from "./ButtonIcon";
import { TrashIcon } from "./icons/TrashIcon";

export type CardProps = {
  children: React.ReactNode;
  meta?: React.ReactNode;
  ariaLabel?: string;
  className?: string;
  onDelete?: () => void;
  deleteAriaLabel?: string;
  enableClamp?: boolean;
  clampLines?: number;
};

export const Card: React.FC<CardProps> = ({
  children,
  meta,
  ariaLabel,
  className = "",
  onDelete,
  deleteAriaLabel = "Eliminar",
  enableClamp = true,
  clampLines = 4,
}) => {
  const clampStyle = enableClamp
    ? ({
        display: "-webkit-box",
        WebkitBoxOrient: "vertical",
        WebkitLineClamp: clampLines,
        overflow: "hidden",
      } as const)
    : undefined;

  return (
    <article
      role="article"
      aria-label={ariaLabel}
      className={cx(
        "relative w-full rounded-2xl border",
        "border-zinc-200/80 bg-white/95 hover:bg-blue-100",
        "shadow-sm hover:shadow-md transition-shadow",
        className
      )}
    >
      <div className={"p-4 pr-12"}>
        <div
          className={
            "whitespace-pre-wrap break-words hyphens-auto text-zinc-900 text-base leading-relaxed"
          }
          style={clampStyle}
        >
          {children}
        </div>

        {meta && <div className={"mt-2 text-zinc-500 text-sm"}>{meta}</div>}
      </div>

      {onDelete && (
        <div className="absolute right-2 top-2">
          <IconButton
            ariaLabel={deleteAriaLabel}
            onClick={onDelete}
            title={deleteAriaLabel}
          >
            <TrashIcon className="w-4 h-4" />
          </IconButton>
        </div>
      )}
    </article>
  );
};

export default memo(Card);
