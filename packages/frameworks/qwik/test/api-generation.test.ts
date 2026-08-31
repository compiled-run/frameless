import { describe, expect, test } from 'vitest';
import { QWIK_API_GENERATION } from '../src/api-generation.ts';

describe('Qwik API generation inventory', () => {
	test('emits Qwik 2 beta only; versionless has no Qwik lane yet', () => {
		expect(QWIK_API_GENERATION.supported).toEqual([2]);
		expect(QWIK_API_GENERATION.versionless.frameworkSupport).toBe('absent');
		expect(QWIK_API_GENERATION.deprecatedApisAlreadyAbsentFromEmit).toContain(
			'@builder.io/qwik',
		);
	});
});
