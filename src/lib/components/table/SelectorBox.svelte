<script lang="ts">
	type Selector = {
		options: NamedItem[];
		selected: string[];
	};

	type NamedItem = {
		true_name: string;
		display_name: string;
	};

	function select(option: string) {
		if (selector.selected.includes(option)) {
			if (!required) {
				selector.selected = selector.selected.filter((selectedOption) => selectedOption != option);
			}
		} else {
			if (exclusive) {
				selector.selected = [option];
			} else {
				selector.selected = [...selector.selected, option];
			}
		}
	}

	function isSelected(option: string) {
		return selector.selected.includes(option);
	}

	export let selector: Selector;
	export let exclusive: boolean = false;
	export let required: boolean = false;
	export let horizontalPadding: number = 10;
</script>

<div id="wrapper">
	{#each selector.options as option}
		<button
			class="selector-button"
			style="padding-left: {horizontalPadding}px; padding-right: {horizontalPadding}px;"
			class:selected={isSelected(option.true_name)}
			on:click={() => select(option.true_name)}
		>
			{option.display_name}
		</button>
	{/each}
</div>

<style lang="scss">
	@use '$styles/variables';
	@use '$styles/utility';

	#wrapper {
		@include utility.flex-row;
		@include utility.primary-color-outline;
		border-radius: variables.$rounding-standard;
	}

	.selector-button {
		font-size: variables.$font-size-standard;
		padding: 7px 0;
	}

	button {
		background-color: transparent;
		border: none;
		padding: 0;
		transition: variables.$transition-standard;

		&:hover {
			cursor: pointer;
			background-color: variables.$primary-color-semidark;
		}

		&.selected {
			background-color: variables.$primary-color;
		}
	}
</style>
