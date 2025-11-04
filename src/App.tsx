import React from "react";
import RootLayout from "@app/layouts/RootLayout";
import Home from "@pages/Home";

const App: React.FC = () => {
  return (
    <RootLayout>
      <Home />
    </RootLayout>
  );
};

export default App;
