# Frameless guard hardening and drag coverage

## What the owner asked for

After `frameless-app-fidelity-v1` closed complete, the PM listed what remained. The owner's
answer, verbatim: **"Fix them all."**

## The list, and what "all" honestly covers

1. **The citation guard disarms itself on rename or delete.** `resolvesInRepo`
   (`scripts/check-citations.mjs:830`) uses `existsSync` only to CLASSIFY, so a citation to a
   path that does not exist is silently ruled not-first-party and escapes every ruling.
   **MEASURED BY THE PM AT HEAD**: a planted citation to
   `packages/compiler/src/totally-not-a-real-file.ts:42` left `pnpm check:citations` at **exit 0**.
   Unowned since T013 of the previous board. This is the biggest item because the previous board
   moved the repo's entire record integrity onto this check.

2. **`.svelte` and `.vue` prose is unswept.** `SWEPT_SOURCE_EXTENSIONS` is
   `/\.(?:ts|tsx|js|jsx|mjs|cjs)$/`, so **0 of the 610 swept files** are `.svelte` or `.vue` and
   **99 tracked files** (58 + 41) carry prose no ruling can read. The last audit called this "a
   property of the instrument, not a defect to close". **The PM disagrees and the owner ruled
   "fix them all":** it is a missing lexer, not a law of nature.

3. **The drag is a CHROMIUM-ONLY claim in all six lanes.** Five cards recorded Firefox as
   unmeasured and none closed it. The demos assert drag as a cross-lane property.

4. **Two small stale records**: `gate.test.ts:50` "four more scenarios are queued" (17 exist,
   none queued - and the paragraph carries NO date, so no exemption applies), and
   `codex.css:60`'s 43/13/4 divergence counts, taken over the FIVE lanes that served `/codex`
   before angular gained its sixth and never re-run.

## What "all" does NOT cover, stated plainly

- **The qwik lost drop** (1 of 16, the first from a fresh page). It sits inside qwik's own
  resumability envelope. The owner's standing rule is that a framework is not tested outside its
  design envelope and such output is not read as a defect. **Recorded, not fixed. Nothing filed
  upstream.**
- **OD1's conditional S12 exemption** stands as the owner ruled it, and reopens on its own terms.

## The oracle

**THREE PARTS, ALL REQUIRED.**

1. **EVERY GUARD CHANGE IS PROVEN RED-CAPABLE AGAINST A REAL FAILURE, AND THE PROOF RE-RUNS IN
   CI.** Mutate the detector, show the suite go red, restore byte-identically, report the digest
   both times. `pnpm check:citations` exiting 0 on a clean tree IS NOT EVIDENCE - the previous
   board proved a neutered detector still prints "agreed with the prose" and exits 0.
2. **THE DRAG CLAIM NAMES ITS BROWSER, OR IS MEASURED IN A SECOND ONE.** Either Firefox is driven
   and the result recorded per lane, or every drag claim in the repo is qualified as Chromium.
   "It works in Chromium" may not be written as "it works".
3. **NOTHING REGRESSES.** `pnpm test` at EXACTLY ONE failure (the foreign ARM B); `pnpm e2e`
   stays 6 x 9 run ALONE; `pnpm lint` and `pnpm check:citations` clean. `pnpm check` BASELINE
   **261** and may rise only on a card that states the amount IN ADVANCE and justifies it.

**Final proof:** per guard change, the mutation and its restore digest; per lane, the Firefox
result or the qualified claim; the check budget's start and end with every rise attributed.
