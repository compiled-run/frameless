/**
 * Vue API generation that Frameless emits.
 *
 * Frameless targets Vue 3 `<script setup>` with valued `:` / `@` shorthands.
 * Vue 2 Options API is out of this package. Vue 3.6 RC ships opt-in Vapor
 * Mode; it does not deprecate `<script setup>`, so this lane stays on the
 * Vue 3 baseline. Versionless has no Vue lane yet.
 */
export const VUE_API_GENERATION = {
	surveyedAt: '2026-11-01',
	defaultGeneration: 3,
	supported: [3],
	pin: { package: 'vue', version: '^3.5.40' },
	latestPublished: '3.5.44',
	latestPrerelease: '3.6.0-rc.14',
	deprecatedApisAlreadyAbsentFromEmit: ['Options API', 'Vue 2 filters', 'new Vue()'],
	versionless: {
		repo: 'compiled-run/versionless',
		frameworkSupport: 'absent',
		moveGenerationWhen: 'not-applicable-frameless-never-emitted-vue-2',
	},
} as const;
