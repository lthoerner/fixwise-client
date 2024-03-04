<script lang="ts">
	type SelectorMap = {
		[option: string]: SelectorItem;
	};

	type SelectorItem = {
		display_name: string;
		selected: boolean;
	};

	export let options: SelectorMap;
</script>

<div class="flex-row gray-outline">
	{#each Object.values(options) as option}
		<button
			class="menu-padding medium-text"
			class:selected={option.selected}
			on:click={() => (option.selected = !option.selected)}
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
		padding-left: 10px;
		padding-right: 10px;
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
