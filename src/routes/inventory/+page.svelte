<script lang="ts">
	import Table from '$components/table/Table.svelte';
	export let data;
</script>

<Table tableData={data.inventoryJson} tableSchema={data.inventorySchema} />
