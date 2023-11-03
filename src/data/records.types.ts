export type ISource =
	| {
			type: 'act';
			id: string;
	  }
	| {
			type: 'map' | 'mapBoss' | 'actBoss' | string;
			name?: string;
	  };

export type IGreynote =
	| 'monsterSpecific'
	| 'areaSpecific'
	| 'disabled'
	| 'story'
	| 'delirium'
	| 'chestObject'
	| 'strongbox'
	| 'globalDrop'
	| 'vendor';
export type IConfidence = 'none' | 'low' | 'ok' | 'done';
export type IRemaininWork = 'confirm' | 'unclearHypothesis' | 'noHypothesis' | 'storyOnly' | 'legacyTag' | 'openEnded';

export interface IParsedDivcordTableRecord {
	id: number;
	card: string;
	greynote?: IGreynote;
	tagHypothesis?: string;
	confidence: IConfidence;
	remainingWork?: IRemaininWork;
	wikiDisagreements?: string;
	sourcesWithTagButNotOnWiki?: string;
	notes?: string;
	sources?: ISource[];
}
