# T007 — vue src stale counts of the queued/eight-scenario-era family

Worker receipt evidence. HEAD at start: `602e49c`. Date: 2026-08-01.

## 1. My own measurement of the annotation split (verify 1)

Not inherited from T006. Derived directly from
`packages/compiler/test/goldens/s<n>-*.json` (17 files) by walking every
component's `props.entries` and counting entries with `type !== undefined`:

| golden | component | typed/total |
|---|---|---|
| s1-render-once | RenderOnce | 4/4 |
| s2-keyed-todo | KeyedTodo | 0/2 |
| s3-event-form | EventForm | 0/2 |
| s4-nested-list | NestedBoard | 0/2 |
| s5-branch-teardown | BranchBoard | 0/2 |
| s6-whitespace-text | WhitespaceBoard | 0/3 |
| s7-form-controls | FormBoard | 0/2 |
| s8-async-handlers | AsyncBoard | 2/2 |
| s9-boolean-attributes | AttrBoard | 0/2 |
| s10-todomvc | TodoMvc | 1/1 |
| s11-todomvc-advanced | TodoMvcAdvanced | 1/1 |
| s12-codex-clone | CodexClone | 1/1 |
| s13-hn-front | HnFront | 1/1 |
| s14-hn-item | HnItem | 2/2 |
| s15-habit-tracker | HabitTracker | 1/1 |
| s16-task-board | TaskBoard | 1/1 |
| s17-contacts | Contacts | 1/1 |

Totals: 17 goldens, 17 components, 30 entries, 15 typed / 15 untyped.
**Per-component all-or-nothing: TRUE** — ZERO mixed components. Ten goldens
fully typed; seven (S2–S7, S9) fully untyped at 0 of 15 entries. (This agrees
with T006's "10 of 17", but was re-derived, not inherited.)

**Is the `!typed` branch live?** Measured against the shipped derived tree, not
reasoned: `grep "defineProps(\["` over `packages/frameworks/vue/generated/`
matches S2–S7, S9 (7 scenario files) plus `generated-composition/M1-panel.vue`;
`defineProps({` matches the other NINE emitted scenario files (S1, S8,
S10–S13, S15–S17 — the tenth fully typed golden, S14, is VUE_UNBUILT, refused
with a recorded reason, so vue's built corpus is 16 of the 17 goldens). So **BOTH branches are
LIVE**: the `!typed` branch prints the shipped array form for seven scenarios
plus M1-panel. The only part of the old comment that remains a guard is the
PARTIAL-annotation case, which has zero corpus instances (zero mixed
components). T006's liveness claim is therefore CONFIRMED BY INDEPENDENT
MEASUREMENT (golden walk + derived-tree grep), not inherited.

Type kinds present (for site 4 below): the corpus's ONLY `TSBooleanKeyword`
prop entry is RenderOnce's `visible`. S8 carries `ready: TSTypeReference` +
`onTrace: TSFunctionType`; S14 carries `parent: TSStringKeyword` + `depth:
TSNumberKeyword`; every whole-app golden carries `onTrace: TSFunctionType`.

## 2. Corrections made (verify 1–3)

All four edits are comments plus the ONE named runtime-message fragment. No
logic, no control flow, no emitted byte changed (proof: section 4).

1. `packages/frameworks/vue/src/emitter/index.ts` ~1202 — replaced
   "MEASURED at the time of writing … (RenderOnce 4/4, the other seven
   scenarios 0/15) … a guard against a corpus that changes, not a live split"
   with a RE-MEASURED 2026-08-01 @ 602e49c record: all-or-nothing still TRUE,
   split now 10 fully typed vs 7 fully untyped, BOTH branches LIVE, only the
   partial case remains a guard.
2. `packages/frameworks/vue/src/gate/index.ts` ~1301 comment — parenthetical
   "(RenderOnce 4 of 4 typed, the other seven goldens 0 of 15)" replaced with
   the same dated measurement (ten of seventeen fully typed, 15 of 30 entries,
   other seven 0 of 15, zero mixed).
3. `gate/index.ts` ~1332 message — ONLY the counted fragment
   "(RenderOnce 4 of 4; the other seven goldens 0 of 15)" became
   "(re-measured 2026-08-01: ten of the seventeen goldens fully annotated, 15
   of 30 entries, zero mixed; the seven others 0 of 15)". Test-pinned
   substrings preserved verbatim and re-proven: `defineProps() in its
   type-argument form`, `type: Boolean, required: true`, `undefined to false`,
   `Missing required prop` — `vitest run --config vitest.node.config.ts
   test/gate.test.ts` = 47/47 passed.
