import React from "react";
import AppHeader from "@widgets/app-header/ui/AppHeader";

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
          {children}
        </main>
      </div>
    );
  }
);

RootLayout.displayName = "RootLayout";

export default RootLayout;
