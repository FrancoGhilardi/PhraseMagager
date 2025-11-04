import React from "react";
import RootLayout from "@app/layouts/RootLayout";
import Home from "@pages/Home";
import AppProviders from "@app/providers/AppProviders";

const App: React.FC = () => {
  return (
    <AppProviders>
      <RootLayout>
        <Home />
      </RootLayout>
    </AppProviders>
  );
};

export default App;
