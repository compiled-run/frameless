import { readdirSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { buildEnrichedIr, type EnrichedIR } from '@frameless/compiler';
import { resolve } from 'pathe';
import { parse } from 'yuku-parser';
import { describe, expect, test } from 'vitest';
import { emit } from '../src/emitter/index.ts';
import { formatEmitted } from '../src/format-emitted.ts';

const root = resolve(import.meta.dirname, '..');
const goldenRoot = resolve(root, '../../compiler/test/goldens');
const fixtureRoot = resolve(root, 'test/composition-fixtures');

async function golden(name: string): Promise<EnrichedIR> {
	return JSON.parse(await readFile(resolve(goldenRoot, name), 'utf8')) as EnrichedIR;
}

function importSources(source: string): string[] {
	const program = parse(source, { sourceType: 'module', lang: 'tsx' }).program;
	return program.body.flatMap((statement) =>
		statement.type === 'ImportDeclaration' ? [statement.source.value] : [],
	);
}

function namedImports(source: string, specifier: string): string[] {
	const program = parse(source, { sourceType: 'module', lang: 'tsx' }).program;
	return program.body.flatMap((statement) => {
		if (statement.type !== 'ImportDeclaration' || statement.source.value !== specifier)
			return [];
		return statement.specifiers.flatMap((entry) => {
			if (entry.type !== 'ImportSpecifier' || entry.imported.type !== 'Identifier') return [];
			return [entry.imported.name];
		});
	});
}

describe('Solid 2 RC emit', () => {
	test('default emit stays on the Solid 1.x surface', async () => {
		const source = emit(await golden('s2-keyed-todo.json'));
		expect(importSources(source)).toContain('solid-js/store');
		expect(source).toContain('attr:value');
		expect(source).toContain('produce(');
		expect(source).toContain('<For each={todos}>');
		expect(source).not.toContain('keyed=');
	});

	test('S1 drops nothing v1-only because it has no store or controlled text', async () => {
		const source = await formatEmitted(
			emit(await golden('s1-render-once.json'), { target: '2' }),
		);
		expect(importSources(source)).toEqual(['solid-js']);
		expect(namedImports(source, 'solid-js')).toEqual(['createSignal', 'untrack', 'Show']);
		expect(source).not.toContain('solid-js/store');
		expect(source).not.toContain('attr:value');
		expect(source).toContain('createSignal');
		expect(source).toContain('<Show');
	});

	test('S2 uses the Solid 2 store, For, and input surface', async () => {
		const source = await formatEmitted(
			emit(await golden('s2-keyed-todo.json'), { target: '2' }),
		);
		expect(importSources(source)).toEqual(['solid-js']);
		expect(importSources(source)).not.toContain('solid-js/store');
		expect(namedImports(source, 'solid-js')).toEqual(
			expect.arrayContaining([
				'createSignal',
				'untrack',
				'For',
				'Show',
				'createStore',
				'reconcile',
			]),
		);
		expect(namedImports(source, 'solid-js')).not.toContain('produce');
		expect(source).not.toContain('attr:value');
		expect(source).not.toContain('produce(');
		expect(source).toMatch(/<For each=\{todos\} keyed=\{/);
		expect(source).toContain('todo().id');
		expect(source).toContain('todo().title');
		expect(source).toContain('reconcile(');
		expect(source).toMatch(/reconcile\([^,]+,\s*['"]id['"]\)/);
	});

	test('S3 does not emit the removed attr namespace', async () => {
		const source = await formatEmitted(
			emit(await golden('s3-event-form.json'), { target: '2' }),
		);
		expect(source).not.toContain('attr:value');
		expect(source).not.toContain('solid-js/store');
	});

	test('every scenario golden emits under the Solid 2 target', async () => {
		const goldens = readdirSync(goldenRoot)
			.filter((entry) => /^s\d+-[\w-]+\.json$/.test(entry))
			.sort();
		expect(goldens.length).toBeGreaterThan(0);
		for (const name of goldens) {
			const source = emit(await golden(name), { target: '2' });
			expect(importSources(source), name).not.toContain('solid-js/store');
			expect(source, name).not.toContain('attr:value');
			expect(source, name).not.toContain("from 'solid-js/store'");
		}
	});

	test('shared composition uses the Solid 2 context provider form', async () => {
		const filename = 'test/composition-fixtures/C2-shared.tsrx';
		const sourceText = await readFile(resolve(fixtureRoot, 'C2-shared.tsrx'), 'utf8');
		const artifact = await buildEnrichedIr({ filename, source: sourceText });
		const source = await formatEmitted(emit(artifact, { target: '2' }));
		expect(source).not.toContain('.Provider');
		expect(source).not.toContain('is missing its provider');
		expect(source).toContain('useContext(');
		expect(importSources(source)).not.toContain('solid-js/store');
	});
});
