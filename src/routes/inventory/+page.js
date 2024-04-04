export async function load({ fetch }) {
	const inventoryJson = await (await fetch(`http://localhost:8080/inventory`)).json();

	return { inventoryJson };
}
