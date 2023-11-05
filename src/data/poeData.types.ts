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

export interface ICard {
	name: string;
	minLevel: number | null;
	weight: number;
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
	cards: ICard[];
	maps: IMap[];
	mapbosses: IMapBoss[];
}
