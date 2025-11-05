import React from "react";
import AppHeader from "@widgets/app-header/ui/AppHeader";
import { ErrorBoundary } from "@shared/lib/hoc/withErrorBoundary";
import RetryError from "@shared/ui/RetryError";

export type RootLayoutProps = {
  children: React.ReactNode;
  className?: string;
  mainClassName?: string;
};

const RootLayout: React.FC<RootLayoutProps> = React.memo(
  ({ children, className, mainClassName }) => {
    return (
      <div className={className} data-testid="root-layout">
        <AppHeader />
        <main role="main" className={mainClassName}>
          <ErrorBoundary
            fallbackRender={({ reset }) => (
              <RetryError
                message="Ocurrió un problema al mostrar esta sección"
                onRetry={reset}
              />
            )}
          >
            {children}
          </ErrorBoundary>
        </main>
      </div>
    );
  }
);

RootLayout.displayName = "RootLayout";

export default RootLayout;
