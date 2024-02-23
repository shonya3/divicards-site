import json from './cardElementData.json' assert { type: 'json' };
export const cardElementDataFromJson: CardElementData[] = json;

export type CardElementData = {
	name: string;
	artFilename: string;
	flavourText: string;
	stackSize: number | null;
	rewardHtml: string;
};
