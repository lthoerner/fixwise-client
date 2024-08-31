export async function load({ fetch }) {
	const deviceModelsJson = await (await fetch(`http://localhost:8080/device_models`)).json();

	return { deviceModelsJson };
}
