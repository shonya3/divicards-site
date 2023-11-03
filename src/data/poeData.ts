import { includesMap } from './data';
import { IActArea, ICard, IMap, IMapBoss, IPoeData } from './poeData.types';

export class PoeData implements IPoeData {
	acts: IActArea[];
	cards: ICard[];
	maps: IMap[];
	mapbosses: IMapBoss[];
	constructor(poeData: IPoeData) {
		const { acts, cards, maps, mapbosses } = poeData;
		this.acts = acts;
		this.cards = cards;
		this.maps = maps;
		this.mapbosses = mapbosses;
	}

	card(name: string): ICard | null {
		return this.cards.find(c => c.name.trim().toLowerCase() === name.trim().toLowerCase()) ?? null;
	}

	mapboss(name: string): IMapBoss | null {
		return this.mapbosses.find(c => c.name.trim().toLowerCase() === name.trim().toLowerCase()) ?? null;
	}

	bossesByMap(map: string): string[] {
		const bossnames: string[] = [];
		for (const b of this.mapbosses) {
			if (includesMap(map, b.maps)) {
				bossnames.push(b.name);
			}
		}
		return bossnames;
	}
}
