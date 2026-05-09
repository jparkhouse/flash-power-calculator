<script lang="ts">
	import {
		calculateApertureFlashPowerPairs,
		allISOs,
		allFocalLengths,
		type ISO,
		type FocalLength,
		type FlashPowerWithOffset,
		type Aperture
	} from '$lib';

	let currentISO: ISO = 100;
	let currentFocalLength: FocalLength = 50;
	let currentDistance: number = 4;
	let pairs = new Map<Aperture, FlashPowerWithOffset>();

	$: pairs = calculateApertureFlashPowerPairs(currentFocalLength, currentISO, currentDistance);
</script>

<h1>Flash Power Calculator</h1>
<h3>Designed for manual mode on the Godox V860 iii</h3>
<select bind:value={currentISO}>
	{#each allISOs as iso (iso)}
		<option value={iso}>ISO {iso}</option>
	{/each}
</select>
<select bind:value={currentFocalLength}>
	{#each allFocalLengths as focalLength (focalLength)}
		<option value={focalLength}>{focalLength}mm</option>
	{/each}
</select>
{#each pairs.entries() as [aperture, flashPower] (aperture)}
	<p>
		f/{aperture} → 1/{flashPower.power}
		{flashPower.offset > 0 ? ' + ' + flashPower.offset : ''}
	</p>
{/each}
