import { LitElement, html, css, nothing, PropertyValueMap, TemplateResult } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { PresetConfig, DEFAULT_PRESETS } from './presets';
import {
	Greynote,
	RemainingWork,
	Confidence,
	GREYNOTE_VARIANTS,
	CONFIDENCE_VARIANTS,
	REMAINING_WORK_VARIANTS,
} from '../../../../../gen/divcord';
import { SlConverter } from '../../../../utils';

import '@shoelace-style/shoelace/dist/components/select/select.js';
import '@shoelace-style/shoelace/dist/components/option/option.js';
import '@shoelace-style/shoelace/dist/components/button/button.js';
import '@shoelace-style/shoelace/dist/components/input/input.js';
import '@shoelace-style/shoelace/dist/components/checkbox/checkbox.js';
import '@shoelace-style/shoelace/dist/components/icon-button/icon-button.js';
import { classMap } from 'lit/directives/class-map.js';

/**
 * @summary Controls for divcord presets
 *
 * @event config-updated - Emitted when active config options updated
 * @event preset-applied
 * @event custom-presets-updated
 */
@customElement('e-divcord-presets')
export class DivcordPresetsElement extends LitElement {
	@property({ type: Array }) custom_presets: PresetConfig[] = [];

	@state() config: Omit<PresetConfig, 'name'> = DEFAULT_PRESETS[0];
	@state() presetActionState: 'adding' | 'deleting' | 'idle' = 'idle';
	@state() presetsForDelete: Set<string> = new Set();

	protected async updated(map: PropertyValueMap<this>): Promise<void> {
		if (map.has('presetActionState')) {
			if (this.presetActionState === 'adding') {
				await this.updateComplete;
				this.inputNewPresetNameEl.focus();
			}
		}
	}

	protected render(): TemplateResult {
		return html`
			<div
				class=${classMap({
					element: true,
					'element--adding': this.presetActionState === 'adding',
				})}
			>
				<h3>Presets</h3>

				<div class="presets-buttons">
					${DEFAULT_PRESETS.map(
						preset =>
							html`<sl-button @click=${this.#applyPreset.bind(this, preset)}>${preset.name}</sl-button>`
					)}
					${this.custom_presets.map(preset => {
						const btn = html`<sl-button @click=${this.#applyPreset.bind(this, preset)}
							>${preset.name}</sl-button
						>`;

						const select = html`<sl-checkbox @sl-input=${this.#onPresetChecked} .value=${preset.name}
							>${preset.name}</sl-checkbox
						>`;
						return this.presetActionState === 'deleting' ? select : btn;
					})}
					${this.AddingPresets()} ${this.DeletingPresets()}
					${this.presetActionState !== 'idle'
						? html`<sl-button @click=${this.#onCancelClicked}>Cancel</sl-button>`
						: nothing}
				</div>

