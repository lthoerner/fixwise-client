export async function load({ fetch }) {
	const inventoryJson = await (await fetch(`http://localhost:8080/inventory`)).json();
	const inventoryView = (await (await fetch(`http://localhost:8080/views/inventory`)).json())[
		'columns'
	];

	return { inventoryView, inventoryJson };
}
