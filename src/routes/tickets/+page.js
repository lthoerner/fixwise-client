export async function load({ fetch }) {
	const ticketsJson = await (await fetch(`https://techtriage.io/data/tickets`)).json();

	return { ticketsJson };
}
