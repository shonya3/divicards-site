import json from './json/cardElementData.json' assert { type: 'json' };
export const cardElementDataFromJson: CardElementData[] = json;

export type CardElementData = {
	name: string;
	artFilename: string;
	flavourText: string;
	stackSize: number | null;
	rewardHtml: string;
	dropLevel: DropLevel;
};

export type DropLevel = {
	level: { min: number | null; max: number | null };
	label: string;
};
