export async function load({ fetch }) {
    const inventoryView = (await (await fetch(`http://localhost:8080/views/inventory`)).json());
    const inventoryJson = await (await fetch(`http://localhost:8080/inventory`)).json();

    return { inventoryView, inventoryJson };
}
