export function ExperimentalBadge({
  children
}: {
  children?: string;
}) {
  return (
    <span className="ml-2 inline-flex items-center rounded-full border border-amber-500/25 bg-amber-500/12 px-2 py-0.5 text-xs font-semibold text-amber-700 dark:text-amber-300">
      {children ?? "실험적"}
    </span>
  );
}
