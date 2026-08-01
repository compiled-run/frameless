# T003 — the drag, measured in a second engine, per lane

**Result in one line: FIREFOX AGREES WITH CHROMIUM IN ALL SIX LANES, ON EVERY
READING.** The five-lane/one-inert split is the lane's, not the engine's. Five
consecutive cards recorded a second engine as unmeasured; it is measured here.

Everything below was driven by this card at HEAD `377a1a4`, in **one harness**,
in **one session**, against **Chromium 145.0.7632.6** and **Firefox 146.0.1**
(Playwright 1.58.2, `firefox-1509` and `chromium-1208` already present in
`~/Library/Caches/ms-playwright` — **no browser and no dependency was
installed**).

---

## 1. The harness, and why it was proved POSITIVE before any negative was believed

The stop_if is explicit: *"a broken harness reports 'nothing moved' everywhere —
that exact false negative already happened on this repo."* So the order was:

1. **Boot svelte alone** — the lane the record says drags in Chromium.
2. **Run the Chromium arm first.** It moved the card and the card stayed. The
   instrument is therefore known to be able to report a POSITIVE before a single
   Firefox result was read.
3. Only then was Firefox run, on the same lane, in the same harness.

Each lane was booted **one at a time** through its **own official dev script**
(`pnpm --dir <lane> dev|start`), on a private port block **5273–5278** chosen so
nothing could collide with a demo the owner might be running on 5173–5178. The
spawn/shutdown shape is copied from `scripts/demo.mjs`: detached process group,
`SIGINT` to `-pid`, re-probe the port, `SIGKILL` to `-pid` only if it is still
answering, re-probe again. **Nothing was ever `pkill`ed.** Every PID is recorded
in §6 and every port was confirmed free afterwards with `lsof`.

Per lane, per engine, **three gestures**, each from a **fresh context on a fresh
page**:

| gesture | what it is | why |
| --- | --- | --- |
| `dragTo-todo` | Playwright `locator.dragTo(t1 → [data-cards="todo"])` | the shape the card names as working |
| `rawmouse-todo` | `mouse.move` → `mouse.down` → **20 interpolated `mouse.move`** → `mouse.up` | the shape `board.css`, `README.md` and `DEFECTS.md` all say the original five-lane reading was taken with |
| `dragTo-sidebar` | `dragTo(t1 → [data-tb="sidebar"])` | **NEGATIVE CONTROL** — the sidebar is not a drop zone and must REFUSE |

Instrumentation, all **observation only** — nothing in any app was changed:

- a `MutationObserver` with `attributeFilter: ['data-dragging']` over
  `document.documentElement`, recording every card that ever reaches `'yes'`;
- **capture-phase** document listeners counting `dragstart` / `dragenter` /
  `dragover` / `dragleave` / `drop` / `dragend`, which is what separates *"the
  drag never started"* from *"the drag started and the drop was refused"*;
- full console and `pageerror` capture;
- card membership per column read from `[data-cards="<col>"] [data-card]`,
  snapshotted **before**, at **+0.12 s** and at **+1.42 s** after the gesture.

Viewport 1600×1000, matching the record.

---

## 2. THE RESULT, PER LANE AND PER BROWSER

"stayed" = `t1` was in `todo` at **+1.42 s**, not merely at +0.12 s. Both gesture
shapes agreed in every single cell, so they are reported together and their
disagreement count is stated instead: **0**.

| lane | engine | `t1` before | at +0.12 s | at +1.42 s | moved AND stayed | `data-dragging="yes"` seen | `[draggable="true"]` | `Invalid event handler property` |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| react | **chromium** | backlog | backlog | backlog | **NO — inert** | none | 9 | **3** |
| react | **firefox** | backlog | backlog | backlog | **NO — inert** | none | 9 | **3** |
| solid | chromium | backlog | todo | todo | **yes** | `t1` | 9 | 0 |
| solid | firefox | backlog | todo | todo | **yes** | `t1` | 9 | 0 |
| qwik | chromium | backlog | todo | todo | **yes** | `t1` | 9 | 0 |
| qwik | firefox | backlog | todo | todo | **yes** | `t1` | 9 | 0 |
| svelte | chromium | backlog | todo | todo | **yes** | `t1` | 9 | 0 |
| svelte | firefox | backlog | todo | todo | **yes** | `t1` | 9 | 0 |
| vue | chromium | backlog | todo | todo | **yes** | `t1` | 9 | 0 |
| vue | firefox | backlog | todo | todo | **yes** | `t1` | 9 | 0 |
| angular | chromium | backlog | todo | todo | **yes** | `t1` | 9 | 0 |
| angular | firefox | backlog | todo | todo | **yes** | `t1` | 9 | 0 |

