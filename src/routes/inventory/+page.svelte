<script lang="ts">
	import Table from '../components/Table.svelte';
	export let data;
</script>

<nav id="menu">
	<a href="/inventory">Inventory</a>
	<a href="/tickets">Tickets</a>
	<a href="/customers">Customers</a>
</nav>

<div id="page-body">
	<Table tableData={data.inventoryJson} tableSchema={data.inventorySchema} />
</div>

<style lang="scss">
	@use '../../styles/utility' as utility;

	#menu {
		@include utility.flex-row;
		@include utility.title-text;

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

	#page-body {
		margin-right: 25px;
		margin-left: 25px;
		padding-top: 25px;
	}
</style>
