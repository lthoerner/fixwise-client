export async function load({ fetch }) {
	const ticketsJson = await (await fetch(`http://localhost:8080/tickets`)).json();
	const ticketsView = (await (await fetch(`http://localhost:8080/views/tickets`)).json())[
		'columns'
	];

	return { ticketsView, ticketsJson };
}
