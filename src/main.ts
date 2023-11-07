import { SourcefulDivcordTable, SourcefulDivcordTableRecord } from './data/SourcefulDivcordTableRecord';
import { divcordRecords, poeData } from './jsons/jsons';
import './views/wc-cards-table';
import './views/wc-sourceful-divcord-record';
import './views/wc-card-with-divcord-records-view';

// const data = new Data(
// 	new PoeData(poeData),
// 	records.map(r => new SourcefulDivcordTableRecord(r))
// );

// const app = document.createElement('wc-maps-table');
// app.cardsByMaps = structuredClone(data.cardsByMaps());

// document.body.append(app);

const divcordTable = new SourcefulDivcordTable(divcordRecords.map(r => new SourcefulDivcordTableRecord(r)));

const table = Object.assign(document.createElement('wc-cards-table'), {
	poeData,
	sourcesByCards: divcordTable.sourcesByCards(),
});
document.body.append(table);

// const DIVINATION_CARD = 'Desperate Crusade';
// const view = Object.assign(document.createElement('wc-card-with-divcord-records-view'), {
// 	poeData,
// 	card: DIVINATION_CARD,
// 	records: divcordTable.recordsByCard(DIVINATION_CARD),
// });
// document.body.append(view);
