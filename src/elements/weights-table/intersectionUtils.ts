export const INTERSECTING_LINE_THICKNESS_PX = 1;

/**
 * Vertical distance between corners and intersecting line.
 */
export type Distance = {
	/**
	 * Distance between top corner and intersecting line in pixels.
	 */
	topPx: number;

	/**
	 * Distance between bottom corner and intersecting line in pixels.
	 */
	bottomPx: number;
};

export type CalculateDistanceArgs = {
	verticalPositionPx: number;
	thicknessPx: number;
};
function calculateDistance({ verticalPositionPx, thicknessPx }: CalculateDistanceArgs): Distance {
	const topPx = verticalPositionPx - thicknessPx / 2 - 1;
	const bottomPx = window.innerHeight - verticalPositionPx - thicknessPx / 2;

	return {
		topPx,
		bottomPx,
	};
}

export type RootMargin = {
	distance: Distance;
	styles: {
		'--intersecting-line-top': string;
		'--intersecting-line-bottom': string;
	};
	rootMargin: string;
};

export type CalculateRootMarginArgs = CalculateDistanceArgs;
export function calculateRootMargin(args: CalculateRootMarginArgs): RootMargin {
	const distance = calculateDistance(args);

	const styles = {
		'--intersecting-line-top': `${distance.topPx}px`,
		'--intersecting-line-bottom': `${distance.bottomPx}px`,
		'--intersecting-line-thickness': `${INTERSECTING_LINE_THICKNESS_PX}px`,
	};

	const rootMargin = `-${distance.topPx}px 0px -${distance.bottomPx}px`;

	return {
		distance,
		styles,
		rootMargin,
	};
}
