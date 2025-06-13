import {
	Greynote,
	Confidence,
	RemainingWork,
	GREYNOTE_VARIANTS,
	CONFIDENCE_VARIANTS,
	REMAINING_WORK_VARIANTS,
} from '../../../../../gen/divcord';

export type PresetConfig = {
	name: string;
	greynote: Greynote[];
	confidence: Confidence[];
	remainingWork: RemainingWork[];
};

export const DEFAULT_PRESETS: PresetConfig[] = [
	{
		name: 'Show All',
		greynote: Array.from(GREYNOTE_VARIANTS),
		confidence: Array.from(CONFIDENCE_VARIANTS),
		remainingWork: Array.from(REMAINING_WORK_VARIANTS),
	},
	{
		name: 'Divcord Preset',
		greynote: ['Empty', 'Area-specific', 'Chest_object', 'disabled', 'Monster-specific'],
		confidence: ['low', 'none', 'ok'],
		remainingWork: Array.from(REMAINING_WORK_VARIANTS),
	},
];
