export async function load({ fetch }) {
	const deviceModelsJson = await (await fetch(`https://fixwise.io/data/device_models`)).json();

	return { deviceModelsJson };
}
