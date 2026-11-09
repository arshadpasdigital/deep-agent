import type { InputHTMLAttributes } from "react"
import { cn } from "cn"

import { Input } from "@/components/ui/input"

interface FieldRowProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
}

export function FieldRow({ label, id, error, className, ...props }: FieldRowProps) {
  return (
    <div className="grid gap-1.5 sm:grid-cols-[5.5rem_1fr] sm:items-start">
      <label
        htmlFor={id}
        className="pt-2 font-mono text-[0.625rem] uppercase tracking-[0.16em] text-[var(--auth-muted)] sm:text-right"
      >
        {label}
      </label>
      <div className="space-y-1.5">
        <Input
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          className={cn(
            "h-9 border-[var(--auth-line-strong)] bg-[var(--auth-surface-raised)] font-mono text-sm text-[var(--auth-ink)] placeholder:text-[var(--auth-muted)] focus-visible:border-[var(--auth-accent)] focus-visible:ring-[var(--auth-accent)]/30",
            className,
          )}
          {...props}
        />
        {error ? (
          <p id={`${id}-error`} className="text-xs text-destructive">
            {error}
          </p>
        ) : null}
      </div>
    </div>
  )
}
