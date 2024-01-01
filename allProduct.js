let selectedValue;
async function loadProducts(selectedValue,data) {
    // If selectedValue is not provided, default to "All"
    if(data){
        populateTableContainer(data)
    }
    if (!selectedValue) {
        selectedValue = "All";
    }

    // Define the URL based on the selectedValue
    let url;
    if (selectedValue === "All") {
        url = 'http://localhost:5000/products';
    }
    else if (selectedValue === "Sold") {
        url = 'http://localhost:5000/sold';
    }
    else if (selectedValue === "Stock") {
        url = 'http://localhost:5000/stock';
    }

    // console.log(url)
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        populateTableContainer(data?.data, selectedValue);
    }
    catch (error) {
        console.error('Error:', error);
    }
}

// Table creator
function populateTableContainer(data, selectedValue) {
    document.querySelector("#totalPRoduct").textContent = data.length
    let route;
    const tableContainer = document.querySelector("#tableContainer");
    tableContainer.innerHTML = "";
    if (selectedValue === "All") {
        route = "products"
        document.querySelector(".totalPRoduct").classList.remove("hidden")
    }
    if (selectedValue === "Sold") {
        route = "sold";
        document.querySelector(".totalPRoduct").classList.toggle("hidden")
    }
    if (selectedValue === "Stock") {
        route = "stock";
        document.querySelector(".totalPRoduct").classList.remove("hidden")
    }
    // Create a table element
    const table = document.createElement("table");
    table.classList.add("product-table");
    let tableHeaders;
    if (selectedValue !== "Sold") {
        tableHeaders = ["Product Name", "Barcode", "Group Code", "Quality", "Brand Name", "Purched Price", "Actions"];
    }
    else if (selectedValue === "Sold") {
        tableHeaders = ["Links", "Invoice Id", "Actions"];
    }
    const headerRow = document.createElement("tr");
    tableHeaders.forEach((headerText) => {
        const th = document.createElement("th");
        th.textContent = headerText;
        headerRow.appendChild(th);
    });
    table.appendChild(headerRow);
    data.forEach((product) => {
        const totalCost = parseInt(product.purhase) + parseInt(product.cost) + parseInt(product.vat);
        const minRange = totalCost + parseInt(product.minProfit)
        const maxRange = totalCost + parseInt(product.maxProfit)
        const Price = minRange + maxRange / 2;
        const row = document.createElement("tr");
        const nameCell = document.createElement("td");
        const priceCell = document.createElement("td");
        const barcode = document.createElement("td");
        const quality = document.createElement("td");
        const brandName = document.createElement("td");
        const gCode = document.createElement("td");
        if (selectedValue !== "Sold") {
            nameCell.textContent = product.name;
            priceCell.textContent = product.purhase;
            barcode.textContent = product.barCode;
            quality.textContent = product.quality;
            brandName.textContent = product.manufacturer;
            gCode.textContent = product.groupCode;
        }
        else if (selectedValue === "Sold") {
            nameCell.innerHTML = `
            <a href="./invoiceShow.html?searchValue=${product._id}">Show Details</a>
            `;
            barcode.textContent = product.invoiceId
        }
        // Create edit and delete buttons
        const actionsCell = document.createElement("td");
        const editButton = document.createElement("button");
        editButton.textContent = "Edit";

        // Create a single cell for edit and save functionality
        const editCell = document.createElement("td");
        const editPriceInput = document.createElement("input");
        editPriceInput.type = "number";
        editPriceInput.value = product.purhase;
        editPriceInput.style.display = "none";

        const saveButton = document.createElement("button");
        saveButton.textContent = "Save";
        saveButton.style.display = "none"; // Initially hidden
        saveButton.addEventListener("click", () => {
            const newPurchasePrice = editPriceInput.value;
            product.purhase = newPurchasePrice;
            // Update the table cell with the new value
            priceCell.textContent = newPurchasePrice;
            editPriceInput.style.display = "none";
            saveButton.style.display = "none";
            priceCell.style.display = "block";
            editButton.style.display = "block";
            deleteButton.style.display = "block"

            updateProductPrice(product._id, selectedValue, newPurchasePrice ? newPurchasePrice : product.purhase)
        });

        // Create edit button click event
        editButton.addEventListener("click", () => {
            // Hide the "Edit" button
            editButton.style.display = "none";
            // Show the input field for editing purchase price
            editPriceInput.style.display = "block";
            // Show the "Save" button
            saveButton.style.display = "block";
            // Hide the original price cell
            priceCell.style.display = "none";
            deleteButton.style.display = "none"
        });


        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        // Handle delete functionality here
        deleteButton.addEventListener("click", () => {
            const confirmation = window.confirm("You sure Want To Delte Permanently?")
            if (confirmation) {
                deleteProduct(product._id, route)
            }
        });

        if (selectedValue !== "Sold") {
            actionsCell.appendChild(editButton);
            actionsCell.appendChild(deleteButton);
            editCell.appendChild(editPriceInput);
            editCell.appendChild(saveButton);
            row.appendChild(nameCell);
            row.appendChild(barcode);
            row.appendChild(gCode);
            row.appendChild(quality);
            row.appendChild(brandName);
            row.appendChild(priceCell);
            row.appendChild(actionsCell);
            row.appendChild(editCell);
        }
        else if (selectedValue === "Sold") {
            actionsCell.appendChild(editButton);
            actionsCell.appendChild(deleteButton);
            editCell.appendChild(saveButton);
            row.appendChild(nameCell);
            row.appendChild(barcode);
            row.appendChild(actionsCell);
            row.appendChild(editCell);
        }

        table.appendChild(row);
    });

    // Append the table to the tableContainer
    tableContainer.appendChild(table);
}
// Delete Function
async function updateProductPrice(productId, endpoint, newPrice) {
    let selectedValue;
    if (endpoint === "products") {
        selectedValue = "All"
    }
    if (endpoint === "sold") {
        selectedValue = "Sold"
    }
    if (endpoint === "stock") {
        selectedValue = "Stock"
    }

    try {
        const response = await fetch(`http://localhost:5000/edit/product/price/${productId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ newPrice }), // Include the new price in the request body
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        // Refresh the product list after updating
        loadProducts(selectedValue);
        document.querySelector("#success").classList.toggle("hidden")
        setTimeout(() => {
            document.querySelector("#success").classList.toggle("hidden")
        }, 1000);
    } catch (error) {
        console.error('Error:', error);
    }
}


async function deleteProduct(productId, endpoint) {
    let selectedValue;
    if (endpoint === "products") {
        selectedValue = "All"
    }
    if (endpoint === "sold") {
        selectedValue = "Sold"
    }
    if (endpoint === "stock") {
        selectedValue = "Stock"
    }
    try {
        const response = await fetch(`http://localhost:5000/${endpoint}/${productId}`, {
            method: 'DELETE',
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        // Refresh the product list after deletion

        loadProducts(selectedValue);
        document.querySelector("#success").classList.toggle("hidden")
        setTimeout(() => {
            document.querySelector("#success").classList.toggle("hidden")
        }, 1000);
    } catch (error) {
        console.error('Error:', error);
    }
}

async function sorting() {
    // Do the advance search sort by name or groupcode or brand etc
    let selectedValue = document.querySelector("#selectWhichProduct").value;
    const searcher = document.getElementById("sortSearch")
    const sorter = document.getElementById("sortby")
    const sorterBtn = document.getElementById("sortButton")
    let sortBy = "name";
    sorter.addEventListener("change",()=>{
        if(sorter.value === "name" || sorter.value === ""){
            sortBy = "name"
        }
        else if(sorter.value === "gcode"){
            sortBy = "groupCode"
        }
        else if(sorter.value === "price"){
            sortBy = "purhase"
        }
        else if(sorter.value === "brand"){
            sortBy = "manufacturer"
        }
        else if(sorter === undefined){
            sortBy === "name"
        }
    })

    let urL;
    // console.log(sortBy)
    sorterBtn.addEventListener("click", async () => {
        let search = searcher.value;
        if (search) {
            // console.log(sortBy, search)
            urL = `http://localhost:5000/product/sort/${sortBy}/${search}`
            console.log(urL)
            try {
                const response = await fetch(urL);
                if (response.ok) {
                    const data = await response.json(); // Await the JSON parsing
                    // console.log(data);
                    populateTableContainer(data,selectedValue)
                } else {
                    throw new Error('Network response was not ok');
                }
                
            } catch (error) {
                console.error('Error:', error);
            }
        }
    });
    // else{alert("empty")}
}





















// all event lesteners
// Event listener for the dropdown change event
document.querySelector("#selectWhichProduct").addEventListener("change", async () => {
    const selectedValue = document.querySelector("#selectWhichProduct").value;
    loadProducts(selectedValue);
});

// Initaial functionality
window.addEventListener("load", () => {
    loadProducts();
    document.querySelector("#advancedSearch").classList.toggle("hidden")
    sorting()
});

// const isChecked = document.querySelector("#checkboxSort");
// isChecked.addEventListener("click", () => {
//     if (isChecked.checked) {
//     }
//     else {
//         document.querySelector("#advancedSearch").classList.toggle("hidden")
//     }
// })










