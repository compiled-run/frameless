export type SolidGeneration = '1' | '2';

export type EmitOptions = {
	readonly generation?: SolidGeneration;
};

export function resolveSolidGeneration(options?: EmitOptions): SolidGeneration {
	const generation = options?.generation ?? '1';
	if (generation !== '1' && generation !== '2')
		throw new Error(`Unsupported Solid generation: ${String(generation)}`);
	return generation;
}

export function isSolid2Source(source: string): boolean {
	return source.includes('@frameless/solid (solid-2)');
}
