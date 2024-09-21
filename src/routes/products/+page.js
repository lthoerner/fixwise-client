export async function load({ fetch }) {
	const productsJson = await (await fetch(`https://techtriage.io/data/products`)).json();

	return { productsJson };
}
