<script lang="ts">
	export let direction: 'left' | 'right';
	export let inputPage: number | null;
	export let totalPages: number;

	function turnPage() {
		if (direction === 'right') {
			if (inputPage && inputPage < totalPages) {
				inputPage++;
			} else {
				inputPage = 1;
			}
		} else {
			if (inputPage && inputPage > 1) {
				inputPage--;
			} else {
				inputPage = totalPages;
			}
		}
	}

	const svgPath = direction == 'right' ? 'M2 2L11 11L2 20' : 'M12 2L3 11L12 20';
</script>

<button on:click={turnPage}>
	<svg width="14" height="22" viewBox="0 0 14 22" fill="none" xmlns="http://www.w3.org/2000/svg">
		<path d={svgPath} stroke-width="3" stroke-linecap="round" />
	</svg>
</button>

<style lang="scss">
	@use '$styles/variables';
	@use '$styles/utility';

	button {
		svg path {
			stroke: variables.$primary-color;
			transition: variables.$transition-standard;
		}

		&:hover {
			cursor: pointer;

			svg path {
				stroke: variables.$primary-color-light;
			}
		}
	}
</style>
