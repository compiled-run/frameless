# T005 — the suffix hole in ruling 4, and the exemption list nothing checked

Board: `frameless-guard-and-coverage-v1`. HEAD at start: `7c0e9a9`.
Allowed files: `scripts/check-citations.mjs`, `packages/compiler/test/citations.test.ts`,
this note.

This card was re-scoped out of T001, which was **correctly blocked** because its brief's
central premise was false. This note re-measures both surviving findings from scratch and
does not inherit a number from the card.

---

## 1. Both findings re-measured before anything was changed

### Finding 4a — CONFIRMED, and the isolation names the cause

The plant was applied to `scripts/demo.mjs` with a **marker-present assertion and a
no-op assertion around the substitution**, then confirmed by `grep`, precisely because
the PM's T001 measurement was vacuous for want of exactly that check.

| plant, at HEAD (`7c0e9a9`) | `pnpm check:citations` |
| --- | --- |
| `` // PLANT T005-A: see `packages/compiler/src/core.mjs:42` for the constraint. `` | **EXIT 0**, prints `clean` |
| the same line, one byte-run changed: `no-such-file.mjs` | **EXIT 1**, `scripts/demo.mjs:3:23`, `unclassified-path` |

`ls` and `git ls-files` agree: **no `core.mjs` is tracked anywhere in this repository**,
and `packages/compiler/src/` contains no `.mjs` file at all.

The two rows differ in nothing but the basename, so the cause is isolated. It is not the
detector, the lexer, the sweep or the ordinal shape. It is that `thirdPartyRuling` was
consulted **before** `resolvesInRepo` and matched on **suffix**, so the dangling path
collided with Qwik's published `core.mjs` and was ruled `allowed`.

`scripts/demo.mjs` was restored byte-identically. sha256
`cb452208aa77219489cb3f92ce4f7d629a37494b132af4b7a45e8d6e7d095898` **before and after**,
`git diff --exit-code` clean.

**This also confirms the T001 worker was right and the T001 card was wrong.** A dangling
first-party citation is *not* generally unchecked — the control row proves it fails as
`unclassified-path`. The hole is narrower and worse than the card described.

### My own suffix-matchable count: **11 of 11**

Every entry in `THIRD_PARTY_TARGETS`, not a sampled few. Each was probed with a
non-existent `packages/compiler/src/<suffix>` citation; all eleven were detected by the
regex and all eleven returned `verdict: allowed, kind: third-party`:

```
_debug_node-chunk.mjs                            core.mjs
_pending_tasks-chunk.mjs                         runtime-dom.cjs.js
_common_module-chunk.d.ts                        runtime-core.cjs.js
compiler.d.ts                                    dist/compiler-core.cjs.js
core-internal.d.ts                               svelte/src/internal/client/reactivity/props.js
                                                 src/compiler/utils/extract_svelte_ignore.js
```

So the blind spot was not one basename. **Any first-party file that is ever named
`core.mjs`, `compiler.d.ts`, `runtime-core.cjs.js` … can be renamed or deleted and its
citations go silently unchecked.** It widens with every entry added to the list.

### Finding 4b — CONFIRMED

`WATCHED`, `WATCHED_SOURCE`, `NOT_YET_WATCHED` and `FOREIGN_REPOSITORY_TARGETS` are all
checked in `integrityProblems`. `THIRD_PARTY_TARGETS` was the only one that was not — and
it was the one holding the hole.

---

## 2. Why the fix is ordering-plus-anchoring and **not** whole-path matching

The card offered "BY ORDERING OR BY WHOLE-PATH MATCHING". **Whole-path matching was
measured and rejected: it costs 15 live, correct citations.**

Ruling 4's citations are *deliberately abbreviated* — its own prose says "a citation must
name enough of the path to be recognised". Requiring whole paths would turn these red,
almost all of them in files this card may not edit:

