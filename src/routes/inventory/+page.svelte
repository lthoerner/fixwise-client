<script lang="ts">
	import Decimal from 'decimal.js';

	type InventoryItem = {
		sku: number;
		display_name: string;
		count: number;
		cost: Decimal;
		price: Decimal;
	};

	export let data;

	let inventory = data.inventoryJson.map((item: InventoryItem) => {
		let parsedItem: InventoryItem = {
			...item,
			cost: new Decimal(item.cost),
			price: new Decimal(item.price)
		};

		return parsedItem;
	});

	function formatSku(sku: number) {
		return '#' + sku.toString().padStart(7, '0');
	}

	function formatCurrency(value: Decimal) {
		return value.toFixed(2);
	}
</script>

<nav class="menu">
	<a href="/inventory">Inventory</a>
	<a href="/tickets">Tickets</a>
	<a href="/customers">Customers</a>
</nav>

<div class="page-body">
	<div class="table-menu">
		<div class="quick-search gray-outline">
			<span>Quick search...</span>
		</div>
		<div class="filter gray-outline"><span>Filter</span></div>
		<div class="spacer"></div>
		<div class="menu-right">
			<div class="records-per-page">
				<div class="label"><span>Records per page:</span></div>
				<div class="value gray-outline"><span>10</span></div>
			</div>
			<div class="page-number">
				<div class="prefix-label"><span>Page:</span></div>
				<div class="value gray-outline"><span>1</span></div>
				<div class="suffix-label"><span>of <strong>15</strong></span></div>
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
			<span class="column-name">SKU</span>
			<span class="column-name">Name</span>
			<span class="column-name">Count</span>
			<span class="column-name">Cost</span>
			<span class="column-name">Price</span>
		</div>
		<div class="table-body gray-outline">
			{#each inventory as inventoryItem}
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
		justify-content: flex-start;
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
		justify-content: space-between;
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

		span {
			padding-top: 7px;
			padding-bottom: 7px;
			padding-left: 10px;
			padding-right: 10px;
		}

		.quick-search {
			flex-grow: 2;
			max-width: 270px;
			color: rgba(255, 255, 255, 0.6);
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
