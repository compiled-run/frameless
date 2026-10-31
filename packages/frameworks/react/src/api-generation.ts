/**
 * React API generation that Frameless emits.
 *
 * Frameless targets React 19 (ref-as-prop, no forwardRef). React 16–18 class
 * lifecycles, connect, and CRA-era APIs already live in versionless.
 */
export const REACT_API_GENERATION = {
	surveyedAt: '2026-10-31',
	defaultGeneration: 19,
	supported: [19],
	pin: { package: 'react', version: '19.2.3' },
	latestPublished: '19.3.1',
	deprecatedApisAlreadyAbsentFromEmit: ['forwardRef', 'string refs', 'ReactDOM.render'],
	versionless: {
		repo: 'compiled-run/versionless',
		frameworkSupport: 'present',
		olderApis: ['class lifecycle', 'react-redux connect', 'CRA process global'],
	},
} as const;
