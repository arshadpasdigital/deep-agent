import * as React from "react"
import { Check, Copy } from "lucide-react"

import { cn } from "@/lib/utils"

type Tone = "plain" | "key" | "str" | "muted"

type Token = {
  text: string
  tone?: Tone
}

type Sample = {
  label: string
  meta: string
  path: string
  text: string
  lines: Token[][]
}

const samples = {
  agent: {
    label: "agent.ts",
    meta: "01",
    path: "src/features/agent/agent.ts",
    text: `// one service, two memory layers
const memory = await getMemoryService()
await memory.initialize()

const agent = createAgent({
  model,
  tools: [remember, recall, forget],
  checkpointer: memory.getCheckpointer(),
  store: memory.getStore(),
})

await agent.invoke(
  { messages },
  memory.createThreadConfig({ userId, threadId, agentId }),
)`,
    lines: [
      [{ text: "// one service, two memory layers", tone: "muted" }],
      [
        { text: "const", tone: "key" },
        { text: " memory = " },
        { text: "await", tone: "key" },
        { text: " getMemoryService()" },
      ],
      [
        { text: "await", tone: "key" },
        { text: " memory.initialize()" },
      ],
      [],
      [
        { text: "const", tone: "key" },
        { text: " agent = createAgent({" },
      ],
      [{ text: "  model," }],
      [{ text: "  tools: [remember, recall, forget]," }],
      [{ text: "  checkpointer: memory.getCheckpointer()," }],
      [{ text: "  store: memory.getStore()," }],
      [{ text: "})" }],
      [],
      [
        { text: "await", tone: "key" },
        { text: " agent.invoke(" },
      ],
      [{ text: "  { messages }," }],
      [
        { text: "  memory.createThreadConfig({ userId, threadId, agentId })," },
      ],
      [{ text: ")" }],
    ],
  },
  tools: {
    label: "tools.ts",
    meta: "02",
    path: "src/deep-agent-memory/tools/memory.tools.ts",
    text: `export const remember = tool(
  async ({ key, text }) =>
    memory.remember({ userId, agentId }, key, {
      text,
      source: "memo-agent",
    }),
  { name: "remember", description: "Store a durable fact." },
)`,
    lines: [
      [
        { text: "export const", tone: "key" },
        { text: " remember = tool(" },
      ],
      [
        { text: "  " },
        { text: "async", tone: "key" },
        { text: " ({ key, text }) =>" },
      ],
      [
        { text: "    memory.remember({ userId, agentId }, key, {" },
      ],
      [{ text: "      text," }],
      [
        { text: "      source: " },
        { text: '"memo-agent"', tone: "str" },
        { text: "," },
      ],
      [{ text: "    })," }],
      [
        { text: "  { name: " },
        { text: '"remember"', tone: "str" },
        { text: ", description: " },
        { text: '"Store a durable fact."', tone: "str" },
        { text: " }," },
      ],
      [{ text: ")" }],
    ],
  },
  env: {
    label: ".env",
    meta: "03",
    path: "backend/services/deepagent-service/.env",
    text: `MEMORY_BACKEND=mongo
MONGODB_URI=mongodb://mongodb:27017
MEMORY_CHECKPOINT_DB=deepagent_checkpoints
MEMORY_STORE_DB=deepagent_memory`,
    lines: [
      [
        { text: "MEMORY_BACKEND=" },
        { text: "mongo", tone: "str" },
      ],
      [
        { text: "MONGODB_URI=" },
        { text: "mongodb://mongodb:27017", tone: "str" },
      ],
      [
        { text: "MEMORY_CHECKPOINT_DB=" },
        { text: "deepagent_checkpoints", tone: "str" },
      ],
      [
        { text: "MEMORY_STORE_DB=" },
        { text: "deepagent_memory", tone: "str" },
      ],
    ],
  },
} satisfies Record<string, Sample>

type SampleKey = keyof typeof samples

const toneClass: Record<Tone, string> = {
  plain: "text-console-text",
  key: "text-blue-bright",
  str: "text-lime",
  muted: "text-console-muted",
}

