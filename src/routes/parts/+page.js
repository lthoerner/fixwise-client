export async function load({ fetch }) {
	const partsJson = await (await fetch(`https://techtriage.io/data/parts`)).json();

	return { partsJson };
}
