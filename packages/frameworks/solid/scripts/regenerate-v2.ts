import { readdirSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import type { EnrichedIR } from '@frameless/compiler';
import { resolve } from 'pathe';
import { emit } from '../src/emitter/index.ts';
import { formatEmitted } from '../src/format-emitted.ts';

const root = resolve(import.meta.dirname, '..');
const goldenRoot = resolve(root, '../../compiler/test/goldens');

function byScenarioNumber(left: string, right: string): number {
	return Number(/(\d+)/.exec(left)![1]) - Number(/(\d+)/.exec(right)![1]);
}

const fixtures = readdirSync(goldenRoot)
	.filter((entry) => /^s\d+-[\w-]+\.json$/.test(entry))
	.sort(byScenarioNumber)
	.map((entry) => [`S${/^s(\d+)-/.exec(entry)![1]}.tsx`, entry] as const);

if (fixtures.length === 0)
	throw new Error(`no s<n>-*.json scenario goldens found in ${goldenRoot}`);

await mkdir(resolve(root, 'generated-v2'), { recursive: true });
for (const [output, golden] of fixtures) {
	const ir = JSON.parse(await readFile(resolve(goldenRoot, golden), 'utf8')) as EnrichedIR;
	await writeFile(
		resolve(root, 'generated-v2', output),
		await formatEmitted(emit(ir, { version: '2' })),
	);
}
