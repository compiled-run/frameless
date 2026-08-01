# T002 — extending the citation guard's sweep to `.svelte` and `.vue`

Board: `docs/goals/frameless-guard-and-coverage-v1`. HEAD at start: `b31601b`.
Files changed: `scripts/check-citations.mjs`, `packages/compiler/test/citations.test.ts`,
this note.

---

## 1. The measurement, taken first and taken myself

Every number below was re-measured at HEAD. None is copied from the card.

| quantity | my measurement | the card said |
| --- | --- | --- |
| tracked `.svelte` | **58** | 58 |
| tracked `.vue` | **41** | 41 |
| total component files | **99** | 99 |
| citation-shaped tokens they carry, over RAW TEXT | **0** | "will find real violations" |
| citation-shaped tokens they carry, under the shipped lexer | **0** | — |
| ruling-11 subject-noun mentions | **10** | — |
| ruling-11 violations | **0** | — |
| swept files BEFORE | **610** | 610 |
| swept files AFTER | **709** | must rise by the admitted count |

The rise is `709 − 610 = 99`, which is exactly the tracked component count.
Enumeration used `git ls-files` (tracked, not present) — the same source the guard
uses, cross-checked in the suite against an independent `git ls-files` call so that
"ruling 13 covers them" cannot be satisfied by the guard agreeing with itself.

Timing: `0.673 s` before, `0.69–0.71 s` after (three samples). The guard now reads
99 more files and 52,189 more characters of prose for roughly 25 ms.

### The 10 ruling-11 subject mentions, enumerated

| site | noun | fires? |
| --- | --- | --- |
| `demos/svelte-official/src/routes/habits/+page.svelte` | `six-lane applications` ×1 | no |
| `demos/vue-official/src/App.vue` | `six-lane applications` ×6 | no |
| `demos/vue-official/src/App.vue` | `application routes` ×2 | no — subject is scoped to the angular lane directory |
| `demos/vue-official/src/App.vue` | `wrapper` ×1 | no — same scoping, and see finding 3 |

All 10 sit inside comment prose (raw count 10, lexed count 10), so the lexer loses
none of them. None states a number that disagrees with a derivation.

---

## 2. What the sweep found: ZERO, and here is the proof

Verify item 3 required that a zero be proved rather than asserted. Three independent
lines of evidence:

**(a) An upper bound that cannot miss.** `findCitations` was run over the FULL RAW
TEXT of all 99 files — code, data, attributes, markup and prose alike. Raw text is a
strict superset of anything a lexer can retain, so a lexer cannot find a citation raw
text does not contain. Result: **0 citation-shaped tokens**. Independently
cross-checked with `grep -nE '[A-Za-z0-9_@.-]+\.(ts|tsx|js|jsx|mjs|cjs|vue|svelte|html|css|json|md|yaml|yml|tsrx):[0-9]'`
over the same 99 files: no match. The bare-ordinal grep matches only `'09:30'`-shaped
time literals, which `BARE_ORDINAL`'s `(?<![\w.:-])` lookbehind already refuses.

**(b) The instrument is red on these very files.** Plants in a real `.svelte` and a
real `.vue` file fire and name `file:line:column` — section 4. A zero from an
instrument that has been shown to fire on the same files is a measurement; a zero
from an untested one is nothing.

**(c) The zero is not vacuity.** The lexer recovers **52,189 non-space characters of
comment prose** from these 99 files that no ruling could read before. Mutation B
(section 5) shows that if that number went to zero the guard would go RED, not green.

**So: no violation was found, therefore none was ruled, therefore no exemption was
added and nothing outside `allowed_files` was reached for.** `classify` is byte-for-byte
unchanged; no exclusion list gained an entry.

---

## 3. Findings the card did not predict

### Finding 1 — the guard's own disclosure had rotted from 43 to 99

Ruling 10's doc comment stated `.vue/.svelte  43 files, ZERO`. Tracked today: **99**.
The ZERO still held; the FILE COUNT did not. This is the failure mode the whole guard
exists to prevent, sitting in the paragraph that argues for the guard, in the file
that is exempt from the guard by ruling 2. **The card's 58 + 41 = 99 was right and the
repository's own record was wrong**, which is the reverse of the usual direction and
worth saying plainly. Corrected in place.

### Finding 2 — `commentsOnly` was NOT length-preserving, and 12 tracked files proved it

`commentsOnly` built its blank canvas with `[...text]`, which splits by **code point**,
while every cursor in it (`text[index]`, `indexOf`) is a **UTF-16 offset**. The two
agree only while a file is entirely BMP.

**Twelve tracked files are not BMP** — every lane's S15 habit tracker carries 14 astral
characters — and for each of them `commentsOnly` returned a string **14 UTF-16 units
shorter than its input**:

