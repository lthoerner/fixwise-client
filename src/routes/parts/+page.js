export async function load({ fetch }) {
	const partsJson = await (await fetch(`http://localhost:8080/parts`)).json();

	return { partsJson };
}
