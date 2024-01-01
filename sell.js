let search = ''
let product_id = "-0"
const ourDate = Date().slice(4,15)
let random = ourDate + " " + Math.floor(Math.random()*99999999)
document.querySelector("#search").addEventListener('blur', () => {
    search = document.querySelector("#search").value;
})
const itemDataArray = [];
document.querySelector(".btn").addEventListener("click", async () => {
    // console.log(search)
    if (search !== "") {
        const data = await fetch(`http://localhost:5000/stock/query/${search}`)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    document.querySelector('#err').textContent = '';
                    fetchProduct(data.data)
                    product_id = data.data._id;
                }
                if (data.erorr) {
                    const err = data.message
                    document.querySelector('#err').textContent = err;
                    document.querySelector('#searchResult').innerHTML = ""
                }
            })
    }
    if (search === "") {
        document.querySelector('#err').textContent = "please input something";
        document.querySelector('#searchResult').innerHTML = ""
    }

    // this funciton fetch a product by it's barcode and then add it to the cart table on click on the add button
    function fetchProduct(data) {
        const tCost = parseInt(data.purhase?data.purhase: 0 ) + parseInt(data.cost?data.cost:0) + parseInt(data.vat?data.vat:0);
        const min = parseInt(data.minProfit?data.minProfit:0)+tCost;
        const max = parseInt(data.maxProfit?data.maxProfit:0) + tCost;
        const price = (min + max) / 2;
        console.log(price)
        const searchResult = document.querySelector("#searchResult");
        searchResult.innerHTML = `
    <div style="border-radius: 10px; background-color: rgb(199, 199, 199); margin-left: -33%; margin-top: 15px; width: 800px; height: 120px; padding: 15px 20px; justify-content: space-between; align-items: center;  display: flex; gap: 25px;">
    <div style="display: flex; gap: 10px; flex-direction: column; overflow-x: scroll; width:suto;">
        <div style="width: auto; text-wrap: nowrap;">${data.name}</div>
        <small style="font-size: medium; margin-bottom: 15px;">barcode: ${data.barCode}</small>
    </div>
    <div style="display: flex; justify-content: center;
    align-items: center;">
        <a href="./productView.html?searchValue=${search}"><button class="btn" id="previeww">Preview</button></a>
        <button class="btn" id="cartHandle">Add</button>
    </div>
</div>
    `
        const tr = document.createElement('tr');
        const total = [];
        tr.innerHTML = `
        <td><span class="delete-btn hidden"><button onclick="deleteRow(this)">Del</button></span> <span class="dataName" data-name>${data.name}</span></td>
        <td class="GcOdE">${data.groupCode}</td>
        <td data-barcode class="barcode">${data.barCode}</td>
        <td><input  style="width:45px;" type="number" name="" class="qty" placeholder="QTY" data-qty value=1></td>
        <td data-rate class="originalPrice">${price}</td>
        <td data-><input  style="width:65px;" type="number" class="p sellingPrice" value=${price} data-price></td>
        <td style="border:1px solid black;border-right:none;border-left:none;"><span class="total dataTotal" data-total>${price}</span></td>
    `;

        document.querySelector("#cartHandle").addEventListener("click", async () => {
            const BC = data.barCode;
            const table = document.querySelector("#table");
            const barcodeIds = document.querySelectorAll("#table>tr td[data-barcode]");
            const BarcodesArray = [];
            barcodeIds.forEach(barcode => {
                BarcodesArray.push(barcode.textContent)
            })

            if (!BarcodesArray.includes(BC)) {
                table.appendChild(tr)
            }
            else {
                document.querySelector('#err').textContent = 'this barcode seems to be exist!';
            }

            // Use the 'input' event to track changes in the quantity and price input fields
            const qtyInput = tr.querySelector('.qty');
            const priceInput = tr.querySelector('.p');
            const totalCell = tr.querySelector('.total');

            qtyInput.addEventListener('input', updateTotal);
            priceInput.addEventListener('input', updateTotal);

            const itemData = {
                name: data.name,
                barCode: data.barCode,
                quantity: parseInt(qtyInput.value),
                price: parseInt(priceInput.value)
            };

            itemDataArray.push(itemData);
            qtyInput.addEventListener('input', updateTotal);
            priceInput.addEventListener('input', updateTotal);

            // in here, you can add the itemData to your table or perform other operations
            function updateTotal() {
                const p = parseInt(priceInput.value) || 0;
                const t = parseInt(qtyInput.value) || 0;
                total[0] = (p * t).toFixed(2); // Calculate the total and round to 2 decimal places
                totalCell.textContent = total[0]; // Update the total cell in the table row
                updateTotalValue(); // Update the total value in the footer
            }
        });
    }
})
function deleteRow(button) {
    const parentRow = button.closest('tr');
    if (parentRow) {
        parentRow.remove();
    }
}