4. `gate/index.ts` ~1314 comment (FOUND BY MY SWEEP, same family) — "it lands
   on the ONE corpus component that could take the sugar today" was true only
   in the RenderOnce-alone era. Corrected: RenderOnce still carries the
   corpus's ONLY Boolean-typed prop (`visible`), so the Boolean-casting deltas
   still land on it, but it is now one of TEN fully annotated components the
   narrowing would admit.

## 3. Sweep of both files, my own count (verify 4)

Multi-line sweep of both allowed src files for `queued`, `eight
scenario(s)/goldens`, `the other seven`, `seven scenarios/goldens`, `0/15`,
`0 of 15`, `4/4`, `4 of 4`, `fifteen`, `seventeen`, `sixteen-scenario`,
`RenderOnce`, `ONE corpus`. **My count of live same-family sites: FOUR** — the
three the card named plus gate/index.ts ~1314 ("the ONE corpus component"),
all four corrected above. Everything else classified:

- emitter:82 "EMPTY for fifteen of the seventeen scenarios - only S11 and S12
  name one" — CURRENT and TRUE: measured, only `generated/S11.vue` and
  `S12.vue` carry `globalThis` shim consts; 17 = golden corpus (vue builds 16,
  S14 recorded unbuilt).
- emitter:147–150 "MEASURED at 127a75b … all eight goldens" — DATED historical
  record. Not touched.
- emitter:1883–1894 "RE-DERIVED at 81be833 … eight occurrences … 'all twelve
  existing goldens' was written at 5ca20c7" — DATED + QUOTED historical. Not
  touched.
- gate:128 "THE LISTS SHRANK FROM EIGHT IDS TO SIX" — historical narrative of
  a landed change. Not touched.
- gate:1155–1199 progression comments ("EIGHT -> TWELVE", "Eighteen ->
  NINETEEN", "Nineteen -> TWENTY") — dated per-scenario progression records
  attributed to prior boards/tasks. Not touched.
- gate:1209 (v-model message) and gate:1274 (defineModel message) — current
  sixteen-scenario-era figures, cross-checked: 1274's "TWENTY-EIGHT printed
  entries" = 30 golden entries − S14's 2 (vue builds 16 scenarios), consistent
  at HEAD. One drift RECORDED, NOT REACHED: 1274's domain wording "every
  PropDestructuringEntry propsDeclaration() prints into defineProps([...])"
  predates the object form — ten components now print `defineProps({...})`.
  That is sixteen-scenario-era phrasing, not this card's family, and it is not
  the named message fragment, so it stays for the PM to card if wanted.
- Outside allowed_files: nothing reached.

## 4. Machine gates (verify 5–7)

- START baseline measured MYSELF: my two edited files copied aside BY NAME to
  scratchpad, `git checkout --` by name (no stash), `pnpm check` = **261**
  (exit 6). Edits restored, `pnpm check` = **261**, DELTA 0.
- `pnpm test`: **1 failed | 1506 passed (1507)** — the single failure is the
  foreign ARM B (`packages/compiler/test/package-inventory.test.ts`,
  peer-suffix key for @markless/core, owner's dirty lock/workspace). Passed
  count UNCHANGED vs T006's recorded baseline (1 failed | 1506 passed).
- vue gate tests alone: 47/47 passed (proves message-substring preservation).
- `pnpm e2e` RUN ALONE: PASS, "Three-way: 6 demos x 9 scenarios, all
  observations equal".
- `pnpm lint`: 0 warnings, 0 errors on 558 files.
- `pnpm check:citations`: clean over 4 watched docs / 17 watched source / 709
  swept.
- Derived trees: shell array of ALL 14 `generated*` trees
  (`{react,solid,qwik,svelte,vue,angular}/{generated,generated-composition}` +
  react/solid `generated-persistence`), each asserted to exist and be
  non-empty (17/3/17/3/17/10/1/17/10/1/16/2/16/2 files), then
  `git diff --exit-code -- "${trees[@]}"` CLEAN, `git status --short` over the
  same array EMPTY. No wildcard pathspec used.
- Owner dirt fingerprints, START and FINISH, `shasum -a 256`, whole output
  LINES sorted: `pnpm-lock.yaml` f326d314…, `pnpm-workspace.yaml` aeb7edc1…,
  website tree digest f936e169… over 116 files — IDENTICAL both ends, paths
  untouched.
