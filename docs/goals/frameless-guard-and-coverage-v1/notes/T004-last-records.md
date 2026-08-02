# T004 — the last two stale records, corrected

Worker evidence note. Board: `docs/goals/frameless-guard-and-coverage-v1/state.yaml`, task T004.
All measurements below are the Worker's own, taken 2026-08-01 at HEAD `46f673f` plus the owner's
known dirty paths (fingerprinted below, untouched).

## Site 1 — `packages/frameworks/angular/test/gate.test.ts:50` "four more scenarios are queued"

**Measured myself, not copied from the card:**

- `packages/compiler/test/goldens/`: seventeen `s<n>-*.json` scenario goldens, s1–s17, no s18.
- `packages/compiler/test/fixtures/`: `s1`–`s17` `.tsrx` fixtures, no s18 (no fixture opened or
  edited — enumerated by `ls` only).
- `packages/frameworks/angular/generated/`: seventeen artifacts, S1.ts–S17.ts.
- `ANGULAR_UNBUILT_SCENARIOS` in `test/unbuilt-scenarios.ts`: `[]`.
- Repo-wide grep for `S18|s18-`: only hypothetical mentions ("the day an S18 lands"). No roadmap,
  table or card queues a scenario anywhere.

So: **seventeen scenarios exist, all seventeen are emitted in this lane, none is queued.** The
paragraph carries no date (the exemption T021 assumed does not apply), so the clause was live and
false. Corrected as a dated MEASURED record; **no assertion touched — the diff is comment-only**
(`git diff` on the file shows changes inside the `/** ... */` block only; `pnpm check` delta 0 and
the angular suite still passes confirm it mechanically).

## Site 2 — `demos/shared/shadcn-theme/codex.css:60` the 43/13/4 divergence counts

**Chose: REMOVE the counts (OD3 half one), not re-run.** Why: the 43/13/4 (and the "33 elements"
letter-spacing count inside the same reading) counted the **pre-repair** page over the five lanes
that served /codex at the time. The repairs that block itself carries have shipped, so driving
/codex in six lanes today measures the **repaired** page — it cannot reproduce or update that
population. The figure is not merely un-re-run; it is un-re-runnable. Writing any six-lane number
without driving it is a stop_if, so the counts are removed and the fact stated without them: /codex
was the only page in the shipped set still diverging, in computed style, text-run width and box
rect, between react/solid/vue and qwik/svelte, with the three mechanisms kept in full. Per-element
readings (151.58px vs 147.25px, the radius scale, the h2 line-height) are single-element pre-repair
measurements, not population counts, and stand.

Edited `demos/shared/shadcn-theme/codex.css` only; propagated by running
`node ../shared/copy-shadcn-theme.mjs <asset-root>` in each of the six lanes (the script's own
invocation shape). **All seven copies share one digest:**
`ad32be6eb882c4aa5d78725bfbf8df0183f43de837503c0d01bcd06a4d60cb46` (SHA-256).

## Sweep of both files (verify item 4) — my own count

Method: full read of both files plus multi-line-safe greps (`queued`, `four more`, lane-count and
divergence-count vocabulary). Families: (A) scenario-count/queue claims, (B) lane-population /
divergence-count claims.

**Corrected: 5 count-sites (card named 2).**

| # | Site | Family | Ruling |
|---|---|---|---|
| 1 | `gate.test.ts:50` "four more scenarios are queued" | A | card site 1 — corrected, measured |
| 2 | `codex.css:60` block, "43/13/4" | B | card site 2 — counts removed (OD3 half one) |
| 3 | same block, "on 33 elements" | B | same never-re-runnable population — removed with it |
| 4 | `codex.css` ".codex" comment, "Five of the six demos are official framework scaffolds" | B | **false at HEAD** — measured: qwik README declares "An unmodified `pnpm create qwik` app", svelte README records `sv create`, angular README is the ng-CLI scaffold README, and this file's own header already records react/solid/vue as create-vite scaffolds. Six of six. Count removed |
| 5 | same comment, "the five shipped lanes are comparable … rather than five per-scaffold overrides" | B | five-lane-era count; six lanes ship /codex today. Counts removed |

**Evaluated and deliberately left (4):**

- `codex.css` "across the five lanes THAT SERVED THIS PAGE AT THE TIME" / "the five-lane sweep" —
  the historical population disclosure itself, correct as it stands.
- `codex.css` `.codex h1` comment ("THIS LINE SAID FIVE … SIX lanes, not five") — the predecessor
  board's own correction record, a quoted historical.
- `codex.css` T013/T019/T021 pixel figures (26342/7303/13498/…, 13 vs 39 tokens) — card-attributed
  measurements, ruled by the previous board.
- `gate.test.ts:1142` "the whole 18-file corpus" — past-tense record of the @switch
  candidate-selection parse. Arithmetic checks for its time: 15 scenarios (S11/S12 then refused)
  + 3 composition modules = 18; today's corpus is 20. Its three **live** companion claims were
  re-measured at HEAD and hold: `@switch` occurs zero times in `src/emitter/` and zero times in
  `generated/` + `generated-composition/`; no `#name` template reference variable exists in either
  tree (all `#` hits are S13's hash-route hrefs); so `Reference` and `SwitchBlock` remain absent
  from the corpus today.

Cross-file note for the PM (outside my `allowed_files`, untouched): the same "four more scenarios
are queued" / "more scenarios are queued" wording lives in
`packages/frameworks/{react,solid,qwik,vue,svelte}/test/gate.test.ts` and in all six lanes'
`test/emitter.test.ts`. Whether those paragraphs carry dates I did not adjudicate; they are not in
this card.

## Verification (all on the final bytes)

- Owner dirt fingerprints, START and FINISH, identical: `pnpm-lock.yaml` `f326d314…`,
  `pnpm-workspace.yaml` `aeb7edc1…`, `website/` `f936e169…` over 116 files (SHA-256, whole output
  lines sorted).
- `pnpm check`: START measured at HEAD **before any edit** (no copy-aside needed) = **261**;
  after edits = **261**. Delta 0.
- `pnpm test`: **1 failed / 1506 passed** — the failure is the foreign ARM B
  (`packages/compiler/test/package-inventory.test.ts` peer-suffix key, owner's in-flight lockfile).
- `pnpm lint`: 0 warnings / 0 errors over 558 files.
- `pnpm check:citations`: clean — 4 watched documents / 17 watched source / **709 swept** (sweep
  did not shrink).
- `pnpm e2e`: run alone (no frameless demo server up — the live vite/preview processes on this
  machine belong to markless/markless-precompute/tsrx-vp-demo, other repos, and were left alone);
  result recorded in the receipt.
- Derivation proof: shell array of **25 explicit derived-tree paths** (6 lanes × generated +
  generated-composition, 6 emitted trees, 7 todomvc-app-css trees), each asserted to exist and be
  non-empty, then `git diff --exit-code -- <path>` one path at a time, no wildcard pathspec:
  all 25 clean. The six lane `shadcn-theme` trees diff on **exactly** `codex.css` each — the copies
  item 3 mandates. `git status --short` shows the eight task files plus the owner's three dirty
  paths and nothing else.

Nothing committed; changes left in the working tree for PM review.
