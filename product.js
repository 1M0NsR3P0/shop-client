
    

function productFetcher(data) {
    let totalPrice = parseFloat(data?.purhase) + parseFloat(data?.cost) + parseFloat(data?.vat);
    let sellRangeMin = totalPrice + data?.minProfit;
    let sellRangeMax = totalPrice + data?.maxProfit;
    let price = (sellRangeMax + sellRangeMin) / 2
    const defaultPicSrc = data.images[0];
    document.querySelector('.main-container').innerHTML = `
<div>

<div class="barCode" style="display: flex; justify-content: flex-end; width: 100%;"><img
src="./storage/images/barcodenotfound.png" alt="" id="barcode" ></div>


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
                    <h3>${data?.name}</h3>
                </div>
                <div class="mYflex" style="width: 250px;">
                    <span class="names" title="Best Sellling Price Estimated">Price: </span>
                    <span>${price}</span>
                </div>
                <div class="mYflex">
                    <div style="width: 250px;"><span class="names">Size: </span><span>${data?.size}</span></div>
                    <div style="width: 250px;"><span class="names">Color: </span><span>${data?.color}</span></div>
                    <div style="width: 250px;"><span class="names">Weight: </span><span>${data?.weight}</span></div>
                </div>
                <div class="mYflex">
                    <div style="width: 250px;"><span class="names">Materials: </span><span>${data?.materials}</span></div>
                    <div style="width: 250px;"><span class="names">Guaranty: </span><span>Not Available</span></div>
                    <div style="width: 250px;"><span class="names">Warantry: </span><span>5 Month</span></div>
                </div>
                <div class="mYflex">
                    <div style="width: 250px;"><span class="names">Quality: </span><span>${data?.quality}</span></div>
                    <div style="width: 250px; display: flex;flex-direction: column;"><span class="names">Manufacturer:
                        </span><span>${data?.manufacturer}</span></div>
                    <div style="width: 250px;"><span class="names">Total Cost: </span><span>${totalPrice}</span></div>
                </div>
                <div class="mYflex" style="flex-direction: column; gap: 15px;">
                    <div><span class="names">Price Range (Estimated): </span><span>${sellRangeMin}-${sellRangeMax}</span></div>
                    <div style="display: flex;">
                        <div><span class="names">Descriptions: </span>
                            <p
                                style="overflow-y: auto; overflow-x: hidden; height: 44vh; width: 550px; align-items: center;">
                                ${data?.details}</p>
                        </div>
                        <div class="mYflex">
                            <div><span class="names">instructions: </span>
                                <p
                                    style="overflow-y: auto; overflow-x: hidden; height: 44vh; width: 550px; align-items: center;">
                                    ${data?.instructions}</p>
                            </div>
                        </div>
                    </div>
                </div>
                </div>
                </div>
                


</div>`
// document.querySelector('.editBtn').addEventListener('click',()=>{

//     productEditFetcher(data)
// })
    const img = data.images;
    img.map(element => {
        const imagesContainer = document.createElement("div")
        const images = document.createElement("img")
        imagesContainer.classList.add('thumb')
        const src = `./storage/images/${element}`
        images.setAttribute('src', src)
        imagesContainer.appendChild(images)
        document.querySelector('.thumbs').appendChild(imagesContainer)
    })
    document.querySelector('.mainImg').innerHTML = `<img src="./storage/images/${defaultPicSrc}"></img>`
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
    getBarcode(data?.barCode)
    function getBarcode(values){
        const barcodeElement = document.querySelector('#barcode')
        const barcodeValue = values;
        JsBarcode(barcodeElement, barcodeValue, {
        format: 'CODE128',
        displayValue: true,
    });}
}
