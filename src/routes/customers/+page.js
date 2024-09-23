export async function load({ fetch }) {
	const customersJson = await (await fetch(`https://fixwise.io/data/customers`)).json();

	return { customersJson };
}
