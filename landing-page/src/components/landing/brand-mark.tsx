export function BrandMark({ className }: { className?: string }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      aria-hidden="true"
      className={className}
    >
      <rect x="0" y="1" width="20" height="5" fill="var(--lime)" />
      <rect x="0" y="7.5" width="13" height="5" fill="currentColor" />
      <rect x="0" y="14" width="7" height="5" fill="var(--blue)" />
    </svg>
  )
}
