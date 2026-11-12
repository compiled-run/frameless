import { flush } from 'solid-v2';
import { render } from 'solid-v2-web';
import type { Action, Adapter } from '@frameless/analyzer';

type SolidHandle = { readonly host: HTMLElement; readonly dispose: () => void };

export function createSolid2Adapter(component: (props: any) => unknown): Adapter<SolidHandle> {
	return {
		name: 'solid-2.0.0-rc.21',
		host: (handle) => handle.host,
		mount(host, props) {
			return { host, dispose: render(() => component(props) as never, host) };
		},
		dispatch(handle, action) {
			dispatchDomAction(handle.host, action);
		},
		settle(handle) {
			return boundedQuiescence(handle.host, () => {
				flush();
				return Promise.resolve();
			});
		},
		unmount(handle) {
			handle.dispose();
		},
	};
}

function dispatchDomAction(host: HTMLElement, action: Action): void {
	const target = host.querySelector<HTMLElement>(action.target);
	if (!target) throw new Error(`Action target not found: ${action.target}`);
	if (action.type === 'focus') {
		target.focus();
		if (action.selection && target instanceof HTMLInputElement)
			target.setSelectionRange(...action.selection);
		return;
	}
	if (action.type === 'input') {
		const input = target as HTMLInputElement;
		input.value = action.value;
		if (action.selection) input.setSelectionRange(...action.selection);
		input.dispatchEvent(
			new InputEvent('input', { bubbles: true, inputType: 'insertText', data: action.value }),
		);
		return;
	}
	if (action.type === 'check') {
		const input = target as HTMLInputElement;
		input.checked = !action.checked;
		input.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
		return;
	}
	target.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
}

const SETTLE_TICK_BUDGET = 30;
const SETTLE_STABLE_TICKS = 2;
const SETTLE_TICK_FALLBACK_MS = 50;
const SETTLE_RUNAWAY_MS = 2_000;

async function boundedQuiescence(host: HTMLElement, drain: () => Promise<void>): Promise<void> {
	const start = performance.now();
	let previous = '';
	let stable = 0;
	for (let tick = 1; tick <= SETTLE_TICK_BUDGET; tick += 1) {
		await drain();
		await settleTick();
		const current = host.innerHTML;
		stable = current === previous ? stable + 1 : 0;
		previous = current;
		if (stable >= SETTLE_STABLE_TICKS) return;
		const elapsed = performance.now() - start;
		if (elapsed >= SETTLE_RUNAWAY_MS) {
			throw new Error(
				`Observable DOM settle hit the ${SETTLE_RUNAWAY_MS}ms runaway guard after ${tick} tick(s)`,
			);
		}
	}
	throw new Error(`Observable DOM did not quiesce within ${SETTLE_TICK_BUDGET} settle ticks`);
}

function settleTick(): Promise<void> {
	return new Promise<void>((resolve) => {
		let done = false;
		let timer: ReturnType<typeof setTimeout> | undefined;
		const advance = (): void => {
			if (done) return;
			done = true;
			clearTimeout(timer);
			resolve();
		};
		timer = setTimeout(advance, SETTLE_TICK_FALLBACK_MS);
		requestAnimationFrame(advance);
	});
}
