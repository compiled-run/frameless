/**
 * Solid API generations that Frameless emits.
 *
 * Frameless keeps recent majors here. Older majors move to
 * https://github.com/compiled-run/versionless only after the successor has
 * been a stable release for a decent stretch. Solid 2 is still an RC
 * (`2.0.0-rc.19` as of 2026-10-28; API frozen, not a long-lived stable), so
 * generation 1 stays in this package beside generation 2.
 */
export type SolidApiGeneration = 1 | 2;

export interface SolidEmitOptions {
	readonly generation?: SolidApiGeneration;
}

export const SOLID_API_GENERATIONS = {
	surveyedAt: '2026-10-28',
	defaultGeneration: 1,
	supported: [1, 2],
	pins: {
		1: { package: 'solid-js', version: '1.8.22' },
		2: { package: 'solid-js', version: '2.0.0-rc.19', alias: 'solid-rc19' },
	},
	latestStable: '1.9.17',
	latestPrerelease: '2.0.0-rc.19',
	/**
	 * Generation-1 APIs that Solid 2 removed or relocated. Kept in Frameless
	 * until Solid 2 has been stable long enough to hand the v1 lane to
	 * versionless. Versionless does not yet have a Solid package.
	 */
	generation1ApisOwnedHereUntilSolid2IsStable: [
		'solid-js/store',
		'produce',
		'attr:value',
		'onMount',
		'reconcile(next, { key })',
	],
	generation2Replacements: {
		'solid-js/store': 'solid-js (createStore, reconcile)',
		produce: 'draft-first store setter',
		'attr:value': 'plain value (namespaces removed)',
		onMount: 'onSettled',
		'reconcile(next, { key })': 'setStore(s => reconcile(next, key)(s))',
	},
	versionless: {
		repo: 'compiled-run/versionless',
		frameworkSupport: 'absent',
		moveGeneration1When: 'solid-2-stable-for-a-decent-bit',
	},
} as const;
