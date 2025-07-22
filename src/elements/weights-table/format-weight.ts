const formatters = {
	auto_0: new Intl.NumberFormat('ru', { maximumFractionDigits: 0, signDisplay: 'auto' }),
	auto_1: new Intl.NumberFormat('ru', { maximumFractionDigits: 1, signDisplay: 'auto' }),
	always_0: new Intl.NumberFormat('ru', { maximumFractionDigits: 0, signDisplay: 'always' }),
	always_1: new Intl.NumberFormat('ru', { maximumFractionDigits: 1, signDisplay: 'always' }),
};

export function formatWeight(
	weight: number | null | undefined,
	options: { signDisplay?: 'auto' | 'always' } = {}
): string {
	if (weight === 0) return '0';
	if (weight == null) return '—';

	const { signDisplay = 'auto' } = options;
	// Use more precision for smaller numbers.
	const precision = Math.abs(weight) > 5 ? 0 : 1;
	const key = `${signDisplay}_${precision}` as keyof typeof formatters;
	return formatters[key].format(weight);
}
