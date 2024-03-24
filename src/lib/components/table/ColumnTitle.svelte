<script lang="ts">
	function sortColumn() {
		if (selected) {
			ascending = !ascending;
		} else {
			selectedColumn = trueName;
			ascending = true;
		}
	}

	export let trueName: string;
	export let displayName: string;
	export let selectedColumn: string;
	export let ascending: boolean;
	$: selected = selectedColumn === trueName;
</script>

<button on:click={sortColumn}>
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
	@use '$styles/utility' as utility;

	button {
		@include utility.flex-row;
		padding: 0;
		background-color: transparent;
		border: none;
		transition: utility.$transition-slow;

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
		gap: utility.$width-tiny;
		padding-left: utility.$width-small;

		img {
			opacity: 0;
			transition: utility.$transition-slow;
		}

		img.active {
			opacity: 0.8;
		}

		img.inactive {
			opacity: 0.3;
		}
	}
</style>
