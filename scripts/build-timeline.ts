import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { poeData } from '../src/PoeData.js'; // Assuming PoeData is accessible
import init_divcord_wasm, { fetch_divcord_records } from '../gen/divcordWasm/divcord_wasm.js';
import { Confidence, DivcordRecord } from '../gen/divcord.js';
import { Source } from '../gen/Source.js';

// --- Determine WASM path and load it ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const wasmPath = path.resolve(__dirname, '../gen/divcordWasm/divcord_wasm_bg.wasm');
const wasmBuffer = await fs.readFile(wasmPath);

await init_divcord_wasm(wasmBuffer);

// Helper to get a consistent signature for a Source object
function getSourceSignature(source: Source): string {
	return `${source.id}|${source.type}|${source.kind}`;
}

// Helper to diff two arrays of Source objects
function diffSourceArrays(
	oldSources: Source[],
	newSources: Source[]
): { added: Source[]; removed: Source[]; hasChanges: boolean } {
	const oldSourceSignatures = new Set(oldSources.map(getSourceSignature));
	const newSourceSignatures = new Set(newSources.map(getSourceSignature));

	const added: Source[] = newSources.filter(s => !oldSourceSignatures.has(getSourceSignature(s)));
	const removed: Source[] = oldSources.filter(s => !newSourceSignatures.has(getSourceSignature(s)));

	return {
		added,
		removed,
		hasChanges: added.length > 0 || removed.length > 0,
	};
}

// Helper to generate a stable key for a DivcordRecord (excluding id and mutable fields)
function getDivcordRecordStableKey(record: DivcordRecord): string {
	const parts = [
		record.card,
		record.greynote,
		record.tagHypothesis ?? '___TAG_HYPO_UNDEFINED___', // Handle optional field
		record.remainingWork,
		record.notes ?? '___NOTES_UNDEFINED___', // Handle optional field
	];
	return parts.join('||'); // Use a multi-char separator to avoid collisions
}

export type DivcordRecordFieldChanges = {
	confidence?: { old: Confidence; new: Confidence };
	sources?: { added: Source[]; removed: Source[] };
	verifySources?: { added: Source[]; removed: Source[] };
};

export type DivcordRecordDeepDiff = {
	added: DivcordRecord[];
	removed: DivcordRecord[];
	modified: Array<{
		oldRecord: DivcordRecord;
		newRecord: DivcordRecord;
		changes: DivcordRecordFieldChanges;
	}>;
};

/**
 * Diffs two arrays of DivcordRecord based on content changes.
 * It identifies records by a "stable key" (card name + descriptive fields)
 * and then checks for changes in `confidence`, `sources`, and `verifySources`.
 * Records with changed stable keys are treated as additions/removals.
 */
export function diffDivcordRecordsDeep(
	oldRecords: DivcordRecord[],
	newRecords: DivcordRecord[]
): DivcordRecordDeepDiff {
	const diffResult: DivcordRecordDeepDiff = {
		added: [],
		removed: [],
		modified: [],
	};

	const oldRecordsMap = new Map<string, DivcordRecord>();
	for (const record of oldRecords) {
		oldRecordsMap.set(getDivcordRecordStableKey(record), record);
	}

	const processedOldKeys = new Set<string>();

	for (const newRecord of newRecords) {
		const stableKey = getDivcordRecordStableKey(newRecord);
		const oldRecord = oldRecordsMap.get(stableKey);

		if (oldRecord) {
			processedOldKeys.add(stableKey);
			const changes: DivcordRecordFieldChanges = {};
			let hasModifications = false;

			if (oldRecord.confidence !== newRecord.confidence) {
				changes.confidence = { old: oldRecord.confidence, new: newRecord.confidence };
				hasModifications = true;
			}
			const sourcesDiff = diffSourceArrays(oldRecord.sources, newRecord.sources);
			if (sourcesDiff.hasChanges) {
				changes.sources = { added: sourcesDiff.added, removed: sourcesDiff.removed };
				hasModifications = true;
			}
			const verifySourcesDiff = diffSourceArrays(oldRecord.verifySources, newRecord.verifySources);
			if (verifySourcesDiff.hasChanges) {
				changes.verifySources = { added: verifySourcesDiff.added, removed: verifySourcesDiff.removed };
				hasModifications = true;
			}
			if (hasModifications) {
				diffResult.modified.push({ oldRecord, newRecord, changes });
			}
		} else {
			diffResult.added.push(newRecord);
		}
	}

	for (const record of oldRecords) {
		if (!processedOldKeys.has(getDivcordRecordStableKey(record))) {
			diffResult.removed.push(record);
		}
	}

	return diffResult;
}

