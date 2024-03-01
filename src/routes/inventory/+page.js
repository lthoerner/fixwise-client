export async function load({ fetch, url }) {
    const column = url.searchParams.get('column') ?? 'sku';
    const direction = url.searchParams.get('direction') ?? 'asc';
    let inventoryJson = await (await fetch(`http://localhost:8080/inventory?column=${column}&direction=${direction}`)).json();

    return { column, direction, inventoryJson };
}
