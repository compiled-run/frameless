# T008 — 12b domain phrase corrected to name BOTH propsDeclaration forms

Worker receipt evidence. HEAD at start: `861aff9`. Date: 2026-08-01.

## 1. My own measurement (verify 1) — NOT inherited

**Both forms print in the shipped tree.** Measured by grep over
`packages/frameworks/vue/generated/`:

- ARRAY form `defineProps([...])`: S2, S3, S4, S5, S6, S7, S9 (7 scenario
  files) plus `generated-composition/M1-panel.vue` — e.g. S2 ships
  `const props = defineProps(['seed', 'onTrace']);`.
- OBJECT form `defineProps({...})`: S1, S8, S10, S11, S12, S13, S15, S16, S17
  (9 scenario files) — e.g. S1 ships `defineProps({ label: { type: String,
  required: true }, ... })`. The object entries are NOT string literals.

**Figures re-derived from the compiler goldens by my own script** (walk every
`components[].props.entries` over `packages/compiler/test/goldens/s<n>-*.json`):
17 goldens, 30 entries, 15 typed / 15 untyped, 9 distinct first-segment names
over all 17. Subtracting S14 (recorded VUE_UNBUILT in
`test/unbuilt-scenarios.ts`, the same subtraction `scenarioGoldens` makes):
**16 built scenarios, 28 printed entries (13 typed + 15 untyped), 7 distinct
names** (`label, multiplier, visible, onTrace, seed, initial, ready`). So the
message's "TWENTY-EIGHT printed entries spanning seven distinct prop names" and
"sixteen-scenario corpus" are the instrument WORKING — spelled(28)/spelled(7)/
spelled(16) derived-asserted by `expectPrintedPropFigures`. NOTE: the card said
"15 typed entries print into the OBJECT form"; measured, 15 typed entries EXIST
but only 13 PRINT — S14's 2 are refused with the whole scenario.

**Fragments of the defineModel message that gate.test.ts asserts** (my own
enumeration):

- DERIVED (`expectPrintedPropFigures`, gate.test.ts ~:353): `TWENTY-EIGHT
  printed entries spanning seven distinct prop names`; `sixteen-scenario
  corpus`. Also driven RED by the CALIBRATION row against a planted corpus
  (`TWENTY-NINE printed entries`).
- LITERAL pins ("MUTATION: rejects defineModel" row): `Worked example 12b`,
  `mergeModels`, `Modifiers`, `prop:props`, `writable=false`, `FAIL outranks
  DEFERRED`.
- EXCLUSIVITY ("THE SPLIT" row): `mergeModels` appears in EXACTLY this message;
  this message must NOT contain `onTraceOnce`, `silent no-op`,
  `NEED_HYDRATION`; after stripping the `Emitted Vue source calls
  defineModel(). ` prefix the grounds must stay distinct from the other two
  limbs. (`denied at Gate 2, which it PASSES` pins the 12a TEMPLATE message,
  not this one.)
- The `derivePrintedPropEntries` doc comment itself: asserted by NOTHING — it
  is a comment; only its derivation code below it is load-bearing, and that
  code is untouched.

## 2. Corrections (verify 2)

Two sites, exactly the two the card named. No logic, no control flow, no
derivation, no assertion, no emitted byte changed (proof: section 4).

1. `packages/frameworks/vue/src/gate/index.ts` :1274 (shipped defineModel
   message) — ONLY the G4 domain phrase changed: "the domain is every
   PropDestructuringEntry propsDeclaration() prints into defineProps([...]);"
   became a dated measured record naming BOTH live forms (MEASURED 2026-08-01
   at 861aff9: array form for the seven fully-untyped scenarios, object form
   for the nine fully-typed ones this lane builds, with the array-only phrasing
   noted as dating from the array-only era). Every fragment in section 1
   survives verbatim — re-proven by the 47/47 run below.
2. `packages/frameworks/vue/test/gate.test.ts` ~:290 — ONLY the doc comment
   above `derivePrintedPropEntries` changed, the same dated measured record;
   also corrects the comment's "prints as a string literal" (true only of the
   array form — the object form prints `name: { type, required }` options).
   The derivation code and every assertion untouched.

## 3. Sweep of both files, my own count (verify 4)

Multi-line sweep of both allowed files for `defineProps([...])`,
`defineProps({`, `string literal`, `array form`, `object form`, `prints as`,
`prints into`, `propsDeclaration`. **My count of live same-family sites: TWO**
— the two the card named, both corrected. Everything else classified:

- gate/index.ts :26–30, :1307–1310, :1336 — "the array form compiles to
  props: ['label', ...] while the type-argument form compiles to props: {...}"
  is a DIFFERENT claim: what vue@3.5.40 compiles AUTHORED macro forms to,
  T007's dated (2026-08-01) re-measured no-typed-props records. Not touched.
- gate.test.ts :317 comment "`propsDeclaration()` prints `entry.path[0]` and
  throws on a longer path" — VERIFIED TRUE FOR BOTH BRANCHES against
  emitter/index.ts propsDeclaration (:1180–1232): both branches print
  `names[i]` = `entry.path[0]` and the length!==1 throw precedes the branch.
  Not rot.
- Outside allowed_files, RECORDED NOT REACHED: none needing correction found —
  emitter/index.ts :1196–1210 already names both forms (T007's dated record).

## 4. Machine gates (verify 3, 5–7)

- START baseline measured MYSELF: `pnpm check` run BEFORE my first edit =
  **261**. After edits = **261**, DELTA 0.
- vue gate tests alone (`pnpm vitest run --config vitest.node.config.ts
  test/gate.test.ts` from packages/frameworks/vue): **47/47 passed** with the
  edit in place.
- `pnpm test`: **1 failed | 1506 passed (1507)** — the single failure is the
  foreign ARM B (`packages/compiler/test/package-inventory.test.ts`). Passed
  count UNCHANGED vs T007's recorded baseline.
- `pnpm e2e` RUN ALONE: "Three-way: 6 demos x 9 scenarios, all observations
  equal".
- `pnpm lint`: 0 warnings, 0 errors on 558 files.
- `pnpm check:citations`: clean over 4 watched docs / 17 watched source / 709
  swept.
- Derived trees: shell array of all 14 `generated*` trees, each asserted to
  exist and be non-empty (17/10/1/17/10/1/17/3/16/2/16/2/17/3 files), then
  `git diff --exit-code -- "${trees[@]}"` CLEAN and `git status --short` over
  the same array EMPTY. No wildcard pathspec.
- Owner dirt fingerprints START and FINISH (`shasum -a 256`): pnpm-lock.yaml
  f326d314…, pnpm-workspace.yaml aeb7edc1…, website tree f936e169… over 116
  files — IDENTICAL both ends, paths untouched. `git status --short` at FINISH
  shows only my two files modified beside the owner's three paths.
