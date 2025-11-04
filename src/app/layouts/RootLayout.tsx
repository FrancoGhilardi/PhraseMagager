import React from "react";
import cx from "@shared/lib/cx";
import AppHeader from "@widgets/app-header/ui/AppHeader";

export type RootLayoutProps = {
  children: React.ReactNode;
  className?: string;
  mainClassName?: string;
  headerRightSlot?: React.ReactNode;
};

/**
 * Root layout that centralizes the app shell:
 * - Header at the top.
 * - A constrained main container for content.
 * - Sensible defaults for min height and colors.
 */
const RootLayout: React.FC<RootLayoutProps> = React.memo(
  ({ children, className, mainClassName, headerRightSlot }) => {
    return (
      <div
        className={cx("min-h-screen w-full bg-white text-gray-900", className)}
        data-testid="root-layout"
      >
        <AppHeader rightSlot={headerRightSlot} />
        <main
          role="main"
          className={cx(
            "mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8",
            mainClassName
          )}
        >
          {children}
        </main>
      </div>
    );
  }
);

RootLayout.displayName = "RootLayout";

export default RootLayout;
