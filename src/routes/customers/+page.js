export async function load({ fetch, url }) {
    const customerSchema = (await (await fetch(`http://localhost:8080/customers/schema`)).json())['columns'];
    const customerJson = await (await fetch(`http://localhost:8080/customers`)).json();

    return { customerSchema, customerJson };
}
