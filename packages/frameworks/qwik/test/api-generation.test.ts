import { describe, expect, test } from 'vitest';
import { QWIK_API_GENERATION } from '../src/api-generation.ts';

describe('Qwik API generation inventory', () => {
	test('emits Qwik 2 only; versionless has no Qwik lane yet', () => {
		expect(QWIK_API_GENERATION.supported).toEqual([2]);
		expect(QWIK_API_GENERATION.pin.version).toBe('2.0.0-beta.38');
		expect(QWIK_API_GENERATION.latestPublished).toBe('2.0.0-rc.4');
		expect(QWIK_API_GENERATION.vitest4AdmittedOnLatest).toBe(true);
		expect(QWIK_API_GENERATION.versionless.frameworkSupport).toBe('absent');
		expect(QWIK_API_GENERATION.deprecatedApisAlreadyAbsentFromEmit).toContain(
			'@builder.io/qwik',
		);
	});
});
