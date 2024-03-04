<script lang="ts">
	import Decimal from 'decimal.js';
	import ColumnTitle from './ColumnTitle.svelte';
	export let data;

	type ColumnSchemaRecord = {
		true_name: string;
		display_name: string;
		search_weight: number;
		data_type: string;
		formatting: ColumnFormatting;
	};

	type ColumnSchema = {
		display_name: string;
		search_weight: number;
		data_type: string;
		formatting: ColumnFormatting;
	};

	type ColumnFormatting = {
		prefix: string;
		suffix: string;
		pad_length: number;
	};

	type BooleanMap = {
		[key: string]: boolean;
	};

	function parseInventory() {
		let inventory = data.inventoryJson;

		for (const [column_name, column_metadata] of columns.entries()) {
			if (column_metadata.data_type === 'decimal') {
				for (let item of inventory) {
					item[column_name] = new Decimal(item[column_name]);
				}
			}
		}

		return inventory;
	}

	function format(item: any) {
		let formattedItem = { ...item };
		for (const [column_name, column_metadata] of columns.entries()) {
			let value = item[column_name];

			if (column_metadata.data_type === 'decimal') {
				value = new Decimal(value).toFixed(2).toString();
			}

			if (column_metadata.formatting) {
				if (column_metadata.formatting.pad_length) {
					value = value.toString().padStart(column_metadata.formatting.pad_length, '0');
				}

				formattedItem[column_name] =
					`${column_metadata.formatting.prefix ?? ''}${value}${column_metadata.formatting.suffix ?? ''}`;
			}
		}

		return formattedItem;
	}

	function search(item: any, searchQuery: string) {
		if (searchQuery !== '') {
			const searchQueryLower = searchQuery.toLowerCase();
			for (const column of columns.keys()) {
				const searchColumn = item[column].toString().toLowerCase();
				if (searchColumn.includes(searchQueryLower)) {
					return item;
				}
			}

			return;
		}

		return item;
	}

	function compare(a: any, b: any, selectedSortColumn: string, ascendingSort: boolean) {
		const nameA = a[selectedSortColumn];
		const nameB = b[selectedSortColumn];

		const column = columns.get(selectedSortColumn);
		if (column && column.data_type === 'decimal') {
			return ascendingSort ? new Decimal(nameA).cmp(nameB) : new Decimal(nameB).cmp(nameA);
		}

		if (ascendingSort) {
			if (nameA < nameB) {
				return -1;
			}
			if (nameA > nameB) {
				return 1;
			}
		} else {
			if (nameA < nameB) {
				return 1;
			}
			if (nameA > nameB) {
				return -1;
			}
		}

		return 0;
	}

	function turnPage(next: boolean) {
		if (next) {
			if (page < pages) {
				page++;
			} else {
				page = 1;
			}
		} else {
			if (page > 1) {
				page--;
			} else {
				page = pages;
			}
		}
	}

	function advanceFilterStep() {
		if (!selectingFilterColumn && !selectingFilterCriteria) {
			selectingFilterColumn = true;
		} else if (selectingFilterColumn) {
			selectingFilterColumn = false;
			selectingFilterCriteria = true;
		} else if (selectingFilterCriteria) {
			selectingFilterCriteria = false;
		}
	}

	const columns: Map<string, ColumnSchema> = new Map();
	for (const column of data.inventorySchema as ColumnSchemaRecord[]) {
		columns.set(column.true_name, column as ColumnSchema);
	}

	const inventory: any[] = parseInventory();

	let searchQuery = '';
	let selectedSortColumn = 'sku';
	let ascendingSort = true;

	let recordsPerPage = 10;
	let page = 1;

	let selectingFilterColumn = false;
	let selectingFilterCriteria = false;
	let selectedFilterColumns: BooleanMap = {};
	columns.forEach((_, column) => (selectedFilterColumns[column] = false));

	$: page = page < pages ? page : pages;
	$: page = page > 0 ? page : 1;
	$: pages = Math.ceil(searchedInventory.length / recordsPerPage);

	$: windowedInventory = searchedInventory.slice(
		(page - 1) * recordsPerPage,
		page * recordsPerPage
	);
	$: searchedInventory = inventory
		.filter((item) => search(item, searchQuery))
		.sort((a, b) => compare(a, b, selectedSortColumn, ascendingSort))
		.map(format);
</script>

<nav class="menu flex-row title-text">
	<a href="/inventory">Inventory</a>
	<a href="/tickets">Tickets</a>
	<a href="/customers">Customers</a>
</nav>

