<script lang="ts">
	import Decimal from 'decimal.js';
	import { goto } from '$app/navigation';
	export let data;

	function formatSku(sku: number) {
		return '#' + sku.toString().padStart(7, '0');
	}

	function formatCurrency(value: Decimal) {
		return value.toFixed(2);
	}

	function sortInventoryClickHandler(column: string) {
		if (column === selectedSortColumn) {
			ascendingSort = !ascendingSort;
		} else {
			selectedSortColumn = column;
			ascendingSort = true;
		}

		goto(`/inventory?column=${column}&direction=${ascendingSort ? 'asc' : 'desc'}`);
	}

	type InventoryItem = {
		sku: number;
		display_name: string;
		count: number;
		cost: Decimal;
		price: Decimal;
	};

	let searchQuery = '';
	let selectedSortColumn = data.column;
	let ascendingSort = data.direction === 'asc';

	let recordsPerPage = 10;
	let page = 1;

	$: pages = Math.ceil(inventory.length / recordsPerPage);
	$: windowedInventory = inventory.slice((page - 1) * recordsPerPage, page * recordsPerPage);
	$: inventory = (data.inventoryJson as any[])
		.filter((item) => {
			if (searchQuery !== '') {
				let searchQueryLower = searchQuery.toLowerCase();
				let searchFields = [item.sku, item.display_name, item.count, item.cost, item.price].map(
					(field) => field.toString().toLowerCase()
				);

				if (!searchFields.some((field) => field.includes(searchQueryLower))) {
					return false;
				}
			}

			return true;
		})
		.map((item) => {
			let parsedItem: InventoryItem = {
				...item,
				cost: new Decimal(item.cost),
				price: new Decimal(item.price)
			};

			return parsedItem;
		});
</script>

<nav class="menu">
	<a href="/inventory">Inventory</a>
	<a href="/tickets">Tickets</a>
	<a href="/customers">Customers</a>
</nav>

