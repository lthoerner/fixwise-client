<script lang="ts">
	import Table from '$components/table/Table.svelte';
	export let data;
</script>

<Table tableData={data.customerJson} tableView={data.customerView} />