Card counts, which are the same statement in the other unit: `backlog` goes
**3 → 2** and `todo` goes **3 → 4** in the five dragging lanes in **both**
engines, and stays **3 / 3** in react in both. `progress` (2) and `review` (1)
never move. 3+3+2+1 = **9**, which is also the `[draggable="true"]` count in
every cell above.

### NEGATIVE CONTROL — the drop on the sidebar

| lane | chromium | firefox |
| --- | --- | --- |
| react | REFUSED — `t1` stays in `backlog` | REFUSED |
| solid | REFUSED | REFUSED |
| qwik | REFUSED | REFUSED |
| svelte | REFUSED | REFUSED |
| vue | REFUSED | REFUSED |
| angular | REFUSED | REFUSED |

**12 of 12 refusals.** And the control is not vacuous: in the five dragging
lanes it still fired `dragstart` **and** reached `data-dragging="yes"`, then
ended in `dragend` with **no `drop`**. The gesture happened; the drop zone
declined it. A harness that simply failed to drag would have shown no
`dragstart` either.

### The three react warnings, verbatim, in both engines

```
chromium  Invalid event handler property `%s`. Did you mean `%s`? onDragstart onDragStart
chromium  Invalid event handler property `%s`. Did you mean `%s`? onDragend   onDragEnd
chromium  Invalid event handler property `%s`. Did you mean `%s`? onDragover  onDragOver
firefox   Invalid event handler property `onDragstart`. Did you mean `onDragStart`?
firefox   Invalid event handler property `onDragend`. Did you mean `onDragEnd`?
firefox   Invalid event handler property `onDragover`. Did you mean `onDragOver`?
```

Same three names, same count, both engines. The two spellings are a **Playwright
console-serialisation** difference (Chromium hands over the unformatted `%s`
template plus its arguments; Firefox hands over the interpolated string) and not
a react-dom difference — the arguments are identical.

### THE CHROMIUM CONTROL REPRODUCED THE RECORD EXACTLY

The card's stated baseline was *"five lanes drag and the card STAYS 1.3 s after
the drop; react is INERT with three verbatim 'Invalid event handler property'
errors; `[draggable=true]`=9 in ALL SIX."* **All three reproduced**, in my own
Chromium arm, in this session. That is what makes the Firefox column
interpretable.

### It is a MEASUREMENT, and it is read as one

Agreement is what entry 15's own diagnosis **predicts**: react's row fails on a
**binding name** (`onDragover` vs `onDragOver`), and a binding name is decided in
`react-dom`, not in the engine. So the result confirms the standing diagnosis
rather than the harness. **Had the engines disagreed that would have been a
result too — and not a defect in any framework.** Nothing here is read as one and
nothing is filed anywhere.

---

## 3. THE QWIK FLAKE — re-run, did not reproduce, NOT retired

`DEFECTS.md` records **one qwik drop lost in sixteen**, on the *first drop from a
fresh page*. The six-lane run above gives qwik **n = 1 per engine**, which is too
thin to write a row on. So that exact condition was re-run **12 further times per
engine** — fresh context, fresh page, first drop, nothing else.

| engine | landed | attempts (this card, that condition) |
| --- | --- | --- |
| chromium | 12 / 12 (**13 / 13** including the six-lane run) | first-drop-from-fresh-page |
| firefox | 12 / 12 (**13 / 13** including the six-lane run) | first-drop-from-fresh-page |

**This does not retire the recorded limit and is not written as if it did.** A
different harness in a different session cannot cancel another one's flake; two
readings that disagree are two readings. It is recorded beside the original in
`board-css/README.md`, not in place of it.

---

## 4. AN ERROR IN THE BRIEF, FOUND BY MEASUREMENT

> The card, verify item 1: *"`locator.dragTo` is the working shape — a previous
> card proved **raw `page.mouse.down/move/up` reports NOTHING MOVED IN ANY
> LANE**, including lanes that do drag, because Chromium does not synthesise
> HTML5 drag from raw mouse events."*

