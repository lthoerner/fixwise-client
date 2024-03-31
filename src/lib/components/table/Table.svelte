<script lang="ts">
	import Decimal from 'decimal.js';
	import SelectorBox from './SelectorBox.svelte';
	import ColumnTitle from './ColumnTitle.svelte';
	import IconPair from './IconPair.svelte';
	import PageNavigatorIcon from './PageNavigatorIcon.svelte';

	export let tableRows: any[];
	export let tableView: TableViewRecord;

	type TableViewRecord = ColumnViewRecord[];

	type ColumnViewRecord = {
		name: string;
		display_name: string;
		data_type: string;
		trimmable: boolean;
		formatting: ColumnFormatting | null;
	};

	type TableView = Map<string, ColumnView>;

	type ColumnView = {
		display_name: string;
		data_type: string;
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
		criteria: StringCriteria | NumericCriteria | DateCriteria;
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

	type DateCriteria = {
		operator: 'after' | 'before' | 'on';
		value: Date;
		type: 'date_criteria';
	};

	function parseRowDataTypes() {
		for (const [column_name, column_metadata] of columns.entries()) {
			if (column_metadata.data_type === 'decimal') {
				for (let row of tableRows) {
					row[column_name] = new Decimal(row[column_name]);
				}
			} else if (column_metadata.data_type === 'timestamp') {
				for (let row of tableRows) {
					row[column_name] = new Date(row[column_name]);
				}
			}
		}

		return tableRows;
	}

	function format(row: any) {
		let formattedRow = { ...row };

		for (const [column_name, column_metadata] of columns.entries()) {
			let initialValue = row[column_name];
			let workingValue = initialValue;

			if (column_metadata.data_type === 'decimal') {
				workingValue = (initialValue as Decimal).toFixed(2);
			} else if (column_metadata.data_type === 'timestamp') {
				let date = initialValue as Date;
				let day = String(date.getDate()).padStart(2, '0');
				let month = String(date.getMonth() + 1).padStart(2, '0');
				let year = String(date.getFullYear());
				let hours = String(date.getHours()).padStart(2, '0');
				let minutes = String(date.getMinutes()).padStart(2, '0');
				workingValue = `${day}/${month}/${year} ${hours}:${minutes}`;
			}

			if (column_metadata.formatting) {
				if (column_metadata.formatting.pad_length) {
					workingValue = workingValue
						.toString()
						.padStart(column_metadata.formatting.pad_length, '0');
				}

				workingValue = `${column_metadata.formatting.prefix ?? ''}${workingValue}${column_metadata.formatting.suffix ?? ''}`;
			}

			formattedRow[column_name] = workingValue;
		}

		return formattedRow;
	}

	function isSearchMatch(row: any, query: string): boolean {
		if (query === '') {
			return true;
		}

		const searchQueryLower = searchQuery.toLowerCase();
		for (const column of columns.keys()) {
			const searchColumn = row[column].toString().toLowerCase();
			if (searchColumn.includes(searchQueryLower)) {
				return true;
			}
		}

		return false;
	}

	function isFilterMatch(parsedRow: any, formattedRow: any, filters: Filter[]): boolean {
		for (const filter of filters) {
			const criteria = filter.criteria;

			for (const column of filter.columns) {
				const parsedColumnValue = parsedRow[column];
				const formattedColumnValue = formattedRow[column].toString();

				if (criteria.type === 'string_criteria') {
					if (criteria.regex) {
						const regex = new RegExp(criteria.value);
						if (!regex.test(formattedColumnValue)) {
							return false;
						}
					} else {
						if (!formattedColumnValue.includes(criteria.value)) {
							return false;
						}
					}
				} else if (criteria.type === 'numeric_criteria') {
					switch (criteria.operator) {
						case 'greater_than':
							if (!(parsedColumnValue > criteria.value)) {
								return false;
							}
							break;
						case 'less_than':
							if (!(parsedColumnValue < criteria.value)) {
								return false;
							}
							break;
						case 'equals':
							if (parsedColumnValue !== criteria.value) {
								return false;
							}
							break;
					}
				} else if (criteria.type === 'date_criteria') {
					switch (criteria.operator) {
						case 'after':
							if (!(parsedColumnValue > criteria.value)) {
								return false;
							}
							break;
						case 'before':
							if (!(parsedColumnValue < criteria.value)) {
								return false;
							}
							break;
						case 'on':
							if (parsedColumnValue !== criteria.value) {
								return false;
							}
							break;
					}
				}
			}
		}

		return true;
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

	function getFilteredRows(mode: string, searchQuery: string, filters: Filter[]): any[] {
		const num_rows = parsedRows.length;
		const searchMode = mode === 'search';
		const filterMode = mode === 'filter';

		let filteredRows = [];

		for (let i = 0; i < num_rows; i++) {
			const parsedRow = parsedRows[i];
			const formattedRow = formattedRows[i];

			if (searchMode && isSearchMatch(formattedRow, searchQuery)) {
				filteredRows.push(formattedRow);
			} else if (filterMode && isFilterMatch(parsedRow, formattedRow, filters)) {
				filteredRows.push(formattedRow);
			}
		}

		return filteredRows;
	}

	function saveFilter() {
		let criteria: StringCriteria | NumericCriteria | DateCriteria;
		if (allFilterColumnsNumeric) {
			criteria = {
				operator: numericOperators.selected[0] as 'greater_than' | 'less_than' | 'equals',
				value: parseFloat(filterQuery),
				type: 'numeric_criteria'
			};
		} else if (allFilterColumnsDate) {
			criteria = {
				operator: dateOperators.selected[0] as 'after' | 'before' | 'on',
				value: new Date(filterQuery),
				type: 'date_criteria'
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
		return allColumnsAreType(selectedColumns, ['decimal', 'integer']);
	}

	function allColumnsDate(selectedColumns: Selector) {
		return allColumnsAreType(selectedColumns, ['timestamp']);
	}

	function allColumnsAreType(selectedColumns: Selector, types: string[]) {
		for (const column_name of selectedColumns.selected) {
			const column = columns.get(column_name);
			if (column && !types.includes(column.data_type)) {
				return false;
			}
		}

		return true;
	}

	const columns: TableView = new Map();
	for (const column of tableView as ColumnViewRecord[]) {
		columns.set(column.name, column as ColumnView);
	}

	const parsedRows: any[] = parseRowDataTypes();

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

	let dateOperators: Selector = {
		options: [
			{
				true_name: 'after',
				display_name: '>'
			},
			{
				true_name: 'before',
				display_name: '<'
			},
			{
				true_name: 'on',
				display_name: '='
			}
		],
		selected: ['on']
	};

	let useRegex = false;

	$: allFilterColumnsNumeric = allColumnsNumeric(filterColumns);
	$: allFilterColumnsDate = allColumnsDate(filterColumns);

	$: formattedRows = parsedRows.map(format);
	$: filteredRows = getFilteredRows(lookupType.selected[0], searchQuery, filters);
	$: numViewableRows = filteredRows.length;
	$: windowedRows = filteredRows
		.sort((a, b) => compare(a, b, selectedSortColumn, ascendingSort))
		.slice((realPage - 1) * recordsPerPage, realPage * recordsPerPage);

	$: if (inputPage !== null && inputPage > totalPages) {
		inputPage = totalPages;
	}
	$: if (inputPage === 0) {
		inputPage = null;
	}
	$: realPage = inputPage && inputPage > 0 ? inputPage : 1;
	$: totalPages = Math.ceil(numViewableRows / recordsPerPage);

	$: if (numViewableRows === 0) {
		emptyTable = true;
	}
	$: if (emptyTable && numViewableRows > 0) {
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
			{#if allFilterColumnsNumeric || allFilterColumnsDate}
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
					if (filterQuery !== '') saveFilter();
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
	{#if filteredRows.length > 0}
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
	{#if windowedRows.length > 0}
		{#each windowedRows as row}
			<div class="row">
				{#each columns as [column_name, column_metadata]}
					<span class="grid-item" class:trimmable={column_metadata.trimmable}>
						{row[column_name]}
					</span>
				{/each}
			</div>
		{/each}
	{:else}
		<div id="placeholder-row"><span>No rows to display</span></div>
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
