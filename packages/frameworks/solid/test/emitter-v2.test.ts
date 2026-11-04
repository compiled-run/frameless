import { readdirSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { buildEnrichedIr, type EnrichedIR } from '@frameless/compiler';
import { resolve } from 'pathe';
import { describe, expect, test } from 'vitest';
import { emit } from '../src/emitter/index.ts';
import { formatEmitted } from '../src/format-emitted.ts';
import { checkSources } from '../src/gate/index.ts';

const root = resolve(import.meta.dirname, '..');
const goldenRoot = resolve(root, '../../compiler/test/goldens');
const generatedRoot = resolve(root, 'generated-v2');

async function golden(name: string): Promise<EnrichedIR> {
	return JSON.parse(await readFile(resolve(goldenRoot, name), 'utf8')) as EnrichedIR;
}

describe('Solid 2 RC emit path', () => {
	test('default emit stays Solid 1', async () => {
		const ir = await golden('s1-render-once.json');
		expect(emit(ir)).toBe(emit(ir, { version: 1 }));
		expect(emit(ir)).not.toBe(emit(ir, { version: 2 }));
	});

	test('S1 drops attr: namespaces and flushes after the authored set', async () => {
		const source = emit(await golden('s1-render-once.json'), { version: 2 });
		expect(source).toContain("from 'solid-js'");
		expect(source).not.toContain('solid-js/store');
		expect(source).not.toContain('attr:value');
		expect(source).toMatch(/setCount\(count\(\) \+ 1\);\s*flush\(\);/);
		expect(source).toContain("props.onTrace('change', { count: count() })");
	});

	test('S2 moves the store API onto solid-js and keys For directly', async () => {
		const source = emit(await golden('s2-keyed-todo.json'), { version: 2 });
		expect(source).toMatch(/import \{[^}]*createStore[^}]*\} from 'solid-js'/);
		expect(source).not.toContain('solid-js/store');
		expect(source).not.toContain('produce');
		expect(source).not.toContain('attr:value');
		expect(source).toContain('keyed={(todo) => todo.id}');
		expect(source).toContain('{(todo) =>');
		expect(source).toContain('todo().id');
		expect(source).toContain('todo().title');
		expect(source).toMatch(/setTodos\(\(storeDraft\) => \{/);
		expect(source).toMatch(/setTodos\(reconcile\([\s\S]*flush\(\);/);
	});

	test('S3 is still a controlled form without the 1.x attr:value pair', async () => {
		const source = emit(await golden('s3-event-form.json'), { version: 2 });
		expect(source).not.toContain('attr:value');
		expect(source).toContain('onInput');
		expect(source).not.toContain('solid-js/store');
	});

	test('generated-v2 goldens stay byte-fresh', async () => {
		const files = readdirSync(generatedRoot)
			.filter((entry) => /^S\d+\.tsx$/.test(entry))
			.sort();
		expect(files).toEqual(['S1.tsx', 'S2.tsx', 'S3.tsx']);
		const goldens = {
			'S1.tsx': 's1-render-once.json',
			'S2.tsx': 's2-keyed-todo.json',
			'S3.tsx': 's3-event-form.json',
		} as const;
		for (const file of files) {
			const ir = await golden(goldens[file as keyof typeof goldens]);
			const actual = await readFile(resolve(generatedRoot, file), 'utf8');
			expect(actual).toBe(await formatEmitted(emit(ir, { version: 2 })));
		}
	});

	test('composition attach uses onSettled and split createEffect', async () => {
		const filename = resolve(root, 'test/composition-fixtures/C4-attach.tsrx');
		const source = await readFile(filename, 'utf8');
		const artifact = await buildEnrichedIr({ filename, source });
		const emitted = emit(artifact, { version: 2 });
		expect(emitted).toMatch(/import \{[^}]*onSettled[^}]*\} from 'solid-js'/);
		expect(emitted).not.toMatch(/\bonMount\b/);
		expect(emitted).toMatch(/createEffect\(\(\) => \{/);
		expect(emitted).toMatch(/createEffect\(\(\) => \{[\s\S]*?\}, \(\[/);
	});

	test('the v2 gate accepts the S2 shape it is responsible for', async () => {
		const ir = await golden('s2-keyed-todo.json');
		const source = await formatEmitted(emit(ir, { version: 2 }));
		const result = await checkSources([{ file: 'S2.tsx', source, artifact: ir }], {
			version: 2,
		});
		expect(result.violations).toEqual([]);
	});
});