**FALSE at HEAD, in both engines, and the repository already said so.** The raw
`mouse.down` → 20 interpolated `mouse.move` → `mouse.up` gesture moved the card
and it stayed in **solid, qwik, svelte, vue and angular**, in **Chromium** and in
**Firefox** — 10 of 10 positive cells, identical to `dragTo` in every one. It was
also inert in react in both, identically. **`dragTo` and raw mouse disagreed on
exactly zero of the 24 gesture-cells run.**

Two independent things falsify the premise:

1. **My own measurement**, above, in both engines.
2. **The record.** `board-css/README.md`, `board.css` and `DEFECTS.md` *all
   three* say the original five-lane reading was taken *"with a real native mouse
   drag — mouse down on the card, twenty interpolated moves, mouse up; no
   synthetic `DragEvent` anywhere."* The shape the card calls proven-broken is
   the shape the shipped record is written from.

The mechanism is the ordinary one: **Playwright drives drag through the browser's
own drag machinery** (Chromium via CDP drag interception, Firefox via Juggler),
so `page.mouse.*` produces a genuine native HTML5 drag. `locator.dragTo` is a
convenience over the same path, which is exactly why the two agree everywhere.

**Consequence for this card:** none of the safety was skipped. The
prove-positive-before-believing-a-negative discipline was followed anyway, and it
is the right discipline — it just was not needed, because there was no negative
to believe. **Whatever the earlier "nothing moved in any lane" reading was, it
was not a property of raw mouse input at HEAD.** That earlier instrument is a
seventh-vacuous-instrument candidate and it is **recorded, not chased** — it is
not in this card's scope.

---

## 5. THE CLAIM SWEEP, MULTI-LINE, AND MY OWN COUNT

### The unit, stated before the number

A line-oriented grep is the wrong instrument twice over here, so two things were
fixed before counting:

- **Claims are JOINED across wrapped lines.** Comment leaders (`//`, `*`, `#`,
  `>`, `<!--`) are stripped and continuation lines are joined before matching.
- **Qualification is judged per BLOCK, not per sentence.** A comment paragraph
  names its engine **once** and then makes four readings off it. Counting
  sentences reports those four as unqualified and is simply wrong about the
  document. A **block** is a run of non-blank normalised lines.

A block counts as a **drag claim** when it asserts an **observed runtime outcome
of a drag gesture** — a card moving or not moving, a drop accepted or refused, an
attribute reaching the live DOM, a console warning appearing, a lane being inert.
It does **not** count when it is about what an emitter *prints*, what a fixture
*declares*, or a build-time a11y/type refusal: those are not browser readings and
have no browser to name.

### My own count

| | HEAD (`377a1a4`) | after this card |
| --- | --- | --- |
| live runtime-outcome drag **blocks** (excluding `docs/goals/` receipts) | 130 | 141 |
| …**naming an engine** | **7** | **53** |
| …**UNNAMED** | 123 | 88 |
| …of which are derived `board.css` lane copies | 30 | 6 |
| **UNNAMED DISTINCT SITES** | **93** | **82** |
| files carrying them | 50 | 50 |

For scale, the broad sentence-level sweep that this replaces reports **513**
drag-mentioning sentences repo-wide, **201** of them inside `docs/goals/`
receipts and **302** live and unnamed. That number is reported because it is what
a looser instrument gives, and it is **not** the number ruled on: most of those
sentences are emitter prose, code tokens, or a second sentence of a block whose
first sentence names the engine.

**11 distinct sites closed.** Every one of them was inside `allowed_files`.

### What is left inside `allowed_files`, ruled by name

Eight blocks in the three reachable files still do not name an engine, and
**every one is correctly silent** — there is no browser reading to attach:

