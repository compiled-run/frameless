import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { resolve } from 'pathe';
import { describe, expect, test } from 'vitest';
import { parse } from 'yuku-parser';
import type { EnrichedIR } from '@frameless/compiler';
import { emit } from '../src/emitter/index.ts';
import { formatEmitted } from '../src/format-emitted.ts';

// `tsx`, NOT `jsx`, AT EVERY SITE IN THIS FILE THAT PARSES EMITTED OUTPUT.
// The artifact became `.tsx` at `frameless-emitter-capability-v1` T009/T011 and
// carries an IR-8 props type from T014. MEASURED at yuku-parser/yuku-analyzer
// 0.7.0: `jsx` reports "Expected ')' to close parameter list, but found ':'" on a
// typed props parameter, so a stale `jsx` here fails on VALID output.

const root = resolve(import.meta.dirname, '..');
const goldenRoot = resolve(root, '../../compiler/test/goldens');
const nodeRequire = createRequire(import.meta.url);

interface BabelCore {
	transformAsync(
		source: string,
		options: Record<string, unknown>,
	): Promise<{ code?: string | null } | null>;
}

interface PackageManifest {
	version: string;
	exports: Record<string, unknown>;
}

function importSources(source: string): string[] {
	const program = parse(source, { sourceType: 'module', lang: 'tsx' }).program;
	return program.body.flatMap((statement) =>
		statement.type === 'ImportDeclaration' ? [statement.source.value] : [],
	);
}

function resolutionErrorCode(specifier: string): string | undefined {
	try {
		nodeRequire.resolve(specifier);
		return undefined;
	} catch (error) {
		return (error as NodeJS.ErrnoException).code;
	}
}

async function rcManifest(): Promise<PackageManifest> {
	return JSON.parse(
		await readFile(nodeRequire.resolve('solid-2/package.json'), 'utf8'),
	) as PackageManifest;
}

describe('Solid 2 toolchain contract', () => {
	test('pins the current Solid 2 RC evidence runtime', async () => {
		const manifest = await rcManifest();
		expect(manifest.version).toBe('2.0.0-rc.21');
		expect(Object.keys(manifest.exports)).not.toContain('./jsx-runtime');
		expect(Object.keys(manifest.exports)).not.toContain('./web');
		expect(Object.keys(manifest.exports)).not.toContain('./store');
	});

	test('default emitted S2 output still links to the Solid 1 store subpath', async () => {
		const source = await readFile(resolve(root, 'generated/S2.tsx'), 'utf8');
		expect(importSources(source)).toContain('solid-js/store');
	});

	test('the installed Solid 1 JSX toolchain links DOM output to the web subpath', async () => {
		const presetPath = nodeRequire.resolve('babel-preset-solid');
		const presetRequire = createRequire(presetPath);
		const { transformAsync } = presetRequire('@babel/core') as BabelCore;
		const solidPreset = nodeRequire('babel-preset-solid');
		const result = await transformAsync(
			'export function BlockerProbe() { return <div />; }',
			{
				babelrc: false,
				configFile: false,
				filename: 'solid2-blocker-probe.tsx',
				presets: [[solidPreset, { generate: 'dom' }]],
			},
		);

		expect(result?.code).toBeTypeOf('string');
		expect(importSources(result?.code ?? '')).toContain('solid-js/web');
	});

	test('Solid 2 RC still does not export the v1 web or store subpaths', () => {
		expect(nodeRequire.resolve('solid-js/web')).toBeTypeOf('string');
		expect(nodeRequire.resolve('solid-js/store')).toBeTypeOf('string');
		expect(resolutionErrorCode('solid-2/web')).toBe('ERR_PACKAGE_PATH_NOT_EXPORTED');
		expect(resolutionErrorCode('solid-2/store')).toBe('ERR_PACKAGE_PATH_NOT_EXPORTED');
	});

	test('generation 2 S2 output no longer links the removed v1 subpaths', async () => {
		const ir = JSON.parse(
			await readFile(resolve(goldenRoot, 's2-keyed-todo.json'), 'utf8'),
		) as EnrichedIR;
		const source = await formatEmitted(emit(ir, { generation: '2' }));
		expect(importSources(source)).toEqual(['solid-js']);
		expect(importSources(source)).not.toContain('solid-js/store');
		expect(importSources(source)).not.toContain('solid-js/web');
	});
});
