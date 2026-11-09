# Deep Agent Landing Page — UI/UX Review, Round 1

- **Project:** Deep Agent landing page
- **Mode:** `/design review` (round 1, pre-redesign)
- **Date:** 2026-11-09
- **Surface:** Single marketing page, React + Tailwind, desktop 1440 / tablet / mobile 390 and 320
- **Score:** 41 / 50
- **Verdict:** Needs changes

## TL;DR

The first impression is strong and specific. The memory inspector is a real product proof object, the warm paper + vermilion + moss palette avoids the default AI gradient, and the serif/mono pairing carries a clear editorial-technical voice. What holds it back is repetition: six sections reuse the same "statement plus italic orange tail" headline formula, the page becomes text-led after the hero, and the interaction layer has gaps. The cursor sits at "good direction, needs a sharper second act."

Primary next move: a full redesign that changes the spatial premise, not another polish pass. Keep the product-specific proof, rebuild the composition around a registry / instrument panel, and fix the interaction findings below.

## Heuristic scores

| # | Lens | Score | Key finding |
|---|---|---|---|
| 1 | First impression | 9 / 10 | Memory inspector + ledger palette are memorable and product-specific |
| 2 | Hierarchy | 8 / 10 | Clear at a glance; repeated heading pattern flattens section distinction |
| 3 | Color voice | 9 / 10 | Warm paper, vermilion, moss; authored dark mode; no generic tech gradient |
| 4 | Type voice | 8 / 10 | Instrument Serif + Inter + Plex Mono works; the italic-accent formula repeats |
| 5 | Interaction feel | 7 / 10 | Restart, facts, copy, cross-tenant check are meaningful; hit areas and CTA loop lag |
| | **Total** | **41 / 50** | |

## What is working

- **A real proof object.** `MemoryConsole` shows a thread, a checkpoint, a recalled fact, and a restart demonstration. It is the strongest element on the page and belongs only to this product.
- **A non-default palette.** Warm off-white canvas, ink, vermilion signal, and moss state color. It reads as a ledger, not a SaaS template.
- **Technical credibility.** The spec sheet, code sample, namespace tree, and isolation check answer an engineer's real questions.
- **Responsive reflow.** 320 px and 390 px both reflow without horizontal overflow after the code panel was constrained.
- **Contrast.** Body copy measures 10.54:1, primary labels 5.19–5.98:1, console text 6.96:1. No measured failure.
- **Reduced motion.** The hero entrance resolves to `animation: none` under `prefers-reduced-motion: reduce`.

## Findings

| # | Severity | Discipline | Location | Before | After | Why |
|---|---|---|---|---|---|---|
| 1 | HIGH | Accessibility | `src/components/landing/tabs.tsx:78`, `memory-console.tsx:111` | Tab buttons render 29 px tall; restart button renders 36 px tall | Give every interactive control a 44 px minimum hit area on coarse pointers | Fingers mistap adjacent 29 px tabs on mobile |
| 2 | MEDIUM | Accessibility | `memory-console.tsx:93`, `code-block.tsx:201`, `tabs.tsx:73` | Only the active panel is rendered, so inactive tabs' `aria-controls` point at missing IDs | Render all panels and hide inactive ones with `hidden`, or drop the tab pattern | A screen reader is told about controls that do not exist |
| 3 | MEDIUM | Interaction | `src/App.tsx:562-594` | "Start building" lands on a final CTA whose actions point back up the page | Make the final CTA lead with a concrete, copyable run command; keep the loop out of the primary path | The primary CTA promises an action then hands back navigation |
| 4 | MEDIUM | Layout | `memory-console.tsx:111-135` | Restored status wraps to three lines and grows the console by ~55 px | Shorten the status and reserve panel height so the restart does not shift the page | A demonstration should not move the layout it is proving |
| 5 | MEDIUM | Voice | `src/App.tsx:185-594` | Six section headlines use "statement + italic orange phrase" | Vary headline construction and section composition; reserve the device for the hero | The formula starts to read as a template rather than a voice |
| 6 | MEDIUM | Content | `code-block.tsx:74-80` | `memory.remember({ userId, agentId, key, text })` does not match the real `remember(identity, key, fact)` signature | Show the actual scoped identity + key + fact call | The audience is engineers; a wrong signature costs trust |
| 7 | LOW | Layout | `src/App.tsx:365-384` | Mechanism tags sit at different vertical positions | Use a flex column with `mt-auto` so tags share a baseline | Ragged tag rows weaken the diagram rhythm |
| 8 | LOW | Responsive | `src/App.tsx:185`, `src/App.tsx:230` | Kicker and proof line leave orphaned single words at 320 px | Split into non-wrapping spans that break at separators | Orphan words read as accidental, not adaptive |
| 9 | LOW | Typography | `src/App.tsx:454-462` | Code section headline leaves "the" hanging at the end of line one | Keep "the agent" together or rebalance the heading size | A single hanging word interrupts the headline |
| 10 | LOW | Layout | `src/App.tsx:429` | Spec row content is inset 12 px from its top rule | Align the row inset with the rule or remove the inset | Visible misalignment at the section's strongest line |
| 11 | LOW | Accessibility | `site-header.tsx:55` | Mobile menu cannot be closed with Escape | Close on Escape and return focus to the trigger | Keyboard users expect Escape to dismiss a disclosure |
| 12 | LOW | Content | `src/App.tsx:365`, `src/App.tsx:429` | "Thread continuity" and "Long-term facts" are used as h3s in two sections | Differentiate the mechanism labels from the spec labels | Duplicate headings make the heading list ambiguous |

## Considered but rejected

| Location | Candidate | Rejected because |
|---|---|---|
| Hero | Enlarge the headline further | 102 px already owns the hierarchy; the problem is section variety, not scale |
| Palette | Replace vermilion | Contrast and voice pass; the repetition is the issue, not the hue |
| Hero | Add a gradient behind the inspector | The flat paper field is doing the work; a gradient would be decoration |
| Sections | Restore scroll-triggered reveals | The first build hid section content in static/full-page rendering; mount entrance is more robust |
| Dark mode | Make dark the default | The warm paper identity is the stronger brand statement; dark is a second theme |

## Verification

**Checks run**

- Screenshots at 1440×1000, 390×844, 320×700; full-page captures at 1440 and 390.
- Restart interaction: restored state appears with the checkpoint message.
- Facts tab, tab arrow-key navigation, mobile menu open/close.
- Cross-tenant read: 403 + 0 facts state.
- Contrast measured with rendered canvas colors across 12 text pairs.
- `bun run typecheck`, `bun run lint`, `bun run build` all pass.
- Reduced motion: `.hero-reveal` animation resolves to `none`.

**Fixed during the audit**

- Scroll-gated content was invisible in full-page capture and any static rendering. Replaced with a safe mount entrance.
- The 34 rem code block forced a 598 px document at 390 px. Added `min-w-0` to the grid and panel.

**Not verified**

- Real screen-reader pass on VoiceOver/NVDA.
- 200% browser zoom and text-only zoom.
- Safari and Firefox rendering (Chrome only).

## Verdict

**Needs changes.** No page-breaking HIGH remains after the overflow fix, but the 44 px hit-area failure is still standing and six medium findings remain. The visual direction is worth keeping as a reference, but the repetition and the text-heavy lower page justify a full redesign rather than incremental polish.

**Next modes:** `redesign` (composition + voice reset), `a11y` (hit areas, tab panels, Escape), `interaction` (CTA close), `typeset` (small labels).
