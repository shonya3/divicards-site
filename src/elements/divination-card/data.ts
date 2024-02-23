import { CardElementData, cardElementDataFromJson } from '../../gen/cardElementData';

export const cardsDataMap = new Map<string, CardElementData>();
for (const card of cardElementDataFromJson) {
	cardsDataMap.set(card.name, card);
}
