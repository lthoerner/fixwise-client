export async function load({ fetch }) {
	const vendorsJson = await (await fetch(`http://localhost:8080/vendors`)).json();

	return { vendorsJson };
}
