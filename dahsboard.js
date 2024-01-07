document.querySelector('#serachBtn').addEventListener("click", () => {
    const searchValue = document.getElementById("search").value;
    const url = `./edit.html?searchValue=${searchValue}`;
    window.location.href = url
})

const modeOnBtn = document.querySelector("#scanMode");
let isModeON = localStorage.getItem('scanmode') === "true"; // Parse as string
modeOnBtn.textContent = isModeON ? "Turn OFF" : "Scane Mode";

modeOnBtn.addEventListener("click", () => {
    isModeON = !isModeON; // Toggle the value
    modeOnBtn.textContent = isModeON ? "Turn OFF" : "Scane Mode";
    localStorage.setItem("scanmode", isModeON);
    isModeON && barcodeScanner();
    if (!isModeON) {
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
        // document.querySelector(".codes").appendChild(el);
        document.querySelector(".searchBox").setAttribute("value", `${code}`)
        // scannerCamEl.classList.add('scanner-cam--scanned');
        if (code) {
            document.querySelector("#serachBtn").click()
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


function handleKeyPress(event) {
    if (!document.querySelector("#search").value) {
        // alert("insert text")
    }
    if (event.key === "Enter") {
        const searchValue = document.getElementById("search").value;
        const url = `./edit.html?searchValue=${searchValue}`;
        window.location.href = url
    }
    if (event.key === "Backspace") {
        const url = `./dashboard.html`;
        window.location.href = url
    }
}
document.addEventListener("keypress", (event) => {
    handleKeyPress(event)
})
window.onload = () => {
    graphHider()
}
function graphHider() {
    const hideGraph = localStorage.getItem('scanmode');
    if (hideGraph === "true") {
        document.querySelector('.graph-container').style.display = "none";
        document.querySelector("#scanner-container").style.display = "block"
    }
    if (hideGraph === "false") {
        document.querySelector("#scanner-container").style.display = "none"
        document.querySelector('.graph-container').style.display = "flex";
    }
}
document.querySelector('#scanMode').addEventListener('click', () => {
    graphHider()
})

/*
    search feature code from here
    it will contain serach by name. 
    it will suggest search
*/

const searchInput = document.querySelector("#SearchBox input");
const suggestionsContainer = document.querySelector("#suggestions");
const nearestMatchContainer = document.querySelector(".nearestMatch");
const theFoundProductContainer = document.querySelector(".theFoundProduct");

// Function to show suggestions
function showSuggestions(matchingProducts) {
    suggestionsContainer.innerHTML = '';

    // Display suggestions
    matchingProducts.forEach(product => {
        const suggestionItem = document.createElement('li');
        suggestionItem.textContent = product.name;
        suggestionItem.classList.add('suggestion');
        suggestionItem.addEventListener('click', () => {
            // Handle suggestion click (e.g., fill input with suggestion)
            searchInput.value = product.name;
            document.querySelector("#SearchBox button").click();
            suggestionsContainer.innerHTML = ''; // Clear suggestions after click
        });
        suggestionsContainer.appendChild(suggestionItem);
    });
}

// Function to display nearest matches
function showNearestMatches(nearestMatches) {
    nearestMatchContainer.innerHTML = '';

    // Display nearest matches
    nearestMatches.forEach(match => {
        const matchItem = document.createElement('li');
        matchItem.innerHTML = `
        <span style="color:blue;">${match}</span>
        `;
        matchItem.classList.add('nearestMatchItem');
        nearestMatchContainer.appendChild(matchItem);
        matchItem.addEventListener("click",()=>{
            document.querySelector("#SearchBox input").value = match;
            document.querySelector("#SearchBox button").click();
        })
    });
}

// Add input event listener for live suggestions
searchInput.addEventListener("input", () => {
    document.querySelector(".graph-container").style.display = "none";
    const inputValue = searchInput.value.trim().toLowerCase();

    // Use fetch to get the products
    fetch('http://localhost:5000/products')
        .then(response => response.json())
        .then(data => {
            // Find matching products
            const matchingProducts = data.data.filter(product => product.name.toLowerCase().includes(inputValue));

            // Display suggestions
            showSuggestions(matchingProducts);
        })
        .catch(error => console.error('Error fetching data:', error));
});

document.querySelector("#SearchBox button").addEventListener("click", async () => {
    const inputValue = searchInput.value.trim().toLowerCase();
    document.querySelector("#suggestions").innerHTML = ''
    // Use fetch to get the products
    try {
        const response = await fetch('http://localhost:5000/products');
        const data = await response.json();

        // Find the product by name
        const foundProduct = data.data.find(product => product.name.toLowerCase() === inputValue);

        if (foundProduct) {
            // Product found, show theFoundProductContainer
            let totalPrice = parseFloat(foundProduct?.purhase) + parseFloat(foundProduct.cost)+ (parseFloat(foundProduct.vat) || 0);
            let sellRangeMin = totalPrice + foundProduct?.minProfit;
            let sellRangeMax = totalPrice + foundProduct?.maxProfit;
            let price = (sellRangeMax + sellRangeMin) / 2
            theFoundProductContainer.innerHTML = `            
            <div style="padding:50px;">            
            <div class="dataContainer">
                        <!-- picture part -->
                        <div class="pics">
                            <div class="mainImg"></div>
                            <div class="thumbs"></div>
                        </div>
                        <!-- details part -->
                        <div class="detailsContainer">
                            <div class="mYflex">
                                <span class="names">Name: </span>
                                <h3>${foundProduct?.name}</h3>
                            </div>
                            <div class="mYflex" style="width: 250px;">
                                <span class="names" title="Best Sellling Price Estimated">Price: </span>
                                <span>${price}</span>
                            </div>
                            <div class="mYflex">
                                <div style="width: 250px;"><span class="names">Size: </span><span>${foundProduct?.size}</span></div>
                                <div style="width: 250px;"><span class="names">Color: </span><span>${foundProduct?.color}</span></div>
                                <div style="width: 250px;"><span class="names">Weight: </span><span>${foundProduct?.weight}</span></div>
                                <div style="width: 250px;"><span class="names">SKU: </span><span>${foundProduct?.sku}</span></div>
                                <div style="width: 250px;"><span class="names">Quantity: </span><span>${foundProduct?.qty}</span></div>
                            </div>
                            <div class="mYflex">
                                <div style="width: 250px;"><span class="names">Materials: </span><span>${foundProduct?.materials}</span></div>
                                <div style="width: 250px;"><span class="names">Guaranty: </span><span>Not Available</span></div>
                                <div style="width: 250px;"><span class="names">Warantry: </span><span>5 Month</span></div>
                            </div>
                            <div class="mYflex">
                                <div style="width: 250px;"><span class="names">Quality: </span><span>${foundProduct?.quality}</span></div>
                                <div style="width: 250px; display: flex;flex-direction: column;"><span class="names">Manufacturer:
                                    </span><span>${foundProduct?.manufacturer}</span></div>
                                <div style="width: 250px;"><span class="names">Total Cost: </span><span>${totalPrice}</span></div>
                            </div>
                            <div class="mYflex" style="flex-direction: column; gap: 15px;">
                                <div><span class="names">Price Range (Estimated): </span><span>${sellRangeMin}-${sellRangeMax}</span></div>
                                <div style="display: flex;">
                                    <div><span class="names">Descriptions: </span>
                                        <p
                                            style="overflow-y: auto; overflow-x: hidden; height: 44vh; width: 550px; align-items: center;">
                                            ${foundProduct?.details}</p>
                                    </div>
                                    <div class="mYflex">
                                        <div><span class="names">instructions: </span>
                                            <p
                                                style="overflow-y: auto; overflow-x: hidden; height: 44vh; width: 550px; align-items: center;">
                                                ${foundProduct?.instructions}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            </div>
                            </div>
            </div>
            `;
// let's edit the images code
const img = foundProduct.images;
    img.map(element => {
        const imagesContainer = document.createElement("div")
        const images = document.createElement("img")
        imagesContainer.classList.add('thumb')
        const src = `./storage/images/${element}`
        images.setAttribute('src', src)
        imagesContainer.appendChild(images)
        document.querySelector('.thumbs').appendChild(imagesContainer)
    })
    document.querySelector('.mainImg').innerHTML = `<img src="./storage/images/${foundProduct.images[0]}"></img>`
    document.querySelector('.thumbs').addEventListener('click',(event)=>{
        if (event.target.tagName === 'IMG') {
            const src = event.target.getAttribute('src');
            const mainImage = document.querySelector('.mainImg');
            mainImage.innerHTML = ''; // Clear the main image container
            const mainImg = document.createElement('img');
            mainImg.setAttribute('src', src);
            mainImage.appendChild(mainImg);
        }
    })


            nearestMatchContainer.innerHTML = ''; // Clear nearest matches
            theFoundProductContainer.style.display = "block";
        } else {
            // Product not found, suggest nearest matches
            const nearestMatches = findNearestMatches(inputValue, data.data.map(product => product.name));
            showNearestMatches(nearestMatches);

            // Hide theFoundProductContainer and display nearestMatchContainer
            theFoundProductContainer.style.display = "none";
        }
    } catch (error) {
        console.error('Error fetching data:', error);
    }
});

// Function to find nearest matches
function findNearestMatches(input, productNames) {
    const inputLower = input.toLowerCase();
    const matches = [];

    for (const productName of productNames) {
        const productNameLower = productName.toLowerCase();
        if (productNameLower.includes(inputLower)) {
            matches.push(productName);
        }
    }

    return matches;
}

