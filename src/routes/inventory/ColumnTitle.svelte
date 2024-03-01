<script lang="ts">
	import { goto } from '$app/navigation';

	function sort() {
		if (selected) {
			ascending = !ascending;
		} else {
			selectedColumn = columnName;
			ascending = true;
		}

		goto(`/inventory?column=${selectedColumn}&direction=${ascending ? 'asc' : 'desc'}`);
	}

	export let displayName: string;
	export let columnName: string;
	export let selectedColumn: string;
	export let ascending: boolean;
	$: selected = columnName === selectedColumn;
</script>

<button on:click={sort}>
	<span>{displayName}</span>
	<div>
		<img
			class:active={ascending && selected}
			class:inactive={!ascending && selected}
			src="/sort_arrow_ascending.svg"
			alt="Ascending sort"
		/>
		<img
			class:active={!ascending && selected}
			class:inactive={ascending && selected}
			src="/sort_arrow_descending.svg"
			alt="Descending sort"
		/>
	</div>
</button>

<style lang="scss">
	button {
		display: flex;
		flex-direction: row;
		align-items: center;
		background-color: transparent;
		border: none;
	}

	span {
		color: white;
		font-size: 22px;
		font-weight: bold;
	}

	div {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 3px;
		padding-left: 7px;

		img {
			opacity: 0;
		}

		img.active {
			opacity: 0.8;
		}

		img.inactive {
			opacity: 0.4;
		}
	}
</style>
