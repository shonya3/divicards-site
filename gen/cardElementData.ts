import json from './json/cardElementData.json' with { type: 'json' };
export const cardElementDataFromJson: CardElementData[] = json;

export type CardElementData = {
  slug: string;
	name: string;
	artFilename: string;
	flavourText: string;
	stackSize: number | null;
	rewardHtml: string;
	minLevel: number;
	unique: UniqueReward | null;
};

export type UniqueReward = {
	name: string;
	item_class: string;
};
