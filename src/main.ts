import { LitElement, css, PropertyValueMap, html, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import './style.css';

declare global {
	interface HTMLElementTagNameMap {
		'e-transition-app': TransitionAppElement;
		'e-square': SquareElement;
		'e-border': BorderElement;
	}
}

declare global {
	interface Document {
		startViewTransition: (cb: (...args: any[]) => any) => Promise<unknown>;
	}
}

@customElement('e-border')
export class BorderElement extends LitElement {
	@property() color = 'violet';

	protected willUpdate(map: PropertyValueMap<this>): void {
		if (map.has('color')) {
			this.style.setProperty('border-color', this.color);
		}
	}

	static styles = css`
		:host {
			paint: contain;
			display: block;
			position: absolute;
			border: 2px solid;
			width: 200%;
			height: 200%;

			top: 50%;
			right: 50%;
			transform: translate(50%, -50%);
		}
	`;
}

@customElement('e-square')
export class SquareElement extends LitElement {
	@property({ type: Number }) size = 50;
	@property() color = 'blue';

	protected willUpdate(map: PropertyValueMap<this>): void {
		if (map.has('size')) {
			this.style.setProperty('--size', `${this.size}px`);
		}

		if (map.has('color')) {
			this.style.setProperty('--background-color', `${this.color}`);
		}
	}

	#handleBorderChange(e: Event) {
		console.log('slot');
		const target = e.target as HTMLSlotElement;
		console.log(target.childNodes.length);

		let color: string | null = null;
		for (const child of target.assignedElements()) {
			if (child instanceof BorderElement) {
				color = child.color;
			}
		}

		if (color) {
			this.style.setProperty('--background-color', color);
		} else {
			this.style.setProperty('--background-color', this.color);
		}
	}

	protected render() {
		return html`<slot name="border" @slotchange=${this.#handleBorderChange}></slot>`;
	}

	static styles = css`
		:host {
			paint: contain;
			display: block;
			position: relative;
			width: var(--size);
			height: var(--size);
			background-color: var(--background-color);

			transition: background-color 200ms ease-out;
		}
	`;
}

@customElement('e-transition-app')
export class TransitionAppElement extends LitElement {
	@state() squares = [
		{ size: 50, color: 'green', border: true },
		{ size: 100, color: 'yellow', border: false },
	];

	@state() borderIndex = 0;

	#moveBorder() {
		document.startViewTransition(() => {
			this.borderIndex = this.borderIndex === 0 ? 1 : 0;
		});
	}

	#transitionName(name: string) {
		return `${this.tagName}-${name}`;
	}

	protected render() {
		const squares = this.squares.map(({ size, color }, index) => {
			return html`<li>
				<e-square style="view-transition-name: ${this.#transitionName(color)}" size=${size} color=${color}>
					${this.borderIndex === index
						? html`<e-border
								slot="border"
								color="indigo"
								style="view-transition-name: ${this.#transitionName('border')}"
						  ></e-border>`
						: nothing}
				</e-square>
			</li>`;
		});

		return html`<div class="controls">
				<button @click=${this.#moveBorder}>Move border</button>
			</div>
			<ul>
				${squares}
			</ul>`;
	}

	static styles = css`
		:host {
			display: block;
		}

		ul {
			margin: 0;
			background-color: #434343;
			padding: 10rem;
			list-style: none;
			display: flex;
			gap: 10rem;
		}
	`;
}
document.body.append(document.createElement('e-transition-app'));

// region:     --- lib
export type Styles = Record<string, string>;
export type Props = Record<any, any>;

export function createElement(tag: keyof HTMLElementTagNameMap, props: Props = {}, styles: Styles = {}) {
	const el = Object.assign(document.createElement(tag), props);
	setStyles(el, styles);
	return el;
}

export function setStyles(el: HTMLElement, styles: Styles) {
	for (const [key, value] of Object.entries(styles)) {
		el.style.setProperty(key, value);
	}
}
// endregion:  --- lib

// region:     --- create elements
const border = createElement('e-border', { color: 'red', slot: 'border' }, { 'view-transition-name': 'border' });
const green = createElement('e-square', { size: 50, color: 'green' }, { 'view-transition-name': 'green-square' });
const yellow = createElement('e-square', { size: 100, color: 'yellow' }, { 'view-transition-name': 'yellow-square' });

const squares = createElement(
	'div',
	{},
	{
		display: 'flex',
		gap: '10rem',
		padding: '10rem',
		'background-color': '#434343',
	}
);

const button = createElement('button', {
	textContent: 'Move border',
	onclick() {
		document.startViewTransition(() => {
			moveBorder();
		});
	},
});
// endregion:  --- create elements

green.append(border);
squares.append(green, yellow);
document.body.append(button, squares);

function moveBorder() {
	const parentSquare = border.closest('e-square');
	if (parentSquare) {
		const nextSquare = parentSquare.color === 'green' ? yellow : green;
		nextSquare.append(border);
	} else {
		throw new Error('Could not find closest e-square');
	}
}