| site | ruling |
| --- | --- |
| `demos/shared/board-css/board.css:726-729` | an **ABSENCE** claim — `class`/`style` lowering *"unmeasured in all six lanes"*. Nothing was measured, so there is no engine to name. |
| `demos/shared/board-css/README.md:107-111` | the same absence claim, stated in the README. |
| `docs/DEFECTS.md:1234-1243` | `aria-disabled` guidance. Contains `drop`ped, not a drag reading. |
| `docs/DEFECTS.md:1822-1826` | boolean **content attributes** silently dropped by serializers. Not a drag reading. |
| `docs/DEFECTS.md:1995-2002` | the per-lane `onKeyDown` **table**. Its immediately preceding block now reads *"was asked in chromium, and T003 re-asked the DRAG half of it in chromium AND firefox"* — a block-splitting artifact of the instrument, not an unqualified claim. |
| `docs/DEFECTS.md:2072-2077` | the `keydown` **inference** paragraph, which already says *"five lanes × `keydown` in a browser is unrun"*. Naming an engine there would be worse, not better. |
| `docs/DEFECTS.md:2137-2145` | svelte's a11y refusals — a **compile-time** refusal. No engine involved. |
| `docs/DEFECTS.md:2153-2165` | TodoMVC's dropped Escape-revert. Not a drag reading. |

Two further sites in `README.md` were **flagged rather than qualified**, because
qualifying them would mean writing a browser claim this card did not measure:

- the **live reference** reading (`[draggable]` is 0) — a third-party site, not
  re-taken by T003, now explicitly marked *"measured in one unnamed engine"*;
- the **`◀`/`▶` arrows** *"move a card in all six lanes"* — a **click**, not a
  drag, so T003 did not drive it. Marked as still single-engine.

### RECORDED, NOT REACHED — 74 distinct unnamed sites outside `allowed_files`

Grouped by file, with block line ranges at HEAD + this card's diff. **None was
touched.** Note the structure of the list: a large fraction is **one sentence**,
the page's own `.tb-note` — *"DRAG A CARD ONTO ANOTHER COLUMN — it works in
solid, qwik, svelte, vue and angular…"* — authored once in
`packages/compiler/test/fixtures/s16-task-board.tsrx` and **printed by six
emitters into twelve derived artifacts plus a golden**. Those 13 cannot be
hand-edited at all; they move only when the fixture moves and the corpus is
regenerated. **That is one authoring decision and one card, not 13.**

| file | sites | block line ranges |
| --- | --- | --- |
| `demos/angular-official/public/todomvc-app-css/frameless-supplement.css` | 1 | 274-280 |
| `demos/angular-official/src/app/app.routes.ts` | 2 | 255-271, 273-282 |
| `demos/angular-official/src/app/board-page.ts` | 1 | 47-50 |
| `demos/angular-official/src/emitted/TaskBoard.ts` | 1 | 100-131 |
| `demos/qwik/public/todomvc-app-css/frameless-supplement.css` | 1 | 274-280 |
| `demos/qwik/src/emitted/TaskBoard.tsx` | 1 | 327-386 |
| `demos/qwik/src/routes/board/index.tsx` | 1 | 32-38 |
| `demos/react-official/public/todomvc-app-css/frameless-supplement.css` | 1 | 274-280 |
| `demos/react-official/src/App.jsx` | 4 | 529-536, 538-544, 546-553, 563-566 |
| `demos/react-official/src/emitted/TaskBoard.tsx` | 1 | 305-359 |
| `demos/shared/todomvc-app-css/frameless-supplement.css` | 1 | 274-280 |
| `demos/solid-official/public/todomvc-app-css/frameless-supplement.css` | 1 | 274-280 |
| `demos/solid-official/src/App.jsx` | 2 | 388-394, 408-411 |
| `demos/solid-official/src/emitted/TaskBoard.tsx` | 1 | 304-359 |
| `demos/svelte-official/src/lib/emitted/TaskBoard.svelte` | 1 | 15-236 |
| `demos/svelte-official/src/routes/board/+page.svelte` | 2 | 12-21, 48-51 |
| `demos/svelte-official/static/todomvc-app-css/frameless-supplement.css` | 1 | 274-280 |
| `demos/vue-official/public/todomvc-app-css/frameless-supplement.css` | 1 | 274-280 |
| `demos/vue-official/src/App.vue` | 1 | 411-423 |
| `demos/vue-official/src/emitted/TaskBoard.vue` | 1 | 117-140 |
| `packages/compiler/src/build.ts` | 1 | 176-200 |
| `packages/compiler/test/citations.test.ts` | 1 | 1723-1732 |
| `packages/compiler/test/enriched-ir.test.ts` | 3 | 1846-2057, 2760-2769, 2897-2903 |
| `packages/compiler/test/fixtures/s14-hn-item.tsrx` | 1 | 163-187 |
| `packages/compiler/test/fixtures/s16-task-board.tsrx` | 9 | 11-15, 34-41, 62-75, 77-81, 133-140, 187-210, 258-265, 279-423, 565-634 |
| `packages/compiler/test/goldens/s16-task-board.json` | 1 | (one-line golden) |
| `packages/frameworks/angular/generated/S16.ts` | 1 | 100-131 |
| `packages/frameworks/angular/scripts/regenerate.ts` | 2 | 164-172, 174-184 |
| `packages/frameworks/angular/test/emitter.test.ts` | 2 | 599-682, 1144-1148 |
| `packages/frameworks/qwik/generated/S16.tsx` | 1 | 327-386 |
| `packages/frameworks/qwik/scripts/regenerate.ts` | 2 | 10-106, 123-136 |
| `packages/frameworks/qwik/src/emitter/index.ts` | 1 | 1052-1070 |
| `packages/frameworks/qwik/test/gate.test.ts` | 2 | 195-203, 847-873 |
| `packages/frameworks/react/generated/S16.tsx` | 1 | 305-359 |
| `packages/frameworks/react/scripts/regenerate.ts` | 2 | 7-104, 106-115 |
| `packages/frameworks/react/test/emitted-typecheck.test.ts` | 1 | 219-224 |
| `packages/frameworks/react/test/gate.test.ts` | 1 | 228-235 |
| `packages/frameworks/react/test/size.test.ts` | 1 | 261-418 |
| `packages/frameworks/solid/generated/S16.tsx` | 1 | 304-359 |
| `packages/frameworks/solid/scripts/regenerate.ts` | 2 | 7-104, 115-128 |
| `packages/frameworks/solid/test/emitted-typecheck.test.ts` | 1 | 407-414 |
| `packages/frameworks/svelte/generated/S16.svelte` | 1 | 15-236 |
| `packages/frameworks/svelte/scripts/regenerate.ts` | 2 | 124-141, 143-153 |
| `packages/frameworks/vue/generated/S16.vue` | 1 | 117-140 |
| `packages/frameworks/vue/scripts/regenerate.ts` | 2 | 138-146, 148-158 |
| `packages/frameworks/vue/src/gate/index.ts` | 2 | 1186-1215, 1266-1289 |
| `scripts/demo.mjs` | 3 | 56-144, 168-171, 678-720 |

