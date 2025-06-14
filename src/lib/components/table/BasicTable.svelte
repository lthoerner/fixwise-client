<script lang="ts">
	import Decimal from 'decimal.js';

	// import ColumnTitle from './ColumnTitle.svelte';
	// import IconPair from './icons/IconPair.svelte';
	import PageNavigatorIcon from './icons/PageNavigator.svelte';

	import type {
		TableDocument,
		TableRecord,
		Filter,
		StringCriteria,
		NumericCriteria,
		DateCriteria,
		Selector
	} from './table_types_functions';
	import {
		getTagColor,
		isSearchMatch,
		isFilterMatch,
		parseRecordDataTypes,
		allColumnsNumeric,
		allColumnsDate,
		compare
	} from './table_types_functions';

	let { tableDocument }: { tableDocument: TableDocument } = $props();

	function getFilteredRecords(
		searchMode: boolean,
		searchQuery: string,
		filters: Filter[]
	): TableRecord[] {
		let filteredRecords = [];

		for (const record of tableDocument.records) {
			if (searchMode && isSearchMatch(tableDocument, record, searchQuery)) {
				filteredRecords.push(record);
			} else if (!searchMode && isFilterMatch(record, filters)) {
				filteredRecords.push(record);
			}
		}

		return filteredRecords;
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
				column: filterColumns.selected,
				criteria
			}
		];

		filterQuery = '';
		filterStep = null;
		filterColumns.selected = '';
		useRegex = false;
		numericOperators.selected = 'equals';
	}

	parseRecordDataTypes(tableDocument);

	let numColumns = Object.keys(tableDocument.metadata).length;

	let selectedSortColumn = $state(Object.keys(tableDocument.metadata)[0]);
	let ascendingSort = $state(true);

	let recordsPerPage = $state(20);
	let inputPage: number | null = $state(1);

	let searchQuery = $state('');
	let filterQuery = $state('');

	let filters: Filter[] = $state([]);

	let filterStep: null | 'column' | 'criteria' = $state(null);
	let filterColumns: Selector = $state({
		options: [],
		selected: 'placeholder'
	});

	for (const [column_name, column_metadata] of Object.entries(tableDocument.metadata)) {
		filterColumns.options.push({
			true_name: column_name,
			display_name:
				column_metadata.display.text?.name ?? column_metadata.display.tag?.name ?? column_name
		});
	}

	let lookupTypeIsSearch = $state(true);

	let numericOperators: Selector = $state({
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
		selected: 'equals'
	});

	let dateOperators: Selector = $state({
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
		selected: 'on'
	});

	let useRegex = $state(false);

	let allFilterColumnsNumeric = $derived(allColumnsNumeric(tableDocument, filterColumns));
	let allFilterColumnsDate = $derived(allColumnsDate(tableDocument, filterColumns));

	let filteredRecords = $derived(getFilteredRecords(lookupTypeIsSearch, searchQuery, filters));

	let numViewableRecords = $derived(filteredRecords.length);
	let emptyTable = $derived(numViewableRecords > 0);
	let realPage = $derived(inputPage && inputPage > 0 ? inputPage : 1);
	let totalPages = $derived(Math.ceil(numViewableRecords / recordsPerPage));

	let windowedRecords = $derived(
		filteredRecords
			.sort((a, b) => compare(tableDocument, a, b, selectedSortColumn, ascendingSort))
			.slice((realPage - 1) * recordsPerPage, realPage * recordsPerPage)
	);

	$effect(() => {
		let s = searchQuery;
		let f = filters;
		inputPage = 1;
	});
</script>

