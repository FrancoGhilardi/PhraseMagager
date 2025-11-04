import React from "react";
import { store } from "@app/store/store";
import { Provider } from "react-redux";

type Props = {
  children: React.ReactNode;
};

export const AppProviders: React.FC<Props> = ({ children }) => {
  if (!children) return null;

  return <Provider store={store}>{children}</Provider>;
};

export default AppProviders;
