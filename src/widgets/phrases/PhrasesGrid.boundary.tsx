import withErrorBoundary from "@shared/lib/hoc/withErrorBoundary";
import RetryError from "@shared/ui/RetryError";
import PhrasesGrid, { type PhrasesGridProps } from "./PhrasesGrid";

export const PhrasesGridWithBoundary = withErrorBoundary<PhrasesGridProps>(
  PhrasesGrid,
  {
    fallbackRender: ({ reset }) => (
      <RetryError message="No pudimos renderizar la grilla" onRetry={reset} />
    ),
  }
);

export default PhrasesGridWithBoundary;