// --- Configuration ---
// Path to your separate data repository where JSONs are stored
const DATA_REPO_PATH = path.resolve(__dirname, '../../divicards-timeline'); // Assumes divicards-timeline is a sibling to divicards-site
const SNAPSHOTS_DIR = path.join(DATA_REPO_PATH, 'snapshots');
const TIMELINE_FILE_PATH = path.join(DATA_REPO_PATH, 'timeline_changes.json');

// --- Helper Functions ---
async function fetchLatestDivcordRecords(): Promise<DivcordRecord[]> {
	console.log('Fetching latest Divcord records...');
	// Use the imported fetch_divcord_records from your WASM module
	return await fetch_divcord_records(poeData, console.error);
}

function getISODateString(date: Date): string {
	return date.toISOString().split('T')[0];
}

async function loadJSON<T>(filePath: string, defaultValue: T): Promise<T> {
	try {
		const data = await fs.readFile(filePath, 'utf-8');
		return JSON.parse(data) as T;
	} catch (error) {
		if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
			console.log(`File not found: ${filePath}. Using default value.`);
			return defaultValue;
		}
		throw error;
	}
}

async function saveJSON(filePath: string, data: unknown): Promise<void> {
	await fs.mkdir(path.dirname(filePath), { recursive: true });
	await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
	console.log(`Saved JSON to ${filePath}`);
}

type CardLevelChange = {
	status: 'added' | 'removed' | 'modified' | 'unchanged';
	confidenceChanges?: string[]; // Summary of confidence changes
	sourcesAdded?: Source[];
	sourcesRemoved?: Source[];
	verifySourcesAdded?: Source[];
	verifySourcesRemoved?: Source[];
	// Add other aggregated fields as needed
};
type DailyCardChanges = Record<string, CardLevelChange>;

