<script lang="ts">
	function sortColumn() {
		if (selected) {
			ascending = !ascending;
		} else {
			selectedSortColumn = trueName;
			ascending = true;
		}
	}

	let {
		trueName,
		displayName,
		selectedSortColumn = $bindable(),
		selectedFilterColumn = $bindable(),
		ascending = $bindable()
	}: {
		trueName: string;
		displayName: string;
		selectedSortColumn: string;
		selectedFilterColumn: string;
		ascending: boolean;
	} = $props();

	let selected = $derived(selectedSortColumn === trueName);
</script>

<button onclick={sortColumn}>
	<span class:selected={selectedFilterColumn === trueName}>{displayName}</span>
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
