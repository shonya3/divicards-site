/**
 * Parses divcord table https://github.com/shonya3/divicards/tree/main/divcord_wasm
 */

addEventListener('message', async e => {
	const { default: initWasm, parsed_records } = await import('../../gen/divcordWasm/divcord_wasm.js');
	await initWasm();
	const records = parsed_records(
		JSON.stringify(e.data.spreadsheet),
		JSON.stringify(e.data.poeData),
		(errorMessage: string) => {
			postMessage({
				type: 'ParseError',
				data: errorMessage,
			});
		}
	);
	postMessage({
		type: 'records',
		data: records,
	});
});
