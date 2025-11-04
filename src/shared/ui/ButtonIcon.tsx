import { cx } from "@shared/lib/cx";

export const IconButton: React.FC<{
  children: React.ReactNode;
  ariaLabel: string;
  title?: string;
  onClick?: () => void;
}> = ({ children, ariaLabel, title, onClick }) => {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      title={title}
      onClick={onClick}
      className={cx(
        "inline-flex items-center justify-center rounded-full border h-8 w-8",
        "border-zinc-200/80 bg-white/90",
        "hover:bg-zinc-100 active:bg-zinc-200",
        "transition-colors"
      )}
    >
      {children}
    </button>
  );
};
