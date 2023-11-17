import { includesMap } from './data/CardsFinder';
import { IActArea, ICard, IMap, IMapBoss, IPoeData } from './data/poeData.types';

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

	findActAreaById(actId: string) {
		return this.acts.find(area => area.id === actId);
	}

	findMap(name: string) {
		return this.maps.find(map => map.name.toLowerCase() === name.trim().toLowerCase());
	}

	findActbossAndArea(name: string) {
		for (const area of this.acts) {
			const actAreaBoss = area.bossfights.find(boss => boss.name === name);
			if (actAreaBoss) {
				return {
					area,
					actAreaBoss,
				};
			}
		}
	}

	findMapbossAndMaps(name: string) {
		const mapboss = this.mapboss(name);
		if (!mapboss) return null;
		const maps = mapboss.maps.map(m => {
			const map = this.findMap(m);
			if (!map) {
				throw new Error(`No map for ${map}`);
			}
			return map;
		});
		return {
			mapboss,
			maps,
		};
	}

	card(name: string): ICard | null {
		return this.cards.find(c => c.name.trim().toLowerCase() === name.trim().toLowerCase()) ?? null;
	}

	minLevel(card: string): number {
		return this.card(card)?.minLevel ?? 0;
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
