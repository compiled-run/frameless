declare module 'solid-v2' {
	export function flush(): void;
}

declare module 'solid-v2-web' {
	export function render(code: () => unknown, element: Node, options?: unknown): () => void;
}
