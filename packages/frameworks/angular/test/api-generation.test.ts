import { describe, expect, test } from 'vitest';
import { ANGULAR_API_GENERATION } from '../src/api-generation.ts';

describe('Angular API generation inventory', () => {
	test('emits Angular 22 standalone only; older Angular already lives in versionless', () => {
		expect(ANGULAR_API_GENERATION.supported).toEqual([22]);
		expect(ANGULAR_API_GENERATION.latestPublished).toBe('22.2.4');
		expect(ANGULAR_API_GENERATION.versionless.frameworkSupport).toBe('present');
		expect(ANGULAR_API_GENERATION.deprecatedApisAlreadyAbsentFromEmit).toContain('NgModule');
	});
});
