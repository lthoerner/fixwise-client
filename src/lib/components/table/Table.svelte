<script lang="ts">
	import Decimal from 'decimal.js';
	import SelectorBox from './SelectorBox.svelte';
	import ColumnTitle from './ColumnTitle.svelte';

	export let tableData: any[];
	export let tableSchema: any[];

	type ColumnSchemaRecord = {
		name: string;
		display_name: string;
		data_type: string;
		formatting: ColumnFormatting;
	};

	type ColumnSchema = {
		display_name: string;
		data_type: string;
		formatting: ColumnFormatting;
	};

	type ColumnFormatting = {
		prefix: string;
		suffix: string;
		pad_length: number;
	};

	type Selector = {
		options: NamedItem[];
		selected: string[];
	};

	type NamedItem = {
		true_name: string;
		display_name: string;
	};

	type Filter = {
		columns: string[];
		criteria: StringCriteria | NumericCriteria;
	};

	type StringCriteria = {
		regex: boolean;
		value: string;
		type: 'string_criteria';
	};

	type NumericCriteria = {
		operator: 'greater_than' | 'less_than' | 'equals';
		value: number;
		type: 'numeric_criteria';
	};

	function parseTableDataTypes() {
		for (const [column_name, column_metadata] of columns.entries()) {
			if (column_metadata.data_type === 'decimal') {
				for (let item of tableData) {
					item[column_name] = new Decimal(item[column_name]);
				}
			}
		}

		return tableData;
	}

	function format(item: any) {
		let formattedItem = {
			...item
		};
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
		if (searchQuery != '') {
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

	function filter(item: any, filters: Filter[]) {
		for (const filter of filters) {
			const criteria = filter.criteria;

			for (const column of filter.columns) {
				const columnValue = item[column].toString();

				if (criteria.type === 'string_criteria') {
					if (criteria.regex) {
						const regex = new RegExp(criteria.value, 'i');
						if (!regex.test(columnValue)) {
							return;
						}
					} else {
						if (!columnValue.includes(criteria.value)) {
							return;
						}
					}
				} else if (criteria.type === 'numeric_criteria') {
					switch (criteria.operator) {
						case 'greater_than':
							if (!(columnValue > criteria.value)) {
								return;
							}
							break;
						case 'less_than':
							if (!(columnValue < criteria.value)) {
								return;
							}
							break;
						case 'equals':
							if (columnValue !== criteria.value) {
								return;
							}
							break;
					}
				}
			}
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
			if (inputPage && inputPage < totalPages) {
				inputPage++;
			} else {
				inputPage = 1;
			}
		} else {
			if (inputPage && inputPage > 1) {
				inputPage--;
			} else {
				inputPage = totalPages;
			}
		}
	}

	function applyFilter() {
		let criteria: StringCriteria | NumericCriteria;
		if (allFilterColumnsNumeric) {
			criteria = {
				operator: numericOperators.selected[0] as 'greater_than' | 'less_than' | 'equals',
				value: parseFloat(filterQuery),
				type: 'numeric_criteria'
			};
		} else {
			criteria = {
				regex: useRegex,
				value: filterQuery,
				type: 'string_criteria'
			};
		}

		filters = [
			...filters,
			{
				columns: filterColumns.selected,
				criteria
			}
		];

		filterQuery = '';
		filterStep = null;
		filterColumns.selected = [];
		useRegex = false;
		numericOperators.selected = ['equals'];
	}

	function allColumnsNumeric(selectedColumns: Selector) {
		const numericTypes = ['decimal', 'integer'];
		for (const column_name of selectedColumns.selected) {
			// Throw error here?
			const column = columns.get(column_name);
			if (column && !numericTypes.includes(column.data_type)) {
				return false;
			}
		}

		return true;
	}

	const columns: Map<string, ColumnSchema> = new Map();
	for (const column of tableSchema as ColumnSchemaRecord[]) {
		columns.set(column.name, column as ColumnSchema);
	}

	const parsedTableData: any[] = parseTableDataTypes();

	let selectedSortColumn = columns.keys().next().value;
	let ascendingSort = true;

	let recordsPerPage = 10;
	let inputPage: number | null = 1;

	let searchQuery = '';
	let filterQuery = '';

	let filters: Filter[] = [];

	let filterStep: null | 'column' | 'criteria' = null;
	let filterColumns: Selector = {
		options: [],
		selected: []
	};

	for (const [column_name, column_metadata] of columns.entries()) {
		filterColumns.options.push({
			true_name: column_name,
			display_name: column_metadata.display_name
		});
	}

	let lookupType: Selector = {
		options: [
			{
				true_name: 'search',
				display_name: 'Search'
			},
			{
				true_name: 'filter',
				display_name: 'Filter'
			}
		],
		selected: ['search']
	};

	let numericOperators: Selector = {
		options: [
			{
				true_name: 'greater_than',
				display_name: '>'
			},
			{
				true_name: 'less_than',
				display_name: '<'
			},
			{
				true_name: 'equals',
				display_name: '='
			}
		],
		selected: ['equals']
	};

	let useRegex = false;

	$: allFilterColumnsNumeric = allColumnsNumeric(filterColumns);

	$: if (inputPage != null && inputPage > totalPages) {
		inputPage = totalPages;
	}
	$: if (inputPage === 0) {
		inputPage = null;
		console.log('Nullified input page');
	}
	$: realPage = inputPage && inputPage > 0 ? inputPage : 1;
	$: totalPages = Math.ceil(searchedTableData.length / recordsPerPage);

	$: windowedTableData = searchedTableData.slice(
		(realPage - 1) * recordsPerPage,
		realPage * recordsPerPage
	);
	$: searchedTableData = parsedTableData
		.filter((item) => {
			if (lookupType.selected.includes('search')) {
				return search(item, searchQuery);
			} else if (lookupType.selected.includes('filter')) {
				return filter(item, filters);
			}
		})
		.sort((a, b) => compare(a, b, selectedSortColumn, ascendingSort))
		.map(format);
</script>

<div id="table-menu">
	<SelectorBox bind:selector={lookupType} exclusive={true} required={true} />
	{#if lookupType.selected.includes('search')}
		<input id="search" class="menu-input" bind:value={searchQuery} placeholder="Quick search..." />
	{/if}
	{#if lookupType.selected.includes('filter')}
		{#if filterStep === null}
			<button class="menu-button" on:click={() => (filterStep = 'column')}>
				<span>Add Filter</span>
			</button>
		{/if}
		{#if filterStep === 'column'}
			<SelectorBox bind:selector={filterColumns} />
			<button
				class="menu-button"
				on:click={() => (filterColumns.selected.length > 0 ? (filterStep = 'criteria') : false)}
			>
				<span>Done</span>
			</button>
		{/if}
		{#if filterStep === 'criteria'}
			{#if allFilterColumnsNumeric}
				<SelectorBox
					bind:selector={numericOperators}
					exclusive={true}
					required={true}
					horizontalPadding={18}
				/>
				<input class="menu-input" bind:value={filterQuery} placeholder="Type a number..." />
			{:else}
				<div id="filter-query">
					<button
						id="regex-button"
						class:selected={useRegex}
						on:click={() => (useRegex = !useRegex)}
					>
						<img src="/regex.svg" alt="Use regex" />
					</button>
					<input
						class="menu-input"
						style="padding-right: 2em;"
						bind:value={filterQuery}
						placeholder="Type a query..."
					/>
				</div>
			{/if}
			<button
				class="menu-button"
				on:click={() => {
					if (filterQuery != '') applyFilter();
				}}
			>
				<span>Apply</span>
			</button>
			<div class="icon-pair">
				<img src="/columns.svg" alt="Columns Selected:" />
				<span>{filterColumns.selected.length}</span>
			</div>
		{/if}
		<div class="icon-pair">
			<img src="/filter.svg" alt="Active Filters:" />
			<span>{filters.length}</span>
		</div>
	{/if}
	{#if searchedTableData.length > 0}
		<div class="menu-right">
			<div id="records-per-page">
				<div class="menu-padding"><span>Records per page:</span></div>
				<input class="menu-input" type="number" bind:value={recordsPerPage} />
			</div>
			<div id="page-number">
				<div class="menu-padding"><span>Page:</span></div>
				<input class="menu-input" type="number" bind:value={inputPage} />
				<div class="menu-padding">
					<span>of <strong>{recordsPerPage > 0 ? totalPages : '?'}</strong></span>
				</div>
			</div>
			<div id="page-navigation">
				<button on:click={() => turnPage(false)}>
					<img src="/page_navigator_previous.svg" alt="Navigate to next page" />
				</button>
				<button on:click={() => turnPage(true)}>
					<img src="/page_navigator_next.svg" alt="Navigate to previous page" />
				</button>
			</div>
		</div>
	{:else}
		<div class="menu-right">
			<div class="menu-padding">
				<span><strong>No pages to show</strong></span>
			</div>
		</div>
	{/if}
</div>

<div id="table">
	<div id="column-titles">
		{#each columns as [column_name, column_metadata]}
			<ColumnTitle
				trueName={column_name}
				displayName={column_metadata.display_name}
				bind:selectedColumn={selectedSortColumn}
				bind:ascending={ascendingSort}
			/>
		{/each}
	</div>
	<div id="table-body">
		{#if searchedTableData.length > 0}
			{#each windowedTableData as dataItem}
				<div class="row">
					{#each columns as [column, _]}
						<span class="grid-item">{dataItem[column]}</span>
					{/each}
				</div>
			{/each}
		{:else}
			<div id="placeholder-row"><span>No items to show</span></div>
		{/if}
	</div>
</div>

<style lang="scss">
	@use '$styles/utility' as utility;

	#table-menu {
		@include utility.flex-row;
		@include utility.gap-standard;

		#regex-button {
			@include utility.absolute;
			@include utility.rounded-corners-sharp;
			@include utility.transition-standard;

			padding-top: 4px;
			padding-bottom: 4px;
			padding-left: 5px;
			padding-right: 5px;
			margin-right: 6px;

			&:hover,
			&.selected {
				background-color: gray;
			}

			img {
				height: 13px;
			}
		}

		#records-per-page,
		#page-number {
			@include utility.flex-row;

			input {
				width: 2em;
			}
		}

		#search {
			flex-grow: 2;
			max-width: 250px;
		}

		#filter-query {
			@include utility.flex-row;
			@include utility.justify-end;
		}

		#page-navigation {
			@include utility.flex-row;
			@include utility.gap-standard;

			img {
				@include utility.transition-standard;

				opacity: 0.5;

				&:hover {
					opacity: 1;
				}
			}
		}

		.menu-right {
			@include utility.flex-row;
			@include utility.gap-small;

			margin-left: auto;
		}

		.menu-padding {
			padding-top: 7px;
			padding-bottom: 7px;
			padding-left: 10px;
			padding-right: 10px;
		}

		.menu-button {
			@include utility.gray-outline;
			@include utility.rounded-corners-standard;
			@include utility.medium-text;
			@include utility.transition-standard;
			@extend .menu-padding;

			&:hover {
				background-color: gray;
			}
		}

		.menu-input {
			@include utility.gray-outline;
			@include utility.rounded-corners-standard;
			@include utility.medium-text;
			@extend .menu-padding;
		}

		.icon-pair {
			@include utility.flex-row;
			@include utility.gap-small;
			@include utility.medium-text;

			img {
				height: 1.1em;
			}
		}
	}

	#table {
		@include utility.gray-outline;
		@include utility.rounded-corners-standard;

		display: grid;
		margin-top: 15px;
		padding: 15px;

		#column-titles {
			@include utility.grid-row-auto;

			padding-left: 15px;
			padding-right: 15px;
			margin-top: 12px;
			margin-bottom: 17px;
		}

		#table-body {
			@include utility.gray-outline-top;

			padding-top: 10px;
		}

		.grid-item {
			@include utility.large-text;

			padding-left: 3px;
		}

		.row {
			@include utility.grid-row-auto;
			@include utility.rounded-corners-standard;
			@include utility.transition-slow;

			padding-left: 15px;
			padding-right: 15px;
			padding-top: 10px;
			padding-bottom: 10px;

			&:hover {
				transform: translateY(-2px);
				font-size: 20px;
				padding-left: 12px;
				background-color: rgba(255, 255, 255, 0.05);
			}
		}

		#placeholder-row {
			@include utility.flex-row;
			@include utility.justify-center;

			font-size: 20px;
			padding-top: 20px;
			padding-bottom: 14px;
			padding-left: 15px;
		}
	}
</style>
