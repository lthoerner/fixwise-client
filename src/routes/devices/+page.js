export async function load({ fetch }) {
	const devicesJson = await (await fetch(`https://fixwise.io/data/devices`)).json();

	return { devicesJson };
}
