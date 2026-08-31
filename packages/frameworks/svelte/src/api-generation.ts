/**
 * Svelte API generation that Frameless emits.
 *
 * Frameless targets Svelte 5 runes. Svelte 4 stores / `export let` are out of
 * this package. Versionless has no Svelte lane yet.
 */
export const SVELTE_API_GENERATION = {
	defaultGeneration: 5,
	supported: [5],
	pin: { package: 'svelte', version: '^5.56.1' },
	deprecatedApisAlreadyAbsentFromEmit: ['export let', 'writable/readable stores', 'on:click'],
	versionless: {
		repo: 'compiled-run/versionless',
		frameworkSupport: 'absent',
		moveGenerationWhen: 'not-applicable-frameless-never-emitted-svelte-4',
	},
} as const;
