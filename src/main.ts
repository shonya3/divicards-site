import { ParsedDivcordTableRecord } from './data/ParsedDivcordTableRecord';
import { poeData, divcordRecords as records } from './jsons/jsons';
import { DivinationCardElement } from './divination-card/wc-divination-card';
import { MapsTableElement } from './wc-maps-table';
import { CardsTableElement, SourceElement } from './wc-cards-table';
import { css, html } from 'lit';
import { ActAreaElement } from './act-area/wc-act-area';

// const data = new Data(
// 	new PoeData(poeData),
// 	records.map(r => new ParsedDivcordTableRecord(r))
// );

// const app = document.createElement('wc-maps-table');
// app.cardsByMaps = structuredClone(data.cardsByMaps());

// document.body.append(app);

DivinationCardElement.define();
MapsTableElement.define();
CardsTableElement.define();
SourceElement.define();
ActAreaElement.define();

const table: CardsTableElement = Object.assign(document.createElement('wc-cards-table'), {
	poeData,
	sourcesByCards: ParsedDivcordTableRecord.sourcesByCard(records),
});
document.body.append(table);
