import { readFile } from 'node:fs/promises';
import { resolve } from 'pathe';
import { describe, expect, test } from 'vitest';
import { SOLID_API_GENERATIONS } from '../src/api-generation.ts';
import { emit } from '../src/emitter/index.ts';

const goldenRoot = resolve(import.meta.dirname, '../../../compiler/test/goldens');

async function golden(name: string) {
	return JSON.parse(await readFile(resolve(goldenRoot, name), 'utf8'));
}

describe('Solid API generation inventory', () => {
	test('keeps generation 1 as default and treats generation 2 RC as a sibling lane', () => {
		expect(SOLID_API_GENERATIONS.supported).toEqual([1, 2]);
		expect(SOLID_API_GENERATIONS.defaultGeneration).toBe(1);
		expect(SOLID_API_GENERATIONS.pins[2].version).toBe('2.0.0-rc.19');
		expect(SOLID_API_GENERATIONS.pins[2].alias).toBe('solid-rc19');
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
});
