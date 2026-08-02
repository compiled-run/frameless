# T006 — the eleven remaining "queued" sites, corrected as dated measured records

Worker receipt evidence. HEAD at start: `810adee`. Date: 2026-08-01.

## 1. The scenario count, measured myself — not copied

Measured off `packages/compiler/test/goldens/` directly:

- `ls | grep -cE '^s[0-9]+-.*\.json$'` → **17** scenario goldens, `s1-render-once.json`
  through `s17-contacts.json`, contiguous s1–s17.
- Fixtures: `packages/compiler/test/fixtures/` holds exactly `s1`–`s17` `.tsrx` — **no s18
  fixture**.
- **No s18 golden**: `find` over the repo (excluding node_modules/.git/website) for `*s18*`
  returns nothing. The only textual "s18/S18" hits outside T004's own dated record are
  hypothetical conditionals (`packages/compiler/test/citations.test.ts:1518` "an S18 ...
  moves it"; two TS diagnostic codes TS18046/TS18047/TS18048) — none queues one.
- **No roadmap row**: the only "roadmap" mentions outside goal boards are in
  `docs/report.md`, all pre-launch narrative, none queuing a scenario.

**NONE is queued.** The 11 sites' "four more scenarios are queued" was written in the
8-scenario era and has been false since s9 landed at the latest.

## 2. One measurement legitimately serves all 11 sites

Verified before reusing the count: every one of the 11 files resolves its corpus root to
`../../compiler/test/goldens` (grep receipts in the task log — react gate:43, qwik
gate:24, solid gate:42, vue gate:31, svelte gate:27, solid emitter:32, svelte emitter:15,
qwik emitter:11, react emitter:37, angular emitter:18, vue emitter:12). Same corpus, one
measurement — but the EMITTED side differs per lane and was measured per lane:

| lane | emitted | subtraction |
|---|---|---|
| react | 17/17 (`generated/S1–S17.tsx`) | none in derivation |
| solid | 17/17 | none in derivation |
| qwik | 17/17 | none in derivation |
| angular | 17/17 | `ANGULAR_UNBUILT_SCENARIOS` EMPTY (asserted empty) |
| svelte | 16/17 | `SVELTE_UNBUILT_SCENARIOS` = S14 only, recorded refusal (same-module component reference) |
| vue | 16/17 | `VUE_UNBUILT_SCENARIOS` = S14 only, recorded refusal (same-module component reference) |

The dated records written into each file carry the lane-accurate figure — svelte/vue say
"sixteen are emitted/in this table", not seventeen; nothing was homogenized.

## 3. The 11 corrections (comment-only; no assertion touched)

Re-found by my own grep at 810adee (ordinals matched the PM's): gate.test.ts —
solid:32, react:33, qwik:40, svelte:43, vue:47(–48); emitter.test.ts — react:53,
solid:48, qwik:27, svelte:53, vue:50, angular:56. Each stale clause ("...and four more
scenarios are queued." / "Four more scenarios are queued, and a table hand-edited per
scenario is that same hole four more times.") was replaced with a **MEASURED 2026-08-01**
record in T004's angular gate shape (angular gate.test.ts:50–55 at HEAD): seventeen
goldens exist, lane-accurate emitted count, NONE queued — no s18 golden, no s18 fixture,
no roadmap row. Each paragraph's own argument (gate: derived-inventory abort story;
emitter: freshness-drift story) was preserved; only the claim moved.

## 4. Sweep of all 11 files: my own count of the same families

Multi-line sweep for stale counts and era phrasing (`queued`, `four more`, `seven
goldens`, `eight goldens/scenarios`, `three/four/five lanes`, number words). Findings:

**LIVE same-family claims found and corrected (5 more sites, total 16):**

1–4. qwik emitter:264–267, angular emitter:1026–1029, vue emitter:803–806, svelte
emitter:413–416 — "`s1-render-once` is the ONLY annotated fixture in the corpus — four
typed entries against fifteen untyped ones across the other seven goldens" — present
tense, undated, FALSE. MEASURED 2026-08-01 by walking every golden's
`components[].props.entries[].type`: **TEN of seventeen goldens carry typed entries (s1,
s8, s10–s17); fifteen typed against fifteen untyped; s1 still holds four**. Corrected to
the dated measured record, argument preserved.

5. vue emitter:416–419 — "The other seven scenarios carry no annotation" — present
tense, FALSE (nine other annotated goldens exist). Corrected: S2 specifically is
unannotated (measured 0 typed / 2 untyped) and remains the control arm.

**Historical/exempt (recorded, NOT corrected — per stop_if only undated live claims are in scope):**

- "This list was `['generated/S1.x' ...]`" openings — quoted historical, all 11 files.
- "MEASURED at 127a75b, before T010 ... across all eight goldens" (qwik emitter:233ff and
  its svelte:381/vue:771/angular:994 siblings) — commit-anchored past tense.
- "MEASURED before this field landed ... all eight goldens" (qwik emitter:289, react:2261,
  solid:1871, svelte:438, vue:828, angular:1051) — event-anchored past tense.
- react emitter:2194ff / solid emitter:1810ff "Measured across all eight goldens ...
  react and solid threw" — record of the IR-8-era measurement, past tense.
- qwik gate:288 "found the standing corpus of FOUR lanes" — attributed T015 record.
- vue gate:98–137, 951 — the T010 counted-literals doctrine block; historical + code.
- angular emitter "other five lanes" (264, 660, 1129) — currently TRUE (six lanes).
- Assertion-backed counts (angular emitter:327 "all fifteen event records"
  `toHaveLength(15)`; angular emitter:681 "emits all seventeen") — live-verified by their
  own assertions, not stale.

**Same-family claims OUTSIDE allowed_files — recorded, not reached:**

- `packages/frameworks/vue/src/emitter/index.ts:1202–1205` — "MEASURED at the time of
  writing: annotation is per-component all-or-nothing across the corpus (RenderOnce 4/4,
  the other seven scenarios 0/15), so this branch is a guard against a corpus that
  changes, not a live split." The all-or-nothing half is STILL TRUE (every golden is all
  typed or all untyped), but the counts are stale and the branch IS now a live split —
  ten annotated vs seven unannotated goldens exercise both arms.
- `packages/frameworks/vue/src/gate/index.ts:1301–1303` (comment) and `:1332` (the
  SHIPPED `no-runtime-prop-options` violation message) — "annotation is per-component
  all-or-nothing in the corpus today (RenderOnce 4 of 4 typed, the other seven goldens
  0 of 15)" — live, stale, and the :1332 instance is a counted literal inside a shipped
  message, the exact defect family vue gate's own T010 doctrine block documents.
- Goal notes quoting the old wording (`docs/goals/frameless-vue-v1/notes/T011`,
  `frameless-emitter-capability-v1/notes/T003/T010`) — quoted historical, exempt.

**My count: 16 live sites corrected (11 assigned + 5 swept); 3 live sites recorded
outside allowed_files (vue src emitter x1, vue src gate x2, one of them a shipped
message); everything else measured as historical or assertion-backed.**

## 5. Machine gates (all measured, START and FINISH)

- `pnpm check`: START (pre-edit, at 810adee + owner dirt) **261** `error TS` lines;
  FINISH with all 16 corrections **261**. DELTA 0. (Baseline measured myself before any
  edit; finish measured on the exact bytes shipped — restore from aside verified
  byte-identical by `cmp`.)
- `pnpm test`: baseline at HEAD versions (my 11 paths copied aside BY NAME, `git
  checkout --` by name, no stash): **1 failed | 1506 passed (1507)** — the foreign ARM B
  (`packages/compiler/test/package-inventory.test.ts`). With my edits: **1 failed | 1506
  passed (1507)**, same single ARM B failure. Passed count UNCHANGED, measured both sides.
- `pnpm e2e` RUN ALONE: PASS — "Three-way: **6 demos x 9 scenarios**, all observations
  equal", plus all six official-demo receipts.
- `pnpm lint`: 0 warnings, 0 errors (558 files).
- `pnpm check:citations`: clean at **4 / 17 / 709** after the first 11 edits, after the
  5 sweep edits, and at FINISH. The sweep did not shrink.

## 6. Derived trees: this card derives nothing

Shell array (no wildcard pathspec), all 12 trees
(`packages/frameworks/{react,solid,qwik,svelte,vue,angular}/{generated,generated-composition}`)
asserted to EXIST and be NON-EMPTY, then `git diff --exit-code -- "${trees[@]}"` → exit 0
and `git status --short -- "${trees[@]}"` → empty, checked both before and after the
verify runs.

## 7. Owner dirt untouched

`shasum -a 256`, whole output LINES sorted, START and FINISH:
`f326d314… pnpm-lock.yaml` / `aeb7edc1… pnpm-workspace.yaml` / website roll-up
`f936e169…` over **116 files**. `diff` of the two fingerprint files: IDENTICAL.
