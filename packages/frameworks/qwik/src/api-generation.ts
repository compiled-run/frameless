/**
 * Qwik API generation that Frameless emits.
 *
 * Frameless targets Qwik 2 beta (`@qwik.dev/core`). Qwik 1 (`@builder.io/qwik`)
 * is the older line. Versionless has no Qwik lane yet. Qwik 2 is still beta,
 * so a Qwik 1 emit lane would stay in Frameless if one existed — it does not.
 */
export const QWIK_API_GENERATION = {
	defaultGeneration: 2,
	supported: [2],
	pin: { package: '@qwik.dev/core', version: '2.0.0-beta.38' },
	deprecatedApisAlreadyAbsentFromEmit: ['@builder.io/qwik'],
	versionless: {
		repo: 'compiled-run/versionless',
		frameworkSupport: 'absent',
		moveGenerationWhen: 'not-applicable-frameless-never-emitted-qwik-1',
	},
} as const;
