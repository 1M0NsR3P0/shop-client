window.onload = () => {
    const query = new URLSearchParams(window.location.search);
    const querySearch = query.get("searchValue");
    callerEditor(querySearch)
    function callerEditor(params) {
        if (querySearch !== "") {
            const data = fetch(`http://localhost:5000/getproduct/${params}`)
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        // console.log(data.data)
                        productEditFetcher(data.data)
                    }
                    if (data.erorr) {
                        const err = data.message
                        const root = document.querySelector("#root")
                        root.innerHTML = `
                                    <div>
                                        ${err}
                                    </div>
                                    `
                        document.querySelector('.disPlayEdit').classList.add('hidden')
                        return console.log(err)
                    }
                })
        }
        if (querySearch === "") {
            const err = "erorr"
            productEditFetcher(err)
            document.querySelector('.disPlayEdit').classList.add('hidden')
        }

    }

}

function productEditFetcher(data) {
    // console.log(data)
    if (data === "erorr") {
        const root = document.querySelector("#root")
        root.innerHTML = `
        <div>
            please insert some data
        </div>
        `
        document.querySelector('.disPlayEdit').classList.add('hidden')
    }
    const totalPrice = parseFloat(data?.purhase) + parseFloat(data?.cost) + parseFloat(data?.vat);
    const sellRangeMin = totalPrice + parseInt(data?.minProfit);
    const sellRangeMax = totalPrice + parseInt(data?.maxProfit);
    const price = (sellRangeMax + sellRangeMin) / 2
    const defaultPicSrc = data.images[0] ? data.images[0] : "./storage/images/Image_not_available.png";

    // console.log(priceCode)
    // console.log(data)
    document.querySelector('.main-container').innerHTML = `<div>
    <div class="barCode" style="display: flex; justify-content: flex-end; width: 100%;"><img
    src="./storage/images/barcodenotfound.png" alt="" id="barcode" ></div>
    
    <div class="dataContainer">
                <!-- picture part -->
                <div class="pics">
                    <div class="mainImg"></div>
                    <div class="thumbs"></div>
                    <div><input type="file" name="p_Img" id="p_img" accept="image/*" multiple name="pics" class="hidden"></div>
                    <button class="imageEdt" id="imageEdit">
                    <svg clip-rule="evenodd" fill-rule="evenodd" stroke-linejoin="round" stroke-miterlimit="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="m11.25 6c.398 0 .75.352.75.75 0 .414-.336.75-.75.75-1.505 0-7.75 0-7.75 0v12h17v-8.75c0-.414.336-.75.75-.75s.75.336.75.75v9.25c0 .621-.522 1-1 1h-18c-.48 0-1-.379-1-1v-13c0-.481.38-1 1-1zm-2.011 6.526c-1.045 3.003-1.238 3.45-1.238 3.84 0 .441.385.626.627.626.272 0 1.108-.301 3.829-1.249zm.888-.889 3.22 3.22 8.408-8.4c.163-.163.245-.377.245-.592 0-.213-.082-.427-.245-.591-.58-.578-1.458-1.457-2.039-2.036-.163-.163-.377-.245-.591-.245-.213 0-.428.082-.592.245z" fill-rule="nonzero"/></svg>
                    </button>
                    <button class="hidden" id="save">save</button>
                </div>
                <!-- details part -->
                <div class="detailsContainer">
                    <div class="mYflex">
                        <span class="names">Name: </span>
                        <h3 class="showMe">${data?.name}</h3> <input type="text" id="name" name="name" class="hidden editInput" style="width: 250px;" placeholder='enter'>
                    </div>
                    
                    <div class="mYflex" style="width:250px">
                        <span class="names" title="Best Sellling Price Estimated">Price: </span>
                        <span id="hidePrice"><span class="show" id="showPrice">${genPriceCode(price.toString())}</span><span id="thePrice" class="hidden">${price}</span></span>
                        
                    </div>
                    <div class="mYflex" style="width: 250px;">
                        <span class="names">Product Group: </span>
                        <h3 class="showMe">${data?.groupCode}</h3> <input type="text" id="groupCode" name="groupCode" class="hidden editInput" style="width:100px ; " placeholder="enter">
                    </div>
                    <div class="mYflex">
                        <div style="width: 250px;"><span class="names">Size: </span><span class="showMe">${data?.size}</span></div>
                        <input type="text" id="size" name="size" class="hidden editInput" style="width:50px;" placeholder="enter">
                        <div style="width: 250px;"><span class="names">Color: </span><span class="showMe" style=" color:${data?.color};background-color:${data?.color}">This</span> </div>
                        <input type="text" id="color" name="color" class="hidden editInput" style="width:50px;" placeholder="enter">
                        <div style="width: 250px;"><span class="names">Weight: </span><span class="showMe">${data?.weight}</span></div>
                        <input type="text" id="weight" name="weight" class="hidden editInput" style="width:50px;" placeholder="enter">
                    </div>
                    <div class="mYflex">
                        <div style="width: 250px;"><span class="names">Materials: </span><span class="showMe">${data?.materials}</span></div>
                        <select id="materials" name="materials" style="height: 30px; border-radius: 10px; outline: none; border: none;" name="materials" class="hidden editInput">
                        <option value="steel">Steel</option>
                        <option value="plastic">Plastic</option>
                        <option value="iron">Iron</option>
                        <option value="aloy">Aloy</option>
                        <option value="copper">Copper</option>
                        <option value="nichrome">Nichrome</option>
                    </select> <span>: Select Materials</span>
                        <div style="width: 250px;"><span class="names">Guaranty: </span><span class="showMe">${data.guarantyValue ? data.guarantyValue : "Not Available"}</span></div>
                                <input type="text" id="guaranty" name="guaranty" class="hidden editInput" style="width:50px;" placeholder="enter">
                        <div style="width: 250px;"><span class="names">Warantry: </span><span class="showMe">${data?.warrantyValue ? data.warrantyValue : "Not Available"}</span></div>
                                <input type="text" id="warranty" name="warranty" class="hidden editInput" style="width:50px;" placeholder="enter">
                               
                    </div>
                    <div class="mYflex">
                        <div style="width: 250px;"><span class="names">Quality: </span><span>${data?.quality}</span></div>
                        <select id="quality" name="quality" class="hidden editInput" style="height: 30px; border-radius: 10px; outline: none; border: none;">
                        <option value="Brand_new">Brand_new</option>
                        <option value="standard">standard</option>
                        <option value="Medium">Medium</option>
                        <option value="Medium_low">Medium_low</option>
                        <option value="old">old</option>
                        <option value="low_q">low_q</option>
                    </select> <span>: Select quality Type</span>
                        <div style="width: 250px; display: flex;flex-direction: column;"><span class="names">Manufacturer:
                            </span><span class="showMe">${data?.manufacturer}</span></div>
                                     <input type="text" id="manufacturer" name="manufacturer" class="hidden editInput" style="width:80px;" placeholder="enter">
                        <div style="width: 250px;"><span class="names">Total Cost: </span><span>${totalPrice}</span></div>
                    </div>
                    <div class="mYflex" style="flex-direction: column; gap: 15px;">
                        <div>
                        <span class="names">Price Range (Estimated): </span><span>${sellRangeMin}-${sellRangeMax}</span></div>
                        <input type="number" id="min" name="min" class="hidden editInput" style="width:50px; height:80%;" placeholder="min">
                        <input type="number" id="max" name="max" class="hidden editInput" style="width:50px; height:80%;" placeholder="max">
                        <input type="number" id="cost" name="cost" class="hidden editInput" style="width:100px;" placeholder="cost update">
                        <input type="number" id="purhase" name="purhase" class="hidden editInput" style="width:100px;"    placeholder="purhase update">
                        <div class="myFlex" style="display: flex;">
                        
                            <div class="mYflex" style="flex-direction: column; justify-content: start;"><span class="names">Descriptions: </span>
                                <p class="showMe"
                                    style="overflow-y: auto; overflow-x: hidden; height: 35vh; width: 550px; align-items: center;">
                                    ${data?.details}</p>
                                <textarea type="text" id="details" name="details" class="hidden editInput" style="min-width:250px; min-height:80px; height:80%; max-height:15vh;max-width:45vh; border-radius: 10px;" placeholder="enter"></textarea>    
                            </div>
                            
                            <div class="mYflex" style="flex-direction: column; justify-content: start;">
                                <div class="ins"><span class="names">instructions: </span>
                                    <p class="showMe"
                                        style="overflow-y: auto; overflow-x: hidden; height: 30vh; width: 550px; align-items: center;">
                                        ${data?.instructions}</p>
                                </div>
                                <textarea type="text" id="instruction" name="instruction" class="hidden editInput" style="min-width:250px; min-height:80px;border-radius: 10px; height:80%; max-height:15vh;max-width:45vh;"  placeholder="enter"></textarea>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
    </div>`



    const img = data.images;
    document.querySelector("#p_img").addEventListener('change', () => {
        const imgFiles = document.querySelector("input[multiple]");
        for (let i = 0; i < imgFiles.files.length; i++) {
            const file = imgFiles.files[i];
            const src = URL.createObjectURL(file);
            const fileName = file.name;
            img.push(fileName)
        }
    });
    if (img.length <= 0) {
        for (let i = 0; i <= 3; i++) {
            const imagesContainer = document.createElement("div")
            const images = document.createElement("img")
            imagesContainer.classList.add('thumb')
            const src = `./storage/images/Image_not_available.png`
            images.setAttribute('src', src)
            images.setAttribute('alt', "no image available");
            imagesContainer.appendChild(images)
            document.querySelector('.thumbs').appendChild(imagesContainer)
            document.querySelector('.mainImg').innerHTML = `<img src="./storage/images/Image_not_available.png" alt="No Image Available"></img>`
        }
    }
    if (img.length >= 1) {
        img.map(element => {
            const imagesContainer = document.createElement("div")
            imagesContainer.style.position = "relative"
            const deleteButton = document.createElement('button');
            deleteButton.classList.add('delImg')
            // deleteButton.setAttribute('id', "del")
            deleteButton.textContent = "Remove"
            deleteButton.classList.add('hidden')
            imagesContainer.appendChild(deleteButton);
            const images = document.createElement("img")
            imagesContainer.classList.add('thumb')
            const src = `./storage/images/${element}`
            images.setAttribute('src', src)
            images.setAttribute('alt', "no image available");
            deleteButton.addEventListener('click', () => {
                // Find the index of the clicked deleteButton in the array of deleteButtons
                const index = img.indexOf(element);
                if (index !== -1) {
                    imagesContainer.parentNode.removeChild(imagesContainer);
                    img.splice(index, 1);
                }
            });
            
            imagesContainer.appendChild(images)
            document.querySelector('.thumbs').appendChild(imagesContainer)
        })
        document.querySelector('.mainImg').innerHTML = `<img src="./storage/images/${defaultPicSrc}" alt="No Image Available"></img>`
        document.querySelector('.thumbs').addEventListener('click', (event) => {
            if (event.target.tagName === 'IMG') {
                const src = event.target.getAttribute('src');
                const mainImage = document.querySelector('.mainImg');
                mainImage.innerHTML = '';
                const mainImg = document.createElement('img');
                mainImg.setAttribute('src', src);

                mainImage.appendChild(mainImg);
            }
        })
    }

    getBarcode(data?.barCode)
    function getBarcode(values) {
        const barcodeElement = document.querySelector('#barcode')
        const barcodeValue = values;
        JsBarcode(barcodeElement, barcodeValue, {
            format: 'CODE128',
            displayValue: true,
        });
    }
    const editBtn = document.querySelector("#disPlayEdit");
    editBtn.addEventListener('click', () => {
        // document.querySelector("#imageEdit").classList.toggle("hidden")
        document.querySelector('#save').classList.toggle("hidden")
        const allInputs = document.querySelectorAll('.editInput');
        allInputs.forEach(element => {
            element.classList.toggle('hidden')
            document.querySelector('#p_img').classList.toggle('hidden')
            document.querySelectorAll('.showMe').forEach(ele => {
                ele.classList.toggle('hidden')
            })
        });
    })
    document.getElementById('save').addEventListener('click', () => {
        document.querySelector('#save').classList.toggle("hidden")
        let formsData = {}
        const name = document.getElementById('name').value;
        const groupCode = document.getElementById('groupCode').value;
        const size = document.getElementById('size').value;
        const color = document.getElementById('color').value;
        const weight = document.getElementById('weight').value;
        const materials = document.getElementById('materials').value;
        const guaranty = document.getElementById('guaranty').value;
        const warranty = document.getElementById('warranty').value;
        const quality = document.getElementById('quality').value;
        const manufacturer = document.getElementById('manufacturer').value;
        const min = document.getElementById('min').value;
        const max = document.getElementById('max').value;
        const details = document.getElementById('details').value;
        const instruction = document.getElementById('instruction').value;
        const purhase = document.getElementById('purhase').value;
        const cost = document.getElementById('cost').value;
        console.log(img)
        formsData = {
            barCode: data.barCode,
            images: img,
            name: name,
            groupCode:groupCode,
            size: size,
            color: color,
            weight: weight,
            materials: materials,
            Gruaranty: guaranty,
            Warranty: warranty,
            quality: quality,
            manufacturer: manufacturer,
            min: min,
            max: max,
            details: details,
            instructions: instruction,
            purhase: purhase,
            cost: cost
        }
        fetch(`http://localhost:5000/product/update/${data.barCode}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formsData),
        })
            .then(async (response) => {
                if (response.ok) {
                    document.querySelector('#save').style.display = "none"
                    openSuccessAlert();
                    // location.reload();
                } else {
                    console.error('Error updating product');
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });

    })
    document.querySelector('#hidePrice').addEventListener('click', () => {
        document.querySelector('#showPrice').classList.toggle('show')
        document.querySelector('#showPrice').classList.toggle('hidden')
        document.querySelector('#thePrice').classList.toggle('hidden')
    })

    const numberInput = document.querySelectorAll("input[type='number']")
    numberInput.forEach((Element) => {
        Element.addEventListener('keydown', (event) => {
            if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
                event.preventDefault();
            }
        });
    })


    const imageEdit = document.querySelector("#imageEdit")
    imageEdit.addEventListener("click",()=>{
        document.querySelectorAll(".delImg").forEach(d=>{
            d.classList.toggle("hidden")
        })
    })
}

