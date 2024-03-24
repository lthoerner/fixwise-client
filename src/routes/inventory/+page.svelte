<script lang="ts">
	import Table from '$components/table/Table.svelte';
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
	@use '$styles/utility' as utility;

	#menu {
		@include utility.flex-row;
		@include utility.title-text;

		background-color: purple;

		a {
			padding-top: 18px;
			padding-bottom: 13px;
			padding-left: 25px;
			padding-right: 25px;
			text-decoration: none;
			transition: 0.23s ease-out;

			&:hover {
				background-color: magenta;
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
