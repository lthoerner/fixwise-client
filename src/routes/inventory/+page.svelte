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
		return '#' + sku.toString().padStart(6, '0');
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
	<div class="table">
		<div class="row">
			<span class="column-name">SKU</span>
			<span class="column-name">Name</span>
			<span class="column-name">Count</span>
			<span class="column-name">Cost</span>
			<span class="column-name">Price</span>
		</div>
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

<style lang="scss">
	:global(body) {
		margin: 0;
		padding: 0;
	}

	p,
	a,
	span {
		font-family: 'Helvetica', sans-serif;
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
	}

	.table {
		display: grid;
		grid-template-columns: repeat(5, 20%);
		grid-template-rows: auto;
		margin-top: 25px;
		padding: 15px;
		row-gap: 15px;
		border-radius: 20px;
		background-color: black;

		span.column-name {
			font-weight: bold;
			font-size: 25px;
			margin-top: 12px;
			margin-bottom: 12px;
		}

		span.grid-item {
			font-size: 20px;
			margin-top: 12px;
			margin-bottom: 12px;
			padding-left: 5px;
		}

		.row {
			display: grid;
			grid-template-columns: repeat(5, 20%);
			grid-column-start: 1;
			grid-column-end: 6;
			padding-left: 15px;
			padding-right: 15px;
			border-radius: 20px;
			background-color: lightgrey;
			transition: 0.2s ease-out;

			&:hover {
				transform: scale(1.0035) translateY(-2px);
				border-radius: 19px;
				background-color: white;
				transition: 0.2s ease-out;
			}
		}
	}
</style>
