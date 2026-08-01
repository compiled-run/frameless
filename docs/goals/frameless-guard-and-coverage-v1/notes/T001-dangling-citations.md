# T001 - the dangling-citation sweep, and why the card's named hole is not there

**Status: BLOCKED, with the measurement delivered. No byte of `scripts/check-citations.mjs` or
`packages/compiler/test/citations.test.ts` was changed.**

Measured at HEAD `d7f3188`. Every number below is this card's own, taken with the guard's own
exported `scanText`, `commentsOnly`, `sweptSourceFiles`, `WATCHED` and `WATCHED_SOURCE`.

---

## 1. THE CARD'S PREMISE IS FALSE, AND IT WAS FALSIFIED THREE WAYS

The card, the charter and `state.yaml` all state the same diagnosis:

> A citation to a path that does not exist is silently ruled NOT-FIRST-PARTY and escapes every
> ruling [...] The hole is at `scripts/check-citations.mjs:830` - `resolvesInRepo` calls
> `existsSync` ONLY TO CLASSIFY.

**It does not escape every ruling. It is already a violation, and the guard already exits 1.**

### 1a. Read the fall-through in `classify`

`resolvesInRepo` returning `false` does not end the ruling. Control falls past it to
`foreignRepositoryRuling`, and then to a final `return` whose verdict is **`violation`**, kind
**`unclassified-path`**. The existing prose above `THIRD_PARTY_TARGETS` says so in as many words:

> Anything that resolves to no repository file and matches nothing here FAILS as unclassified -
> this list cannot grow silently.

### 1b. The PM's exact plant, re-run, FAILS

Planted the card's own token in `scripts/demo.mjs`, in a comment:

```
// PM PROBE: see packages/compiler/src/totally-not-a-real-file.ts:42 for the shape.
```

`pnpm check:citations` → **EXIT 1**, naming the firing site:

```
scripts/demo.mjs:3:18  packages/compiler/src/totally-not-a-real-file.ts:42
    unclassified-path: packages/compiler/src/totally-not-a-real-file.ts resolves to no file in
    this repository and matches no ruling in THIRD_PARTY_TARGETS.
```

Restored byte-identically and re-ran: **EXIT 0**.
`scripts/demo.mjs` sha256 `cb452208aa77219489cb3f92ce4f7d629a37494b132af4b7a45e8d6e7d095898`
**before and after** — identical, `git diff` clean.

### 1c. The PM's exit 0 is explained, and the explanation is RULING 8 WORKING

The same token survives or is blanked depending on where it sits, because `commentsOnly` is a
lexer and code is not prose:

| where the token sits | survives `commentsOnly` | violations |
| --- | --- | --- |
| in a `//` comment | yes | **1** |
| in a string literal | no (blanked) | 0 |
| in a template literal | no (blanked) | 0 |
| as bare code | no (blanked) | 0 |

