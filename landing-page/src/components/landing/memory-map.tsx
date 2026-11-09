import * as React from "react"
import { RotateCcw } from "lucide-react"

import { cn } from "@/lib/utils"

const facts = [
  {
    key: "prefers_ts_strict",
    value: "strict mode, no any",
    updated: "3d",
  },
  {
    key: "memo_tone",
    value: "dry, no adjectives",
    updated: "3d",
  },
  {
    key: "ships_on",
    value: "Friday, before 15:00",
    updated: "12d",
  },
]

export function MemoryMap() {
  const [restarting, setRestarting] = React.useState(false)
  const [restored, setRestored] = React.useState(false)
  const timeout = React.useRef<number | null>(null)

  React.useEffect(() => {
    return () => {
      if (timeout.current) {
        window.clearTimeout(timeout.current)
      }
    }
  }, [])

  function restart() {
    if (restarting) {
      return
    }

    setRestored(false)
    setRestarting(true)

    timeout.current = window.setTimeout(() => {
      setRestarting(false)
      setRestored(true)
    }, 1250)
  }

  const status = restarting ? "restoring" : restored ? "restored" : "ready"

  return (
    <div className="on-dark border border-console-edge bg-console text-console-text">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3 border-b border-console-edge px-4 py-3">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-lime">
            memory.map
          </span>
          <span className="font-mono text-[10px] uppercase tracking-[0.13em] text-console-muted">
            thread 8f3c
          </span>
          <span className="hidden items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-console-muted sm:inline-flex">
            <span className="size-1.5 bg-blue-bright" aria-hidden="true" />
            user ana
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span
            role="status"
            aria-live="polite"
            className="flex items-center gap-1.5 font-mono text-[9.5px] uppercase tracking-[0.13em] text-console-muted"
          >
            <span
              className={cn(
                "size-1.5",
                restarting
                  ? "status-pulse bg-lime"
                  : restored
                    ? "bg-lime"
                    : "bg-console-muted"
              )}
              aria-hidden="true"
            />
            {status}
          </span>
          <button
            type="button"
            onClick={restart}
            disabled={restarting}
            className="inline-flex h-11 items-center gap-2 rounded-[2px] border border-console-edge bg-console-2 px-3 font-mono text-[9.5px] uppercase tracking-[0.12em] text-console-text transition-colors hover:border-lime hover:text-lime disabled:cursor-wait disabled:opacity-60"
          >
            <RotateCcw
              className={cn("size-3.5", restarting && "animate-spin")}
              aria-hidden="true"
            />
            {restarting
              ? "Restoring"
              : restored
                ? "Restart again"
                : "Restart service"}
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-[1.15fr_0.9fr_1.05fr]">
        <div className="flex h-full flex-col border-b border-console-edge p-4 md:border-r md:border-b-0">
          <LaneHead index="01" title="THREAD" meta="checkpointed" />

          <div className="mt-4 space-y-3">
            <Message role="user" time="09:14">
              Draft the Q3 memo. Keep the tone dry.
            </Message>

            <Message role="agent" time="09:15">
              On it. I still have the two facts you pinned last month.
            </Message>

            <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.12em] text-lime">
              <span className="size-1.5 bg-lime" aria-hidden="true" />
              checkpoint · step 02
            </div>

            <div className="border border-blue/45 bg-blue/10 px-2.5 py-1.5">
              <p className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-blue-bright">
                recalled · long-term
              </p>
              <p className="mt-0.5 font-mono text-[10.5px] leading-relaxed text-console-text">
                &ldquo;prefers strict TypeScript&rdquo;
              </p>
            </div>

            <Message role="user" time="09:16">
              Tighten the opening.
            </Message>
          </div>

          <div className="mt-auto min-h-[4.25rem] pt-3">
            {restarting ? (
              <div className="border-l-2 border-lime pl-3">
                <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-lime">
                  restarting · process suspended
                </p>
                <p className="mt-0.5 font-mono text-[10px] text-console-muted">
                  step 02 is already on disk
                </p>
              </div>
            ) : restored ? (
              <div className="border-l-2 border-lime pl-3">
                <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-lime">
                  restored · step 03
                </p>
                <p className="mt-0.5 font-mono text-[10px] text-console-muted">
                  no recap · no replay
                </p>
              </div>
            ) : (
              <div className="border-l-2 border-console-edge pl-3">
                <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-console-muted">
                  live thread · waiting
                </p>
                <p className="mt-0.5 font-mono text-[10px] text-console-muted">
                  state ready for the next turn
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="flex h-full flex-col border-b border-console-edge p-4 md:border-r md:border-b-0">
          <LaneHead index="02" title="CHECKPOINT" meta="step 02" />

          <ol className="mt-4">
            <Step index="01" title="Turn accepted" meta="messages" state="done" />
            <Step index="02" title="Graph state" meta="on disk" state="done" />
            <Step
              index="03"
              title="Next superstep"
              meta={restarting ? "restoring" : restored ? "resumed" : "ready"}
              state={restored ? "done" : "active"}
            />
          </ol>

          <p className="mt-auto border-t border-console-edge pt-3 font-mono text-[10px] uppercase tracking-[0.12em] text-console-muted">
            durable · mongodb
          </p>
        </div>

        <div className="flex h-full flex-col p-4">
          <LaneHead index="03" title="LONG-TERM" meta="mongodb" />

          <p className="mt-4 break-all font-mono text-[10px] leading-relaxed text-blue-bright">
            users/ana/agents/research/facts
          </p>

          <div className="mt-3 divide-y divide-console-edge border-y border-console-edge">
            {facts.map((fact) => (
              <div key={fact.key} className="py-2">
                <div className="flex items-baseline justify-between gap-3">
                  <p className="font-mono text-[10.5px] text-console-text">
                    {fact.key}
                  </p>
                  <p className="font-mono text-[9.5px] uppercase tracking-[0.1em] text-console-muted">
                    {fact.updated}
                  </p>
                </div>
                <p className="mt-0.5 font-mono text-[10px] text-console-muted">
                  {fact.value}
                </p>
              </div>
            ))}
          </div>

          <p className="mt-auto pt-3 font-mono text-[10px] uppercase tracking-[0.12em] text-console-muted">
            read on demand · never global
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 border-t border-console-edge px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.13em] text-console-muted">
        <span className="flex items-center gap-1.5">
          <span className="size-1.5 bg-lime" aria-hidden="true" />
          checkpointed state
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-1.5 bg-blue-bright" aria-hidden="true" />
          namespaced facts
        </span>
        <span className="ml-auto hidden sm:inline">rollback safe</span>
      </div>
    </div>
  )
}

