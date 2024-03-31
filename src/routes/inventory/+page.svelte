<script lang="ts">
	import Table from '$components/table/Table.svelte';
	export let data;
</script>

<Table tableRows={data.inventoryJson} tableView={data.inventoryView} />
