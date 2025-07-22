import { DivcordRecord } from '../gen/divcord';
import { slug } from '../gen/divcordWasm/divcord_wasm';
import { Source, SourceType, SOURCE_TYPE_VARIANTS } from '../gen/Source';
import { prepare_weight_data } from './elements/weights-table/lib';
import { PoeData, poeData } from './PoeData';

/** Drop source and array of cards with verification status and possible transitive source */
export type SourceAndCards = {
	/** Drop source */
	source: Source;
	/** Array of cards with verification status and possible transitive source   */
	cards: CardBySource[];
};
/** Is the drop source of card needs to be verified or already done */
export type VerificationStatus = 'done' | 'verify';
/** Card name with verification status and possible transitive source. Being used in context of drop source */
export type CardBySource = {
	/** card name */
	card: string;
	/** Source associated with another source. For example, if we search cards by maps, map boss will be a transitive source */
	transitiveSource?: Source;
	/** Verification status for card drop from this source: is it done or need to be verified  */
	status: VerificationStatus;
};

/** Returns Record, where key - name of map, value - card name, it's verification status in context of given map and maybe mapboss, if card drops from mapboss  */
export function cardsByMaps(records: DivcordRecord[]): Record<string, CardBySource[]> {
	const sourcesAndCards = cardsBySourceTypes(['Map'], records, poeData);
	const entries = sourcesAndCards.map(({ source, cards }) => [source.id, cards]);
	return Object.fromEntries(entries);
}

/** Sort cards by weight, start from the most rare. If card has no weight, force it to the end */
export function sort_by_weight(cards: { card: string }[] | string[], poeData: Readonly<PoeData>): void {
	const SORT_TO_THE_END = 1_000_000;
	const getSortableWeight = (cardName: string): number => {
		const card = poeData.find.card(cardName);
		if (!card) return SORT_TO_THE_END;

		const weightData = prepare_weight_data(card);
		if (weightData.displayKind === 'disabled' || weightData.displayKind === 'no-data') {
			return SORT_TO_THE_END;
		}
		return weightData.displayWeight;
	};

	cards.sort((a, b) => {
		const aWeight = getSortableWeight(typeof a === 'string' ? a : a.card);
		const bWeight = getSortableWeight(typeof b === 'string' ? b : b.card);
		return aWeight - bWeight;
	});
}

export function cardsByMapboss(boss: string, records: DivcordRecord[], poeData: PoeData): CardBySource[] {
	const cards: CardBySource[] = [];
	if (!poeData.mapbosses.some(b => b.name === boss)) {
		return cards;
	}

	for (const record of records) {
		if (record.sources.some(s => s.id === boss)) {
			cards.push({ card: record.card, status: 'done' });
		}

		if (record.verifySources.some(s => s.id === boss)) {
			cards.push({ card: record.card, status: 'verify' });
		}
	}

	return cards;
}

export function cardsByActboss(boss: string, records: DivcordRecord[]): CardBySource[] {
	const cards: CardBySource[] = [];

	for (const record of records) {
		if (record.sources.some(s => s.id === boss)) {
			cards.push({ card: record.card, status: 'done' });
		}

		if (record.verifySources.some(s => s.id === boss)) {
			cards.push({ card: record.card, status: 'verify' });
		}
	}

	return cards;
}

export function cardsBySource(source: Source, records: DivcordRecord[], poeData: PoeData): CardBySource[] {
	const cards: CardBySource[] = [];

	if (source.type === 'Map') {
		for (const boss of poeData.find.bossesOfMap(source.id)) {
			for (const card of cardsByMapboss(boss.name, records, poeData)) {
				cards.push({
					...card,
					transitiveSource: createSource({
						id: boss.name,
						type: 'Map Boss',
					}),
				});
			}
		}
	}

	if (source.type === 'Act') {
		const actArea = poeData.acts.find(a => a.id === source.id)!;
		for (const fight of actArea.bossfights) {
			for (const card of cardsByActboss(fight.name, records)) {
				cards.push({
					...card,
					transitiveSource: createSource({
						id: fight.name,
						type: 'Act Boss',
					}),
				});
			}
		}
	}

	for (const record of records) {
		// for DONE sources
		const sourcePresentsInRecord = record.sources.some(
			s => s.id === source.id && s.kind === source.kind && s.type === source.type
		);

		if (sourcePresentsInRecord) {
			cards.push({ card: record.card, status: 'done' });
			continue;
		}

		// for VERIFY sources
		const verifySourcePresentsInRecord = record.verifySources.some(
			s => s.id === source.id && s.kind === source.kind && s.type === source.type
		);

		if (verifySourcePresentsInRecord) {
			cards.push({ card: record.card, status: 'verify' });
		}
	}

	// return cards;
	return dedupeCards(cards);
}

