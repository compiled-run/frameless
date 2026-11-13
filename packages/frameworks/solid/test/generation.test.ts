import { readdirSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { buildEnrichedIr, type EnrichedIR } from '@frameless/compiler';
import { resolve } from 'pathe';
import { describe, expect, test } from 'vitest';
import { emit } from '../src/emitter/index.ts';
import { formatEmitted } from '../src/format-emitted.ts';
import { checkSources } from '../src/gate/index.ts';

const root = resolve(import.meta.dirname, '..');
const goldenRoot = resolve(root, '../../compiler/test/goldens');
const generatedRoot = resolve(root, 'generated');
const nodeRequire = createRequire(import.meta.url);

function byScenarioNumber(left: string, right: string): number {
	return Number(/(\d+)/.exec(left)![1]) - Number(/(\d+)/.exec(right)![1]);
}

function scenarioGoldens(): Array<readonly [string, string]> {
	const table = readdirSync(goldenRoot)
		.filter((entry) => /^s\d+-[\w-]+\.json$/.test(entry))
		.sort(byScenarioNumber)
		.map((entry) => [`S${/^s(\d+)-/.exec(entry)![1]}.tsx`, entry] as const);
	if (table.length === 0)
		throw new Error(`no s<n>-*.json scenario goldens found in ${goldenRoot}`);
	return table;
}

async function golden(name: string): Promise<EnrichedIR> {
	return JSON.parse(await readFile(resolve(goldenRoot, name), 'utf8')) as EnrichedIR;
}

describe('Solid generation split', () => {
	test('generation 1 remains the default and stays byte-identical to checked-in goldens', async () => {
		for (const [file, goldenName] of scenarioGoldens()) {
			const ir = await golden(goldenName);
			const committed = await readFile(resolve(generatedRoot, file), 'utf8');
			expect(await formatEmitted(emit(ir))).toBe(committed);
			expect(await formatEmitted(emit(ir, { generation: 1 }))).toBe(committed);
		}
	});

	test('generation 2 uses Solid 2 RC APIs and drops the 1.x-only forms', async () => {
		const ir = await golden('s2-keyed-todo.json');
		const source = await formatEmitted(emit(ir, { generation: 2 }));
		expect(source).toContain("from 'solid-js'");
		expect(source).toContain('createStore');
		expect(source).toContain('reconcile');
		expect(source).toContain('keyed=');
		expect(source).toContain('todo().title');
		expect(source).toContain('todo().id');
		expect(source).toContain('reconcile(');
		expect(source).not.toContain('solid-js/store');
		expect(source).not.toContain('produce');
		expect(source).not.toContain('attr:value');
		expect(source).not.toContain('{ key:');
		const gate = await checkSources([{ file: 'S2.tsx', source, artifact: ir }], {
			generation: 2,
		});
		expect(gate.violations).toEqual([]);
	});

	test('generation 2 S3 keeps the live value binding and drops attr:value', async () => {
		const ir = await golden('s3-event-form.json');
		const source = await formatEmitted(emit(ir, { generation: 2 }));
		expect(source).toMatch(/value=\{[^}]+\}/);
		expect(source).not.toContain('attr:value');
		expect(source).not.toContain('solid-js/store');
		expect(source).not.toContain('produce');
	});

	test('generation 2 refuses composition until lifecycle mapping is admitted', async () => {
		const filename = 'test/composition-fixtures/C2-shared.tsrx';
		const source = await readFile(resolve(root, filename), 'utf8');
		const ir = await buildEnrichedIr({ filename, source });
		expect(() => emit(ir, { generation: 2 })).toThrow(
			/Solid 2 composition emission is not admitted/,
		);
		expect(await formatEmitted(emit(ir))).toContain('createContext');
	});

	test('the installed Solid 1 pin still exports the v1 subpaths generation 2 no longer emits', () => {
		expect(nodeRequire.resolve('solid-js/web')).toBeTypeOf('string');
		expect(nodeRequire.resolve('solid-js/store')).toBeTypeOf('string');
	});
});