<div id="menu">
	<select bind:value={lookupTypeIsSearch}>
		<option value={true}>Search</option>
		<option value={false}>Filter</option>
	</select>
	{#if lookupTypeIsSearch}
		<input id="search-query" bind:value={searchQuery} placeholder="Quick search..." />
	{:else}
		{#if filterStep === null}
			<button class="menu-button" onclick={() => (filterStep = 'column')}>
				<span>Add Filter</span>
			</button>
			{#if filters.length > 0}
				<button class="menu-button" onclick={() => (filters = [])}>
					<span>Reset</span>
				</button>
			{/if}
		{:else}
			<button
				class="menu-button"
				onclick={() => {
					filterStep = null;
					filterQuery = '';
					filterColumns.selected = '';
				}}
			>
				<span>Cancel</span>
			</button>
		{/if}
		{#if filterStep === 'column'}
			<select bind:value={filterColumns.selected}>
				<option value="">Choose a column</option>
				{#each filterColumns.options as column}
					<option value={column.true_name}>{column.display_name}</option>
				{/each}
			</select>
			<button
				class="menu-button"
				onclick={() => (filterColumns.selected.length > 0 ? (filterStep = 'criteria') : false)}
			>
				<span>Next</span>
			</button>
		{/if}
		{#if filterStep === 'criteria'}
			{#if allFilterColumnsNumeric}
				<select bind:value={numericOperators.selected}>
					<option value="equals">=</option>
					<option value="less_than">&lt;</option>
					<option value="greater_than">&gt;</option>
				</select>
				<input id="filter-query-numeric" bind:value={filterQuery} placeholder="Type a number..." />
			{:else if allFilterColumnsDate}
				<select bind:value={dateOperators.selected}>
					<option value="on">On</option>
					<option value="before">Before</option>
					<option value="after">After</option>
				</select>
				<input id="filter-query-date" type="date" bind:value={filterQuery} />
			{:else}
				<div id="regex-button-container">
					<button
						id="regex-button"
						class:selected={useRegex}
						onclick={() => (useRegex = !useRegex)}
					>
						<img src="/regex.svg" alt="Use regex" />
					</button>
					<input id="filter-query-string" bind:value={filterQuery} placeholder="Type a query..." />
				</div>
			{/if}
			<button class="menu-button" onclick={() => (filterStep = 'column')}>
				<span>Back</span>
			</button>
			<button
				class="menu-button"
				onclick={() => {
					if (filterQuery !== '') saveFilter();
				}}
			>
				<span>Apply</span>
			</button>
		{/if}
		{#if filterStep !== null}
			<!-- <IconPair icon="column" bind:text={filterColumns.selected.length} /> -->
		{/if}
		<!-- <IconPair icon="filter" bind:text={filters.length} /> -->
	{/if}
	{#if filteredRecords.length > 0}
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

<table
	id="body"
	style="--num-columns: {numColumns}; border-collapse: separate; border-spacing: 15px;"
>
	<thead>
		<tr id="column-headers">
			{#each Object.entries(tableDocument.metadata) as [column_name, column_metadata]}
				<th>
					{column_metadata.display.text?.name ?? column_metadata.display.tag?.name ?? column_name}
				</th>
			{/each}
		</tr>
	</thead>
	<tbody>
		{#if windowedRecords.length > 0}
			{#each windowedRecords as record}
				<tr>
					{#each Object.entries(tableDocument.metadata) as [column_name, column_metadata]}
						{#if column_metadata.data_type === 'tag'}
							<td
								class="tag trimmable"
								style="color: {getTagColor(
									column_metadata.display.tag,
									record[column_name].value.toString()
								).value}; --tag-color-opacity: {getTagColor(
									column_metadata.display.tag,
									record[column_name].value.toString()
								).opacity}%"
							>
								{record[column_name].formatted}
							</td>
						{:else}
							<td class="grid-item" class:trimmable={column_metadata.display.text?.trimmable}>
								{record[column_name].formatted ?? record[column_name].value}
							</td>
						{/if}
					{/each}
				</tr>
			{/each}
		{:else}
			<tr id="placeholder-row"><td>No records to display</td></tr>
		{/if}
	</tbody>
</table>

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

		// .menu-button {
		// 	@include utility.primary-color-outline;
		// 	@extend .menu-padding;
		// 	font-size: variables.$font-size-standard;
		// 	border-radius: variables.$rounding-standard;
		// 	transition: variables.$transition-standard;

		// 	&:hover {
		// 		cursor: pointer;
		// 		background-color: variables.$primary-color;
		// 	}
		// }

		#regex-button-container {
			@include utility.flex-row;
			justify-content: flex-end;

			input {
				padding-right: 2em;
			}
		}

		.menu-input {
			@include utility.primary-color-outline;
			@extend .menu-padding;
			font-size: variables.$font-size-standard;
			border-radius: variables.$rounding-standard;
		}

		// #search-query {
		// 	@extend .menu-input;
		// 	flex-grow: 2;
		// 	max-width: 250px;
		// }

		#filter-query-string {
			@extend .menu-input;
			width: 10em;
		}

		#filter-query-numeric {
			@extend .menu-input;
			width: 8em;
		}

		#filter-query-date {
			@extend .menu-input;
			width: 6em;

			// Width needs to be adjusted for Firefox because date picker cannot be disabled
			@supports (-moz-appearance: none) {
				width: 8.4em;
				padding-right: 7px;
			}
		}
	}

	// #body {
	// 	@include utility.primary-color-outline;
	// 	display: grid;
	// 	grid-template-columns: repeat(var(--num-columns), auto);
	// 	grid-auto-rows: min-content;
	// 	column-gap: variables.$width-large;
	// 	justify-content: space-between;
	// 	border-radius: variables.$rounding-standard;
	// 	margin-top: variables.$width-standard;
	// 	padding: variables.$width-standard;
	// 	padding-top: variables.$width-standard + 12px;

	// 	#column-headers {
	// 		@include utility.primary-color-outline-bottom;
	// 		display: grid;
	// 		grid-column: 1 / span var(--num-columns);
	// 		grid-template-columns: subgrid;
	// 		padding-left: variables.$width-standard;
	// 		padding-right: variables.$width-standard;
	// 		padding-bottom: variables.$width-standard + 2px;
	// 		margin-bottom: variables.$width-small + 3px;
	// 	}

	// 	.grid-item {
	// 		font-size: variables.$font-size-large;
	// 		max-width: fit-content;
	// 	}

	// 	.trimmable {
	// 		text-overflow: ellipsis;
	// 		white-space: nowrap;
	// 		overflow: hidden;
	// 	}

	// 	.tag {
	// 		font-size: variables.$font-size-standard;
	// 		max-width: fit-content;
	// 		border-radius: variables.$rounding-sharp;
	// 		background-color: color-mix(
	// 			in srgb,
	// 			var(--tag-color-value) var(--tag-color-opacity),
	// 			transparent
	// 		);
	// 		padding: variables.$width-tiny + 1px variables.$width-small + 1px;
	// 	}

	// 	.row {
	// 		display: grid;
	// 		grid-template-columns: subgrid;
	// 		grid-column: 1 / span var(--num-columns);
	// 		padding: variables.$width-small + 3px variables.$width-standard;
	// 		border-radius: variables.$rounding-standard;
	// 		transition: variables.$transition-slow;

	// 		span {
	// 			&:hover {
	// 				cursor: text;
	// 			}
	// 		}

	// 		&:hover {
	// 			cursor: pointer;
	// 			transform: translateY(-2px);
	// 			background-color: lightgrey;
	// 		}
	// 	}

	// 	#placeholder-row {
	// 		@include utility.flex-row;
	// 		justify-content: center;
	// 		grid-column: 1 / span var(--num-columns);
	// 		font-size: variables.$font-size-large;
	// 		font-weight: bold;
	// 		padding-top: 20px;
	// 		padding-bottom: 14px;
	// 	}
	// }
</style>
