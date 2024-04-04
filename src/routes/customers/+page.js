export async function load({ fetch }) {
	const customersJson = await (await fetch(`http://localhost:8080/customers`)).json();

	return { customersJson };
}
