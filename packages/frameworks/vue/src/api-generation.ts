/**
 * Vue API generation that Frameless emits.
 *
 * Frameless targets Vue 3 `<script setup>` with valued `:` / `@` shorthands.
 * Vue 2 Options API is out of this package. Versionless has no Vue lane yet.
 */
export const VUE_API_GENERATION = {
	defaultGeneration: 3,
	supported: [3],
	pin: { package: 'vue', version: '^3.5.40' },
	deprecatedApisAlreadyAbsentFromEmit: ['Options API', 'Vue 2 filters', 'new Vue()'],
	versionless: {
		repo: 'compiled-run/versionless',
		frameworkSupport: 'absent',
		moveGenerationWhen: 'not-applicable-frameless-never-emitted-vue-2',
	},
} as const;
