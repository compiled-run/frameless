import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { resolve } from 'pathe';
import { describe, expect, test } from 'vitest';
import { parse } from 'yuku-parser';
import { SOLID_API_GENERATIONS } from '../src/api-generation.ts';

// `tsx`, NOT `jsx`, AT EVERY SITE IN THIS FILE THAT PARSES EMITTED OUTPUT.
// The artifact became `.tsx` at `frameless-emitter-capability-v1` T009/T011 and
// carries an IR-8 props type from T014. MEASURED at yuku-parser/yuku-analyzer
// 0.7.0: `jsx` reports "Expected ')' to close parameter list, but found ':'" on a
// typed props parameter, so a stale `jsx` here fails on VALID output.

const root = resolve(import.meta.dirname, '..');
const nodeRequire = createRequire(import.meta.url);
const rcAlias = SOLID_API_GENERATIONS.pins[2].alias;

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
		await readFile(nodeRequire.resolve(`${rcAlias}/package.json`), 'utf8'),
	) as PackageManifest;
}

describe('Solid 2 toolchain contract', () => {
	test('pins the RC evidence runtime and records that jsx-runtime left solid-js', async () => {
		const manifest = await rcManifest();
		expect(manifest.version).toBe(SOLID_API_GENERATIONS.pins[2].version);
		expect(SOLID_API_GENERATIONS.supported).toEqual([1, 2]);
		expect(SOLID_API_GENERATIONS.defaultGeneration).toBe(1);

		// Solid 2 RC moved JSX types onto @solidjs/web. The beta.9 contract that
		// expected ./jsx-runtime on solid-js itself is overturned.
		expect(Object.keys(manifest.exports)).not.toContain('./jsx-runtime');
		expect(Object.keys(manifest.exports)).not.toContain('./web');
		expect(Object.keys(manifest.exports)).not.toContain('./store');
	});

	test('emitted S2 generation-1 output still links to the Solid 1 store subpath', async () => {
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

	test('rc.19 cannot link the v1 web or store subpaths', async () => {
		expect(nodeRequire.resolve('solid-js/web')).toBeTypeOf('string');
		expect(nodeRequire.resolve('solid-js/store')).toBeTypeOf('string');

		expect(resolutionErrorCode(`${rcAlias}/web`)).toBe('ERR_PACKAGE_PATH_NOT_EXPORTED');
		expect(resolutionErrorCode(`${rcAlias}/store`)).toBe('ERR_PACKAGE_PATH_NOT_EXPORTED');

		const manifest = await rcManifest();
		expect(manifest.version).toBe('2.0.0-rc.19');
	});

	test('generation 1 stays in Frameless until Solid 2 is a long-lived stable', () => {
		expect(SOLID_API_GENERATIONS.versionless.frameworkSupport).toBe('absent');
		expect(SOLID_API_GENERATIONS.versionless.moveGeneration1When).toBe(
			'solid-2-stable-for-a-decent-bit',
		);
		expect(SOLID_API_GENERATIONS.generation1ApisOwnedHereUntilSolid2IsStable).toEqual([
			'solid-js/store',
			'produce',
			'attr:value',
			'onMount',
			'reconcile(next, { key })',
		]);
	});
});
