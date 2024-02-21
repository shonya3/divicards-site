import { poeDataFromJson } from './gen/poeDataFromJson';

export interface IPoeData {
	acts: IActArea[];
	cards: Record<string, ICard>;
	maps: IMap[];
	mapbosses: IMapBoss[];
}

export class PoeData implements IPoeData {
	acts: IActArea[];
	cards: Record<string, ICard>;
	maps: IMap[];
	mapbosses: IMapBoss[];
	cardsMap: Map<string, ICard> = new Map();
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

	level(name: string, type: 'Map' | 'Act'): number | null {
		switch (type) {
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

export interface IActArea {
	id: string;
	name: string;
	act: number;
	areaLevel: number;
	imageUrl: string;
	poedbImageUrl: string;
	hasWaypoint: boolean;
	hasLabyrinthTrial: boolean;
	isTown: boolean;
	bossfights: IBossfight[];
	flavourText: string;
}

export interface IBossfight {
	name: string;
	url: string;
}

export interface ILeagueReleaseInfo {
	name: string;
	date: string;
	version: string;
}

export interface ICard {
	name: string;
	minLevel: number | null;
	maxLevel?: number;
	weight: number;
	league?: ILeagueReleaseInfo | null;
}

export interface IMap {
	name: string;
	tier: number;
	available: boolean;
	unique: boolean;
	icon: string;
}

export interface IMapBoss {
	name: string;
	maps: string[];
}

/** Utility class to find map, act, etc */
class FindPoeData {
	#poe: Readonly<PoeData>;
	constructor(poeData: Readonly<PoeData>) {
		this.#poe = poeData;
	}

	actArea(id: string): IActArea | null {
		return this.#poe.acts.find(area => area.id === id) ?? null;
	}

	map(name: string): IMap | null {
		return this.#poe.maps.find(map => map.name.toLowerCase() === name.trim().toLowerCase()) ?? null;
	}

	card(name: string): ICard | null {
		return this.#poe.cards[name] ?? null;
	}

	actBossAndArea(name: string): { area: IActArea; boss: IBossfight } | null {
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

	mapBossAndMaps(name: string): { boss: IMapBoss; maps: IMap[] } | null {
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

	mapBoss(name: string): IMapBoss | null {
		return this.#poe.mapbosses.find(c => c.name.trim().toLowerCase() === name.trim().toLowerCase()) ?? null;
	}
}

export const poeData = new PoeData(poeDataFromJson);
