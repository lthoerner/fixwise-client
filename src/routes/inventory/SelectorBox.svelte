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

<div class="flex-row gray-outline">
	{#each selector.options as option}
		<button
			class="menu-padding medium-text"
			style="padding-left: {horizontalPadding}px; padding-right: {horizontalPadding}px;"
			class:selected={isSelected(option.true_name)}
			on:click={() => select(option.true_name)}
		>
			{option.display_name}
		</button>
	{/each}
</div>

<style lang="scss">
	.flex-row {
		display: flex;
		flex-direction: row;
		flex-wrap: nowrap;
		align-items: center;
		overflow: hidden;
	}

	.medium-text {
		font-size: 16px;
	}

	.gray-outline {
		border-style: solid;
		border-width: 2px;
		border-color: gray;
		border-radius: 0.6em;
	}

	.menu-padding {
		padding-top: 7px;
		padding-bottom: 7px;
	}

	button {
		font-family: 'Helvetica', sans-serif;
		background-color: transparent;
		border: none;
		padding: 0;
		color: white;
		transition: 0.23s ease-out;

		&:hover {
			background-color: rgba(255, 255, 255, 0.25);
			transition: 0.23s ease-out;
		}

		&.selected {
			background-color: gray;
			transition: 0.23s ease-out;
		}
	}
</style>
