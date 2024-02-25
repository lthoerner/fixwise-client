export async function load({ fetch }) {
    let inventoryJson = await (await fetch('http://localhost:8080/inventory?column=sku&direction=asc')).json();

    return { inventoryJson };
}
