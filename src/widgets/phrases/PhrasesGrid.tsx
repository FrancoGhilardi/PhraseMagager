import React from "react";
import Card from "@shared/ui/Card";
import { cx } from "@shared/lib/cx";
import { formatCreatedAt } from "./utils/utils";

export type PhrasesGridItem = {
  id: string;
  text: string;
  createdAt?: number | string;
};

export type PhrasesGridProps = {
  items: PhrasesGridItem[];
  dense?: boolean;
  className?: string;
  showCount?: boolean;
  isFiltered?: boolean;
  emptyMessage?: React.ReactNode;
  noResultsMessage?: React.ReactNode;
  onDelete?: (id: string) => void;
};

const defaultEmpty = (
  <div className="text-center py-12">
    <p className="text-sm text-zinc-500 dark:text-zinc-400">
      Aún no hay frases.
    </p>
    <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">
      Empieza añadiendo una nueva frase arriba.
    </p>
  </div>
);

const defaultNoResults = (
  <div className="text-center py-12">
    <p className="text-sm text-zinc-500 dark:text-zinc-400">Sin resultados.</p>
    <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">
      Prueba con otro término de búsqueda.
    </p>
  </div>
);

export const PhrasesGrid: React.FC<PhrasesGridProps> = ({
  items,
  dense = false,
  className = "",
  showCount = true,
  isFiltered = false,
  emptyMessage,
  noResultsMessage,
  onDelete,
}) => {
  const count = items.length;

  if (count === 0) {
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
          ? noResultsMessage ?? defaultNoResults
          : emptyMessage ?? defaultEmpty}
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
                dense={dense}
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
