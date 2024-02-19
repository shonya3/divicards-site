import { poeDataFromJson } from './gen/poeDataFromJson';

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
	constructor(poeData: IPoeData) {
		const { acts, cards, maps, mapbosses } = structuredClone(poeData);
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
		return this.cards[name] ?? null;
	}

	minLevel(card: string): number {
		return this.card(card)?.minLevel ?? 0;
	}

	mapboss(name: string): IMapBoss | null {
		return this.mapbosses.find(c => c.name.trim().toLowerCase() === name.trim().toLowerCase()) ?? null;
	}

	level(name: string, type: 'Map' | 'Act'): number | null {
		switch (type) {
			case 'Map': {
				const tier = this.findMap(name)?.tier;
				return typeof tier === 'number' ? tier + 67 : null;
			}
			case 'Act': {
				return this.findActAreaById(name)?.areaLevel ?? null;
			}
			default:
				throw new Error('Type should be Act or Map');
		}
	}
}

export const poeData = new PoeData(poeDataFromJson);
