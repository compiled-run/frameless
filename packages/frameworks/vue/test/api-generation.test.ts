import { describe, expect, test } from 'vitest';
import { VUE_API_GENERATION } from '../src/api-generation.ts';

describe('Vue API generation inventory', () => {
	test('emits Vue 3 only; versionless has no Vue lane yet', () => {
		expect(VUE_API_GENERATION.supported).toEqual([3]);
		expect(VUE_API_GENERATION.versionless.frameworkSupport).toBe('absent');
		expect(VUE_API_GENERATION.deprecatedApisAlreadyAbsentFromEmit).toContain('Options API');
	});
});
