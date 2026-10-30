/**
 * Angular API generation that Frameless emits.
 *
 * Frameless targets Angular 22 standalone components. NgModule-era and
 * AngularJS APIs already live in versionless.
 */
export const ANGULAR_API_GENERATION = {
	surveyedAt: '2026-10-30',
	defaultGeneration: 22,
	supported: [22],
	pin: { package: '@angular/compiler', version: '^22.0.8' },
	latestPublished: '22.2.4',
	deprecatedApisAlreadyAbsentFromEmit: ['NgModule', 'entryComponents', 'HttpModule'],
	versionless: {
		repo: 'compiled-run/versionless',
		frameworkSupport: 'present',
		olderApis: ['AngularJS', 'NgModule workspace', 'HttpClient era seams'],
	},
} as const;
