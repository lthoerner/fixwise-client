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

<div class="header_nav">
	<a class="header_current" href="/inventory"><h1>Inventory</h1></a>
	<a href="/tickets"><h1>Tickets</h1></a>
	<a href="/customers"><h1>Customers</h1></a>
</div>
<div class="inventory">
	<h1>Inventory</h1>
	<div class="table">
		{#each inventory as inventoryItem}
			<div class="row">
				<h2>SKU: {formatSku(inventoryItem.sku)}</h2>
				<h2>Name: {inventoryItem.display_name}</h2>
				<h2>Count: {inventoryItem.count}</h2>
				<h2>Cost: {formatCurrency(inventoryItem.cost)}</h2>
				<h2>Price: {formatCurrency(inventoryItem.price)}</h2>
			</div>
		{/each}
	</div>
</div>

<style lang="scss">
	h1,
	h2 {
		font-family: 'Helvetica', sans-serif;
	}

	.header_nav {
		display: flex;
		flex-direction: row;
		flex-wrap: nowrap;
		align-items: center;
		justify-content: left;
		background-color: lightblue;

		a {
			padding-top: 3px;
			padding-bottom: 3px;
			padding-left: 25px;
			padding-right: 25px;
			text-decoration: none;
			color: black;

			&:hover {
				border-top-left-radius: 17px;
				border-top-right-radius: 17px;
				background-color: cyan;
				transition: 0.2s ease-out;
			}

			&.header_current {
				color: blue;
			}
		}
	}

	.inventory {
		.table {
			display: flex;
			flex-direction: column;
			flex-wrap: nowrap;
			padding: 15px;
			gap: 15px;
			border-radius: 20px;
			background-color: darkslategray;

			.row {
				display: flex;
				flex-direction: row;
				flex-wrap: nowrap;
				justify-content: left;
				padding-left: 15px;
				gap: 40px;
				border-radius: 20px;
				background-color: lightgrey;
				transition: 0.2s ease-out;

				&:hover {
					transform: scale(1.0035);
					// margin: 0px -3px;
					border-radius: 19px;
					background-color: white;
					transition: 0.2s ease-out;
				}
			}
		}
	}
</style>