				<div class="filters">
					<sl-select
						label="Greynote"
						.value=${this.config.greynote.map(c => SlConverter.toSlValue(c))}
						@sl-change=${this.#onGreynotesSelectChange}
						multiple
						clearable
					>
						${Array.from(GREYNOTE_VARIANTS).map(variant => {
							return html` <sl-option value=${SlConverter.toSlValue(variant)}>${variant}</sl-option>`;
						})}
					</sl-select>
					<sl-select
						label="Confidence"
						.value=${this.config.confidence.map(c => SlConverter.toSlValue(c))}
						@sl-change=${this.#onConfidenceSelectChange}
						multiple
						clearable
					>
						${Array.from(CONFIDENCE_VARIANTS).map(variant => {
							return html` <sl-option value=${SlConverter.toSlValue(variant)}>${variant}</sl-option>`;
						})}
					</sl-select>

					<sl-select
						.value=${this.config.remainingWork.map(c => SlConverter.toSlValue(c))}
						@sl-change=${this.#onRemainingWorkSelectChange}
						label="Remaining Work"
						multiple
						clearable
					>
						${Array.from(REMAINING_WORK_VARIANTS).map(variant => {
							return html` <sl-option value=${SlConverter.toSlValue(variant)}>${variant}</sl-option>`;
						})}
					</sl-select>
				</div>
			</div>
		`;
	}

	connectedCallback(): void {
		super.connectedCallback();
		window.addEventListener('keydown', this.onEscapePressed);
	}

	disconnectedCallback(): void {
		super.disconnectedCallback();
		window.removeEventListener('keydown', this.onEscapePressed);
	}

	#updateConfig(newConfig: Omit<PresetConfig, 'name'>) {
		this.config = newConfig;
		this.dispatchEvent(new Event('config-updated'));
	}

	#applyPreset(preset: PresetConfig) {
		this.#updateConfig({ ...preset });
		this.dispatchEvent(new CustomEvent('preset-applied', { detail: preset, bubbles: true, composed: true }));
	}

	#updateCustomPresets(customPresets: PresetConfig[]) {
		this.dispatchEvent(
			new CustomEvent('custom-presets-updated', { detail: customPresets, bubbles: true, composed: true })
		);
	}

	#onGreynotesSelectChange(e: Event) {
		const target = e.target as EventTarget & { value: string[] };
		const options = target.value.map(opt => SlConverter.fromSlValue<Greynote>(opt));
		this.#updateConfig({ ...this.config, greynote: options });
	}
	#onRemainingWorkSelectChange(e: Event) {
		const target = e.target as EventTarget & { value: string[] };
		const options = target.value.map(opt => SlConverter.fromSlValue<RemainingWork>(opt));
		this.#updateConfig({ ...this.config, remainingWork: options });
	}
	#onConfidenceSelectChange(e: Event) {
		const target = e.target as EventTarget & { value: string[] };
		const options = target.value.map(opt => SlConverter.fromSlValue<Confidence>(opt));
		this.#updateConfig({ ...this.config, confidence: options });
	}

	#onPlusPresetClicked() {
		this.presetActionState = 'adding';
	}

	#onDeleteModeActivate() {
		this.presetActionState = 'deleting';
	}

	#onCancelClicked() {
		this.presetActionState = 'idle';
	}

	#onTrashClicked() {
		const customPresets = this.custom_presets.filter(preset => {
			return !this.presetsForDelete.has(preset.name);
		});
		this.#updateCustomPresets(customPresets);

		this.presetsForDelete = new Set();
		this.presetActionState = 'idle';
	}

	onEscapePressed = (e: KeyboardEvent) => {
		if (e.key === 'Escape') {
			this.presetActionState = 'idle';
		}
	};

	findPreset(name: string): PresetConfig | null {
		return [...DEFAULT_PRESETS, ...this.custom_presets].find(p => p.name === name) ?? null;
	}

	@query('#input-new-preset-name') inputNewPresetNameEl!: HTMLInputElement;
	#onSubmitNewPreset(e: SubmitEvent) {
		e.preventDefault();
		const name = this.inputNewPresetNameEl.value;
		if (!name) {
			return;
		}

		if (this.findPreset(name)) {
			this.inputNewPresetNameEl.setCustomValidity('Duplicate names');
			return;
		}

		this.inputNewPresetNameEl.value = '';

		const newPreset = { ...this.config, name };

		const customPresets = [...this.custom_presets, newPreset];

		this.#updateCustomPresets(customPresets);
		this.presetActionState = 'idle';
	}

	#onPresetChecked(e: Event) {
		const target = e.target as EventTarget & { checked: boolean; value: string };
		const name = target.value;
		const checked = target.checked;
		checked ? this.presetsForDelete.add(name) : this.presetsForDelete.delete(name);
		this.presetsForDelete = new Set(this.presetsForDelete);
	}

	protected AddingPresets(): TemplateResult | typeof nothing {
		switch (this.presetActionState) {
			case 'idle': {
				return html`<sl-icon-button
					label="add preset"
					@click=${this.#onPlusPresetClicked}
					class="preset-action-btn"
					name="plus-lg"
				></sl-icon-button>`;
			}

			case 'adding': {
				return html`<form @submit=${this.#onSubmitNewPreset} class="adding-new-preset">
					<sl-input
						class="adding-new-preset_input"
						required
						id="input-new-preset-name"
						label="name for your preset"
						.helpText=${'set configs and then confirm'}
					></sl-input>
					<sl-button type="submit" class="adding-new-preset_confirm-btn">Confirm</sl-button>
				</form>`;
			}

			case 'deleting': {
				return nothing;
			}
		}
	}

	protected DeletingPresets(): TemplateResult | typeof nothing {
		if (this.custom_presets.length === 0) return nothing;

		switch (this.presetActionState) {
			case 'idle': {
				return html`<sl-button @click=${this.#onDeleteModeActivate}>Delete some presets</sl-button>`;
			}

			case 'adding': {
				return nothing;
			}

			case 'deleting': {
				return html`<sl-icon-button
					@click=${this.#onTrashClicked}
					class="preset-action-btn"
					name="trash3"
					.disabled=${this.presetsForDelete.size === 0}
				></sl-icon-button>`;
			}
		}
	}

	static styles = css`
		* {
			padding: 0;
			margin: 0;
			box-sizing: border-box;
		}

		:host {
			display: block;
		}

		.element {
			padding: 1rem;
		}

		.element--adding {
			border: 1px solid var(--sl-color-blue-700);
		}

		.presets-buttons {
			display: flex;
			align-items: center;
			flex-wrap: wrap;
			gap: 0.2rem;
		}

		.preset-action-btn {
			font-size: 1.5rem;
		}

		.adding-new-preset {
			display: flex;
			gap: 0.2rem;
			align-items: center;
			justify-content: center;
			margin-left: 0.2rem;
		}

		.adding-new-preset_input {
			margin-bottom: 0.2rem;
		}

		.filters {
			display: flex;
			flex-wrap: wrap;
			gap: 1rem;
		}

		.filters > * {
			min-width: 400px;
		}
	`;
}

declare global {
	interface HTMLElementTagNameMap {
		'e-divcord-presets': DivcordPresetsElement;
	}
}
