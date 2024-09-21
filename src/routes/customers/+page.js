export async function load({ fetch }) {
	const customersJson = await (await fetch(`https://techtriage.io/data/customers`)).json();

	return { customersJson };
}
