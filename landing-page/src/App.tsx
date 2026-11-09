import type * as React from "react"
import { ArrowRight, ArrowUpRight, Check, Minus } from "lucide-react"

import { BrandMark } from "@/components/landing/brand-mark"
import { CodeBlock } from "@/components/landing/code-block"
import { CommandCopy } from "@/components/landing/command-copy"
import { IndexRail } from "@/components/landing/index-rail"
import { IsolationExplorer } from "@/components/landing/isolation-explorer"
import { MemoryMap } from "@/components/landing/memory-map"
import { SectionHead } from "@/components/landing/section-head"
import { SiteHeader } from "@/components/landing/site-header"

const specimen = [
  ["thread", "BaseCheckpointSaver"],
  ["long-term", "BaseStore"],
  ["durable", "MongoDB"],
  ["isolation", "user + agent"],
]

const comparison = [
  { label: "Prior turns", before: "discarded", after: "restored" },
  { label: "User facts", before: "re-asked", after: "recalled" },
  { label: "After restart", before: "from zero", after: "from checkpoint" },
  { label: "Tenant scope", before: "undefined", after: "user + agent" },
]

const stages = [
  {
    index: "01",
    title: "execute",
    heading: "Run the turn",
    body: "The model executes inside the graph. Messages and tool calls accumulate in state.",
    tag: "graph.invoke",
  },
  {
    index: "02",
    title: "checkpoint",
    heading: "Write the state",
    body: "LangGraph persists graph state after every superstep, keyed by thread_id.",
    tag: "BaseCheckpointSaver",
  },
  {
    index: "03",
    title: "remember",
    heading: "Store the fact",
    body: "Explicit tools write facts under a tenant namespace, not a global bucket.",
    tag: "BaseStore",
  },
  {
    index: "04",
    title: "recall",
    heading: "Read it back",
    body: "The next turn, or another thread, reads the same scoped namespace.",
    tag: "user_id + agent_id",
  },
]

const capabilities = [
  {
    index: "01",
    title: "Thread continuity",
    body: "Resume a conversation after a restart, a deploy, or an interrupted turn. Stored state includes every completed superstep.",
    tag: "BaseCheckpointSaver",
  },
  {
    index: "02",
    title: "Long-term facts",
    body: "Preferences, decisions, and project context persist across threads under one tenant namespace.",
    tag: "BaseStore",
  },
  {
    index: "03",
    title: "Structural isolation",
    body: "Every read and write carries a user_id and an agent_id. A missing identity throws before storage is touched.",
    tag: "namespaces",
  },
  {
    index: "04",
    title: "Swappable backend",
    body: "In-memory for tests, MongoDB for production. One contract, two adapters, no agent changes.",
    tag: "MemoryBackend",
  },
  {
    index: "05",
    title: "Model-facing tools",
    body: "remember, recall, and forget are registered on the agent and scoped to the caller.",
    tag: "LangChain tools",
  },
  {
    index: "06",
    title: "Failures surface",
    body: "A failed checkpoint or fact write fails the turn. No silent data loss, no fabricated recall.",
    tag: "MemoryError",
  },
]

const implementationPoints = [
  "Inject the checkpointer and store once, when the agent is created.",
  "Invoke with a thread config that carries thread_id, user_id, and agent_id.",
  "Let the model call remember, recall, and forget inside the conversation.",
  "Swap the backend by configuration, not by editing the agent.",
]

const footerLinks = [
  { href: "#failure-mode", label: "Failure mode" },
  { href: "#mechanism", label: "Mechanism" },
  { href: "#spec", label: "Specification" },
  { href: "#code", label: "Implementation" },
  { href: "#isolation", label: "Isolation" },
]

function Section({
  id,
  children,
}: {
  id: string
  children: React.ReactNode
}) {
  return (
    <section id={id} className="scroll-mt-16 border-b border-edge">
      <div className="px-5 py-16 md:px-8 md:py-24 lg:px-10">{children}</div>
    </section>
  )
}

