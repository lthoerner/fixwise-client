export async function load({ fetch }) {
	const invoicesJson = await (await fetch(`https://techtriage.io/data/invoices`)).json();

	return { invoicesJson };
}
