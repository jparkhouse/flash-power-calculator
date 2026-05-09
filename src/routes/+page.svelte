<script lang="ts">
	import {
		calculateApertureFlashPowerPairs,
		allISOs,
		allFocalLengths,
		type FlashPowerWithOffset,
		type Aperture
	} from '$lib';

	import ScrollPicker from '$lib/scroll-picker.svelte';

	let currentISOIndex = 0;
	let currentFocalLengthIndex = 0;
	let currentDistanceIndex = 0;

	const allISOStrings = allISOs.map((iso) => iso.toString());

	const allFocalLengthStrings = allFocalLengths.map((f) => f.toString() + 'mm');

	const allDistances = Array.from({ length: 39 }, (_, i) => +(0.5 + i * 0.5).toFixed(1));
	const allDistanceStrings = allDistances.map((d) => d.toString() + 'm');

	$: currentFocalLength = allFocalLengths[currentFocalLengthIndex];
	$: currentISO = allISOs[currentISOIndex];
	$: currentDistance = allDistances[currentDistanceIndex];

	let pairs = new Map<Aperture, FlashPowerWithOffset>();

	$: pairs = calculateApertureFlashPowerPairs(currentFocalLength, currentISO, currentDistance);
</script>

<h1>Flash Power Calculator</h1>
<h3>Designed for manual mode on the Godox V860 iii</h3>
<div class="pickers">
	<ScrollPicker
		inputArray={allFocalLengthStrings}
		onSelect={(i: number) => (currentFocalLengthIndex = i)}
		title="Lens"
	/>
	<ScrollPicker
		inputArray={allISOStrings}
		onSelect={(i: number) => (currentISOIndex = i)}
		title="Film ISO"
	/>
	<ScrollPicker
		inputArray={allDistanceStrings}
		onSelect={(i: number) => (currentDistanceIndex = i)}
		title="Distance"
	/>
</div>
{#each pairs.entries() as [aperture, flashPower] (aperture)}
	<p>
		f/{aperture} → 1/{flashPower.power}
		{flashPower.offset > 0 ? ' + ' + flashPower.offset : ''}
	</p>
{/each}

<style>
	.pickers {
		display: flex;
		gap: 3px;
		border-radius: 8px;
		overflow: hidden;
		padding: 4px;
	}
</style>
