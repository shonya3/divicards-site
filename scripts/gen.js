// @ts-check

import { execa } from 'execa';
import path from 'node:path';

const result = execa('cargo run', [], {
	cwd: path.resolve(import.meta.dirname, '../../divicards/generate_website_files'),
	stdio: 'pipe',
});

/**
 *
 * @param {unknown} data
 */
const onData = data => {
	String(data)
		.split('\n')
		.filter(Boolean)
		.forEach(line => {
			console.log(`  ${line.trim()}`);
		});
};

result.stdout?.on('data', onData);
result.stderr?.on('data', onData);