function LaneHead({
  index,
  title,
  meta,
}: {
  index: string
  title: string
  meta: string
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-console-edge pb-2">
      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-console-muted">
        <span className="text-lime">{index}</span> / {title}
      </p>
      <span className="font-mono text-[9.5px] uppercase tracking-[0.1em] text-console-muted">
        {meta}
      </span>
    </div>
  )
}

function Message({
  role,
  time,
  children,
}: {
  role: string
  time: string
  children: React.ReactNode
}) {
  return (
    <div className="border-l border-console-edge pl-3">
      <p className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-console-muted">
        {role} · {time}
      </p>
      <p className="mt-0.5 font-mono text-[10.5px] leading-relaxed text-console-text">
        {children}
      </p>
    </div>
  )
}

function Step({
  index,
  title,
  meta,
  state,
}: {
  index: string
  title: string
  meta: string
  state: "done" | "active"
}) {
  return (
    <li className="relative border-l border-console-edge pb-4 pl-4 last:border-transparent last:pb-0">
      <span
        className={cn(
          "absolute top-1 -left-[3.5px] size-1.5",
          state === "done" ? "bg-lime" : "status-pulse bg-lime"
        )}
        aria-hidden="true"
      />
      <div className="flex items-baseline justify-between gap-3">
        <div>
          <p className="font-mono text-[9.5px] uppercase tracking-[0.12em] text-console-muted">
            step {index}
          </p>
          <p className="mt-0.5 font-mono text-[10.5px] text-console-text">
            {title}
          </p>
        </div>
        <span className="font-mono text-[9.5px] uppercase tracking-[0.1em] text-lime">
          {meta}
        </span>
      </div>
    </li>
  )
}
