import type { ActArea, Bossfight, Card, MapArea, MapBoss, IPoeData } from './gen/poeData';
import { poeDataFromJson } from './gen/poeData';

export class PoeData implements IPoeData {
	acts: ActArea[];
	cards: Record<string, Card>;
	maps: MapArea[];
	mapbosses: MapBoss[];
	cardsMap: Map<string, Card> = new Map();
	find: FindPoeData;
	constructor(poeDataFromJson: IPoeData) {
		const { acts, cards, maps, mapbosses } = structuredClone(poeDataFromJson);
		this.acts = acts;
		this.cards = cards;
		this.maps = maps;
		this.mapbosses = mapbosses;
		this.find = new FindPoeData(this);
	}

	cardMinLevel(card: string): number {
		return this.find.card(card)?.minLevel ?? 0;
	}

	areaLevel(name: string, area: 'Map' | 'Act'): number | null {
		switch (area) {
			case 'Map': {
				const tier = this.find.map(name)?.tier;
				return typeof tier === 'number' ? tier + 67 : null;
			}
			case 'Act': {
				return this.find.actArea(name)?.areaLevel ?? null;
			}
			default:
				throw new Error('Type should be Act or Map');
		}
	}
}

/** Utility class to find map, act, etc */
class FindPoeData {
	#poe: Readonly<PoeData>;
	constructor(poeData: Readonly<PoeData>) {
		this.#poe = poeData;
	}

	actArea(id: string): ActArea | null {
		return this.#poe.acts.find(area => area.id === id) ?? null;
	}

	map(name: string): MapArea | null {
		return this.#poe.maps.find(map => map.name.toLowerCase() === name.trim().toLowerCase()) ?? null;
	}

	card(name: string): Card | null {
		return this.#poe.cards[name] ?? null;
	}

	actBossAndArea(name: string): { area: ActArea; boss: Bossfight } | null {
		for (const area of this.#poe.acts) {
			const boss = area.bossfights.find(boss => boss.name === name);
			if (boss) {
				return {
					area,
					boss,
				};
			}
		}

		return null;
	}

	mapBossAndMaps(name: string): { boss: MapBoss; maps: MapArea[] } | null {
		const boss = this.mapBoss(name);
		if (!boss) return null;
		const maps = boss.maps.map(m => {
			const map = this.map(m);
			if (!map) {
				throw new Error(`No map for ${map}`);
			}
			return map;
		});

		return {
			boss,
			maps,
		};
	}

	mapBoss(name: string): MapBoss | null {
		return this.#poe.mapbosses.find(c => c.name.trim().toLowerCase() === name.trim().toLowerCase()) ?? null;
	}

	bossesOfMap(map: string): MapBoss[] {
		return this.#poe.mapbosses.filter(boss => boss.maps.includes(map));
	}
}

export const poeData = new PoeData(poeDataFromJson);