async function main() {
	console.log('hello main');

	const today = new Date();
	const yesterday = new Date(today);
	yesterday.setDate(today.getDate() - 1);

	const todayDateStr = getISODateString(today);
	const yesterdayDateStr = getISODateString(yesterday);

	const todaySnapshotPath = path.join(SNAPSHOTS_DIR, `records_${todayDateStr}.json`);
	const yesterdaySnapshotPath = path.join(SNAPSHOTS_DIR, `records_${yesterdayDateStr}.json`);

	// 1. Fetch current records
	const currentRecords = await fetchLatestDivcordRecords();
	if (!currentRecords || currentRecords.length === 0) {
		console.log('No current records fetched. Exiting.');
		return;
	}
	await saveJSON(todaySnapshotPath, currentRecords);

	// 2. Load previous day's records
	const previousRecords = await loadJSON<DivcordRecord[]>(yesterdaySnapshotPath, []);
	if (previousRecords.length === 0) {
		console.log(
			`No records found for ${yesterdayDateStr}. First run or missing previous data. Only saving today's snapshot.`
		);
		// On the very first run, or if yesterday's data is missing,
		// we can't generate a diff for "today".
		// We could initialize timeline_changes.json with an empty object or a special "initial data" entry.
		const timelineData = await loadJSON<Record<string, DailyCardChanges>>(TIMELINE_FILE_PATH, {});
		if (!timelineData[todayDateStr]) {
			// Could add a "snapshot_created" entry if desired, but no "changes"
		}
		await saveJSON(TIMELINE_FILE_PATH, timelineData);
		return;
	}

	// 3. Perform record-level diff
	const recordLevelDiff = diffDivcordRecordsDeep(previousRecords, currentRecords);

	// 4. Aggregate changes by card name
	const cardLevelChangesToday: DailyCardChanges = {};
	const allCardNames = new Set([...previousRecords.map(r => r.card), ...currentRecords.map(r => r.card)]);

	for (const cardName of allCardNames) {
		const cardInPrevious = previousRecords.some(r => r.card === cardName);
		const cardInCurrent = currentRecords.some(r => r.card === cardName);
		let status: CardLevelChange['status'];

		if (cardInCurrent && !cardInPrevious) {
			status = 'added';
		} else if (!cardInCurrent && cardInPrevious) {
			status = 'removed';
		} else {
			status = 'modified'; // Assume modified if present in both, details below will confirm
		}

		const cardChangeDetails: CardLevelChange = { status };

		// Collect detailed changes for 'added' or 'modified' cards
		if (status === 'added' || status === 'modified') {
			const relevantAddedRecords = recordLevelDiff.added.filter(r => r.card === cardName);
			const relevantModifiedRecords = recordLevelDiff.modified.filter(m => m.newRecord.card === cardName);

			// Confidence (example: summarize unique new confidences)
			const confidenceMessages: string[] = [];
			relevantModifiedRecords.forEach(mod => {
				if (mod.changes.confidence) {
					confidenceMessages.push(`${mod.changes.confidence.old} -> ${mod.changes.confidence.new}`);
				}
			});
			relevantAddedRecords.forEach(added => {
				confidenceMessages.push(`New: ${added.confidence}`);
			});
			if (confidenceMessages.length > 0) {
				cardChangeDetails.confidenceChanges = [...new Set(confidenceMessages)];
			}

			// Sources
			const sourcesAdded: Source[] = [];
			const sourcesRemoved: Source[] = [];
			relevantAddedRecords.forEach(r => sourcesAdded.push(...r.sources));
			relevantModifiedRecords.forEach(mod => {
				if (mod.changes.sources) {
					sourcesAdded.push(...mod.changes.sources.added);
					sourcesRemoved.push(...mod.changes.sources.removed);
				}
			});
			// TODO: De-duplicate sources if necessary (e.g., using getSourceSignature)
			if (sourcesAdded.length > 0) cardChangeDetails.sourcesAdded = sourcesAdded;
			if (sourcesRemoved.length > 0) cardChangeDetails.sourcesRemoved = sourcesRemoved;

			// Verify Sources (similar logic to sources)
			const verifySourcesAdded: Source[] = [];
			const verifySourcesRemoved: Source[] = [];
			relevantAddedRecords.forEach(r => verifySourcesAdded.push(...r.verifySources));
			relevantModifiedRecords.forEach(mod => {
				if (mod.changes.verifySources) {
					verifySourcesAdded.push(...mod.changes.verifySources.added);
					verifySourcesRemoved.push(...mod.changes.verifySources.removed);
				}
			});
			if (verifySourcesAdded.length > 0) cardChangeDetails.verifySourcesAdded = verifySourcesAdded;
			if (verifySourcesRemoved.length > 0) cardChangeDetails.verifySourcesRemoved = verifySourcesRemoved;

			// If status was 'modified' but no actual field changes were aggregated, mark as 'unchanged'
			if (
				status === 'modified' &&
				!cardChangeDetails.confidenceChanges &&
				!cardChangeDetails.sourcesAdded &&
				!cardChangeDetails.sourcesRemoved &&
				!cardChangeDetails.verifySourcesAdded &&
				!cardChangeDetails.verifySourcesRemoved
			) {
				cardChangeDetails.status = 'unchanged';
			}
		}

		// Only add to timeline if there's a meaningful change
		if (cardChangeDetails.status !== 'unchanged') {
			cardLevelChangesToday[cardName] = cardChangeDetails;
		}
	}

	// 5. Update master timeline JSON
	if (Object.keys(cardLevelChangesToday).length > 0) {
		const timelineData = await loadJSON<Record<string, DailyCardChanges>>(TIMELINE_FILE_PATH, {});
		timelineData[todayDateStr] = cardLevelChangesToday;
		await saveJSON(TIMELINE_FILE_PATH, timelineData);
	} else {
		console.log('No card-level changes detected for today.');
	}

	// 6. (Optional) Commit and push to data repository
	// if (Object.keys(cardLevelChangesToday).length > 0) {
	// 	console.log('Committing and pushing changes to data repository...');
	// 	try {
	// 		// Ensure commands are run in the data repository's directory
	// 		const gitOptions = { cwd: DATA_REPO_PATH, stdio: 'inherit' } as const; // stdio: 'inherit' will show git output in console
	// 		execSync(`git add .`, gitOptions);
	// 		execSync(`git commit -m "Update data for ${todayDateStr}"`, gitOptions);
	// 		execSync(`git push`, gitOptions);
	// 		console.log('Successfully committed and pushed data updates.');
	// 	} catch (gitError) {
	// 		console.error('Failed to commit and push data updates:', gitError);
	// 		// Decide if this should be a fatal error for the script
	// 	}
	// }
	console.log('Timeline build process complete.');
}

main().catch(error => {
	console.error('Error in timeline build process:', error);
	// process.exit(1);
});
