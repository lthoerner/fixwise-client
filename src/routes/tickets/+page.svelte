<script lang="ts">
	import Table from '$components/table/Table.svelte';
	export let data;
</script>

<Table tableRows={data.ticketsJson} tableView={data.ticketsView} />
