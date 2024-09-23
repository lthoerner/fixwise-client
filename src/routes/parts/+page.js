export async function load({ fetch }) {
	const partsJson = await (await fetch(`https://fixwise.io/data/parts`)).json();

	return { partsJson };
}
