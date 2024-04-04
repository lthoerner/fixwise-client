export async function load({ fetch }) {
	const ticketsJson = await (await fetch(`http://localhost:8080/tickets`)).json();

	return { ticketsJson };
}
