import type { EnrichedIR } from '@frameless/compiler';
import { emit as emitSolid, validateEnrichedIr } from './emitter/index.ts';
import { formatEmitted } from './format-emitted.ts';
import {
	checkGeneratedFiles as checkGeneratedSolid,
	checkSources as checkSolid,
	discoverGeneratedFiles,
	SOLID_GATE_POLICIES,
} from './gate/index.ts';
import type { GateResult } from './gate/index.ts';

const GENERATION = { generation: '2' } as const;

export { validateEnrichedIr, formatEmitted, discoverGeneratedFiles, SOLID_GATE_POLICIES };
export type { DossierRef, GatePolicy, GateResult, GateViolation } from './gate/index.ts';

export function emit(ir: EnrichedIR): string {
	return emitSolid(ir, GENERATION);
}

export async function checkSources(
	entries: ReadonlyArray<{
		readonly file: string;
		readonly source: string;
		readonly artifact?: EnrichedIR;
	}>,
	options: { readonly cwd?: string } = {},
): Promise<GateResult> {
	return checkSolid(entries, { ...options, ...GENERATION });
}

export async function checkGeneratedFiles(
	options: { readonly cwd?: string; readonly directory?: string } = {},
): Promise<GateResult> {
	return checkGeneratedSolid(options);
}
