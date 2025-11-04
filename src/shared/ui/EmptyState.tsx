import React from "react";
import { cx } from "@shared/lib/cx";
import { DefaultEmptyIcon } from "./icons/DefaultEmptyIcon";

export type EmptyStateProps = {
  title?: React.ReactNode;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
  centered?: boolean;
  role?: React.AriaRole;
  ariaLive?: "off" | "polite" | "assertive";
};

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = "Nothing here yet",
  description,
  icon,
  actions,
  className,
  centered = true,
  role = "status",
  ariaLive = "polite",
}) => {
  return (
    <section
      role={role}
      aria-live={ariaLive}
      className={cx("w-full", centered && "text-center", className)}
    >
      <div
        className={cx(
          "mx-auto flex flex-col items-center space-y-2",
          centered ? "justify-center" : "justify-start"
        )}
      >
        <div
          aria-hidden="true"
          className={cx(
            "flex items-center justify-center rounded-xl h-12 w-12",
            "bg-zinc-100 text-zinc-500 ring-1 ring-zinc-200/80"
          )}
        >
          {icon ?? <DefaultEmptyIcon className={"h-6 w-6"} />}
        </div>

        {title && (
          <h3 className={"font-medium text-zinc-800 text-base"}>{title}</h3>
        )}

        {description && (
          <p className={"text-zinc-500 text-sm"}>{description}</p>
        )}

        {actions && <div className={"mt-2"}>{actions}</div>}
      </div>
    </section>
  );
};

/**
 * Ícono sugerido para “sin resultados” (lupa con tachado).
 */

export default EmptyState;
