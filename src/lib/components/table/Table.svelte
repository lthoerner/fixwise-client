<script lang="ts">
	import Decimal from 'decimal.js';
	import SelectorBox from './SelectorBox.svelte';
	import ColumnTitle from './ColumnTitle.svelte';
	import IconPair from './IconPair.svelte';
	import PageNavigatorIcon from './PageNavigatorIcon.svelte';

	export let tableData: any[];
	export let tableView: TableViewRecord;

	type TableViewRecord = ColumnViewRecord[];

	type ColumnViewRecord = {
		name: string;
		data_type: string;
		display_name: string;
		trimmable: boolean;
		formatting: ColumnFormatting | null;
	};

	type TableView = Map<string, ColumnView>;

	type ColumnView = {
		data_type: string;
		display_name: string;
		trimmable: boolean;
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

	const columns: TableView = new Map();
	for (const column of tableView as ColumnViewRecord[]) {
		columns.set(column.name, column as ColumnView);
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

	let emptyTable = false;

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

	$: if (inputPage !== null && inputPage > totalPages) {
		inputPage = totalPages;
	}
	$: if (inputPage === 0) {
		inputPage = null;
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

	$: if (searchedTableData.length === 0) {
		emptyTable = true;
	}
	$: if (emptyTable && searchedTableData.length > 0) {
		inputPage = 1;
		emptyTable = false;
	}
</script>

<div id="menu">
	<SelectorBox bind:selector={lookupType} exclusive={true} required={true} />
	{#if lookupType.selected.includes('search')}
		<input id="search" class="menu-input" bind:value={searchQuery} placeholder="Quick search..." />
	{/if}
	{#if lookupType.selected.includes('filter')}
		{#if filterStep === null}
			<button class="menu-button" on:click={() => (filterStep = 'column')}>
				<span>Add Filter</span>
			</button>
			{#if filters.length > 0}
				<button class="menu-button" on:click={() => (filters = [])}>
					<span>Reset</span>
				</button>
			{/if}
		{:else}
			<button
				class="menu-button"
				on:click={() => {
					filterStep = null;
					filterQuery = '';
					filterColumns.selected = [];
				}}
			>
				<span>Cancel</span>
			</button>
		{/if}
		{#if filterStep === 'column'}
			<SelectorBox bind:selector={filterColumns} />
			<button
				class="menu-button"
				on:click={() => (filterColumns.selected.length > 0 ? (filterStep = 'criteria') : false)}
			>
				<span>Next</span>
			</button>
		{/if}
		{#if filterStep === 'criteria'}
			{#if allFilterColumnsNumeric}
				<SelectorBox
					bind:selector={numericOperators}
					exclusive={true}
					required={true}
					horizontalPadding={12}
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
					<input class="menu-input" bind:value={filterQuery} placeholder="Type a query..." />
				</div>
			{/if}
			<button class="menu-button" on:click={() => (filterStep = 'column')}>
				<span>Back</span>
			</button>
			<button
				class="menu-button"
				on:click={() => {
					if (filterQuery !== '') applyFilter();
				}}
			>
				<span>Apply</span>
			</button>
		{/if}
		{#if filterStep !== null}
			<IconPair icon="column" bind:text={filterColumns.selected.length} />
		{/if}
		<IconPair icon="filter" bind:text={filters.length} />
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
				<PageNavigatorIcon direction="left" bind:inputPage bind:totalPages />
				<PageNavigatorIcon direction="right" bind:inputPage bind:totalPages />
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

<div id="body" style="--num-columns: {columns.size}">
	<div id="column-headers">
		{#each columns as [column_name, column_metadata]}
			<ColumnTitle
				trueName={column_name}
				displayName={column_metadata.display_name}
				bind:selectedSortColumn
				bind:selectedFilterColumns={filterColumns.selected}
				bind:ascending={ascendingSort}
			/>
		{/each}
	</div>
	{#if windowedTableData.length > 0}
		{#each windowedTableData as dataItem}
			<div class="row">
				{#each columns as [column_name, column_metadata]}
					<span class="grid-item" class:trimmable={column_metadata.trimmable}>
						{dataItem[column_name]}
					</span>
				{/each}
			</div>
		{/each}
	{:else}
		<div id="placeholder-row"><span>No items to show</span></div>
	{/if}
</div>

<style lang="scss">
	@use '$styles/variables';
	@use '$styles/utility';

	#menu {
		@include utility.flex-row;
		gap: variables.$width-standard;

		#regex-button {
			position: absolute;
			padding: 4px 5px;
			margin-right: 6px;
			border-radius: variables.$rounding-sharp;
			transition: variables.$transition-standard;

			&:hover {
				cursor: pointer;
				background-color: variables.$primary-color;
			}

			&.selected {
				background-color: variables.$primary-color;
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
			justify-content: flex-end;

			input {
				padding-right: 2em;
			}
		}

		#page-navigation {
			@include utility.flex-row;
			gap: variables.$width-standard;
		}

		.menu-right {
			@include utility.flex-row;
			gap: variables.$width-small;
			margin-left: auto;
		}

		.menu-padding {
			padding: 7px 10px;
		}

		.menu-button {
			@include utility.primary-color-outline;
			@extend .menu-padding;
			font-size: variables.$font-size-standard;
			border-radius: variables.$rounding-standard;
			transition: variables.$transition-standard;

			&:hover {
				cursor: pointer;
				background-color: variables.$primary-color;
			}
		}

		.menu-input {
			@include utility.primary-color-outline;
			@extend .menu-padding;
			font-size: variables.$font-size-standard;
			border-radius: variables.$rounding-standard;
		}
	}

	#body {
		@include utility.primary-color-outline;
		display: grid;
		grid-template-columns: repeat(var(--num-columns), auto);
		grid-auto-rows: min-content;
		column-gap: variables.$width-large;
		justify-content: space-between;
		border-radius: variables.$rounding-standard;
		margin-top: variables.$width-standard;
		padding: variables.$width-standard;
		padding-top: variables.$width-standard + 12px;

		#column-headers {
			@include utility.primary-color-outline-bottom;
			display: grid;
			grid-column: 1 / span var(--num-columns);
			grid-template-columns: subgrid;
			padding-left: variables.$width-standard;
			padding-right: variables.$width-standard;
			padding-bottom: variables.$width-standard + 2px;
			margin-bottom: variables.$width-small + 3px;
		}

		.grid-item {
			font-size: variables.$font-size-large;
			max-width: fit-content;

			&.trimmable {
				text-overflow: ellipsis;
				white-space: nowrap;
				overflow: hidden;
			}
		}

		.row {
			display: grid;
			grid-template-columns: subgrid;
			grid-column: 1 / span var(--num-columns);
			padding: variables.$width-small + 3px variables.$width-standard;
			border-radius: variables.$rounding-standard;
			transition: variables.$transition-slow;

			span {
				&:hover {
					cursor: text;
				}
			}

			&:hover {
				cursor: pointer;
				transform: translateY(-2px);
				background-color: variables.$primary-color-dark;
			}
		}

		#placeholder-row {
			@include utility.flex-row;
			justify-content: center;
			grid-column: 1 / span var(--num-columns);
			font-size: variables.$font-size-large;
			font-weight: bold;
			padding-top: 20px;
			padding-bottom: 14px;
		}
	}
</style>
