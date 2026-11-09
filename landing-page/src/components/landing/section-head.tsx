import type * as React from "react"

type SectionHeadProps = {
  index: string
  label: string
  title: React.ReactNode
  note?: React.ReactNode
}

export function SectionHead({ index, label, title, note }: SectionHeadProps) {
  return (
    <div className="grid gap-6 border-b border-edge pb-8 md:grid-cols-[minmax(0,1fr)_19rem] md:items-end md:gap-10">
      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-muted">
          <span className="text-lime-deep">{index}</span> / {label}
        </p>
        <h2 className="mt-3 max-w-[20ch] text-balance font-display text-[clamp(2.2rem,4.4vw,3.9rem)] font-extrabold leading-[0.95] tracking-[-0.035em] [font-stretch:110%]">
          {title}
        </h2>
      </div>
      {note ? (
        <div className="max-w-[36ch] text-sm leading-relaxed text-ink-muted">
          {note}
        </div>
      ) : null}
    </div>
  )
}
