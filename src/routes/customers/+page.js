export async function load({ fetch }) {
    const customerView = (await (await fetch(`http://localhost:8080/views/customers`)).json());
    const customerJson = await (await fetch(`http://localhost:8080/customers`)).json();

    return { customerView, customerJson };
}
