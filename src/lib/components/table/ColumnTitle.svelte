<script lang="ts">
	function sortColumn() {
		if (selected) {
			ascending = !ascending;
		} else {
			selectedSortColumn = trueName;
			ascending = true;
		}
	}

	export let trueName: string;
	export let displayName: string;
	export let selectedSortColumn: string;
	export let selectedFilterColumns: string[];
	export let ascending: boolean;
	$: selected = selectedSortColumn === trueName;
</script>

<button on:click={sortColumn}>
	<span class:selected={selectedFilterColumns.includes(trueName)}>{displayName}</span>
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
	@use '$styles/variables';
	@use '$styles/utility';

	button {
		@include utility.flex-row;
		padding: 0;
		background-color: transparent;
		border: none;
		transition: variables.$transition-slow;

		&:hover {
			cursor: pointer;
			transform: translateY(-2px);

			img {
				opacity: 0.17;
			}
		}
	}

	span {
		font-size: 22px;
		font-weight: bold;

		// &.selected {
		// 	background-color: variables.$primary-color-semidark;
		// }
	}

	div {
		@include utility.flex-column;
		gap: variables.$width-tiny;
		padding-left: variables.$width-small;

		img {
			opacity: 0;
			transition: variables.$transition-slow;
		}

		img.active {
			opacity: 0.8;
		}

		img.inactive {
			opacity: 0.3;
		}
	}
</style>
