# Frameless Solid target agent playbook

Use this guidance for the installed `@frameless/solid` version. The package consumes
`frameless-enriched-ir/2`, emits Solid fallback JSX, checks generated conventionality, and supplies
the browser analyzer adapter.

## Target boundaries

1. Import the analyzer lifecycle from `@frameless/solid/adapter` in browser projects. That subpath
   contains only the adapter and browser/runtime dependencies.
2. Keep EnrichedIR target-neutral. Solid lowering, ESTree generation, ESLint policy, stores, and JSX
   transforms stay in this package.
3. Treat `generated/*.jsx` as output. Change the structural emitter or gate and regenerate; never
   hand-edit component behavior.
4. Keep the runtime label `solid-1.8.22-fallback` for the browser adapter. Do not describe that
   lane as Solid 2 validation. Solid 2 RC emission is `emit(ir, { generation: '2' })` / the
   `@frameless/solid/v2` CLI target; it is source-complete, not browser-runtime-validated.

## Dossier invariants

- Cheap derived values are plain arrows. Never emit `createMemo` in v0.
- Collection rows use `createStore` and keyed `reconcile`, with bare row-member reads. Solid 1 wraps
  member edits in `produce`; Solid 2 passes the draft callback to the setter directly.
- Emit structural branches with two-arm Show and following siblings once.
- Preserve setter calls in authored order; do not copy React's SSA collapse.
- Text controls require `value` and `onInput`; Solid 1 also pairs an identical `attr:value`. Solid 2
  drops `attr:` (removed in 2.0). Checkboxes use `onChange`.
- Prop-reading once-captures use `untrack`, while reactive reads remain `props.path`.
- Reject IR or output that cannot consume all keyed, write, event, or branch semantics.

## Verification

- Run `pnpm --dir packages/frameworks/solid test` for emitter, freshness, size, adapter-entry, and
  gate mutation lanes.
- Run `npx vitest run --project solid-browser` for reference calibration, hidden-variant smoke,
  emitted equivalence, and store row reuse.
- Run affected consuming-application checks when this package changes their generated output.

Yuku pin rule: parser/analyzer/codegen pinned at 0.7.0; any pin change requires re-executing the parity suite (collision families, printer round-trips, gate verdicts) per docs/goals/frameless-composition-v1/notes/yuku-parity-evaluation.md.
