export async function load({ fetch }) {
	const devicesJson = await (await fetch(`https://techtriage.io/data/devices`)).json();

	return { devicesJson };
}
