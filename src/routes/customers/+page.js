export async function load({ fetch }) {
	const customersJson = await (await fetch(`http://localhost:8080/customers`)).json();
	const customersView = (await (await fetch(`http://localhost:8080/views/customers`)).json())[
		'columns'
	];

	return { customersView, customersJson };
}
