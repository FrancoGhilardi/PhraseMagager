import { cx } from "@shared/lib/cx";

export const IconButton: React.FC<{
  children: React.ReactNode;
  ariaLabel: string;
  title?: string;
  onClick?: () => void;
  dense?: boolean;
}> = ({ children, ariaLabel, title, onClick, dense = false }) => {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      title={title}
      onClick={onClick}
      className={cx(
        "inline-flex items-center justify-center rounded-full border",
        dense ? "h-7 w-7" : "h-8 w-8",
        "border-zinc-200/80 bg-white/90",
        "hover:bg-zinc-100 active:bg-zinc-200",
        "dark:border-zinc-700 dark:bg-zinc-800/90",
        "dark:hover:bg-zinc-700 dark:active:bg-zinc-700/80",
        "transition-colors"
      )}
    >
      {children}
    </button>
  );
};