export function CodeBlock() {
  const [active, setActive] = React.useState<SampleKey>("agent")
  const [copied, setCopied] = React.useState(false)
  const copyTimeout = React.useRef<number | null>(null)
  const sample = samples[active]

  React.useEffect(() => {
    return () => {
      if (copyTimeout.current) {
        window.clearTimeout(copyTimeout.current)
      }
    }
  }, [])

  async function copy() {
    try {
      await navigator.clipboard.writeText(sample.text)
      setCopied(true)

      if (copyTimeout.current) {
        window.clearTimeout(copyTimeout.current)
      }

      copyTimeout.current = window.setTimeout(() => setCopied(false), 1800)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className="min-w-0 border border-console-edge bg-console-2">
      <div className="flex items-center justify-between gap-3 border-b border-console-edge px-3 py-2">
        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-lime">
          source / memory
        </span>
        <button
          type="button"
          onClick={copy}
          className="inline-flex h-11 items-center gap-2 rounded-[2px] border border-console-edge px-3 font-mono text-[9.5px] uppercase tracking-[0.12em] text-console-text transition-colors hover:border-lime hover:text-lime"
        >
          {copied ? (
            <Check className="size-3.5 text-lime" aria-hidden="true" />
          ) : (
            <Copy className="size-3.5" aria-hidden="true" />
          )}
          {copied ? "Copied" : "Copy"}
        </button>
        <span role="status" aria-live="polite" className="sr-only">
          {copied ? "Code copied to clipboard." : ""}
        </span>
      </div>

      <div className="grid md:grid-cols-[10.5rem_minmax(0,1fr)]">
        <div
          role="group"
          aria-label="Source files"
          className="grid grid-cols-3 border-b border-console-edge md:grid-cols-1 md:border-r md:border-b-0"
        >
          {(Object.keys(samples) as SampleKey[]).map((key) => {
            const file = samples[key]
            const selected = active === key

            return (
              <button
                key={key}
                type="button"
                aria-pressed={selected}
                onClick={() => setActive(key)}
                className={cn(
                  "flex min-h-11 flex-col items-start justify-center border-l-2 px-3 py-2 text-left transition-colors",
                  selected
                    ? "border-lime bg-console text-console-text"
                    : "border-transparent text-console-muted hover:bg-console-2 hover:text-console-text"
                )}
              >
                <span className="font-mono text-[10px] uppercase tracking-[0.1em]">
                  {file.label}
                </span>
                <span className="hidden font-mono text-[9px] uppercase tracking-[0.12em] text-console-muted sm:block">
                  {file.meta}
                </span>
              </button>
            )
          })}

          <div className="hidden border-t border-console-edge px-3 pt-3 md:block">
            <p className="font-mono text-[9.5px] uppercase tracking-[0.12em] text-console-muted">
              backend · mongo
            </p>
            <p className="mt-1 font-mono text-[9.5px] uppercase tracking-[0.12em] text-console-muted">
              runtime · bun
            </p>
          </div>
        </div>

        <div className="min-w-0 overflow-x-auto p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.13em] text-console-muted">
              {sample.path}
            </p>
            <span className="shrink-0 font-mono text-[9.5px] uppercase tracking-[0.1em] text-console-muted">
              {sample.lines.length} lines
            </span>
          </div>

          <div className="mt-3 min-w-[34rem] font-mono text-[12px] leading-[1.85]">
            {sample.lines.map((line, lineIndex) => (
              <div
                key={lineIndex}
                className="grid grid-cols-[2rem_1fr] gap-3 whitespace-pre"
              >
                <span
                  className="select-none text-right text-console-muted/60"
                  aria-hidden="true"
                >
                  {lineIndex + 1}
                </span>
                <code>
                  {line.length === 0 ? (
                    <span> </span>
                  ) : (
                    line.map((token, tokenIndex) => (
                      <span
                        key={tokenIndex}
                        className={cn(toneClass[token.tone ?? "plain"])}
                      >
                        {token.text}
                      </span>
                    ))
                  )}
                </code>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
