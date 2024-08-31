export async function load({ fetch }) {
	const devicesJson = await (await fetch(`http://localhost:8080/devices`)).json();

	return { devicesJson };
}
