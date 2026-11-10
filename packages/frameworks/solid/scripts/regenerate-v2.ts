import { mkdir, readFile, writeFile } from 'node:fs/promises';
import type { EnrichedIR } from '@frameless/compiler';
import { resolve } from 'pathe';
import { emit } from '../src/emitter/index.ts';
import { formatEmitted } from '../src/format-emitted.ts';

const root = resolve(import.meta.dirname, '..');
const goldenRoot = resolve(root, '../../compiler/test/goldens');
const fixtures = [
	['S1.tsx', 's1-render-once.json'],
	['S2.tsx', 's2-keyed-todo.json'],
	['S3.tsx', 's3-event-form.json'],
	['S4.tsx', 's4-nested-list.json'],
	['S5.tsx', 's5-branch-teardown.json'],
	['S6.tsx', 's6-whitespace-text.json'],
	['S7.tsx', 's7-form-controls.json'],
	['S8.tsx', 's8-async-handlers.json'],
	['S9.tsx', 's9-boolean-attributes.json'],
	['S10.tsx', 's10-todomvc.json'],
	['S11.tsx', 's11-todomvc-advanced.json'],
	['S12.tsx', 's12-codex-clone.json'],
	['S13.tsx', 's13-hn-front.json'],
	['S14.tsx', 's14-hn-item.json'],
	['S15.tsx', 's15-habit-tracker.json'],
	['S16.tsx', 's16-task-board.json'],
	['S17.tsx', 's17-contacts.json'],
] as const;

await mkdir(resolve(root, 'generated-v2'), { recursive: true });
for (const [output, golden] of fixtures) {
	const ir = JSON.parse(await readFile(resolve(goldenRoot, golden), 'utf8')) as EnrichedIR;
	await writeFile(
		resolve(root, 'generated-v2', output),
		await formatEmitted(emit(ir, { generation: '2' })),
	);
}
