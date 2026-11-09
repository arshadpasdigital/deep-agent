import * as React from "react"
import { ArrowRight } from "lucide-react"

import { cn } from "@/lib/utils"

type Tenant = "ana" | "ben"

const tenantFacts: Record<Tenant, string[]> = {
  ana: ["prefers_ts_strict", "memo_tone", "ships_on"],
  ben: [],
}

type Result = {
  actor: Tenant
  target: Tenant
  status: number
  facts: string[]
}

export function IsolationExplorer() {
  const [actor, setActor] = React.useState<Tenant>("ben")
  const [target, setTarget] = React.useState<Tenant>("ana")
  const [result, setResult] = React.useState<Result | null>(null)

  function selectActor(next: Tenant) {
    setActor(next)
    setResult(null)
  }

  function selectTarget(next: Tenant) {
    setTarget(next)
    setResult(null)
  }

  function run() {
    const allowed = actor === target

    setResult({
      actor,
      target,
      status: allowed ? 200 : 403,
      facts: allowed ? tenantFacts[target] : [],
    })
  }

  return (
    <div>
      <div className="grid gap-5 sm:grid-cols-2">
        <Segmented
          label="actor"
          value={actor}
          onChange={selectActor}
        />
        <Segmented
          label="target namespace"
          value={target}
          onChange={selectTarget}
        />
      </div>

      <button
        type="button"
        onClick={run}
        className="mt-5 inline-flex h-12 items-center gap-2 rounded-[2px] bg-lime px-4 font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-on-lime transition-colors hover:bg-[color-mix(in_oklch,var(--lime),var(--on-lime)_10%)]"
      >
        Run read
        <ArrowRight className="size-4" aria-hidden="true" />
      </button>
      <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.12em] text-ink-muted">
        actor must equal the namespace owner
      </p>

      <div className="on-dark mt-6 border border-console-edge bg-console text-console-text">
        <div className="flex items-center justify-between gap-3 border-b border-console-edge px-3 py-2">
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-lime">
            read result
          </span>
          <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-console-muted">
            {result ? result.status : "idle"}
          </span>
        </div>

        <div
          role="status"
          aria-live="polite"
          className="min-h-[10.5rem] p-4 font-mono text-[10.5px] leading-[1.8]"
        >
          {!result ? (
            <div>
              <p>
                <span className="text-blue-bright">actor</span> = {actor}
              </p>
              <p className="mt-1">
                <span className="text-blue-bright">target</span> ={" "}
                <NamespacePath value={`users/${target}/agents/research/facts`} />
              </p>
              <p className="mt-4 text-console-muted">
                Run the read to cross the namespace boundary.
              </p>
            </div>
          ) : result.status === 403 ? (
            <div>
              <p className="text-alert-bright">403 / namespace mismatch</p>
              <p className="mt-2 text-console-text">
                MemoryIdentityError: actor does not own target namespace
              </p>
              <p className="mt-1 text-console-muted">0 facts returned</p>
              <p className="mt-3">
                actor = {result.actor} · target ={" "}
                <NamespacePath value={`users/${result.target}/...`} />
              </p>
            </div>
          ) : (
            <div>
              <p className="text-lime">200 / ok</p>
              <p className="mt-2 text-console-text">
                {result.facts.length} facts returned
              </p>
              <div className="mt-2 border-t border-console-edge pt-2">
                {result.facts.length > 0 ? (
                  result.facts.map((fact) => (
                    <p key={fact} className="text-console-muted">
                      <span className="text-blue-bright">·</span> {fact}
                    </p>
                  ))
                ) : (
                  <p className="text-console-muted">
                    No facts stored for this tenant.
                  </p>
                )}
              </div>
              <p className="mt-3 text-console-muted">
                namespace ={" "}
                <NamespacePath
                  value={`users/${result.target}/agents/research/facts`}
                />
              </p>
            </div>
          )}
        </div>

        <div className="border-t border-console-edge px-3 py-2 font-mono text-[9.5px] uppercase tracking-[0.12em] text-console-muted">
          identity checked before storage
        </div>
      </div>
    </div>
  )
}

function NamespacePath({ value }: { value: string }) {
  return (
    <span>
      {value.split("/").map((part, index) => (
        <React.Fragment key={`${part}-${index}`}>
          {index > 0 ? "/" : null}
          <wbr />
          {part}
        </React.Fragment>
      ))}
    </span>
  )
}

function Segmented({
  label,
  value,
  onChange,
}: {
  label: string
  value: Tenant
  onChange: (value: Tenant) => void
}) {
  return (
    <fieldset>
      <legend className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-muted">
        {label}
      </legend>
      <div className="mt-2 grid grid-cols-2 gap-px border border-edge bg-edge">
        {(["ana", "ben"] as Tenant[]).map((tenant) => {
          const selected = value === tenant

          return (
            <button
              key={tenant}
              type="button"
              aria-pressed={selected}
              onClick={() => onChange(tenant)}
              className={cn(
                "min-h-11 px-3 font-mono text-[10px] uppercase tracking-[0.1em] transition-colors",
                selected
                  ? "bg-ink text-canvas"
                  : "bg-canvas text-ink-muted hover:bg-canvas-2 hover:text-ink"
              )}
            >
              {tenant}
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}