A plant placed in code or in a string reads exit 0 **because ruling 8 deliberately refuses to read
code as a citation** - the property its doc comment calls load-bearing ("a string literal, an
import specifier and a path built at runtime are NOT citations"). That is the instrument working,
not a blind spot. This is the most likely explanation of the PM's measurement.

**Consequence: verify item 2 - "the fix is classify-then-fail, not classify-then-skip" - describes
behaviour the guard already has. Implementing it is a no-op.**

---

## 2. THERE IS A REAL RENAME/DELETE BLIND SPOT. IT IS THE OPPOSITE CLASS, AND IT IS BIG

The guard emits a citation only for a **path plus an ordinal**, a **bare ordinal**, or a **comma
continuation**. A path mentioned **without** an ordinal is used only as an antecedent for a
following bare ordinal (`PATH_MENTION` feeds `antecedent`); it is **never itself classified**.

Measured:

| probe | violations |
| --- | --- |
| `// see packages/compiler/src/gone.ts:42` (dangling, WITH ordinal) | 1 `unclassified-path` |
| `// see packages/compiler/src/gone.ts` (dangling, NO ordinal) | **0** |
| `The emitter lives in packages/frameworks/react/src/emitter/renamed-away.ts today.` | **0** |

**This is the true rename/delete blind spot, and it is one the guard's own campaign created.** Five
cards (T053-T057) drove authors to *drop ordinals and name symbols instead*. The shape they were
driven **into** - a bare path with no ordinal - is precisely the shape nothing checks. So the hole
does widen with every rename, exactly as the card argues; the card just points at the wrong line.

### The population, measured three ways over the guard's own surfaces

Scanning all 4 watched documents + 17 watched source files + 610 swept files (1,239 path-shaped
mentions), counting mentions that resolve to no file, under three increasingly generous models of
how a reader resolves a shorthand path:

| resolution model | distinct paths | sites |
| --- | ---: | ---: |
| repo-root only | 280 | **753** |
| + relative to the citing file's own directory | 227 | **573** |
| + walk every ancestor dir, + apply `THIRD_PARTY_TARGETS` | 173 | **374** |

Restricted to the **inner ring** where ruling 1 calls citations LIVE, under the most generous model:

| ring | mentions | distinct non-resolving | sites |
| --- | ---: | ---: | ---: |
| `WATCHED` (4 documents) | 205 | 59 | **73** |
| `WATCHED_SOURCE` (17 files) | 192 | 25 | **45** |
| **inner-ring total** | 397 | 84 | **118** |

**My own dangling-citation count, stated plainly: 0 dangling *citations* (the ordinal-bearing class
the card names - the guard already fails them all), and 374 dangling ordinal-less *path mentions*
repo-wide / 118 in the inner ring (the class the card does not name).**

### Ruling the population BY CLASS, since it cannot be ruled by name at this size

The 84 distinct inner-ring paths are overwhelmingly **not** stale citations. Named specimens:

- **Shorthand basenames** - the repo's normal register. `DEFECTS.md` (7 sites), `build.ts` (2+1),
  `metamorphic.test.ts`, `enriched-ir.test.ts`, `regenerate.ts`, `emitted-typecheck.test.ts`,
  `parse-emitted.test.ts`, `estree.ts`, `compare.ts`. All resolve for a human; none resolves as a
  path. Failing these would demand rewriting the repository's entire citation style.
- **Package-relative** - `test/gate.test.ts` (4), `src/emitter/index.ts`, `src/gate/index.ts`,
  `test/unbuilt-scenarios.ts`, `test/toolchain.test.ts`, `notes/T005-refs.md` (5),
  `notes/T006-effects.md` (5), `notes/T020-conditional-behavioural.md`. Correct relative to the
  package or board root the author was standing in.
- **Derived artifacts that a clean checkout legitimately lacks** - `generated/S1.tsx`,
  `generated/S14.vue`, `generated/S14.svelte`, `generated/async-with-await.ts`,
  `generated-composition/M2-page.svelte`, `dist/server.mjs`, `dist/server.js`.
- **Deliberate specimen names that were never meant to resolve** - `X.tsx` (4 sites, in the react
  and solid emitters), `generated.tsx`, `generated.jsx`, `./M1-panel.vue`, `./M1-panel.svelte`,
  `S1.vue`, `P1.tsx`, `M1-panel.ts`, `C1-slot.ts`, `nested-then.jsx`, `nested-callback.jsx`.
- **Already correctly ruled third-party or foreign** - `lib.dom.d.ts`, `@tsrx/core/src/utils/dom.js`,
  `svelte/src/internal/client/runtime.js`, `ts-base.js`, `template-base.js`, and ruling 5's
  `packages/web/src/render.ts`, `packages/compiler/src/passes/public-render/template.ts` and
  `.../shared.ts` in `docs/report.md`.

Per the card's stop_if I have **ruled and reported** these and corrected **none**: every one sits
outside `allowed_files`, and "correcting prose outside allowed_files is another card."

---

## 3. WHY THIS CARD CANNOT SHIP THE FIX

Closing section 2 requires one of two moves, and the card forbids both:

1. **Hand-correct the sites.** 374 repo-wide / 118 inner-ring, every one outside `allowed_files`.
   Directly barred by stop_if.
2. **Exempt them by name.** The card requires each exemption to be *named*, *reasoned* and
   *existence-checked*. An existence-checked exemption list is definitionally impossible for this
   population: these paths are exempt **precisely because they do not resolve**, so an existence
   check on them fails by construction. And 84 entries whose reason is "this is shorthand" is not a
   ruling, it is the allowlist-widened-by-accident that the guard's header exists to prevent.

A third move - restricting the new detector to some smaller ring - is a **scope and taxonomy
decision** (which shorthand register the repository is allowed to keep) and belongs to the PM, not
to this Worker.

**Therefore no guard change was shipped, and per the card's own stop_if - "about to ship a guard
change WITHOUT a mutation showing your own tests RED" - no mutation proof is offered for a change
that does not exist. A mutation proof of an unchanged detector would be the vacuous ceremony this
board was written to catch.**

---

## 4. TWO GENUINE, NARROW HOLES FOUND ON THE WAY - RECORDED, NOT FIXED

Both are real and both are a *different* card, because each changes what ruling 4 means.

### 4a. A `THIRD_PARTY_TARGETS` **suffix** silently allows a dangling first-party-shaped path

`thirdPartyRuling` is consulted **before** `resolvesInRepo` and matches on suffix, so:

| probe | verdict |
| --- | --- |
| `// see packages/compiler/src/gone.ts:42` | violation `unclassified-path` |
| `// see packages/compiler/src/core.mjs:42` | **ALLOWED** - suffix `core.mjs` matched |

A first-party path that does not exist, inside `packages/`, is waved through because a dependency
bundle happens to share its basename. Ruling 5 was deliberately given whole-path matching for
exactly this reason ("why a suffix match would be a hole"); ruling 4 never was.

### 4b. `THIRD_PARTY_TARGETS` is the ONE exemption list with NO integrity check

Every other list is existence-checked in `integrityProblems`: `WATCHED`, `WATCHED_SOURCE`,
`NOT_YET_WATCHED` (both `path` and `directory`), `FOREIGN_REPOSITORY_TARGETS` (via
`foreignShadowProblems`), and `ANGULAR_COUNT_NOT_SCANNED` (via `angularCountIntegrityProblems`).
`THIRD_PARTY_TARGETS`'s 11 entries are checked by nothing, so a dependency upgrade that renames
`runtime-core.cjs.js` leaves a dead exemption that goes on allowing citations no reader can follow -
**the card's own "dangling exemption is the same bug one level up", sitting in the file already.**

This is the closest thing on the board to the card's stated intent and it is genuinely closeable,
but it needs a ruling first: the check must tolerate an absent `node_modules` (crew sandboxes have
none) or it will turn the guard red for the wrong reason, and scanning `node_modules` has a real
cost against the guard's current 0.7 s.

---

## 5. NEGATIVE CONTROLS - THE THIRD-PARTY BRANCH IS REACHABLE, NOT DEAD

Verify item 6, run at HEAD against the unmodified guard:

| probe | verdict | branch exercised |
| --- | --- | --- |
| `packages/compiler/src/build.ts:42` (exists) | violation `first-party-ordinal` | `resolvesInRepo` true |
| `/etc/nope/thing.ts:42` (absolute) | allowed `third-party` | `startsWith('/')` |
| `node_modules/x/gone.ts:42` | allowed `third-party` | `includes('node_modules/')` |
| `https://example.com/a/b.ts:42` (URL) | allowed | `PATH` lookbehind refuses after `//` |
| `the react package at v19` (bare name) | allowed (no match) | `PATH` requires an extension |
| `packages/compiler/src/core.mjs:42` | allowed `third-party` | `THIRD_PARTY_TARGETS` suffix - **see 4a** |

The third-party branch fires on four distinct inputs, so it is live.

---

## 6. STATE AT FINISH - NOTHING REGRESSED, NOTHING WAS DERIVED

`pnpm check:citations` counts, **BEFORE and AFTER identical**:

```
clean over 4 watched document(s), 17 watched source file(s) and 610 swept source file(s)
ruling 11 recompiled 9 wrapper components and 8 application routes ... in 15 file(s)
ruling 11 recompiled 7 six-lane applications and 6 corpus lanes and 8 corpus applications
```

Timing 0.72 s before, 0.72 s after. Sweep did not shrink.

All 20 derived trees asserted to exist and be non-empty first, then `git diff --exit-code` over a
**shell array** (no wildcard pathspec): **clean**.

Owner's three dirty paths, `shasum -a 256` sorting whole output LINES, START and FINISH identical:
`f326d314` / `aeb7edc1` / `f936e169` over 116 `website/` files.

---

## 7. WHAT THE PM SHOULD DECIDE

1. **Re-scope T001** onto the class in section 2, with an explicit ruling on which shorthand
   register the repository keeps, and `allowed_files` wide enough to correct what the new detector
   finds - or a decision that the register stays and the detector is scoped to *qualified* paths
   only (a path containing a `/` that starts at a real top-level directory), which is the one cut
   that could be small. **Unmeasured by me: I did not size that cut, because choosing it is the
   taxonomy decision above.**
2. **Card 4b separately** - it is small, real, matches the card's stated principle, and is the only
   item here that fits inside the original `allowed_files`.
3. **Note for T999:** oracle part 1 says "EVERY GUARD CHANGE IS PROVEN RED-CAPABLE". No guard
   change was made, so part 1 is vacuously satisfied for T001 and the audit should read it that way
   rather than as a delivered mutation proof.