<div class="page-body">
	<div class="table-menu flex-row">
		<input
			class="quick-search menu-padding medium-text gray-outline"
			bind:value={searchQuery}
			placeholder="Quick search..."
		/>
		<button
			class="filter menu-padding flex-row medium-text gray-outline"
			on:click={advanceFilterStep}
		>
			<!-- <span>{selectingFilterColumn || selectingFilterCriteria ? '+' : 'Add\xa0Filter'}</span> -->
			<span>Filter</span>
		</button>
		<div
			class="flex-row medium-text gray-outline"
			class:hidden={!selectingFilterColumn && !selectingFilterCriteria}
		>
			{#each columns as [column_name, column_metadata]}
				<button
					class="filter-column menu-padding flex-row medium-text"
					class:selected={selectedFilterColumns[column_name]}
					on:click={() => {
						selectedFilterColumns[column_name] = !selectedFilterColumns[column_name];
					}}
				>
					{column_metadata.display_name}
				</button>
			{/each}
		</div>
		<input class="menu-padding medium-text gray-outline" class:hidden={!selectingFilterCriteria} />
		<div class="menu-right flex-row">
			<div class="records-per-page flex-row">
				<div class="menu-padding"><span>Records per page:</span></div>
				<input
					class="menu-padding medium-text gray-outline"
					type="number"
					bind:value={recordsPerPage}
				/>
			</div>
			<div class="page-number flex-row">
				<div class="menu-padding"><span>Page:</span></div>
				<input class="menu-padding medium-text gray-outline" type="number" bind:value={page} />
				<div class="menu-padding"><span>of <strong>{pages}</strong></span></div>
			</div>
			<div class="page-navigation flex-row">
				<button on:click={() => turnPage(false)}>
					<img src="/page_navigator_previous.svg" alt="Next page" />
				</button>
				<button on:click={() => turnPage(true)}>
					<img src="/page_navigator_next.svg" alt="Previous page" />
				</button>
			</div>
		</div>
	</div>

	<div class="table gray-outline">
		<div class="column-header">
			{#each columns as [column_name, column_metadata]}
				<ColumnTitle
					columnName={column_name}
					displayName={column_metadata.display_name}
					bind:selectedColumn={selectedSortColumn}
					bind:ascending={ascendingSort}
				/>
			{/each}
		</div>
		<div class="table-body gray-outline-top">
			{#each windowedInventory as inventoryItem}
				<div class="row">
					{#each columns as [column, _]}
						<span class="grid-item large-text">{inventoryItem[column]}</span>
					{/each}
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
	span,
	input,
	button {
		font-family: 'Helvetica', sans-serif;
		color: white;
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

	button {
		background-color: transparent;
		padding: 0;
		border: none;
	}

	input {
		background-color: transparent;
		text-align: left;

		&:focus {
			outline: none;
		}
	}

	.hidden {
		display: none !important;
	}

	.flex-row {
		display: flex;
		flex-direction: row;
		flex-wrap: nowrap;
		align-items: center;
		overflow: hidden;
	}

	.title-text {
		font-size: 36px;
		font-weight: bold;
	}

	.large-text {
		font-size: 18px;
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

	.gray-outline-top {
		border-top-style: solid;
		border-top-width: 2px;
		border-top-color: gray;
	}

	.menu {
		background-color: purple;

		a {
			padding-top: 3px;
			padding-bottom: 3px;
			padding-left: 25px;
			padding-right: 25px;
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
		gap: 15px;

		.menu-right {
			margin-left: auto;
			gap: 7px;
		}

		.menu-padding {
			padding-top: 7px;
			padding-bottom: 7px;
			padding-left: 10px;
			padding-right: 10px;
		}

		.records-per-page,
		.page-number {
			input {
				width: 2em;
			}
		}

		.quick-search {
			flex-grow: 2;
			max-width: 250px;
		}

		.filter {
			transition: 0.23s ease-out;

			&:hover {
				background-color: gray;
				transition: 0.23s ease-out;
			}
		}

		.filter-column {
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

		.page-navigation {
			gap: 15px;

			img {
				opacity: 0.5;
				transition: 0.23s ease-out;

				&:hover {
					opacity: 1;
					transition: 0.23s ease-out;
				}
			}
		}
	}

	.table {
		display: grid;
		margin-top: 15px;
		padding: 15px;

		.grid-item {
			padding-left: 3px;
		}

		.column-header {
			display: grid;
			grid-template-columns: repeat(auto-fit, minmax(0, 1fr));
			padding-left: 15px;
			padding-right: 15px;
			margin-top: 12px;
			margin-bottom: 17px;
		}

		.table-body {
			padding-top: 10px;
		}

		.row {
			display: grid;
			grid-template-columns: repeat(auto-fit, minmax(0, 1fr));
			padding-left: 15px;
			padding-right: 15px;
			padding-top: 10px;
			padding-bottom: 10px;
			transition: 0.3s ease-out;
			border-radius: 0.6em;

			&:hover {
				transform: translateY(-2px);
				font-size: 20px;
				padding-left: 12px;
				background-color: rgba(255, 255, 255, 0.05);
				transition: 0.3s ease-out;
			}
		}
	}
</style>
