export async function load({ fetch }) {
	const invoicesJson = await (await fetch(`https://fixwise.io/data/invoices`)).json();

	return { invoicesJson };
}