The seven `todomvc-app-css/frameless-supplement.css` entries are **false
positives of my classifier** — *"the heading is …**drop**ped into view"* — and are
listed rather than silently filtered so the number can be checked.

**The single highest-value unreached site** is
`packages/compiler/test/fixtures/s16-task-board.tsrx`'s `.tb-note`, because it is
the only one of the 74 that a **user of the shipped page reads on screen**. It
says *"it works in solid, qwik, svelte, vue and angular"* and names no browser.
That claim is now **true in two engines** rather than one, so a card that
qualifies it would be writing something measured — but it is a `.tsrx` fixture,
a byte-length change there moves the checked-in golden, and it is outside
`allowed_files` twice over.

---

## 6. EVERY SERVER THIS CARD STARTED, AND HOW IT WAS STOPPED

| lane | port | PID | stop | port free after |
| --- | --- | --- | --- | --- |
| react | 5273 | 77807 | `SIGINT` to `-77807` | yes |
| solid | 5274 | 78214 | `SIGINT` to `-78214` | yes |
| qwik | 5275 | 78513 | `SIGINT` to `-78513` | yes |
| svelte (smoke) | 5276 | 77447 | `SIGINT` to `-77447` | yes |
| svelte | 5276 | 78830 | `SIGINT` to `-78830` | yes |
| vue | 5277 | 79149 | `SIGINT` to `-79149` | yes |
| angular | 5278 | 79457 | `SIGINT` to `-79457` | yes |
| qwik (repeat probe) | 5285 | 80040 | `SIGINT` to `-80040` | yes |

**No `pkill` was run, at any point, in any form.** The card warns that angular
leaves a child node process holding the port after a `SIGINT` to the pnpm
wrapper; **signalling the process GROUP (`kill -SIGINT -pid`) rather than the
wrapper avoided it** — angular's port was confirmed free on the first re-probe,
with no `SIGKILL` needed, and a final `lsof` over 5273-5278 and 5285 found
nothing listening. Ports **5173-5178** were confirmed empty before `pnpm e2e` and
were never used by this card at all.