```
demos/svelte-official/src/lib/emitted/HabitTracker.svelte  text 9492  lexed 9478  delta -14
packages/frameworks/react/generated/S15.tsx                text 11680 lexed 11666 delta -14
... 10 more, same delta
```

Consequences, both real:

- Its own doc comment claimed "line and column numbers are identical to the original
  file". For those twelve files that was **false**: any comment after the first emoji
  was written at a shifted offset, so a violation in it would have been reported at
  the wrong line and column. Nothing was red there, so nothing exposed it.
- This card's lexer **splices** `commentsOnly`'s output back into a component at the
  script island's true offset. Splicing a shorter string would have silently corrupted
  the geometry of four component files (the two `HabitTracker` components and the two
  `S15` goldens).

Repaired with `blankLike`, which indexes in UTF-16 units. Pinned by a test using an
astral fixture. This was not in the card and would have quietly damaged its own output.

### Finding 3 — `<style>` gets the CSS lexer, and "wrapper" shows why scoping matters

No tracked component file has a `<style>` block today, so the CSS branch is exercised
only by a synthetic fixture. It is shipped anyway rather than left as a hole: without
it, a `/* */` block in a future `<style>` island would be *silently unread*, which is
the exact class of gap this card closes. `//` is deliberately **not** a comment there,
because `url(https://…)` would otherwise swallow the rest of the line — asserted.

Related, and an argument for leaving ruling 11's angular subjects scoped to their
directory: `demos/vue-official/src/App.vue` says "The `<template>` **wrapper** is what
…", a completely different sense of the word. Widening `COUNTED_ANGULAR_SUBJECTS` to
all swept files would fire on it. Not widened.

---

## 4. Red-capability: plants in REAL `.svelte` and `.vue` files

Both plants are **guarded** — the runner asserts the plant is on disk and differs from
the original before believing any result, which is the check whose absence made an
earlier measurement on this project vacuous.

The primary plant is a **multi-line `<!-- -->` block whose first line carries no
citation** and whose citation sits on the **third** line. That is precisely the shape a
line-oriented stripper drops.

```
BASELINE exit=0

=== demos/svelte-official/src/routes/habits/+page.svelte
  sha256 BEFORE 30475f9d48cfa7a324564e9a13a84d1a05f990cb5ddd24d58564bf84677ea660
  [MARKUP <!-- --> continuation line] plantApplied=true exit=1
      NAMED: demos/svelte-official/src/routes/habits/+page.svelte:71:45  packages/compiler/src/build.ts:342
  [SCRIPT // comment]                 plantApplied=true exit=1
      NAMED: demos/svelte-official/src/routes/habits/+page.svelte:70:14  packages/compiler/src/schema.ts:266
  [SCRIPT code (negative control)]    plantApplied=true exit=0
  sha256 AFTER  30475f9d48cfa7a324564e9a13a84d1a05f990cb5ddd24d58564bf84677ea660
  RESTORED IDENTICAL: true

=== demos/vue-official/src/App.vue
  sha256 BEFORE 85ff8a8735139cdc0d152d0ca38bac78cb403a24dd1f7f3520ad5d228f9ee3a9
  [MARKUP <!-- --> continuation line] plantApplied=true exit=1
      NAMED: demos/vue-official/src/App.vue:553:45  packages/compiler/src/build.ts:342
  [SCRIPT // comment]                 plantApplied=true exit=1
      NAMED: demos/vue-official/src/App.vue:552:13  packages/compiler/src/schema.ts:266
  [SCRIPT code (negative control)]    plantApplied=true exit=0
  sha256 AFTER  85ff8a8735139cdc0d152d0ca38bac78cb403a24dd1f7f3520ad5d228f9ee3a9
  RESTORED IDENTICAL: true

FINAL exit=0
git status --short -- demos/ : CLEAN
```

The negative control is the other half: the same token planted in **code** inside the
same `<script>` leaves the guard at exit 0. The separation is the point.

The permanent form of all of this lives in `citations.test.ts` against **synthetic
fixtures in a temp dir**, asserting the firing line and column — never repository
prose, which a future card is free to change.

---

## 5. Mutation: the instrument shown to FAIL, three ways

Guard sha256 before and after all three: **`e79cd670a1b922f3c87833dfb99a9f725c2fde17af909f68928ca865b77af6c4`** —
identical, restored from a pristine copy.

| mutation | `check:citations` | ported tests |
| --- | --- | --- |
| **A — strips nothing** (`componentComments = (text) => text`) | **EXIT 0, prints "clean"** | **4 RED** / 146 pass |
| **B — strips everything** (returns blanks) | **EXIT 1** — ruling 13's anti-vacuity check names it: *"found comment prose in only 0 of 99 tracked component file(s)"* | 17 RED / 133 pass |
| **C — line-oriented stripper** (keep only lines that OPEN a comment) | **EXIT 0, prints "clean"** | **6 RED** / 144 pass |

