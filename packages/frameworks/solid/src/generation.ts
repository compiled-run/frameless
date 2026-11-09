export type SolidGeneration = '1' | '2';

export type EmitOptions = {
	readonly generation?: SolidGeneration;
};

export function resolveSolidGeneration(options?: EmitOptions): SolidGeneration {
	return options?.generation === '2' ? '2' : '1';
}

export function isSolid2Source(source: string): boolean {
	return source.includes('@frameless/solid (solid-2)');
}
