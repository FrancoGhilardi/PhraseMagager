import React from "react";
import { cx } from "@shared/lib/cx";

export type LoadingProps = {
  text?: string;
  center?: boolean;
  className?: string;
};

export const Loading: React.FC<LoadingProps> = ({
  text = "Cargando…",
  center = true,
  className = "",
}) => {
  if (!text.trim()) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={cx("mb-4 px-3 py-2 items-center", className)}
    >
      <p className={cx("mb-3 text-zinc-500 text-4xl", center && "text-center")}>
        {text}
      </p>
    </div>
  );
};

export default Loading;