A and C are the shape the card demanded: **a broken lexer that leaves
`check:citations` green while the suite goes red.** C is the stop_if this card names,
refuted by measurement rather than by warning.

B is the complementary direction and it is the one that proves the new
`componentSweepProblems` is not decoration: a lexer that returns blanks makes the
whole ruling vacuous, and the guard now refuses it out loud rather than printing
"clean". `sweepProblems` cannot see this — 99 files falling out of 709 leaves its
floor of 100 untouched.

Both integrity branches are also driven directly from the suite, because neither is
reachable by data while the file is correct (`COMPONENT_EXTENSIONS` is a subset of
`SWEPT_SOURCE_EXTENSIONS`, so no file list can make branch 1 fire).

---

## 6. What ruling 13 is

A single-file component is three languages in one file, so it gets three lexers,
dispatched in **one left-to-right scan** over regions:

- `<script>` → `commentsOnly`, unchanged, spliced back at its true offset. Same lexer,
  same rulings, same reporting as every other source file.
- markup → `<!-- -->`, terminator-driven, **not** line-driven.
- `<style>` → `/* */` only.

One scan is what makes the nesting honest for free: `<script>` inside a markup comment
is comment text, and `<!--` inside a script string is not a comment. Two independent
passes get the first double-counted and the second wrong. Both asserted.

Geometry is preserved exactly, so a violation is reported where a reader will find it.

**It is a tightening, like every widening before it.** `classify` untouched, no
exclusion added, no citation that was a violation becomes allowed.

---

## 7. Recorded, NOT reached for

Nothing here was fixed by this card. All of it sits outside `allowed_files`, or
outside a Worker's authority, or both.

1. **`.svelte`/`.vue` are the ONLY container ruling 10 lists that is now closed.**
   `.tsrx` (62 files), `.html` (13), `.yaml`/`.yml`, `.json` (5 files, 62 tokens) and
   `.md` (93 of 200 files, 1214 tokens) remain unswept, each needing its own ruling and
   its own lexer. Those figures are ruling 10's; I did **not** re-measure them, and
   given finding 1 the next card should assume they have rotted too.

2. **The workaround this card was written to make unnecessary is still in the record.**
   Ruling 11 recorded that the svelte and vue route prose "were corrected by hand and
   deliberately state NO count, because a number written where no check can read it
   looks guarded and is not." That reason is now gone — those files are lexed, scanned
   and measured clean, so a count stated in them *would* be checked. Putting the counts
   back changes the RECORD, not the CHECK, and is a stop_if here. **A follow-up card.**

3. **Two position claims ruling 11's regex cannot see, in the two lanes it just gained.**
   `demos/svelte-official/src/routes/habits/+page.svelte:8` — "It is a SIX-LANE
   APPLICATION, and the FIRST that was designed to be so" — and the same sentence at
   `demos/vue-official/src/App.vue:352`. `six-lane applications` has
   `positionIsDerivable: false`, but the ordinal FOLLOWS the noun in a separate clause,
   and the position rule requires `<ordinal> … <noun>`. **Not reached for, and the regex
   was deliberately NOT widened**: matching an ordinal after the noun would fire across
   ordinary prose, which is the "cries wolf" failure ruling 9 declined to risk. Whether
   "the first that was DESIGNED to be so" is a forbidden position claim or a true
   statement about design intent is a ruling, and rulings are not a Worker's.

4. **The 374 ordinal-less path mentions are untouched.** They never reach `classify`.
   Owner-level taxonomy, per the stop_if.

---

## 8. Gates

| gate | result |
| --- | --- |
| `pnpm check` START | **261** (measured myself, own paths stashed by name) |
| `pnpm check` END | **261** — delta **0**, as predicted |
| `pnpm test` START | 1490 passed, **1 failed** |
| `pnpm test` END | **1506 passed**, **1 failed** — rise of **exactly 16**, the tests added |
| `pnpm vitest citations.test.ts` | 134 → **150** |
| `pnpm e2e` (RUN ALONE) | **PASS — 6 demos × 9 scenarios**, all observations equal |
| `pnpm lint` | **0 warnings, 0 errors**, 558 files |
| `pnpm check:citations` | exit 0; **4 / 17 / 709**; the sweep did not shrink |
| derived trees | **21 trees asserted to exist and be non-empty FIRST**, then `git diff --exit-code` with a **SHELL ARRAY and no wildcard pathspec** → no diff |
| `git status --short` | only the two files this card owns, plus the owner's three |
| owner fingerprint START | `f326d314` / `aeb7edc1` / `f936e169`, **116** website files |
| owner fingerprint FINISH | identical, whole sorted output lines diffed |

The one `pnpm test` failure is the pre-existing foreign arm (`package-inventory.test.ts`
peer-suffix), unchanged in count and identity.
