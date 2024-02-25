export async function load({ fetch }) {
    let inventoryJson = await (await fetch('http://localhost:8080/inventory')).json();

    return { inventoryJson };
}
