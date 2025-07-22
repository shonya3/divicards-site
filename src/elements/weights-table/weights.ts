import semver from 'semver';

/**
 * Sorts weight history keys (versions) and identifies the latest two for delta calculation.
 */
export function getLatestVersions(weights: Record<string, number>): {
	latest?: string;
	previous?: string;
	allSorted: string[];
} {
	const allSorted = Object.keys(weights).sort((a, b) =>
		semver.rcompare(semver.coerce(a) ?? '0.0.0', semver.coerce(b) ?? '0.0.0')
	);

	return {
		latest: allSorted[0],
		previous: allSorted[1],
		allSorted,
	};
}

const formatters = {
	auto_0: new Intl.NumberFormat(undefined, { maximumFractionDigits: 0, signDisplay: 'auto' }),
	auto_1: new Intl.NumberFormat(undefined, { maximumFractionDigits: 1, signDisplay: 'auto' }),
	always_0: new Intl.NumberFormat(undefined, { maximumFractionDigits: 0, signDisplay: 'always' }),
	always_1: new Intl.NumberFormat(undefined, { maximumFractionDigits: 1, signDisplay: 'always' }),
};

export function formatWeight(
	weight: number | null | undefined,
	options: { signDisplay?: 'auto' | 'always' } = {}
): string {
	if (weight == null) return '—';

	const { signDisplay = 'auto' } = options;
	// Use more precision for smaller numbers.
	const precision = Math.abs(weight) > 5 ? 0 : 1;
	const key = `${signDisplay}_${precision}` as keyof typeof formatters;

	// Round to the correct precision first to avoid -0.0 from Intl.NumberFormat
	const p = Math.pow(10, precision);
	const rounded = Math.round(weight * p) / p;

	// Intl.NumberFormat can format 0 as -0, so we handle it explicitly.
	return formatters[key].format(rounded === 0 ? 0 : weight);
}
