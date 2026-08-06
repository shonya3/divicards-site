import json from './json/poeData.json';
export const poeDataFromJson = json as IPoeData;

export type IPoeData = {
	acts: ActArea[];
	cards: CardsData;
	maps: MapArea[];
	mapbosses: MapBoss[];
};

export type ActArea = {
	id: string;
	name: string;
	act: number;
	areaLevel: number;
	imageUrl: string;
	hasWaypoint: boolean;
	hasLabyrinthTrial: boolean;
	isTown: boolean;
	bossfights: {name: string}[];
};

export type Bossfight = {
	name: string;
};

export type LeagueReleaseInfo = {
	name: string;
	date: string;
	version: string;
};

export type CardsData = {
  dict: Record<string, Card>;
  latestWeightsCollected:LeagueCardsCollected;
}
export type LeagueCardsCollected = {
  /**
   * League version.
   */
  version: string;
   /**
   * Total number of cards collected during latest league by community.
   */
  totalCards: number;
}

export type Card = {
	slug: string;
	name: string;
	minLevel: number | null;
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
	/**
	 * List of card names, provided by in-game atlas.
	 */
	atlasCards: string[];
};

export type MapBoss = {
	name: string;
	maps: string[];
};