export function App() {
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:rounded-[2px] focus:bg-ink focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-canvas"
      >
        Skip to content
      </a>

      <SiteHeader />

      <div className="mx-auto flex w-full max-w-[1500px]">
        <IndexRail />

        <main id="main" className="min-w-0 flex-1">
          <section
            id="overview"
            className="relative scroll-mt-16 overflow-hidden border-b border-edge"
          >
            <div
              className="registry-grid pointer-events-none absolute inset-0 opacity-35"
              aria-hidden="true"
            />

            <div className="relative px-5 pt-10 pb-12 md:px-8 md:pt-14 md:pb-16 lg:px-10">
              <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-ink-muted">
                <span>
                  <span className="text-lime-deep">00</span> / overview
                </span>
                <span>deep agent · memory registry</span>
              </div>

              <h1 className="enter mt-8 font-display text-[clamp(2.9rem,7.2vw,6.6rem)] font-extrabold leading-[0.88] tracking-[-0.05em] [font-stretch:108%]">
                <span className="block">Agents forget.</span>
                <span className="block">
                  Deep Agent{" "}
                  <span className="inline-block bg-lime px-2 pb-1 text-on-lime [box-decoration-break:clone]">
                    doesn&apos;t.
                  </span>
                </span>
              </h1>

              <div className="mt-10 grid gap-8 border-t border-edge pt-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-x-12 lg:gap-y-10">
                <div className="min-w-0">
                  <p className="max-w-[52ch] text-[1.0625rem] leading-[1.6] text-ink-soft">
                    Two memory layers, one agent loop. A durable checkpoint for
                    every thread and a scoped namespace for every user, so the
                    work survives the session.
                  </p>

                  <div className="mt-7 flex flex-wrap gap-3">
                    <a
                      href="#spec"
                      className="inline-flex h-12 items-center gap-2 rounded-[2px] bg-lime px-4 font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-on-lime transition-colors hover:bg-[color-mix(in_oklch,var(--lime),var(--on-lime)_10%)]"
                    >
                      Read the spec
                      <ArrowRight className="size-4" aria-hidden="true" />
                    </a>
                    <a
                      href="#code"
                      className="inline-flex h-12 items-center gap-2 rounded-[2px] border border-edge-strong bg-canvas px-4 font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-ink transition-colors hover:bg-canvas-2"
                    >
                      See the implementation
                    </a>
                  </div>

                  <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[9.5px] uppercase tracking-[0.13em] text-ink-muted">
                    {["LangGraph-native", "MongoDB-durable", "user + agent scope"].map(
                      (item, index) => (
                        <span
                          key={item}
                          className="flex items-center gap-3 whitespace-nowrap"
                        >
                          {item}
                          {index < 2 ? (
                            <span className="text-edge-strong" aria-hidden="true">
                              /
                            </span>
                          ) : null}
                        </span>
                      )
                    )}
                  </div>
                </div>

                <div className="order-3 min-w-0 border border-edge bg-canvas lg:order-none">
                  <div className="flex items-center justify-between border-b border-edge px-3 py-2 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-muted">
                    <span>specimen</span>
                    <span>memory</span>
                  </div>
                  <dl className="divide-y divide-edge font-mono text-[10px]">
                    {specimen.map(([key, value]) => (
                      <div
                        key={key}
                        className="flex items-baseline justify-between gap-3 px-3 py-2.5"
                      >
                        <dt className="text-ink-muted">{key}</dt>
                        <dd className="text-right text-ink">{value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>

                <div className="order-2 min-w-0 lg:order-none lg:col-span-2">
                  <MemoryMap />
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-muted">
                    <span>live proof / restart the service</span>
                    <span>state survives process death</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <Section id="failure-mode">
            <SectionHead
              index="01"
              label="Failure mode"
              title={<>Every session starts over.</>}
              note="The model is stateless. The work is not. Without a checkpoint a restart erases the turn; without a store a new thread re-asks the same questions."
            />

            <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)] lg:gap-14">
              <div>
                <p className="border-l-2 border-lime pl-4 font-display text-[clamp(1.6rem,2.6vw,2.4rem)] font-bold leading-[1.05] tracking-[-0.02em]">
                  Context isn&apos;t memory.
                </p>
                <p className="mt-5 max-w-[36ch] text-sm leading-relaxed text-ink-muted">
                  A longer prompt buys time, not continuity. The state has to
                  live outside the window, keyed to the thread and scoped to the
                  tenant.
                </p>
                <dl className="mt-8 space-y-2 font-mono text-[10px] uppercase tracking-[0.12em]">
                  {[
                    ["state", "on disk"],
                    ["scope", "user + agent"],
                    ["restart", "resume"],
                  ].map(([key, value]) => (
                    <div
                      key={key}
                      className="flex items-baseline justify-between gap-3 border-t border-edge pt-2"
                    >
                      <dt className="text-ink-muted">{key}</dt>
                      <dd>{value}</dd>
                    </div>
                  ))}
                </dl>
                <a
                  href="#mechanism"
                  className="mt-6 inline-flex min-h-11 items-center gap-2 font-mono text-[10px] uppercase tracking-[0.12em] text-ink underline underline-offset-4 hover:text-lime-deep"
                >
                  See the mechanism
                  <ArrowRight className="size-3.5" aria-hidden="true" />
                </a>
              </div>

              <div>
                <div className="hidden grid-cols-[minmax(0,1fr)_9rem_9rem] gap-4 border-b border-edge-strong pb-2 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-muted sm:grid">
                  <span>criterion</span>
                  <span>session-only</span>
                  <span className="text-lime-deep">deep agent</span>
                </div>

                {comparison.map((row) => (
                  <div
                    key={row.label}
                    className="grid gap-2 border-b border-edge py-4 sm:grid-cols-[minmax(0,1fr)_9rem_9rem] sm:items-center sm:gap-4"
                  >
                    <p className="text-sm font-medium">{row.label}</p>
                    <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.08em] text-ink-muted">
                      <Minus className="size-3 shrink-0" aria-hidden="true" />
                      <span className="sm:hidden">session-only / </span>
                      {row.before}
                    </p>
                    <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.08em] text-ink">
                      <Check
                        className="size-3 shrink-0 text-lime-deep"
                        aria-hidden="true"
                      />
                      <span className="sm:hidden">deep agent / </span>
                      {row.after}
                    </p>
                  </div>
                ))}

                <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-muted">
                  comparison / same task, different memory
                </p>
              </div>
            </div>
          </Section>

          <Section id="mechanism">
            <SectionHead
              index="02"
              label="Mechanism"
              title={<>Checkpoint. Store. Recall.</>}
              note="Four operations close the loop. The graph writes after every step; facts are written explicitly; the next turn reads both."
            />

            <div className="mt-10 grid gap-px bg-edge sm:grid-cols-2 lg:grid-cols-4">
              {stages.map((stage) => (
                <div
                  key={stage.index}
                  className="relative bg-canvas p-4 md:p-5"
                >
                  <span
                    className="absolute top-0 left-4 h-2 w-2 -translate-y-1/2 bg-lime md:left-5"
                    aria-hidden="true"
                  />
                  <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-muted">
                    <span className="text-lime-deep">{stage.index}</span> /{" "}
                    {stage.title}
                  </p>
                  <h3 className="mt-3 font-display text-[1.35rem] font-bold tracking-[-0.02em]">
                    {stage.heading}
                  </h3>
                  <p className="mt-2 text-[13px] leading-relaxed text-ink-muted">
                    {stage.body}
                  </p>
                  <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.08em] text-blue">
                    {stage.tag}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-8 grid gap-px bg-edge sm:grid-cols-2">
              <div className="bg-canvas-2 p-4 md:p-5">
                <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-muted">
                  write path
                </p>
                <div className="mt-3 space-y-2 font-mono text-[10.5px]">
                  <p>
                    <span className="text-ink-muted">superstep</span> →
                    deepagent_checkpoints
                  </p>
                  <p>
                    <span className="text-ink-muted">fact</span> →
                    deepagent_memory
                  </p>
                </div>
              </div>
              <div className="bg-canvas p-4 md:p-5">
                <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-muted">
                  read path
                </p>
                <div className="mt-3 space-y-2 font-mono text-[10.5px]">
                  <p>
                    <span className="text-ink-muted">thread_id</span> → restore
                    state
                  </p>
                  <p>
                    <span className="text-ink-muted">user_id + agent_id</span> →
                    recall facts
                  </p>
                </div>
              </div>
            </div>

            <p className="mt-6 border-l-2 border-blue pl-4 font-mono text-[10.5px] leading-relaxed text-ink-soft">
              State is written after every superstep. A restart resumes without
              replaying completed work.
            </p>
          </Section>

          <Section id="spec">
            <SectionHead
              index="03"
              label="Specification"
              title={<>The contract, in six rows.</>}
              note="Each guarantee maps to a contract test in the service. The same expectations run against the in-memory and MongoDB adapters."
            />

            <div className="mt-10">
              <div className="hidden grid-cols-[3rem_minmax(0,1fr)_12rem_8rem] gap-4 border-y border-edge-strong px-3 py-2 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-muted md:grid">
                <span>id</span>
                <span>guarantee</span>
                <span>contract</span>
                <span>state</span>
              </div>

              {capabilities.map((cap) => (
                <div
                  key={cap.index}
                  className="grid grid-cols-[2.5rem_minmax(0,1fr)] gap-x-4 gap-y-2 border-b border-edge px-3 py-5 transition-colors hover:bg-canvas-2 md:grid-cols-[3rem_minmax(0,1fr)_12rem_8rem] md:items-start"
                >
                  <p className="font-mono text-[10px] text-lime-deep">
                    {cap.index}
                  </p>
                  <div>
                    <h3 className="text-[1rem] font-semibold tracking-[-0.01em]">
                      {cap.title}
                    </h3>
                    <p className="mt-1 max-w-[54ch] text-sm leading-relaxed text-ink-muted">
                      {cap.body}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2 md:hidden">
                      <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-ink-muted">
                        {cap.tag}
                      </span>
                      <Verified />
                    </div>
                  </div>
                  <p className="hidden font-mono text-[9.5px] uppercase tracking-[0.08em] text-ink-muted md:block">
                    {cap.tag}
                  </p>
                  <span className="hidden md:inline-flex">
                    <Verified />
                  </span>
                </div>
              ))}
            </div>

            <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-muted">
              same contract / two backends / opt-in mongo suite
            </p>
          </Section>

          <section
            id="code"
            className="on-dark scroll-mt-16 border-y border-console-edge bg-console text-console-text"
          >
            <div className="px-5 py-16 md:px-8 md:py-24 lg:px-10">
              <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-console-muted">
                <span>
                  <span className="text-lime">04</span> / implementation
                </span>
                <span>typescript · bun</span>
              </div>

              <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:items-start lg:gap-12">
                <div className="lg:sticky lg:top-20">
                  <h2 className="font-display text-[clamp(2.4rem,4.6vw,4.2rem)] font-extrabold leading-[0.94] tracking-[-0.04em] [font-stretch:110%]">
                    Wire it once.
                  </h2>
                  <p className="mt-5 max-w-[40ch] text-sm leading-relaxed text-console-muted">
                    The checkpointer and the store are injected when the agent is
                    created. Everything downstream reads the same contract.
                  </p>

                  <ul className="mt-7 space-y-3">
                    {implementationPoints.map((point) => (
                      <li
                        key={point}
                        className="flex gap-3 text-[13px] leading-relaxed text-console-text"
                      >
                        <span
                          className="mt-1.5 size-1.5 shrink-0 bg-lime"
                          aria-hidden="true"
                        />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-8 grid grid-cols-3 gap-px border border-console-edge bg-console-edge">
                    {[
                      ["02", "layers"],
                      ["03", "tools"],
                      ["01", "contract"],
                    ].map(([value, label]) => (
                      <div key={label} className="bg-console p-3">
                        <p className="font-display text-xl font-bold">{value}</p>
                        <p className="mt-0.5 font-mono text-[9.5px] uppercase tracking-[0.12em] text-console-muted">
                          {label}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <CodeBlock />
              </div>

              <p className="mt-10 border-t border-console-edge pt-4 font-mono text-[10px] uppercase tracking-[0.14em] text-console-muted">
                singleton service / graceful close / no memory vendor
              </p>
            </div>
          </section>

          <Section id="isolation">
            <SectionHead
              index="05"
              label="Isolation"
              title={<>One namespace per tenant.</>}
              note="Namespaces encode identity. A read or write without a user_id and an agent_id is rejected before storage is touched."
            />

            <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-14">
              <div>
                <p className="max-w-[44ch] text-sm leading-relaxed text-ink-muted">
                  Every fact lives under{" "}
                  <span className="font-mono text-[11px] text-ink">
                    users/<wbr />&#123;user&#125;/<wbr />agents/<wbr />
                    &#123;agent&#125;/<wbr />facts
                  </span>
                  . The path is the permission boundary, not a filter a caller
                  has to remember.
                </p>

                <div className="mt-6 border border-edge">
                  <div className="flex items-center justify-between border-b border-edge px-3 py-2 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-muted">
                    <span>namespace index</span>
                    <span>facts</span>
                  </div>
                  <div className="divide-y divide-edge">
                    <div className="flex items-center justify-between gap-3 px-3 py-3">
                      <span className="font-mono text-[10.5px]">
                        users/ana/agents/research
                      </span>
                      <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-lime-deep">
                        3 facts
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-3 px-3 py-3">
                      <span className="font-mono text-[10.5px]">
                        users/ben/agents/research
                      </span>
                      <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-ink-muted">
                        0 facts
                      </span>
                    </div>
                  </div>
                </div>

                <dl className="mt-6 space-y-2 font-mono text-[10px] uppercase tracking-[0.1em]">
                  {[
                    ["scope", "user_id + agent_id"],
                    ["missing id", "MemoryIdentityError"],
                    ["cross-tenant", "403"],
                  ].map(([key, value]) => (
                    <div
                      key={key}
                      className="flex items-baseline justify-between gap-3 border-t border-edge pt-2"
                    >
                      <dt className="text-ink-muted">{key}</dt>
                      <dd>{value}</dd>
                    </div>
                  ))}
                </dl>
              </div>

              <IsolationExplorer />
            </div>
          </Section>

          <section
            id="get-started"
            className="scroll-mt-16 border-b border-brand-ink bg-lime text-on-lime"
          >
            <div className="px-5 py-16 md:px-8 md:py-24 lg:px-10">
              <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-on-lime/70">
                <span>
                  <span className="text-on-lime">06</span> / start
                </span>
                <span>local-first · mongodb included</span>
              </div>

              <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-end">
                <h2 className="min-w-0 font-display text-[clamp(3rem,6.6vw,6rem)] font-extrabold leading-[0.9] tracking-[-0.05em] [font-stretch:108%]">
                  Give it a{" "}
                  <span className="inline-block bg-brand-ink px-2 pb-1 text-lime [box-decoration-break:clone]">
                    memory.
                  </span>
                </h2>

                <div className="min-w-0">
                  <p className="max-w-[38ch] text-base leading-relaxed text-on-lime/75">
                    One backend, two layers, one tenant boundary. The stack runs
                    locally with MongoDB included.
                  </p>

                  <div className="mt-6">
                    <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-on-lime/60">
                      run the stack
                    </p>
                    <CommandCopy />
                  </div>

                  <a
                    href="#code"
                    className="mt-4 inline-flex min-h-11 items-center gap-2 font-mono text-[10px] uppercase tracking-[0.12em] underline underline-offset-4 hover:no-underline"
                  >
                    See the implementation
                    <ArrowUpRight className="size-3.5" aria-hidden="true" />
                  </a>
                </div>
              </div>

              <div className="mt-12 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-on-lime/20 pt-4 font-mono text-[10px] uppercase tracking-[0.14em] text-on-lime/70">
                <span>thread checkpoints</span>
                <span>namespaced facts</span>
                <span>explicit recall</span>
                <span className="lg:ml-auto">no external memory vendor</span>
              </div>
            </div>
          </section>

          <footer className="bg-canvas">
            <div className="px-5 py-10 md:px-8 lg:px-10">
              <div className="flex flex-col gap-8 border-t border-edge-strong pt-6 md:flex-row md:items-start md:justify-between">
                <div>
                  <a
                    href="#overview"
                    className="flex min-h-11 items-center gap-2.5"
                  >
                    <BrandMark className="shrink-0" />
                    <span className="font-display text-base font-extrabold uppercase tracking-[0.12em] [font-stretch:112%]">
                      Deep Agent
                    </span>
                  </a>
                  <p className="mt-3 max-w-[36ch] text-sm leading-relaxed text-ink-muted">
                    Durable memory for autonomous agents. Built on LangGraph
                    checkpoints and MongoDB.
                  </p>
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                  <nav aria-label="Footer" className="flex flex-col text-sm">
                    {footerLinks.map((link) => (
                      <a
                        key={link.href}
                        href={link.href}
                        className="inline-flex min-h-11 items-center text-ink-soft transition-colors hover:text-lime-deep lg:min-h-8"
                      >
                        {link.label}
                      </a>
                    ))}
                  </nav>
                  <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink-muted">
                    <p>backend / mongo</p>
                    <p className="mt-2">transport / http</p>
                    <p className="mt-2">scope / user + agent</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex flex-col gap-2 border-t border-edge pt-4 font-mono text-[10px] uppercase tracking-[0.12em] text-ink-muted sm:flex-row sm:justify-between">
                <p>© 2026 Deep Agent</p>
                <p>local-first demo</p>
              </div>
            </div>
          </footer>
        </main>
      </div>
    </>
  )
}

function Verified() {
  return (
    <span className="inline-flex h-6 items-center gap-1 border border-lime-deep/30 bg-lime-soft px-2 font-mono text-[10px] uppercase tracking-[0.08em] text-lime-deep">
      <Check className="size-3" aria-hidden="true" />
      Verified
    </span>
  )
}

export default App
