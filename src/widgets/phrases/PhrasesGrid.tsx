import React, { memo, useMemo } from "react";
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

  const headerText = useMemo<string>(() => {
    return `${count} ${count === 1 ? "frase" : "frases"} en total`;
  }, [count]);

  if (!count) {
    return (
      <section
        aria-label="Listado de frases"
        className={cx("w-full", className)}
      >
        {showCount && (
          <div className="mb-3 md:mb-4 text-xs text-zinc-500">
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
                description="Empezá agregando una nueva frase arriba."
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
        <div className="mb-3 md:mb-4 text-xs text-zinc-500">{headerText}</div>
      )}

      <div
        role="grid"
        aria-live="polite"
        className={
          "grid gap-3 md:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        }
      >
        {items.map((item) => (
          <div role="gridcell" key={item.id}>
            <GridCard item={item} onDelete={onDelete} />
          </div>
        ))}
      </div>
    </section>
  );
};

const GridCard = memo(function GridCard({
  item,
  onDelete,
}: {
  item: PhrasesGridItem;
  onDelete?: (id: string) => void;
}) {
  const createdAt =
    typeof item.createdAt === "number"
      ? item.createdAt
      : typeof item.createdAt === "string"
      ? Number(item.createdAt)
      : undefined;

  const meta =
    createdAt != null && Number.isFinite(createdAt)
      ? formatCreatedAt(createdAt)
      : undefined;

  return (
    <Card
      meta={meta}
      ariaLabel={`Frase ${item.id}`}
      onDelete={onDelete ? () => onDelete(item.id) : undefined}
      deleteAriaLabel="Eliminar frase"
    >
      {item.text}
    </Card>
  );
});

export default PhrasesGrid;
