import withErrorBoundary from "@shared/lib/hoc/withErrorBoundary";
import RetryError from "@shared/ui/RetryError";
import InputsSection from "./InputsSection";

export const InputsSectionWithBoundary = withErrorBoundary(InputsSection, {
  fallbackRender: ({ reset }) => (
    <RetryError message="No pudimos mostrar los controles" onRetry={reset} />
  ),
});

export default InputsSectionWithBoundary;
