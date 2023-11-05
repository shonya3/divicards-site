export const fetchTableSheet = async () => {
	let key = '';
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
