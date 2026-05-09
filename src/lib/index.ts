// place files you want to import through the `$lib` alias in this folder.

export type ISO = 50 | 100 | 200 | 400 | 800 | 1600 | 3200;
export const allISOs: ISO[] = [50, 100, 200, 400, 800, 1600, 3200];

export type FocalLength = 20 | 24 | 28 | 35 | 50 | 70 | 80 | 105 | 135 | 200;
export const allFocalLengths: FocalLength[] = [20, 24, 28, 35, 50, 70, 80, 105, 135, 200];

export type Aperture = 1.4 | 1.8 | 2 | 2.8 | 4 | 5.6 | 8 | 11 | 16 | 22;
const allApertures: Aperture[] = [1.4, 1.8, 2, 2.8, 4, 5.6, 8, 11, 16, 22];

type PowerStep = 1 | 2 | 4 | 8 | 16 | 32 | 64 | 128 | 256;
const allPowerSteps: PowerStep[] = [1, 2, 4, 8, 16, 32, 64, 128, 256];

// from https://photo.stackexchange.com/questions/102949/godox-v860ii-guide-number-at-different-zoom-steps
const focalLengthToGuideNumber = new Map<FocalLength, number>([
	[20, 45.2],
	[24, 46.8],
	[28, 48.4],
	[35, 50.1],
	[50, 51.9],
	[70, 53.6],
	[80, 55.6],
	[105, 57.6],
	[135, 59.6],
	[200, 60]
]);

function adjustGuideNumberWithISO(focalLength: FocalLength, iso: ISO): number {
	const adjustment = Math.sqrt(iso / 100);
	const baseGuideNumber = focalLengthToGuideNumber.get(focalLength)!;

	return baseGuideNumber * adjustment;
}

export function calculateApertureFlashPowerPairs(
	focalLength: FocalLength,
	iso: ISO,
	distance: number
): Map<Aperture, FlashPowerWithOffset> {
	const output = new Map<Aperture, FlashPowerWithOffset>();

	const fullPowerGuideNumber = adjustGuideNumberWithISO(focalLength, iso);

	for (const power of allPowerSteps) {
		const adjustedGuideNumber = fullPowerGuideNumber * Math.sqrt(1 / power);
		const rawAperture = adjustedGuideNumber / distance;

		// skip over values that are out of bounds
		if (rawAperture < allApertures[0] || rawAperture > allApertures[allApertures.length - 1]) {
			continue;
		}

		const closestAperture = getClosestAperture(rawAperture);

		// rfp = 1/fp, with offset
		const rfpAtClosestAperture = calculateRFP(closestAperture, distance, fullPowerGuideNumber);
		// skip over values that fall outside of our possible flash powers
		if (rfpAtClosestAperture > 1.1 || rfpAtClosestAperture < 1 / 280) {
			continue;
		}

		// now we need to convert from rfp to FlashPowerWithOffset
		const flashPowerWithOffset = getFlashPowerWithOffsetFromRFP(rfpAtClosestAperture);
		const existingEntry = output.get(closestAperture);
		if (existingEntry != undefined) {
			if (existingEntry.offset > flashPowerWithOffset.offset) {
				// replace with the easier to set value
				output.set(closestAperture, flashPowerWithOffset);
			}
		} else {
			output.set(closestAperture, flashPowerWithOffset);
		}
	}

	return output;
}

function getClosestAperture(rawAperture: number): Aperture {
	// find the first aperture value that exceeds or meets rawAperture, limited to largest value
	// works well since allApertures is sorted ascending
	return allApertures.find((a) => a >= rawAperture) ?? allApertures[allApertures.length - 1];
}

function getFlashPowerWithOffsetFromRFP(rfp: number): FlashPowerWithOffset {
	// handle the full power case to not deal with rounding shenanigans
	// 0.933 is 1/2 + 0.9, so anything greater should just be clamped at
	// 1/1
	if (rfp > 0.933) {
		return {
			power: 1,
			offset: 0
		};
	}
	// handle min power case
	if (rfp < 1 / 256) {
		return {
			power: 256,
			offset: 0
		};
	}
	// 1 becomes 0, 1/2 becomes -1, etc
	// which conveniently gives us look up for array
	const trueStop = Math.log2(rfp);
	const roundedStop = Math.floor(trueStop);
	// to 1 d.p
	const offset = Math.round((trueStop - roundedStop) * 10) / 10;
	return {
		power: allPowerSteps[Math.abs(roundedStop)],
		offset
	};
}

function calculateRFP(aperture: number, distance: number, fullPowerGuideNumber: number): number {
	const pow = (aperture * distance) / fullPowerGuideNumber;
	return pow * pow;
}

export type FlashPowerWithOffset = {
	power: PowerStep;
	offset: number;
};
