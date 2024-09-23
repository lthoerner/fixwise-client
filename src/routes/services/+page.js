export async function load({ fetch }) {
	const servicesJson = await (await fetch(`https://fixwise.io/data/services`)).json();

	return { servicesJson };
}
