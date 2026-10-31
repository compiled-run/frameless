import { readFile } from 'node:fs/promises';
import { buildEnrichedIr } from '@frameless/compiler';
import { resolve } from 'pathe';
import { describe, expect, test } from 'vitest';
import { SOLID_API_GENERATIONS } from '../src/api-generation.ts';
import { emit } from '../src/emitter/index.ts';

const goldenRoot = resolve(import.meta.dirname, '../../../compiler/test/goldens');
const fixtureRoot = resolve(import.meta.dirname, 'composition-fixtures');

async function golden(name: string) {
	return JSON.parse(await readFile(resolve(goldenRoot, name), 'utf8'));
}

async function composition(name: string) {
	const filename = `test/composition-fixtures/${name}.tsrx`;
	const source = await readFile(resolve(fixtureRoot, `${name}.tsrx`), 'utf8');
	return buildEnrichedIr({ filename, source });
}

describe('Solid API generation inventory', () => {
	test('keeps generation 1 as default and treats generation 2 RC as a sibling lane', () => {
		expect(SOLID_API_GENERATIONS.supported).toEqual([1, 2]);
		expect(SOLID_API_GENERATIONS.defaultGeneration).toBe(1);
		expect(SOLID_API_GENERATIONS.pins[2].version).toBe('2.0.0-rc.20');
		expect(SOLID_API_GENERATIONS.pins[2].alias).toBe('solid-rc20');
		expect(SOLID_API_GENERATIONS.latestStable).toBe('1.9.18');
		expect(SOLID_API_GENERATIONS.versionless.frameworkSupport).toBe('absent');
		expect(SOLID_API_GENERATIONS.versionless.moveGeneration1When).toBe(
			'solid-2-stable-for-a-decent-bit',
		);
	});
});

describe('Solid generation-2 emit', () => {
	test('S1 drops attr: namespaces and flushes after signal writes', async () => {
		const source = emit(await golden('s1-render-once.json'), { generation: 2 });
		expect(source).toContain("from 'solid-js'");
		expect(source).not.toContain('solid-js/store');
		expect(source).not.toContain('attr:value');
		expect(source).toContain('flush()');
		expect(source).toContain('setCount(');
	});

	test('S2 uses solid-js store APIs, keyed For accessors, and draft-first setters', async () => {
		const source = emit(await golden('s2-keyed-todo.json'), { generation: 2 });
		expect(source).toContain('createStore');
		expect(source).toContain('reconcile');
		expect(source).toContain("from 'solid-js'");
		expect(source).not.toContain('solid-js/store');
		expect(source).not.toContain('produce');
		expect(source).not.toContain('attr:value');
		expect(source).toContain('keyed={(todo) => todo.id}');
		expect(source).toContain('todo().id');
		expect(source).not.toContain('todo()()');
		expect(source).toMatch(/reconcile\([\s\S]*?,\s*'id'\)\(/);
		expect(source).not.toContain("{ key: 'id' }");
		expect(source).not.toMatch(/setTodos\(\s*reconcile\(/);
	});

	test('default emit stays generation 1 and does not import flush or keyed For', async () => {
		const source = emit(await golden('s1-render-once.json'));
		expect(source).toContain("from 'solid-js'");
		expect(source).not.toContain('flush()');
		expect(source).not.toContain('keyed=');
	});

	test('C4 attach uses a directive factory so each host instance owns its effect', async () => {
		const source = emit(await composition('C4-attach'), { generation: 2 });
		expect(source).toMatch(/createEffect\(\(\) => \{/);
		expect(source).toMatch(/createEffect\([\s\S]*\}, \(attachSnapshot\) => \{/);
		expect(source).not.toContain('onMount');
		expect(source).not.toContain('onSettled');
		expect(source).toContain('createSignal');
		expect(source).toContain('attachSnapshot.behaviorInputInput');
		expect(source).toContain('flush()');
		expect(source).toMatch(/ref=\{attachHost\(\)\}/);
	});

	test('C3 forwarded attach composes the handle with a per-host factory', async () => {
		const source = emit(await composition('C3-ref'), { generation: 2 });
		expect(source).toMatch(/ref=\{\[/);
		expect(source).toMatch(/attachHost\(\)/);
		expect(source).not.toContain('onCleanup');
	});

	test('accepts computed-string repeat keys and flushes unbraced setter bodies', async () => {
		const keyed = structuredClone(await golden('s2-keyed-todo.json'));
		const repeats: Array<{ key?: { expression?: Record<string, unknown> } }> = [];
		const walk = (value: unknown): void => {
			if (!value || typeof value !== 'object') return;
			if ((value as { kind?: string }).kind === 'keyed-repeat')
				repeats.push(value as { key?: { expression?: Record<string, unknown> } });
			for (const child of Object.values(value)) {
				if (Array.isArray(child)) child.forEach(walk);
				else walk(child);
			}
		};
		walk(keyed.components[0].template);
		const key = repeats[0]?.key;
		expect(key?.expression?.type).toBe('MemberExpression');
		key!.expression!.computed = true;
		key!.expression!.property = { type: 'Literal', value: 'id', raw: "'id'" };
		const keyedSource = emit(keyed, { generation: 2 });
		expect(keyedSource).toContain('keyed={(todo) => todo.id}');
		expect(keyedSource).toContain('todo().id');

		const looped = await buildEnrichedIr({
			filename: 'test/unbraced-loop.tsrx',
			source: `import { state } from "@markless/core";
export function Loop({ label }: { label: string }) @{
	let count = state(0);
	<button onClick={() => { while (count < 3) count++; }}>{count} {label}</button>
}`,
		});
		const loopedSource = emit(looped, { generation: 2 });
		expect(loopedSource).toMatch(/while \(count\(\) < 3\) \{\s*setCount\(count\(\) \+ 1\);\s*flush\(\);/s);
	});
});