<div class="page-body">
	<div class="table-menu">
		<input
			class="quick-search gray-outline"
			bind:value={searchQuery}
			placeholder="Quick search..."
		/>
		<div class="filter gray-outline"><span>Filter</span></div>
		<div class="spacer"></div>
		<div class="menu-right">
			<div class="records-per-page">
				<div class="label"><span>Records per page:</span></div>
				<input class="gray-outline" type="number" bind:value={recordsPerPage} />
			</div>
			<div class="page-number">
				<div class="prefix-label"><span>Page:</span></div>
				<input class="gray-outline" type="number" bind:value={page} />
				<div class="suffix-label"><span>of <strong>{pages}</strong></span></div>
			</div>
			<div class="page-navigation">
				<svg width="14" height="22" viewBox="0 0 14 22" fill="none">
					<path
						d="M12 2L3 11L12 20"
						stroke="white"
						stroke-opacity="0.5"
						stroke-width="3"
						stroke-linecap="round"
					/>
				</svg>
				<svg width="14" height="22" viewBox="0 0 14 22" fill="none">
					<path
						d="M2 2L11 11L2 20"
						stroke="white"
						stroke-opacity="0.5"
						stroke-width="3"
						stroke-linecap="round"
					/>
				</svg>
			</div>
		</div>
	</div>

	<div class="table gray-outline">
		<div class="column-header">
			<button class="column-title" on:click={() => sortInventoryClickHandler('sku')}>
				<span class="column-name">SKU</span>
				<div class="sort-arrows">
					<img
						class:active={ascendingSort && selectedSortColumn == 'sku'}
						class:inactive={!ascendingSort && selectedSortColumn == 'sku'}
						src="/sort_arrow_ascending.svg"
						alt="Ascending sort"
					/>
					<img
						class:active={!ascendingSort && selectedSortColumn == 'sku'}
						class:inactive={ascendingSort && selectedSortColumn == 'sku'}
						src="/sort_arrow_descending.svg"
						alt="Descending sort"
					/>
				</div>
			</button>
			<button class="column-title" on:click={() => sortInventoryClickHandler('display_name')}>
				<span class="column-name">Name</span>
				<div class="sort-arrows">
					<img
						class:active={ascendingSort && selectedSortColumn == 'display_name'}
						class:inactive={!ascendingSort && selectedSortColumn == 'display_name'}
						src="/sort_arrow_ascending.svg"
						alt="Ascending sort"
					/>
					<img
						class:active={!ascendingSort && selectedSortColumn == 'display_name'}
						class:inactive={ascendingSort && selectedSortColumn == 'display_name'}
						src="/sort_arrow_descending.svg"
						alt="Descending sort"
					/>
				</div>
			</button>
			<button class="column-title" on:click={() => sortInventoryClickHandler('count')}>
				<span class="column-name">Count</span>
				<div class="sort-arrows">
					<img
						class:active={ascendingSort && selectedSortColumn == 'count'}
						class:inactive={!ascendingSort && selectedSortColumn == 'count'}
						src="/sort_arrow_ascending.svg"
						alt="Ascending sort"
					/>
					<img
						class:active={!ascendingSort && selectedSortColumn == 'count'}
						class:inactive={ascendingSort && selectedSortColumn == 'count'}
						src="/sort_arrow_descending.svg"
						alt="Descending sort"
					/>
				</div>
			</button>
			<button class="column-title" on:click={() => sortInventoryClickHandler('cost')}>
				<span class="column-name">Cost</span>
				<div class="sort-arrows">
					<img
						class:active={ascendingSort && selectedSortColumn == 'cost'}
						class:inactive={!ascendingSort && selectedSortColumn == 'cost'}
						src="/sort_arrow_ascending.svg"
						alt="Ascending sort"
					/>
					<img
						class:active={!ascendingSort && selectedSortColumn == 'cost'}
						class:inactive={ascendingSort && selectedSortColumn == 'cost'}
						src="/sort_arrow_descending.svg"
						alt="Descending sort"
					/>
				</div>
			</button>
			<button class="column-title" on:click={() => sortInventoryClickHandler('price')}>
				<span class="column-name">Price</span>
				<div class="sort-arrows">
					<img
						class:active={ascendingSort && selectedSortColumn == 'price'}
						class:inactive={!ascendingSort && selectedSortColumn == 'price'}
						src="/sort_arrow_ascending.svg"
						alt="Ascending sort"
					/>
					<img
						class:active={!ascendingSort && selectedSortColumn == 'price'}
						class:inactive={ascendingSort && selectedSortColumn == 'price'}
						src="/sort_arrow_descending.svg"
						alt="Descending sort"
					/>
				</div>
			</button>
		</div>
		<div class="table-body gray-outline">
			{#each windowedInventory as inventoryItem}
				<div class="row">
					<span class="grid-item">{formatSku(inventoryItem.sku)}</span>
					<span class="grid-item">{inventoryItem.display_name}</span>
					<span class="grid-item">{inventoryItem.count}</span>
					<span class="grid-item">{formatCurrency(inventoryItem.cost)}</span>
					<span class="grid-item">{formatCurrency(inventoryItem.price)}</span>
				</div>
			{/each}
		</div>
	</div>
</div>

<style lang="scss">
	:global(body) {
		margin: 0;
		padding: 0;
		background-color: black;
	}

	a,
	span {
		font-family: 'Helvetica', sans-serif;
	}

	input::-webkit-outer-spin-button,
	input::-webkit-inner-spin-button {
		-webkit-appearance: none;
		margin: 0;
	}

	input[type='number'] {
		-moz-appearance: textfield;
		appearance: textfield;
	}

	.gray-outline {
		border-style: solid;
		border-width: 2px;
		border-color: gray;
		border-radius: 0.6em;
	}

	.menu {
		display: flex;
		flex-direction: row;
		flex-wrap: nowrap;
		align-items: center;
		background-color: lightblue;

		a {
			padding-top: 3px;
			padding-bottom: 3px;
			padding-left: 25px;
			padding-right: 25px;
			font-size: 35px;
			font-weight: bold;
			text-decoration: none;
			margin-top: 15px;
			margin-bottom: 10px;
			color: black;
			transition: 0.2s ease-out;

			&:hover {
				border-top-left-radius: 17px;
				border-top-right-radius: 17px;
				background-color: cyan;
				transition: 0.2s ease-out;
			}
		}
	}

	.page-body {
		margin-right: 25px;
		margin-left: 25px;
		padding-top: 25px;
	}

	.table-menu {
		display: flex;
		flex-direction: row;
		gap: 15px;
		font-size: 16px;
		color: white;

		div {
			display: flex;
			flex-direction: row;
			align-items: center;
		}

		.menu-right {
			gap: 7px;
		}

		span,
		input {
			padding-top: 7px;
			padding-bottom: 7px;
			padding-left: 10px;
			padding-right: 10px;
		}

		input {
			background-color: transparent;
			color: white;
			font-size: 16px;
			text-align: left;
		}

		.records-per-page {
			input {
				width: 2em;
			}
		}

		.page-number {
			input {
				width: 1.2em;
			}
		}

		.quick-search {
			flex-grow: 2;
			max-width: 270px;
		}

		.spacer {
			flex-grow: 1;
		}

		.page-navigation {
			gap: 15px;
		}
	}

	.table {
		display: grid;
		margin-top: 15px;
		padding: 15px;

		span {
			color: white;
		}

		span.column-name {
			font-size: 22px;
			font-weight: bold;
		}

		span.grid-item {
			font-size: 18px;
			padding-left: 5px;
		}

		.column-title {
			display: flex;
			flex-direction: row;
			align-items: center;
			background-color: transparent;
			border: none;
		}

		.sort-arrows {
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

		.table-body {
			padding-top: 10px;
			padding-bottom: 10px;
		}

		.row {
			display: grid;
			grid-template-columns: repeat(5, 20%);
			grid-column-start: 1;
			grid-column-end: 6;
			padding-left: 15px;
			padding-right: 15px;
			padding-top: 10px;
			padding-bottom: 10px;
			transition: 0.3s ease-out;

			&:hover {
				transform: translateY(-2px);
				font-size: 20px;
				padding-left: 13px;
				background-color: rgba(255, 255, 255, 0.05);
				transition: 0.3s ease-out;
			}
		}

		.column-header {
			display: grid;
			grid-template-columns: repeat(5, 20%);
			grid-template-rows: 1;
			padding-left: 15px;
			padding-right: 15px;
			margin-top: 12px;
			margin-bottom: 17px;
		}
	}
</style>
