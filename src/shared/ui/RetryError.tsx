import React from "react";
import { cx } from "@shared/lib/cx";

export type RetryErrorProps = {
  message: string;
  onRetry?: () => void;
  onDismiss?: () => void;
  className?: string;
};

export const RetryError: React.FC<RetryErrorProps> = ({
  message,
  onRetry,
  onDismiss,
  className = "",
}) => {
  if (!message?.trim()) return null;

  return (
    <div
      role="alert"
      className={cx(
        "mb-4 rounded-lg border border-red-300/60 bg-red-50 text-red-800 px-3 py-2",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm">{message}</p>
        <div className="flex items-center gap-2">
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="text-xs underline hover:opacity-80"
            >
              Ocultar
            </button>
          )}
          {onRetry && (
            <button
              onClick={onRetry}
              className="text-xs underline hover:opacity-80"
            >
              Reintentar
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default RetryError;
