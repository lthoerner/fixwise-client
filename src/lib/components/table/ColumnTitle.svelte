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
		@include utility.transition-slow;

		padding: 0;
		background-color: transparent;
		border: none;

		&:hover {
			transform: translateX(-2px) translateY(-2px);

			img {
				opacity: 0.17;
			}
		}
	}

	span {
		color: white;
		font-size: 22px;
		font-weight: bold;
	}

	div {
		@include utility.flex-column;
		@include utility.gap-tiny;

		padding-left: 7px;

		img {
			@include utility.transition-slow;

			opacity: 0;
		}

		img.active {
			opacity: 0.8;
		}

		img.inactive {
			opacity: 0.3;
		}
	}
</style>
