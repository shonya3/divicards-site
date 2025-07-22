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
	name: string;
	minLevel: number | null;
	maxLevel?: number;
	weights: Record<string, number>;
	league?: LeagueReleaseInfo | null;
	disabled: boolean;
};

export type MapArea = {
	name: string;
	tier: number;
	available: boolean;
	unique: boolean;
	icon: string;
};

export type MapBoss = {
	name: string;
	maps: string[];
};
