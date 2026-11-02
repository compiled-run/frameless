import { describe, expect, test } from 'vitest';
import { SVELTE_API_GENERATION } from '../src/api-generation.ts';

describe('Svelte API generation inventory', () => {
	test('emits Svelte 5 runes only; versionless has no Svelte lane yet', () => {
		expect(SVELTE_API_GENERATION.supported).toEqual([5]);
		expect(SVELTE_API_GENERATION.versionless.frameworkSupport).toBe('absent');
		expect(SVELTE_API_GENERATION.deprecatedApisAlreadyAbsentFromEmit).toContain('export let');
	});
});
