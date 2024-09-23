export async function load({ fetch }) {
	const vendorsJson = await (await fetch(`https://fixwise.io/data/vendors`)).json();

	return { vendorsJson };
}