export function cardsBySourceTypes(
	sourceTypes: SourceType[],
	records: DivcordRecord[],
	poeData: PoeData
): SourceAndCards[] {
	const map: Map<string, CardBySource[]> = new Map();
	const sourceMap: Map<string, Source> = new Map();
	const set: Set<string> = new Set();

	for (const record of records) {
		const fileteredSources = record.sources.filter(s => sourceTypes.includes(s.type));
		for (const source of fileteredSources) {
			sourceMap.set(source.id, source);
			const cards = map.get(source.id) ?? [];
			cards.push({ card: record.card, status: 'done' });
			if (source.type === 'Map') {
				if (!set.has(source.id)) {
					set.add(source.id);
					for (const boss of poeData.find.bossesOfMap(source.id)) {
						for (const card of cardsByMapboss(boss.name, records, poeData)) {
							cards.push({
								transitiveSource: createSource({
									id: boss.name,
									type: 'Map Boss',
								}),
								...card,
							});
						}
					}
				}
			}
			if (source.type === 'Act') {
				if (!set.has(source.id)) {
					set.add(source.id);
					const actArea = poeData.acts.find(a => a.id === source.id)!;
					for (const fight of actArea.bossfights) {
						for (const card of cardsByActboss(fight.name, records)) {
							cards.push({
								...card,
								transitiveSource: createSource({
									id: fight.name,
									type: 'Act Boss',
								}),
							});
						}
					}
				}
			}

			map.set(source.id, cards);
		}

		const filteredVerifySources = record.verifySources.filter(s => sourceTypes.includes(s.type));
		for (const source of filteredVerifySources) {
			sourceMap.set(source.id, source);
			const cards = map.get(source.id) ?? [];
			cards.push({ card: record.card, status: 'verify' });

			map.set(source.id, cards);
		}
	}

	// If act area directly drops no cards, but some of it's bosses can
	if (sourceTypes.includes('Act')) {
		for (const area of poeData.acts) {
			if (!map.has(area.id)) {
				const cards = map.get(area.id) ?? [];
				for (const fight of area.bossfights) {
					for (const card of cardsByActboss(fight.name, records)) {
						cards.push({
							...card,
							transitiveSource: createSource({
								id: fight.name,
								type: 'Act Boss',
							}),
						});
					}
				}

				map.set(area.id, cards);
				sourceMap.set(area.id, createSource({ id: area.id, type: 'Act' }));
			}
		}
	}

	// If map area directly drops no cards, but some of it's bosses can
	if (sourceTypes.includes('Map')) {
		for (const boss of poeData.mapbosses) {
			for (const atlasMapName of boss.maps) {
				if (!map.has(atlasMapName)) {
					const cardsFromBoss: CardBySource[] = cardsByMapboss(boss.name, records, poeData).map(card => {
						return {
							...card,
							transitiveSource: createSource({
								id: boss.name,
								type: 'Map Boss',
							}),
						};
					});

					map.set(atlasMapName, cardsFromBoss);
					sourceMap.set(atlasMapName, createSource({ id: atlasMapName, type: 'Map' }));
				}
			}
		}
	}

	const sourcesAndCards = Array.from(map.entries()).map(([sourceId, cards]) => {
		const source = sourceMap.get(sourceId)!;
		return { source, cards: dedupeCards(cards) };
	});

	return sourcesAndCards;
}

function dedupeCards(cards: Array<CardBySource>): Array<CardBySource> {
	const added: Set<string> = new Set();
	return cards.filter(({ card }) => {
		if (added.has(card)) {
			return false;
		}

		added.add(card);
		return true;
	});
}

/**
 * Creates a map with key: SourceType and value: number of sources of this type.
 * For Example, key: "Map", and it's value: 177 mean, that there are 177 maps overall
 * @param records Records from divcord table
 * @param poeData
 * @returns
 */
export function sourcetypesMap(records: DivcordRecord[], poeData: PoeData): Map<SourceType, number> {
	const sourcesAndCards = cardsBySourceTypes(Array.from(SOURCE_TYPE_VARIANTS), records, poeData);
	return _sourcetypesMap(sourcesAndCards);
}

/**
 * Creates a map with key: SourceType and value: number of sources of this type.
 * For Example, key: "Map", and it's value: 177 mean, that there are 177 maps overall
 * @param sourcesAndCards
 */
export function _sourcetypesMap(sourcesAndCards: SourceAndCards[]): Map<SourceType, number> {
	let map: Map<SourceType, number> = new Map();

	for (const { source } of sourcesAndCards) {
		const sourceType = source.type;
		const count = map.get(sourceType) ?? 0;
		map.set(sourceType, count + 1);
	}

	const entries = Array.from(map);
	entries.sort(([_, aCount], [__, bCount]) => {
		return bCount - aCount;
	});

	map = new Map(entries);

	return map;
}

export function createSource({ type, id }: { type: SourceType; id: string }): Source {
	return {
		id: id,
		idSlug: slug(id),
		type,
		typeSlug: slug(type),
		kind: 'source',
	};
}
