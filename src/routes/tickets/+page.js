export async function load({ fetch }) {
	const ticketsJson = await (await fetch(`https://fixwise.io/data/tickets`)).json();

	return { ticketsJson };
}
