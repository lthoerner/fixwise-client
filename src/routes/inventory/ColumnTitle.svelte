<script lang="ts">
	function sort() {
		if (selected) {
			ascending = !ascending;
		} else {
			selectedColumn = columnName;
			ascending = true;
		}
	}

	export let columnName: string;
	export let displayName: string;
	export let selectedColumn: string;
	export let ascending: boolean;
	$: selected = columnName == selectedColumn;
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
		padding: 0;
		background-color: transparent;
		border: none;
		transition: 0.3s ease-out;

		&:hover {
			transform: translateX(-2px) translateY(-2px);
			transition: 0.3s ease-out;

			img {
				opacity: 0.17;
				transition: 0.3s ease-out;
			}
		}
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
			transition: 0.3s ease-out;
		}

		img.active {
			opacity: 0.8;
			transition: 0.3s ease-out;
		}

		img.inactive {
			opacity: 0.3;
			transition: 0.3s ease-out;
		}
	}
</style>
