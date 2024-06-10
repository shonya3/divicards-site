// import { LitElement } from 'lit';
// export class InputElement extends LitElement {}

import { classMap } from 'lit/directives/class-map.js';
import { LitElement, html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import { live } from 'lit/directives/live.js';
import { customElement, property, query, state } from 'lit/decorators.js';
import styles from './input.styles.js';
import type { CSSResultGroup, TemplateResult } from 'lit';

/**
 * My copy of shoelace item that uses <datalist>
 * @summary Inputs collect data from the user.
 * @documentation https://shoelace.style/components/input
 * @status stable
 * @since 2.0
 *
 * @dependency sl-icon
 *
 * @slot label - The input's label. Alternatively, you can use the `label` attribute.
 * @slot prefix - Used to prepend a presentational icon or similar element to the input.
 * @slot suffix - Used to append a presentational icon or similar element to the input.
 * @slot clear-icon - An icon to use in lieu of the default clear icon.
 * @slot show-password-icon - An icon to use in lieu of the default show password icon.
 * @slot hide-password-icon - An icon to use in lieu of the default hide password icon.
 * @slot help-text - Text that describes how to use the input. Alternatively, you can use the `help-text` attribute.
 *
 * @event sl-blur - Emitted when the control loses focus.
 * @event sl-change - Emitted when an alteration to the control's value is committed by the user.
 * @event sl-clear - Emitted when the clear button is activated.
 * @event sl-focus - Emitted when the control gains focus.
 * @event sl-input - Emitted when the control receives input.
 * @event sl-invalid - Emitted when the form control has been checked for validity and its constraints aren't satisfied.
 *
 * @csspart form-control - The form control that wraps the label, input, and help text.
 * @csspart form-control-label - The label's wrapper.
 * @csspart form-control-input - The input's wrapper.
 * @csspart form-control-help-text - The help text's wrapper.
 * @csspart base - The component's base wrapper.
 * @csspart input - The internal `<input>` control.
 * @csspart prefix - The container that wraps the prefix.
 * @csspart clear-button - The clear button.
 * @csspart password-toggle-button - The password toggle button.
 * @csspart suffix - The container that wraps the suffix.
 */

@customElement('e-input')
export class InputElement extends LitElement {
	static styles: CSSResultGroup = styles;

	@query('.input__control') input!: HTMLInputElement;

	@property({ type: Array }) datalistItems: string[] = [];

	@state() private hasFocus = false;
	@property() title = ''; // make reactive to pass through

	private __numberInput = Object.assign(document.createElement('input'), { type: 'number' });
	private __dateInput = Object.assign(document.createElement('input'), { type: 'date' });

	/**
	 * The type of input. Works the same as a native `<input>` element, but only a subset of types are supported. Defaults
	 * to `text`.
	 */
	@property({ reflect: true }) type:
		| 'date'
		| 'datetime-local'
		| 'email'
		| 'number'
		| 'password'
		| 'search'
		| 'tel'
		| 'text'
		| 'time'
		| 'url' = 'text';

	static formAssociated = true;
	internals = this.attachInternals();

	@property() list: string = '';

	/** The name of the input, submitted as a name/value pair with form data. */
	@property()
	name = '';

	/** The current value of the input, submitted as a name/value pair with form data. */
	@property() value = '';

	/** The input's size. */
	@property({ reflect: true }) size: 'small' | 'medium' | 'large' = 'medium';

	/** Draws a filled input. */
	@property({ type: Boolean, reflect: true }) filled = false;

	/** Draws a pill-style input with rounded edges. */
	@property({ type: Boolean, reflect: true }) pill = false;

	/** The input's label. If you need to display HTML, use the `label` slot instead. */
	@property() label = '';

	/** The input's help text. If you need to display HTML, use the `help-text` slot instead. */
	@property({ attribute: 'help-text' }) helpText = '';

	/** Adds a clear button when the input is not empty. */
	@property({ type: Boolean }) clearable = false;

	/** Disables the input. */
	@property({ type: Boolean, reflect: true }) disabled = false;

	/** Placeholder text to show as a hint when the input is empty. */
	@property() placeholder = '';

	/** Makes the input readonly. */
	@property({ type: Boolean, reflect: true }) readonly = false;

	/** Adds a button to toggle the password's visibility. Only applies to password types. */
	@property({ attribute: 'password-toggle', type: Boolean }) passwordToggle = false;

	/** Determines whether or not the password is currently visible. Only applies to password input types. */
	@property({ attribute: 'password-visible', type: Boolean }) passwordVisible = false;

	/** Hides the browser's built-in increment/decrement spin buttons for number inputs. */
	@property({ attribute: 'no-spin-buttons', type: Boolean }) noSpinButtons = false;

	/**
	 * By default, form controls are associated with the nearest containing `<form>` element. This attribute allows you
	 * to place the form control outside of a form and associate it with the form that has this `id`. The form must be in
	 * the same document or shadow root for this to work.
	 */
	@property({ reflect: true }) form = '';

	/** Makes the input a required field. */
	@property({ type: Boolean, reflect: true }) required = false;

	/** A regular expression pattern to validate input against. */
	@property() pattern!: string;

	/** The minimum length of input that will be considered valid. */
	@property({ type: Number }) minlength!: number;

	/** The maximum length of input that will be considered valid. */
	@property({ type: Number }) maxlength!: number;

	/** The input's minimum value. Only applies to date and number input types. */
	@property() min!: number | string;

	/** The input's maximum value. Only applies to date and number input types. */
	@property() max!: number | string;

	/**
	 * Specifies the granularity that the value must adhere to, or the special value `any` which means no stepping is
	 * implied, allowing any numeric value. Only applies to date and number input types.
	 */
	@property() step!: number | 'any';

	/** Controls whether and how text input is automatically capitalized as it is entered by the user. */
	@property() autocapitalize!: 'off' | 'none' | 'on' | 'sentences' | 'words' | 'characters';

	/** Indicates whether the browser's autocorrect feature is on or off. */
	@property() autocorrect!: 'off' | 'on';

	/**
	 * Specifies what permission the browser has to provide assistance in filling out form field values. Refer to
	 * [this page on MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/autocomplete) for available values.
	 */
	@property() autocomplete!: string;

	/** Indicates that the input should receive focus on page load. */
	@property({ type: Boolean }) autofocus!: boolean;

	/** Used to customize the label or icon of the Enter key on virtual keyboards. */
	@property() enterkeyhint!: 'enter' | 'done' | 'go' | 'next' | 'previous' | 'search' | 'send';

	/** Enables spell checking on the input. */
	@property({
		type: Boolean,
		converter: {
			// Allow "true|false" attribute values but keep the property boolean
			fromAttribute: value => (!value || value === 'false' ? false : true),
			toAttribute: value => (value ? 'true' : 'false'),
		},
	})
	spellcheck = true;

	/**
	 * Tells the browser what type of data will be entered by the user, allowing it to display the appropriate virtual
	 * keyboard on supportive devices.
	 */
	@property() inputmode!: 'none' | 'text' | 'decimal' | 'numeric' | 'tel' | 'search' | 'email' | 'url';

	//
	// NOTE: We use an in-memory input for these getters/setters instead of the one in the template because the properties
	// can be set before the component is rendered.
	//

	/**
	 * Gets or sets the current value as a `Date` object. Returns `null` if the value can't be converted. This will use the native `<input type="{{type}}">` implementation and may result in an error.
	 */
	get valueAsDate(): Date | null {
		this.__dateInput.type = this.type;
		this.__dateInput.value = this.value;
		return this.input?.valueAsDate || this.__dateInput.valueAsDate;
	}

	set valueAsDate(newValue: Date | null) {
		this.__dateInput.type = this.type;
		this.__dateInput.valueAsDate = newValue;
		this.value = this.__dateInput.value;
	}

	/** Gets or sets the current value as a number. Returns `NaN` if the value can't be converted. */
	get valueAsNumber(): number {
		this.__numberInput.value = this.value;
		return this.input?.valueAsNumber || this.__numberInput.valueAsNumber;
	}

	set valueAsNumber(newValue: number) {
		this.__numberInput.valueAsNumber = newValue;
		this.value = this.__numberInput.value;
	}

	/** Gets the validity state object */
	get validity(): ValidityState {
		return this.input.validity;
	}

	/** Gets the validation message */
	get validationMessage(): string {
		return this.input.validationMessage;
	}

	private handleBlur() {
		this.hasFocus = false;
	}

	private handleChange() {
		this.value = this.input.value;
	}

	private handleClearClick(event: MouseEvent) {
		this.value = '';
		this.input.focus();

		event.stopPropagation();
	}

	private handleFocus() {
		this.hasFocus = true;
	}

	private handleInput() {
		this.value = this.input.value;
		this.dispatchEvent(new Event('input', { composed: true, bubbles: true }));
	}

	private handlePasswordToggle() {
		this.passwordVisible = !this.passwordVisible;
	}

	/** Sets focus on the input. */
	focus(options?: FocusOptions): void {
		this.input.focus(options);
	}

	/** Removes focus from the input. */
	blur(): void {
		this.input.blur();
	}

	/** Selects all the text in the input. */
	select(): void {
		this.input.select();
	}

	/** Sets the start and end positions of the text selection (0-based). */
	setSelectionRange(
		selectionStart: number,
		selectionEnd: number,
		selectionDirection: 'forward' | 'backward' | 'none' = 'none'
	): void {
		this.input.setSelectionRange(selectionStart, selectionEnd, selectionDirection);
	}

	/** Replaces a range of text with a new string. */
	setRangeText(
		replacement: string,
		start?: number,
		end?: number,
		selectMode: 'select' | 'start' | 'end' | 'preserve' = 'preserve'
	): void {
		const selectionStart = start ?? this.input.selectionStart!;
		const selectionEnd = end ?? this.input.selectionEnd!;

		this.input.setRangeText(replacement, selectionStart, selectionEnd, selectMode);

		if (this.value !== this.input.value) {
			this.value = this.input.value;
		}
	}

	/** Displays the browser picker for an input element (only works if the browser supports it for the input type). */
	showPicker(): void {
		if ('showPicker' in HTMLInputElement.prototype) {
			this.input.showPicker();
		}
	}

	/** Increments the value of a numeric input type by the value of the step attribute. */
	stepUp(): void {
		this.input.stepUp();
		if (this.value !== this.input.value) {
			this.value = this.input.value;
		}
	}

	/** Decrements the value of a numeric input type by the value of the step attribute. */
	stepDown(): void {
		this.input.stepDown();
		if (this.value !== this.input.value) {
			this.value = this.input.value;
		}
	}

	/** Checks for validity but does not show a validation message. Returns `true` when valid and `false` when invalid. */
	checkValidity(): boolean {
		return this.input.checkValidity();
	}

	/** Checks for validity and shows the browser's validation message if the control is invalid. */
	reportValidity(): boolean {
		return this.input.reportValidity();
	}

	/** Sets a custom validation message. Pass an empty string to restore validity. */
	setCustomValidity(message: string): void {
		this.input.setCustomValidity(message);
	}

	render(): TemplateResult {
		const hasClearIcon = this.clearable && !this.disabled && !this.readonly;
		const isClearIconVisible = hasClearIcon && (typeof this.value === 'number' || this.value.length > 0);
		const hasLabel = Boolean(this.label);

		return html`
			<div
				part="form-control"
				class=${classMap({
					'form-control': true,
					'form-control--small': this.size === 'small',
					'form-control--medium': this.size === 'medium',
					'form-control--large': this.size === 'large',
					'form-control--has-label': hasLabel,
				})}
			>
				<label part="form-control-label" class="form-control__label" for="input">
					<slot name="label">${this.label}</slot>
				</label>

				<div part="form-control-input" class="form-control-input">
					<div
						part="base"
						class=${classMap({
							input: true,

							// Sizes
							'input--small': this.size === 'small',
							'input--medium': this.size === 'medium',
							'input--large': this.size === 'large',

							// States
							'input--pill': this.pill,
							'input--standard': !this.filled,
							'input--filled': this.filled,
							'input--disabled': this.disabled,
							'input--focused': this.hasFocus,
							'input--empty': !this.value,
							'input--no-spin-buttons': this.noSpinButtons,
						})}
					>
						<span part="prefix" class="input__prefix">
							<slot name="prefix"></slot>
						</span>

						<datalist id="test-list">
							${this.datalistItems.map(item => html`<option value=${item}>${item}</option>`)}
						</datalist>

						<input
							list="test-list"
							part="input"
							id="input"
							class="input__control"
							type=${this.type === 'password' && this.passwordVisible ? 'text' : this.type}
							title=${
								this
									.title /* An empty title prevents browser validation tooltips from appearing on hover */
							}
							name=${ifDefined(this.name)}
							?disabled=${this.disabled}
							?readonly=${this.readonly}
							?required=${this.required}
							placeholder=${ifDefined(this.placeholder)}
							minlength=${ifDefined(this.minlength)}
							maxlength=${ifDefined(this.maxlength)}
							min=${ifDefined(this.min)}
							max=${ifDefined(this.max)}
							step=${ifDefined(this.step as number)}
							.value=${live(this.value)}
							autocapitalize=${ifDefined(this.autocapitalize)}
							?autofocus=${this.autofocus}
							spellcheck=${this.spellcheck}
							pattern=${ifDefined(this.pattern)}
							inputmode=${ifDefined(this.inputmode)}
							aria-describedby="help-text"
							@change=${this.handleChange}
							@input=${this.handleInput}
							@focus=${this.handleFocus}
							@blur=${this.handleBlur}
						/>

						${hasClearIcon
							? html`
									<button
										part="clear-button"
										class=${classMap({
											input__clear: true,
											'input__clear--visible': isClearIconVisible,
										})}
										type="button"
										@click=${this.handleClearClick}
										tabindex="-1"
									>
										<slot name="clear-icon">
											<!-- <sl-icon name="x-circle-fill" library="system"></sl-icon> -->
										</slot>
									</button>
							  `
							: ''}
						${this.passwordToggle && !this.disabled
							? html`
									<button
										part="password-toggle-button"
										class="input__password-toggle"
										type="button"
										@click=${this.handlePasswordToggle}
										tabindex="-1"
									>
										${this.passwordVisible
											? html`
													<slot name="show-password-icon">
														<!-- 
														<sl-icon name="eye-slash" library="system"></sl-icon>-->
													</slot>
											  `
											: html`
													<slot name="hide-password-icon">
														<!--
														<sl-icon name="eye" library="system"></sl-icon>

                                                    -->
													</slot>
											  `}
									</button>
							  `
							: ''}

						<span part="suffix" class="input__suffix">
							<slot name="suffix"></slot>
						</span>

						<slot name="datalist"></slot>
					</div>
				</div>

				<div part="form-control-help-text" id="help-text" class="form-control__help-text">
					<slot name="help-text">${this.helpText}</slot>
				</div>
			</div>
		`;
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'e-input': InputElement;
	}
}
