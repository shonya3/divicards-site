import json from './json/poeData.json';
export const poeDataFromJson = json as IPoeData;

export type IPoeData = {
	acts: ActArea[];
	cards: Record<string, Card>;
	maps: MapArea[];
	mapbosses: MapBoss[];
};

export type ActArea = {
	id: string;
	name: string;
	act: number;
	areaLevel: number;
	imageUrl: string;
	poedbImageUrl: string;
	hasWaypoint: boolean;
	hasLabyrinthTrial: boolean;
	isTown: boolean;
	bossfights: Bossfight[];
	flavourText: string;
};

export type Bossfight = {
	name: string;
	url: string;
};

export type LeagueReleaseInfo = {
	name: string;
	date: string;
	version: string;
};

export type Card = {
	slug: string;
	name: string;
	minLevel: number | null;
	maxLevel?: number;
	weights: Record<string, number>;
	league?: LeagueReleaseInfo | null;
	disabled: boolean;
	/**
	 * List of map names, provided by in-game atlas.
	 */
	atlasMaps: string[];
};

export type MapArea = {
	name: string;
	tier: number;
	unique: boolean;
	icon: string;
	slug: string;
	series: string;
	/**
	 * List of card names, provided by in-game atlas.
	 */
	atlasCards: string[];
};

export type MapBoss = {
	name: string;
	maps: string[];
};
