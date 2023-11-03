/*
import { ParsedDivcordTableRecord } from './data/ParsedDivcordTableRecord';
// import { Data } from './data/data';
// import { PoeData } from './data/poeData';
import { divcordRecords as records } from './jsons/jsons';
// import poeData from './jsons/poeData.json';
import { DivinationCardElement } from './divination-card/wc-divination-card';
import { MapsTableElement } from './wc-maps-table';
import { CardsTableElement, SourceElement } from './wc-cards-table';

// const data = new Data(
// 	new PoeData(poeData),
// 	records.map(r => new ParsedDivcordTableRecord(r))
// );

DivinationCardElement.define();
MapsTableElement.define();
CardsTableElement.define();
SourceElement.define();

// const app = document.createElement('wc-maps-table');
// app.cardsByMaps = structuredClone(data.cardsByMaps());

// document.body.append(app);

const table = document.createElement('wc-cards-table');
table.sourcesByCards = ParsedDivcordTableRecord.sourcesByCard(records);

document.body.append(table);

console.log(Object.keys(ParsedDivcordTableRecord.sourcesByCard(records)).length);
*/

// import { divcordTable, poeData } from './jsons/jsons';
// import pkg, { parsed_records, fetch_divcord_table } from './pkg';

// pkg().then(async () => {
// 	const table = await fetch_divcord_table();
// 	console.log(table);
// });

const fetchTableSheet = async () => {
	let key = 'AIzaSyBVoDF_twBBT_MEV5nfNgekVHUSn9xodfg';
	let spreadsheet_id = '1Pf2KNuGguZLyf6eu_R0E503U0QNyfMZqaRETsN5g6kU';
	let sheet = 'Cards_and_Hypotheses';
	let range = `${sheet}!A3:Z`;

	let url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheet_id}/values/${range}?key=${key}`;
	console.log(url);

	const response = await fetch(url);
	for (const header of response.headers) {
		console.log(header);
	}

	const json = await response.json();
	// console.log(json);
	return json;
};

fetchTableSheet();
