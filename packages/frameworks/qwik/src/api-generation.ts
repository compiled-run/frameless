/**
 * Qwik API generation that Frameless emits.
 *
 * Frameless targets Qwik 2 (`@qwik.dev/core`). The executable pin is still
 * `2.0.0-beta.38`; latest published as of 2026-10-30 is `2.0.0-rc.4`. The
 * `beta` dist-tag is `2.0.0-beta.40`. Qwik 1 (`@builder.io/qwik`) is the older
 * line. Versionless has no Qwik lane yet. Qwik 2 is still pre-stable, so a
 * Qwik 1 emit lane would stay in Frameless if one existed — it does not.
 */
export const QWIK_API_GENERATION = {
	surveyedAt: '2026-10-30',
	defaultGeneration: 2,
	supported: [2],
	pin: { package: '@qwik.dev/core', version: '2.0.0-beta.38' },
	latestPublished: '2.0.0-rc.4',
	latestBeta: '2.0.0-beta.40',
	deprecatedApisAlreadyAbsentFromEmit: ['@builder.io/qwik', 'useResource$', 'useAsync$'],
	versionless: {
		repo: 'compiled-run/versionless',
		frameworkSupport: 'absent',
		moveGenerationWhen: 'not-applicable-frameless-never-emitted-qwik-1',
	},
	/**
	 * `@qwik.dev/core@2.0.0-rc.4` declares `vitest: ">=2 <5"`, which admits this
	 * workspace's vitest 4.1.5. The browser-lane unblock condition in the Qwik
	 * README is therefore met on latest, but not on the executable beta.38 pin
	 * (or on beta.40, which still declares `vitest: ">=2 <4"`). Moving the pin
	 * is a separate decision.
	 */
	vitest4AdmittedOnLatest: true,
} as const;
