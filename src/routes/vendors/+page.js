export async function load({ fetch }) {
	const vendorsJson = await (await fetch(`https://techtriage.io/data/vendors`)).json();

	return { vendorsJson };
}
