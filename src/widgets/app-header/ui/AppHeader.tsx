import { cx } from "@shared/lib/cx";
import React, { memo } from "react";

export type AppHeaderProps = {
  rightSlot?: React.ReactNode;
  className?: string;
};

/**
 * Application header.
 *
 * Semantics:
 * - Uses <header role="banner"> for accessibility.
 * - Keeps layout responsive with a centered content container.
 */
const AppHeader: React.FC<AppHeaderProps> = ({ rightSlot, className }) => {
  return (
    <header
      role="banner"
      aria-label="Application header"
      className={cx("w-full py-6", className)}
      data-testid="app-header"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">
              Gestor de frases
            </h1>

            <p className="mt-1 text-sm text-gray-500 ">
              Recopila y organiza tus frases favoritas.
            </p>
          </div>
          {rightSlot && <div className="flex items-center">{rightSlot}</div>}
        </div>
      </div>
    </header>
  );
};

AppHeader.displayName = "AppHeader";

export default memo(AppHeader);
