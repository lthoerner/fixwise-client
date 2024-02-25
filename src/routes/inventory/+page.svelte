<script lang="ts">
	import Decimal from 'decimal.js-light';

	export let data;
	let inventory = data.inventoryJson;

	function formatSku(sku: number) {
		return '#' + sku.toString().padStart(6, '0');
	}

	function formatCurrency(value: string) {
		let decimalValue = new Decimal(value);
		return decimalValue.toFixed(2);
	}
</script>

<div class="header-nav">
	<a class="header-current" href="/inventory"><h1>Inventory</h1></a>
	<a href="/tickets"><h1>Tickets</h1></a>
	<a href="/customers"><h1>Customers</h1></a>
</div>
<div class="inventory">
	<h1>Inventory</h1>
	<div class="table">
		<div class="row">
			<h2>SKU</h2>
			<h2>Name</h2>
			<h2>Count</h2>
			<h2>Cost</h2>
			<h2>Price</h2>
		</div>
		{#each inventory as inventoryItem}
			<div class="row">
				<h3 class="grid-item">{formatSku(inventoryItem.sku)}</h3>
				<h3 class="grid-item">{inventoryItem.display_name}</h3>
				<h3 class="grid-item">{inventoryItem.count}</h3>
				<h3 class="grid-item">{formatCurrency(inventoryItem.cost)}</h3>
				<h3 class="grid-item">{formatCurrency(inventoryItem.price)}</h3>
			</div>
		{/each}
	</div>
</div>

<style lang="scss">
	h1,
	h2,
	h3 {
		font-family: 'Helvetica', sans-serif;
	}

	.header-nav {
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
			text-decoration: none;
			color: black;
			transition: 0.2s ease-out;

			&:hover {
				border-top-left-radius: 17px;
				border-top-right-radius: 17px;
				background-color: cyan;
				transition: 0.2s ease-out;
			}

			&.header-current {
				color: blue;
			}
		}
	}

	.inventory {
		.table {
			display: grid;
			grid-template-columns: repeat(5, 20%);
			grid-template-rows: auto;
			padding: 15px;
			row-gap: 15px;
			border-radius: 20px;
			background-color: black;

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

				.grid-item {
					padding-left: 5px;
				}
			}
		}
	}
</style>
