const query = new URLSearchParams(window.location.search);
const ProductId = query.get("searchValue");
const invoicePathcer = () => {
    // Define the URL to fetch data from the server
    const apiUrl = `http://localhost:5000/sold/${ProductId}`;

    // Use the fetch API to make a GET request to the server
    fetch(apiUrl)
        .then((response) => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then((data) => {
            // Assuming that 'data' is an object with a 'data' property
            displayInvoiceData(data.data);
        })
        .catch((error) => {
            console.error('Error:', error);
        });
}
const displayInvoiceData = (data) => {
    const invoiceData = data.data.slice(1,data.data.length)
    console.log()
    const invoiceContainer = document.getElementById("invoiceContainer");
    invoiceContainer.innerHTML = ""; // Clear existing content
    const grandtotal = document.createElement("div")
    grandtotal.innerHTML = `<div>Grand Total: ${invoiceData[0].GrandTotal}</div>`
    document.getElementById("grandTotal").appendChild(grandtotal)
    // Assuming that 'data.data.data' is an array
    invoiceData.forEach((invoice, index) => {
        // Create a div element for each invoice
        const invoiceDiv = document.createElement("div");
        invoiceDiv.classList.add("invoice");
        const invoiceDtaa = document.createElement("div")
        invoiceDtaa.innerHTML = `
        <div>
            <h3>Invoice Id: ${data.invoiceId}</h3>
        </div>
        <div>
            <div>Name: ${invoice.name}</div>
            <div>Barcode: ${invoice.barcode}</div>
        </div>
        <div>
            <div>Group Code: ${invoice.groupcode}</div>
            <div>Total Price: ${invoice.originalPrice}</div>
        </div>
            <div>
            <div>Selling Price: ${invoice.sellingPrice}</div>
        </div>
        `;

        // Append the invoice div to the container
        invoiceContainer.appendChild(invoiceDtaa);
    });
};















invoicePathcer()


