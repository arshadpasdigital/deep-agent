import * as React from "react"
import { ArrowUpRight, Menu, X } from "lucide-react"

import { BrandMark } from "@/components/landing/brand-mark"

const links = [
  { href: "#overview", index: "00", label: "Overview" },
  { href: "#failure-mode", index: "01", label: "Failure mode" },
  { href: "#mechanism", index: "02", label: "Mechanism" },
  { href: "#spec", index: "03", label: "Specification" },
  { href: "#code", index: "04", label: "Implementation" },
  { href: "#isolation", index: "05", label: "Isolation" },
]

export function SiteHeader() {
  const [open, setOpen] = React.useState(false)
  const buttonRef = React.useRef<HTMLButtonElement | null>(null)

  React.useEffect(() => {
    if (!open) {
      return
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false)
        buttonRef.current?.focus()
      }
    }

    window.addEventListener("keydown", handleKeyDown)

    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [open])

  return (
    <header className="sticky top-0 z-50 border-b border-edge bg-canvas">
      <div className="mx-auto flex h-14 w-full max-w-[1500px] items-center justify-between gap-4 px-4 md:px-6">
        <a
          href="#overview"
          className="flex min-h-11 items-center gap-2.5"
          aria-label="Deep Agent home"
        >
          <BrandMark className="shrink-0" />
          <span className="font-display text-[15px] font-extrabold uppercase tracking-[0.1em] [font-stretch:112%]">
            Deep Agent
          </span>
        </a>

        <div className="flex items-center gap-3">
          <span className="hidden font-mono text-[10px] uppercase tracking-[0.16em] text-ink-muted md:block">
            memory registry / v1.0
          </span>
          <span className="hidden h-4 w-px bg-edge md:block" aria-hidden="true" />
          <a
            href="#get-started"
            className="hidden h-10 items-center gap-2 rounded-[2px] bg-lime px-3 font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-on-lime transition-colors hover:bg-[color-mix(in_oklch,var(--lime),var(--on-lime)_10%)] md:inline-flex"
          >
            Run locally
            <ArrowUpRight className="size-3.5" aria-hidden="true" />
          </a>

          <button
            ref={buttonRef}
            type="button"
            className="grid size-11 place-items-center border border-edge text-ink transition-colors hover:bg-canvas-2 md:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? (
              <X className="size-5" aria-hidden="true" />
            ) : (
              <Menu className="size-5" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      <div
        id="mobile-nav"
        hidden={!open}
        className="border-t border-edge bg-canvas md:hidden"
      >
        <nav aria-label="Mobile" className="px-4 py-3">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="flex min-h-12 items-center gap-3 border-b border-edge py-2 last:border-0"
            >
              <span className="font-mono text-[10px] text-lime-deep">
                {link.index}
              </span>
              <span className="text-sm text-ink-soft">{link.label}</span>
            </a>
          ))}
          <a
            href="#get-started"
            onClick={() => setOpen(false)}
            className="mt-3 flex min-h-12 items-center justify-center gap-2 rounded-[2px] bg-lime px-4 font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-on-lime"
          >
            Run locally
            <ArrowUpRight className="size-4" aria-hidden="true" />
          </a>
        </nav>
      </div>
    </header>
  )
}
