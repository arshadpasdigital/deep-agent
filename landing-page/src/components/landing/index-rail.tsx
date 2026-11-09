import * as React from "react"

import { cn } from "@/lib/utils"

const sections = [
  { id: "overview", index: "00", label: "Overview" },
  { id: "failure-mode", index: "01", label: "Failure mode" },
  { id: "mechanism", index: "02", label: "Mechanism" },
  { id: "spec", index: "03", label: "Specification" },
  { id: "code", index: "04", label: "Implementation" },
  { id: "isolation", index: "05", label: "Isolation" },
  { id: "get-started", index: "06", label: "Start" },
]

export function IndexRail() {
  const [active, setActive] = React.useState("overview")

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActive(entry.target.id)
          }
        }
      },
      { rootMargin: "-12% 0px -76% 0px", threshold: 0 }
    )

    for (const section of sections) {
      const node = document.getElementById(section.id)
      if (node) {
        observer.observe(node)
      }
    }

    return () => observer.disconnect()
  }, [])

  return (
    <aside className="sticky top-14 hidden h-[calc(100svh-3.5rem)] flex-col justify-between overflow-y-auto border-r border-edge lg:flex">
      <div className="px-5 py-6">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-muted">
          Index
        </p>
        <nav aria-label="Sections" className="mt-4">
          {sections.map((section) => {
            const current = active === section.id

            return (
              <a
                key={section.id}
                href={`#${section.id}`}
                aria-current={current ? "location" : undefined}
                className={cn(
                  "flex min-h-10 items-baseline gap-3 border-l-2 py-2.5 pl-3 transition-colors",
                  current
                    ? "border-lime text-ink"
                    : "border-transparent text-ink-muted hover:border-edge-strong hover:text-ink"
                )}
              >
                <span
                  className={cn(
                    "font-mono text-[10px] tabular-nums",
                    current ? "text-lime-deep" : "text-ink-muted"
                  )}
                >
                  {section.index}
                </span>
                <span className="text-[13px] leading-tight">{section.label}</span>
              </a>
            )
          })}
        </nav>
      </div>

      <div className="border-t border-edge px-5 py-5">
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-muted">
          System
        </p>
        <dl className="mt-3 space-y-2 font-mono text-[10px]">
          {[
            ["backend", "mongodb"],
            ["transport", "http"],
            ["isolation", "user + agent"],
            ["license", "local demo"],
          ].map(([key, value]) => (
            <div key={key} className="flex items-baseline justify-between gap-2">
              <dt className="text-ink-muted">{key}</dt>
              <dd className="text-right text-ink-soft">{value}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-4 flex items-center gap-2 border-t border-edge pt-3">
          <span className="status-pulse size-1.5 bg-lime" aria-hidden="true" />
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-soft">
            operational
          </span>
        </div>
      </div>
    </aside>
  )
}
