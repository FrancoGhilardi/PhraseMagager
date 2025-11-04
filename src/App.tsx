import React from "react";
import RootLayout from "@app/layouts/RootLayout";

/**
 * Root application component.
 * For now it only renders the header to validate styles and spacing.
 */
const App: React.FC = () => {
  return (
    <RootLayout>
      <div className="rounded-2xl border border-dashed border-gray-300 p-6 text-sm text-gray-700 dark:text-gray-300">
        Grid & features will be rendered here.
      </div>
    </RootLayout>
  );
};

export default App;