const tableFooter = document.createElement("tr")
const tableFooter1 = document.createElement("tr")
tableFooter.innerHTML = `
<tr class="row" id="row" row>
<td style="display: hidden; border: none;"></td>
<td style="display: hidden; border: none;"></td>
<td style="display: hidden; border: none;"></td>
<td style="display: hidden; border: none;"></td>
<td style="border-top:1px solid black;">Discount</td>
<td style="border-top:1px solid black;"><input type="number" style="width:45px;" id="discountInput" value="0.00" data-discount></td>
`;
tableFooter1.innerHTML = `
</tr>
<tr class="row" id="row" row>
<td style="display: hidden; border: none;"></td>
<td style="display: hidden; border: none;"></td>
<td style="display: hidden; border: none;"></td>
<td style="display: hidden; border: none;"></td>
<td style="border-top:1px solid black;">Subtotal</td>
<td style="border-top:1px solid black;" id="totalValue" data-total>#####</td>
</tr>
`;
// this is our invoice generator funcion 

document.querySelector('.print').addEventListener("click", () => {
    document.querySelector("#INVOICEid").textContent = random;
    document.querySelector(".sellBtn").classList.toggle("hidden")
    document.querySelector("#inCon").classList.toggle("hidden");
    const cartTable = document.querySelector(".cart table");
    const invoiceTable = document.querySelector(".invoice table");
    invoiceTable.innerHTML = ""
    cartTable.querySelectorAll("tr").forEach(row => {

        invoiceTable.appendChild(row.cloneNode(true));
        invoiceTable.append(tableFooter)
        invoiceTable.append(tableFooter1)

    });
});


// Function to calculate and update the total value
function updateTotalValue() {
    const tableRows = document.querySelectorAll("#table tr");
    let total = 0;

    // Start from index 1 to skip the header row
    for (let i = 1; i < tableRows.length; i++) {
        const row = tableRows[i];
        const totalCell = row.querySelector(".total");
        if (totalCell) {
            total += parseInt(totalCell.textContent);
        }
    }

    // Get the discount input value
    const discountInput = document.getElementById("discountInput");
    const discount = parseInt(discountInput.value) || 0;

    // Calculate the discounted total
    const discountedTotal = total - discount;

    // Update the total value in the HTML
    const totalValueElement = document.getElementById("totalValue");
    if (totalValueElement) {
        totalValueElement.textContent = `${discountedTotal.toFixed(2)}`;
    }
}

// Call the updateTotalValue function whenever a change occurs in the table or discount input
document.querySelector(".cart").addEventListener("input", () => {
    updateTotalValue()
});

// Call the updateTotalValue function whenever a change occurs in the table
document.querySelector(".print").addEventListener("click", () => {
    document.getElementById("discountInput").addEventListener("input", () => {
        updateTotalValue()
    });
    updateTotalValue()
    // sentData()
});

const savedBtn = document.querySelector(".saved")
const editBtn = document.querySelector(".edit");
editBtn.addEventListener("click", () => {
    editBtn.classList.toggle("hidden")
    savedBtn.classList.toggle("hidden")

    document.querySelectorAll(".delete-btn").forEach(del => {
        del.classList.toggle('hidden')
    })
})
savedBtn.addEventListener("click", () => {
    editBtn.classList.toggle("hidden")
    savedBtn.classList.toggle("hidden")
    document.querySelectorAll(".delete-btn").forEach(del => {
        del.classList.toggle('hidden')
    })

})

//we will be adding all these selling invoice details to the database

