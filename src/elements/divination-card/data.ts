import { cardElementDataFromJson } from '../../gen/cardElementDataFromJson';

export interface CardElementData {
	name: string;
	artFilename: string;
	flavourText: string;
	stackSize: number | null;
	rewardHtml: string;
}

export const cardsDataMap = new Map<string, CardElementData>();
for (const card of cardElementDataFromJson) {
	cardsDataMap.set(card.name, card);
}
