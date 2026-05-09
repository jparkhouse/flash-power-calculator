<script lang="ts">
	let { inputArray = [], onSelect = (_i: number) => {}, title = '' } = $props();
	let indexSelected = $state(0);

	let programmaticScroll = false;
	let wheelScroll = false;

	function handleWheel(event: WheelEvent) {
		event.preventDefault();
		wheelScroll = true;
		const direction = event.deltaY > 0 ? 1 : -1;
		indexSelected = Math.max(0, Math.min(inputArray.length - 1, indexSelected + direction));
		onSelect(indexSelected);
	}

	$effect(() => {
		if (pickerEl) {
			programmaticScroll = true;
			if (wheelScroll) {
				pickerEl.scrollTop = indexSelected * 28;
				wheelScroll = false;
			} else {
				pickerEl.scrollTo({ top: indexSelected * 28, behavior: 'smooth' });
			}
		}
	});

	function handleScroll(event: Event) {
		if (programmaticScroll) {
			const el = event.currentTarget as HTMLElement;
			if (el.scrollTop === indexSelected * 28) {
				programmaticScroll = false;
			}
			return;
		}
		const el = event.currentTarget as HTMLElement;
		indexSelected = Math.round(el.scrollTop / 28);
		onSelect(indexSelected);
	}

	let pickerEl: HTMLElement | null = null;
</script>

<div class="component-wrap">
	<p class="title">{title}</p>
	<div class="picker-wrap">
		<div class="overlay" />
		<div class="picker" bind:this={pickerEl} onscroll={handleScroll} onwheel={handleWheel}>
			<div class="spacer" />
			{#each inputArray as item, i (item)}
				<p class="item" class:selected={i === indexSelected}>{item}</p>
			{/each}
			<div class="spacer" />
		</div>
	</div>
</div>

<style>
	.component-wrap {
		position: relative;
		display: flex;
		flex-direction: column;
		gap: 0;
		background: #f5f0e8;
		border-radius: 6px;
		padding: 8px;
		overflow: hidden;
	}

	.component-wrap::before {
		content: '';
		position: absolute;
		left: 8px;
		right: 8px;
		height: 45px;
		z-index: 3;
		pointer-events: none;
		top: 36px;
		background: linear-gradient(to bottom, #ede5d8 10%, transparent);
	}

	.component-wrap::after {
		content: '';
		position: absolute;
		left: 8px;
		right: 8px;
		height: 45px;
		z-index: 3;
		pointer-events: none;
		bottom: 8px;
		background: linear-gradient(to top, #ede5d8 10%, transparent);
	}

	.title {
		font-size: 11px;
		color: #a0917a;
		text-align: center;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		padding-bottom: 8px;
	}

	.picker-wrap {
		position: relative;
		background: #ede5d8;
		border-radius: 0;
		overflow: hidden;
		border-radius: 8px;
	}

	.picker {
		position: relative;
		z-index: 2;
		height: 140px;
		overflow-y: scroll;
		scroll-snap-type: y mandatory;
		scrollbar-width: none;
		display: flex;
		flex-direction: column;
	}

	.spacer {
		height: 56px;
		flex-shrink: 0;
	}

	.item {
		height: 28px;
		flex-shrink: 0;
		scroll-snap-align: center;
		color: #2c1f0e;
		font-size: 13px;
		padding: 0 12px;
		border-bottom: 0.5px solid #ede5d8;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.item.selected {
		font-weight: 500;
		color: #2c1f0e;
	}

	.overlay {
		position: absolute;
		inset: 0;
		pointer-events: none;
		z-index: 3;
		top: 56px;
		bottom: 56px;
		border-top: 1.5px solid #8b7355;
		border-bottom: 1.5px solid #8b7355;
	}

	.picker-wrap::before,
	.picker-wrap::after {
		height: 45px;
	}

	.picker-wrap::before {
		top: 0;
		background: linear-gradient(to bottom, #ede5d8 10%, transparent);
	}

	.picker-wrap::after {
		bottom: 0;
		background: linear-gradient(to top, #ede5d8 10%, transparent);
	}
</style>
