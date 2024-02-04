/*
import { LitElement, css, PropertyValueMap, html, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import './style.css';

declare global {
	interface HTMLElementTagNameMap {
		'e-transition-app': TransitionAppElement;
		'e-square': SquareElement;
		'e-border': BorderElement;
		'e-with-border': WithBorderElement;
	}
}

declare global {
	interface Document {
		startViewTransition: (cb: (...args: any[]) => any) => Promise<unknown>;
	}
}

@customElement('e-with-border')
export class WithBorderElement extends LitElement {
	@property({ type: Boolean }) border = false;

	@state() showBorder = false;
	@state() borderWidth = 0;
	@state() borderHeight = 0;

	protected willUpdate(map: PropertyValueMap<this>): void {
		if (map.has('borderWidth')) {
			console.log(this.borderWidth);
		}
	}

	#onSlotChange(e: Event) {
		const target = e.target as HTMLSlotElement;
		const elements = target.assignedElements();

		if (elements.length > 1) {
			throw new Error('Expected 0 or 1 child elements');
		}

		if (elements.length === 1) {
			this.showBorder = true;

			const element = elements[0] as Element & { size?: number };

			const size = element.size;
			if (typeof size === 'number') {
				console.log(element, size);
				this.borderHeight = size;
				this.borderWidth = size;

				this.style.setProperty('width', `${size}px`);
				this.style.setProperty('height', `${size}px`);
				console.log(window.getComputedStyle(this).width);

				const wrapper = this.shadowRoot?.querySelector('.wrapper') as HTMLElement;
				wrapper.style.setProperty('width', `${size}px`);
				wrapper.style.setProperty('height', `${size}px`);
			}

			// const border = this.shadowRoot!.querySelector('e-border');
			// console.log(this.shadowRoot!.querySelector('e-border'));
			// console.log(border);
		} else {
			this.showBorder = false;
		}
	}

	render() {
		return html`<div class="wrapper">
			<slot @slotchange=${this.#onSlotChange}></slot>
			${this.showBorder
				? html`<e-border width=${this.borderWidth} height=${this.borderHeight}></e-border>`
				: nothing}
		</div>`;
	}

	static styles = css`
		* {
			box-sizing: border-box;
			padding: 0;
			margin: 0;
		}

		.wrapper {
			position: relative;
			display: flex;
			justify-content: center;
			align-items: center;
		}

		e-border {
			box-sizing: content-box;
			view-transition-name: unique-border;
		}
	`;
}

@customElement('e-border')
export class BorderElement extends LitElement {
	@property() color = 'violet';
	@property({ type: Number }) width = 0;
	@property({ type: Number }) height = 0;

	protected willUpdate(map: PropertyValueMap<this>): void {
		if (map.has('color')) {
			this.style.setProperty('border-color', this.color);
		}

		if (map.has('width')) {
			this.style.setProperty('--width', `${this.width}px`);
		}

		if (map.has('height')) {
			this.style.setProperty('--height', `${this.height}px`);
		}
	}

	render() {
		return html` <p>Need to verify</p> `;
	}

	static styles = css`
		* {
			margin: 0;
			padding: 0;
			box-sizing: border-box;
		}

		:host {
			--height: 100%;
			--width: 100%;

			display: block;
			border: 2px solid;
			width: calc(var(--width) + 2.5rem);
			height: calc(var(--height) + 2rem);
			position: absolute;
		}

		p {
			transform: translateY(-100%);
			font-size: var(--font-size);
			top: 0px;
			right: 0px;

			white-space: nowrap;

			max-height: 25px;

			overflow: clip;

			background-color: black;

			height: 50px;
		}
	`;
}

@customElement('e-square')
export class SquareElement extends LitElement {
	@property({ type: Number }) size = 200;
	@property() color = 'blue';
	@property({ type: Boolean }) border = false;
	@property({ attribute: 'border-color' }) borderColor = 'indigo';

	protected willUpdate(map: PropertyValueMap<this>): void {
		if (map.has('size')) {
			this.style.setProperty('--size', `${this.size}px`);
		}

		if (map.has('color')) {
			this.style.setProperty('--background-color', `${this.color}`);
		}

		if (map.has('border')) {
			if (this.border) {
				this.style.setProperty('--background-color', this.borderColor);
			} else {
				this.style.setProperty('--background-color', this.color);
			}
		}
	}

	protected render() {
		return html` <div class="square"></div> `;
	}

	static styles = css`
		* {
			box-sizing: border-box;
			padding: 0;
			margin: 0;
		}

		:host {
			display: block;
			width: var(--size);
			height: var(--size);
		}

		.square {
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
		{ size: 250, color: 'green' },
		{ size: 40, color: 'yellow' },
	];

	@state() borderIndex = 0;

	#moveBorder() {
		document.startViewTransition(() => {
			this.borderIndex = this.borderIndex === 0 ? 1 : 0;
		});
	}

	protected render() {
		const squares = this.squares.map(({ size, color }, index) => {
			const square = html`<e-square size=${size} color=${color}></e-square>`;
			if (index === this.borderIndex) {
				return html`<li><e-with-border>${square}</e-with-border></li>`;
			} else {
				return html`<li>${square}</li>`;
			}
		});

		return html`<div class="controls">
				<button @click=${this.#moveBorder}>Move border</button>
			</div>

			<ul>
				${squares}
			</ul>`;
	}

	static styles = css`
		* {
			padding: 0;
			margin: 0;
			box-sizing: border-box;
			padding-inline: 0;
			padding-block: 0;
		}

		:host {
			display: block;
		}

		e-square::part(border) {
			view-transition-name: unique-transition-name-for-border;
		}

		ul {
			min-height: 50vh;

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
*/