async function sendToServer(obj) {
    const dataTotal = document.querySelector(".imon506412 #totalValue")
    const objArray = [{GrandTotal:dataTotal.textContent}]
    const d = document.querySelectorAll("#Table>tr")
    let slidedRow = [...d]
    slidedRow = slidedRow.slice(1, slidedRow.length - 2)
    slidedRow.forEach((element,index) => {
        const dataName = document.querySelectorAll(".imon506412 .dataName") 
        const GcOdE = document.querySelectorAll(".imon506412 .GcOdE")                      
        const barcode = document.querySelectorAll(".imon506412 .barcode")
        const originalPrice = document.querySelectorAll(".imon506412 .originalPrice")
        const sellingPrice = document.querySelectorAll(".imon506412 .sellingPrice")
        const discount = document.querySelector("#discountInput").value;
        const objct = {
            date: new Date(),
            name:dataName[index].textContent,
            barcode:barcode[index].textContent,
            groupcode:GcOdE[index].textContent,
            originalPrice:originalPrice[index].textContent,
            sellingPrice:sellingPrice[index].value,
        }
        objArray.push(objct)
    })

console.log(objArray)
    try {
        const response = await fetch('http://localhost:5000/sell/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ data: objArray, invoiceId: random}), // Send the total value as JSON data
        });

        if (response.ok) {
            document.querySelector("#soldItemSentMassage").classList.toggle("hidden")
            window.location.reload()
        } else {
            // Handle any errors from the server response
            console.error('Error sending total value to server');
        }
    } catch (error) {
        console.error('Error sending total value:', error);
    }
}

document.querySelector("#sellIt").addEventListener("click", () => {
    sendToServer()
})

document.querySelector("#printIt").addEventListener("click",()=>{
    const printingPage = document.querySelector("#printingPurposes")
    window.print(printingPage)

})

function handleKeyPress(event) {
    
    if (event.key === "Enter") {
        const searchValue = document.getElementById("search").value;
        const url = `./productView.html?searchValue=${searchValue}`;
        window.location.href = url
    }
    console.log(event)
    if (event.code === "Backslash") {
        const url = `./dashboard.html`;
        window.location.href = url
    }
    if(event.key === "+"){
        if(document.querySelector("#searchResult").innerHTML!==""){
            document.querySelector("#cartHandle").click()
        }
    }
}
document.addEventListener("keypress", (event) => {
    handleKeyPress(event)
})

const modeOnBtn = document.querySelector("#scanMode");
let isModeON = localStorage.getItem('scanmode') === "true";
modeOnBtn.textContent = isModeON ? "Turn OFF" : "Scane Mode";

modeOnBtn.addEventListener("click", () => {
    isModeON = !isModeON; // Toggle the value
    modeOnBtn.textContent = isModeON ? "Turn OFF" : "Scane Mode";
    localStorage.setItem("scanmode", isModeON);
    isModeON && barcodeScanner();
    if(!isModeON){
        Quagga.stop()
    }
});

isModeON && barcodeScanner();
async function barcodeScanner() {
    var scannerCamEl = document.getElementById("scnanner-div");
    var App = {
        init: function () {
            var self = this;

            Quagga.init(this.config, function (err) {
                if (err) {
                    return self.handleError(err);
                }
                Quagga.start();
                
            });
        },
        handleError: function (err) {
            console.log(err);
        },
        config: {
            inputStream: {
                target: scannerCamEl,
                type: "LiveStream",
                constraints: {
                    width: { min: 640 },
                    height: { min: 480 },
                    facingMode: "environment",
                    aspectRatio: { min: 1, max: 2 },
                },
            },
            locator: {
                patchSize: "medium",
                halfSample: true,
            },
            numOfWorkers: 2,
            frequency: 10,
            decoder: {
                readers: ["code_128_reader", "ean_reader", "upc_reader"]
            },
            locate: true
        }
    };

    App.init();

    function scanItem(code, barcodeType) {
        var el = document.createElement('li');
        el.innerText = `Type: ${barcodeType}, Code: ${code}`;
        document.querySelector("#search").setAttribute("value", `${code}`)
        if (code) {
            document.querySelector("#searchBtn").click()
        }
    }

    var debouncedScanner = _.debounce(scanItem, 1000, true);
    var styleTimer;

    Quagga.onDetected((result) => {
        var code = result.codeResult.code;
        var barcodeType = result.codeResult.format;

        if (barcodeType) {
            debouncedScanner(code, barcodeType);
        } else {
            console.log("Unknown barcode type");
        }

        clearTimeout(styleTimer);

        styleTimer = setTimeout(function () {
            scannerCamEl.classList.remove('scanner-cam--scanned');
        }, 1000);
    });
}
