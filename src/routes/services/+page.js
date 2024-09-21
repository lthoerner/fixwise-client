export async function load({ fetch }) {
	const servicesJson = await (await fetch(`https://techtriage.io/data/services`)).json();

	return { servicesJson };
}
