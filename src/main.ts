import { ParsedDivcordTableRecord } from './data/ParsedDivcordTableRecord';
import { poeData, divcordRecords as records } from './jsons/jsons';
import './wc-cards-table';
import { CardsTableElement } from './wc-cards-table';

// const data = new Data(
// 	new PoeData(poeData),
// 	records.map(r => new ParsedDivcordTableRecord(r))
// );

// const app = document.createElement('wc-maps-table');
// app.cardsByMaps = structuredClone(data.cardsByMaps());

// document.body.append(app);

const table: CardsTableElement = Object.assign(document.createElement('wc-cards-table'), {
	poeData,
	sourcesByCards: ParsedDivcordTableRecord.sourcesByCard(records),
});
document.body.append(table);
