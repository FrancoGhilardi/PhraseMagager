export const DefaultEmptyIcon: React.FC<{ className?: string }> = ({
  className = "h-6 w-6",
}) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <path
      d="M3 12l3-6h12l3 6v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-6Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    <path
      d="M9 14h6"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);
