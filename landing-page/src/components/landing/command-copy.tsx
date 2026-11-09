import * as React from "react"
import { Check, Copy } from "lucide-react"

const command = "docker compose up --build"

export function CommandCopy() {
  const [copied, setCopied] = React.useState(false)
  const timeout = React.useRef<number | null>(null)

  React.useEffect(() => {
    return () => {
      if (timeout.current) {
        window.clearTimeout(timeout.current)
      }
    }
  }, [])

  async function copy() {
    try {
      await navigator.clipboard.writeText(command)
      setCopied(true)

      if (timeout.current) {
        window.clearTimeout(timeout.current)
      }

      timeout.current = window.setTimeout(() => setCopied(false), 1800)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className="mt-2 flex min-w-0 items-stretch border border-brand-ink bg-brand-ink text-console-text">
      <p className="flex min-w-0 flex-1 items-center gap-2 px-3 font-mono text-[11px]">
        <span className="text-lime" aria-hidden="true">
          $
        </span>
        <span className="min-w-0 overflow-x-auto whitespace-nowrap">
          {command}
        </span>
      </p>
      <button
        type="button"
        onClick={copy}
        className="inline-flex h-12 shrink-0 items-center gap-2 border-l border-console-edge px-3 font-mono text-[9.5px] uppercase tracking-[0.12em] text-console-text transition-colors hover:bg-console-2 hover:text-lime"
      >
        {copied ? (
          <Check className="size-3.5 text-lime" aria-hidden="true" />
        ) : (
          <Copy className="size-3.5" aria-hidden="true" />
        )}
        {copied ? "Copied" : "Copy command"}
      </button>
      <span role="status" aria-live="polite" className="sr-only">
        {copied ? "Command copied to clipboard." : ""}
      </span>
    </div>
  )
}
