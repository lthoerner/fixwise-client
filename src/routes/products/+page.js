export async function load({ fetch }) {
	const productsJson = await (await fetch(`https://fixwise.io/data/products`)).json();

	return { productsJson };
}
