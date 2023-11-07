import { SourcefulDivcordTable, SourcefulDivcordTableRecord } from './data/SourcefulDivcordTableRecord';
import { poeData, divcordRecords } from './jsons/jsons';
import './views/wc-cards-table';

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