---

## 7. THE RECORD, AFTER

- **`demos/shared/board-css/board.css`** — the shared sheet, edited; **the six
  lane copies were NEVER hand-edited**, they were re-derived by
  `demos/shared/copy-board-css.mjs`. Proved rather than asserted: three copies
  (react, svelte, angular) were **deleted** and re-derived, and all seven then
  matched. **ALL SEVEN SHARE ONE DIGEST:**
  `efb4c588aa6024c1d8abe12ea814e876842b020bcfad5cfede53d14d1a6b8bd9`.
- **`demos/shared/board-css/README.md`** — the five-lane table became a
  **per-lane per-engine** table with both browsers and both gesture shapes named,
  plus the qwik re-run and the two flagged single-engine readings.
- **`docs/DEFECTS.md`** — entry 15 gains a T003 blockquote naming both engines
  and every reading; the T008 amendment above it is now explicitly attributed to
  **chromium**; the summary-table row for entry 15 names all three prior arms as
  chromium and adds the second engine; and *"in six real browsers"* is
  disambiguated to **six real browser lanes, one engine** — the referent read off
  `docs/goals/frameless-app-axes-v1/notes/T005-board.md`, which describes a
  temporary `/dragprobe` route installed in six **shells**. This repository has
  used *"six real browsers"* to mean six lanes four separate times; in the one
  document that is about engines, that idiom was the whole problem.

---

## 8. GATES

| gate | result |
| --- | --- |
| owner fingerprint START / FINISH | `f326d314` / `aeb7edc1` / `f936e169`, **116** website files. Full sorted line output **`diff`-identical**. |
| `pnpm check` START (own 9 paths reverted to HEAD, then restored byte-identically) | **261** |
| `pnpm check` END | **261** — **delta 0**, as predicted |
| `pnpm test` | **1 failed / 1506 passed** — **exactly 1**, the foreign ARM B (`package-inventory`, a peer-suffix key in the owner's dirty `pnpm-lock.yaml`) |
| `pnpm e2e` RUN ALONE | **PASS — 6 demos × 9 scenarios**, ports 5173-5178 confirmed empty first |
| `pnpm lint` | 0 warnings, 0 errors, 558 files |
| `pnpm check:citations` | clean, **4 / 17 / 709**, re-run after **every** edit to `docs/DEFECTS.md` (5 times) and again at the end |
| derived trees | **24** trees asserted to **exist and be non-empty FIRST**, then `git diff --exit-code`, **shell array, NO wildcard pathspec** — clean, and **re-run after `pnpm e2e`**, still clean |

---

## 9. DEVIATIONS AND TENSIONS IN THE CARD, DISCLOSED

1. **The six lane copies of `board.css` are NOT in `allowed_files`, and verify
   item 5 orders them written.** *"EDIT `demos/shared/board-css/board.css` and
   RE-RUN the copy script … All seven must share ONE digest afterwards"* cannot
   be satisfied without writing six files the list omits. Compare T004 on this
   same board, whose `allowed_files` **does** list all seven `codex.css` copies.
   The card's own verify is followed; the omission is reported. Zero bytes were
   authored in any copy — every one is `copyFileSync` output.
2. **Verify item 7's "THIS CARD DERIVES NOTHING" is in tension with verify item
   5**, for the same reason. It is read as *the emitted/generated trees derive
   nothing*, which is the class every prior card on this board meant, and the 24
   trees in §8 are exactly those. The six `board-css` copies are reported as the
   **intended** derivation.
3. **The `pnpm check` START measurement was taken by copying my nine files aside
   and `git checkout --`ing them, not by `git stash`**, because a stash on a tree
   carrying the owner's three dirty paths is a worse instrument than a named
   copy. Restore verified `diff`-identical over `shasum -a 256` of all nine.
4. **A third gesture shape was run that the card did not ask for** — raw mouse
   beside `dragTo`. It cost one extra context per lane per engine and it is what
   falsified the brief's premise in §4. Without it, the card's claim about raw
   mouse would have been inherited rather than measured.
5. **The qwik repeat probe in §3 was not in the card.** It was run because
   writing *"qwik: yes"* in a permanent record off **n = 1** would be the same
   under-measurement this board exists to stop.
