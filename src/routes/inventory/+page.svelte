<script lang="ts">
	import Table from '../components/Table.svelte';
	export let data;
</script>

<nav class="menu flex-row title-text">
	<a href="/inventory">Inventory</a>
	<a href="/tickets">Tickets</a>
	<a href="/customers">Customers</a>
</nav>

<Table tableData={data.inventoryJson} tableSchema={data.inventorySchema} />
