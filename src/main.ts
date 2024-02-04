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
			display: block;
			border: 2px solid;
			width: 100%;
			height: 100%;

			position: absolute;
		}

		p {
			font-size: var(--font-size);
			position: absolute;
			top: -2px;
			right: 0px;
			transform: translateY(-100%);
		}
	`;
}

@customElement('e-square')
export class SquareElement extends LitElement {
	@property({ type: Number }) size = 50;
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
		return html`<div class="wrapper">
			<div class="square"></div>
			${this.border ? html`<e-border color=${this.borderColor} part="border"></e-border>` : nothing}
		</div>`;
	}

	static styles = css`
		* {
			box-sizing: border-box;
		}
		:host {
			--padding-inline: 2rem;
			--padding-block: var(--font-size, 1rem);
		}

		.wrapper {
			position: relative;
			display: flex;
			justify-content: center;
			align-items: center;

			padding-inline: var(--padding-inline);
			padding-block: var(--padding-block);
		}

		.square {
			width: var(--size);
			height: var(--size);
			background-color: var(--background-color);
			transition: background-color 200ms ease-out;
		}

		e-border {
			box-sizing: content-box;
		}
	`;
}

@customElement('e-transition-app')
export class TransitionAppElement extends LitElement {
	@state() squares = [
		{ size: 250, color: 'green' },
		{ size: 200, color: 'yellow' },
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
				<e-square
					.border=${index === this.borderIndex}
					style="view-transition-name: ${this.#transitionName(color)}"
					size=${size}
					color=${color}
				>
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
