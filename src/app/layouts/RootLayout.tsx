import React from "react";
import AppHeader from "@widgets/app-header/ui/AppHeader";
import { cx } from "@shared/lib/cx";

export type RootLayoutProps = {
  children: React.ReactNode;
  className?: string;
  mainClassName?: string;
};

const RootLayout: React.FC<RootLayoutProps> = React.memo(
  ({ children, className, mainClassName }) => {
    return (
      <div
        className={cx("min-h-screen w-full bg-white text-gray-900", className)}
        data-testid="root-layout"
      >
        <AppHeader />
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
