import React from "react";
import Card from "@shared/ui/Card";
import { cx } from "@shared/lib/cx";
import { formatCreatedAt } from "./utils/utils";
import EmptyState from "@shared/ui/EmptyState";
import { DefaultEmptyIcon } from "@shared/ui/icons/DefaultEmptyIcon";
import { SearchOffIcon } from "@shared/ui/icons/SearchOffIcon";

export type PhrasesGridItem = {
  id: string;
  text: string;
  createdAt?: number | string;
};

export type PhrasesGridProps = {
  items: PhrasesGridItem[];
  className?: string;
  showCount?: boolean;
  isFiltered?: boolean;
  emptyMessage?: React.ReactNode;
  noResultsMessage?: React.ReactNode;
  onDelete?: (id: string) => void;
};

export const PhrasesGrid: React.FC<PhrasesGridProps> = ({
  items,
  className = "",
  showCount = true,
  isFiltered = false,
  emptyMessage,
  noResultsMessage,
  onDelete,
}) => {
  const count = items.length;

  if (!count) {
    return (
      <section
        aria-label="Listado de frases"
        className={cx("w-full", className)}
      >
        {showCount && (
          <div className="mb-3 md:mb-4 text-xs text-zinc-500 dark:text-zinc-400">
            0 frases en total
          </div>
        )}

        {isFiltered
          ? noResultsMessage ?? (
              <EmptyState
                title="Sin resultados."
                description="Probá con otro término de búsqueda."
                icon={<SearchOffIcon />}
                className="py-10 md:py-12"
              />
            )
          : emptyMessage ?? (
              <EmptyState
                title="Aún no hay frases."
                description="Empieza añadiendo una nueva frase arriba."
                icon={<DefaultEmptyIcon />}
                className="py-10 md:py-12"
              />
            )}
      </section>
    );
  }

  return (
    <section aria-label="Listado de frases" className={cx("w-full", className)}>
      {showCount && (
        <div className="mb-3 md:mb-4 text-xs text-zinc-500 dark:text-zinc-400">
          {count} {count === 1 ? "phrase" : "phrases"} total
        </div>
      )}

      <div
        role="grid"
        aria-live="polite"
        className={cx(
          "grid gap-3 md:gap-4",
          "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        )}
      >
        {items.map((item) => {
          const meta =
            item.createdAt != null
              ? formatCreatedAt(item.createdAt)
              : undefined;

          return (
            <div role="gridcell" key={item.id}>
              <Card
                meta={meta}
                ariaLabel={`Frase ${item.id}`}
                onDelete={onDelete ? () => onDelete(item.id) : undefined}
                deleteAriaLabel="Eliminar frase"
              >
                {item.text}
              </Card>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default PhrasesGrid;
