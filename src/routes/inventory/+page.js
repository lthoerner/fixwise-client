export async function load({ fetch, url }) {
    const inventorySchema = (await (await fetch(`http://localhost:8080/inventory/schema`)).json())['table_fields'];
    const inventoryJson = await (await fetch(`http://localhost:8080/inventory`)).json();

    return { inventorySchema, inventoryJson };
}
