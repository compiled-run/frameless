import { describe, expect, test } from 'vitest';
import { REACT_API_GENERATION } from '../src/api-generation.ts';

describe('React API generation inventory', () => {
	test('emits React 19 only; older React already lives in versionless', () => {
		expect(REACT_API_GENERATION.supported).toEqual([19]);
		expect(REACT_API_GENERATION.versionless.frameworkSupport).toBe('present');
		expect(REACT_API_GENERATION.deprecatedApisAlreadyAbsentFromEmit).toContain('forwardRef');
	});
});
