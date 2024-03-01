<script lang="ts">
	export let ascending: boolean;
	export let selected: boolean;
</script>

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

<style lang="scss">
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