| site | count |
| --- | --- |
| `docs/emitter-idiom-policy.md` (`@angular/common/types/_common_module-chunk.d.ts`) | 3 |
| `packages/frameworks/qwik/src/emitter/index.ts` (`dist/core.mjs`, `dist/core-internal.d.ts`) | 6 |
| `packages/frameworks/qwik/test/refs.test.ts` | 2 |
| `demos/angular-official/{scenarios.box.ts,src/dev-sink.ts}` (`fesm2022/core.mjs`) | 2 |
| `packages/frameworks/svelte/{src/gate/index.ts,test/gate.test.ts}` | 2 |
| **total** | **15** |

A fix whose price is fifteen true sentences is not a fix, and reaching into those files is
the boundary T001 was blocked on.

**What ruling 5 is actually doing is anchoring, and that transfers.** A suffix match is a
claim about a *tail*. A path that begins at a directory this repository tracks is not a
tail — it is a complete first-party path, and it must resolve. Measured over **all 41**
third-party-ruled sites in the repository: **0 are anchored**, because a published
artifact never lives under `packages/` or `demos/`.

| candidate rule | live sites it turns red |
| --- | --- |
| whole-path match (ruling 5's literal shape) | **15** |
| reordering alone | 0 — but it closes only the *existing-file* half, not the measured hole |
| **anchoring + reordering (shipped)** | **0** |

Reordering alone flips nothing today (no tracked file collides with the list), but it is
ruling 5's own written discipline and it closes the future case where such a file arrives.
Both were shipped.

### Ordering inside `classify`, and why ruling 5 must stay above ruling 12

```
path === null            -> unresolvable-bare-ordinal
absolute / node_modules  -> third-party
resolvesInRepo           -> first-party-ordinal        [MOVED UP: ruling 5's discipline, now ruling 4's]
FOREIGN_REPOSITORY       -> foreign-repository         [MUST precede ruling 12]
anchored, unresolved     -> dangling-first-party-path  [RULING 12, new]
THIRD_PARTY suffix       -> third-party
                         -> unclassified-path
```

All three `FOREIGN_REPOSITORY_TARGETS` are anchored at `packages/` — markless is laid out
like this repository, which is the entire reason ruling 5 exists. An anchor check placed
above ruling 5 would turn three correctly-ruled live citations red. This is pinned by a
test, not by a comment.

---

## 3. What integrity MEANS for `THIRD_PARTY_TARGETS`, and why

**The asymmetry:** every other list is checked with `existsSync` because it names a file
that *must* be here. These entries name **published third-party artifacts that must NOT
resolve here by design** — `core.mjs` is Qwik's, `runtime-dom.cjs.js` is Vue's. An
existence check would be exactly backwards and would fail on all eleven correct entries.
That is asserted as a test, not asserted in prose.

So integrity here is **the three ways an entry can be a ruling that rules nothing, or
rules something it must not**:

1. **It shadows a TRACKED file.** The direct counterpart of `foreignShadowProblems`, with
   the same argument: if a first-party file arrives that the suffix matches, the entry has
   silently stopped meaning "published artifact" and started exempting a live repository
   file. `classify` prefers the local file now, so this makes the collision *loud* rather
   than merely harmless. Checked against tracked files (ruling 10's discipline), so a
   scratch file cannot turn the guard red. **0 collisions today.**
2. **Ruling 12 would make it unreachable.** An entry anchored at a tracked directory —
   `suffix: 'packages/compiler/src/core.mjs'` — is refused before this list is consulted,
   so it is dead text that reads as a ruling. **This is the check that stops the hole being
   re-opened by the obvious wrong move**: meet a red dangling citation, exempt it, get a
   green run and a false record. It is also a `stop_if` on this card, now enforced by code.
3. **This file's own detector could never emit it.** A suffix the `PATH` regex cannot match
   end-to-end — a leading slash, a `../`, an extension outside `SOURCE_EXTENSIONS` — can
   never equal or end any citation produced. An exemption for a shape that cannot occur.

**Deliberately NOT checked, recorded rather than glossed:**

- *No anti-emptying check*, unlike `WATCHED.length === 0`. Emptying this list makes the
  guard fail 41 real citations, so it **fails towards red**. A check that can only fire
  after the suite has already gone red is decoration of a different kind.
- *No reachability check.* An entry matching nothing today is not a defect — it rules a
  shape that may be cited tomorrow, and demanding a live user would delete rulings for
  being obeyed.

---

## 4. Red-capability and mutation, for both fixes

Guard digests: fixed = `c0fe286998c24953b6fc3ea3148937d5a05a7ba0a5500f88b320b9c7fe521808`,
identical after every restore below.

### Red-capability

| plant | result |
| --- | --- |
| 4a: `packages/compiler/src/core.mjs:42` in `scripts/demo.mjs` | **EXIT 1**, names `scripts/demo.mjs:3:23`, `dangling-first-party-path` — the same plant exited 0 at HEAD |
| 4b: three defective entries in `THIRD_PARTY_TARGETS` | **EXIT 1**, 5 integrity problems, all three classes fire |

### Mutation — the point of the card

| mutation | `check:citations` | ported tests |
| --- | --- | --- |
| A: `isFirstPartyAnchored` → `false` | **EXIT 0**, prints `clean` and `agreed with the prose` | **6 RED** |
| B: `thirdPartyIntegrityProblems` → `[]` | **EXIT 0** | **4 RED** |

Both mutations reproduce the predecessor board's warning exactly: **a neutered detector
still prints "agreed with the prose" and exits 0.** Only the ported tests catch it.

Restored byte-identically after each; digest `c0fe2869…521808` every time.

---

## 5. Negative controls

- An abbreviated third-party citation (`core.mjs:15905`, `dist/core-internal.d.ts:2971`,
  `fesm2022/core.mjs:594`) still passes — ruling 4 is **bounded, not repealed**.
- Ruling 4's branch is **reachable, not dead**: 41 live citations in the watched set are
  allowed through it at HEAD, asserted as a test rather than assumed from a green run.
- An existing first-party path still fires as `first-party-ordinal`, not as dangling.
- An **unanchored** dangling path (`generated/S2.jsx`, `S2.vue`) keeps `unclassified-path`
  — ruling 12 is narrow.
- Ruling 5's three anchored markless paths still rule `foreign-repository`.

## 6. Effect on existing prose: NONE

Full verdict histogram over the watched documents, watched source and the 610-file sweep:

| | before (HEAD) | after |
| --- | --- | --- |
| `third-party` | 41 | 41 |
| `foreign-repository` | 3 | 3 |
| violations | 0 | 0 |

**Zero sites turn red**, so no enumeration or ruling of existing prose is owed and nothing
outside `allowed_files` was reached for.

One classification *kind* changes without any verdict changing: an **anchored** dangling
path that was reported as `unclassified-path` is now reported as
`dangling-first-party-path`, with a diagnosis that names the rename/delete instead of
advising the reader to add an exemption. Both were violations before and after. No
citation that was a violation became allowed — by construction, the only branches added
are violation branches placed above an allowed branch.

The 374 ordinal-less path mentions were **not touched and not reclassified**. They never
reach `classify` at all; `findCitations` emits them only as antecedents. That taxonomy
decision remains the owner's.

## 7. Deviation

`scripts/demo.mjs` is outside `allowed_files`. It was planted in and restored
byte-identically **three times** because verify items 1 and 4 mandate a plant that shows
`pnpm check:citations` passing at HEAD and failing after the fix, and **neither allowed
file is readable by the guard** — `scripts/check-citations.mjs` and
`packages/compiler/test/citations.test.ts` are both exempted by path under ruling 2 as
specimen text. This is the same boundary T001 hit and the PM accepted. sha256
`cb452208…d095898` identical before and after; `git diff --exit-code` clean; zero net
change. The permanent form of every plant lives in the test suite, driven off synthetic
fixtures in a temp directory.
