// function dateConvert() {
//     const today = new Date();
//     const year = today.getFullYear();
//     let month = (today.getMonth() + 1).toString();
//     if (month.length < 2) {
//         month = '0' + month;
//     }
//     let day = today.getDate().toString();
//     if (day.length < 2) {
//         day = '0' + day;
//     }
//     const formattedDate = `${year}-${month}-${day}`;
//     return formattedDate;
// }

let costDate = new Date().toDateString().slice(4,15);

document.getElementById("selectBtn").addEventListener("click", () => {
    const inputdate = document.getElementById("dateSelection").value;
    if (!inputdate) {
        let date = new Date().toDateString().slice(4,15);
        dataFetcher(date).then((fetchedData) => updatePage(fetchedData));
    }
    if (inputdate) {
        const dateParts = inputdate.split('-');
        const formattedDate = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);
        date = formattedDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }).replace(/,/g, '');
        dataFetcher(date).then((fetchedData) => updatePage(fetchedData,date));
        costDate = undefined
    }
});
const dataFetcher = async (date) => {
    // console.log(date);
    const TodaysInvoiceIds = [];
    const AllInvoicePrices = [];
    let SellsOfTheDay = 0;
    let TotalProductQtySold = 0;
    const allProductList = [];
    const response = await fetch(`http://localhost:5000/sold`);
    const fetchedData = await response.json();
    const todaysSell = fetchedData.data.filter(every => {
        // let dates = new Date().toDateString().slice(4,15)
        const invliceDate = `${every.invoiceId.slice(0,11)}`;
        // console.log(dates)
        return invliceDate===date;
    });
    // console.log(todaysSell)
    todaysSell.map(everySell => {
        TodaysInvoiceIds.push(everySell.invoiceId);
        AllInvoicePrices.push(everySell.data[0].GrandTotal);
        TotalProductQtySold += (everySell.data.length - 1);
        allProductList.push(everySell.data);
    });

    SellsOfTheDay = AllInvoicePrices.reduce((acc, curr) => acc + parseFloat(curr), 0);

    return {
        allProductList: allProductList,
        todaysSell: todaysSell,
        TodaysInvoiceIds: TodaysInvoiceIds,
        AllInvoicePrices: AllInvoicePrices,
        SellsOfTheDay: SellsOfTheDay,
        TotalProductQtySold: TotalProductQtySold,
        InvoiceCount: todaysSell.length,
    };
};

async function getPriceOffEvrySoldProduct(sells, fetchedData) {
    const productQueryData = await fetch(`http://localhost:5000/products`);
    const originalPriceQuery = await productQueryData.json();
    const allProductsBarcode = [];

    const data = dataFetcher().then(data => {
        const listAllProduct = [];
        const ALLproducts = [];
        const storeOfAllOriginalPrices = [];
        const storeOfAllOriginalcost = [];
        const storeOfAllOriginalvat = [];
        let totalPurchase = 0;
        let totalcost = 0;
        let totalvat = 0;

        fetchedData.allProductList.forEach(invoice => {
            listAllProduct.push(invoice.slice(1, invoice.length));
        });

        listAllProduct.forEach((products, index) => {
            products.forEach(product => {
                ALLproducts.push(product);
                allProductsBarcode.push(product.barcode);
            });
        });

        const found = originalPriceQuery.data.filter((element, index) => {
            if (originalPriceQuery.data.length > allProductsBarcode.length) {
                return (element.barCode = allProductsBarcode[index]);
            }
        });

        found.forEach(p => {
            storeOfAllOriginalPrices.push(p.purhase);
            storeOfAllOriginalcost.push(p.cost);
            storeOfAllOriginalvat.push(p.vat);
        });

        totalPurchase = storeOfAllOriginalPrices.reduce((acc, curr) => acc + parseInt(curr), 0);
        totalcost = storeOfAllOriginalcost.reduce((acc, curr) => acc + parseInt(curr), 0);
        totalvat = storeOfAllOriginalvat.reduce((acc, curr) => acc + parseInt(curr), 0);

        const totalCostPerProduct = totalPurchase + totalcost + totalvat;
        document.querySelector("#OriginalPrice").textContent = totalPurchase;
        document.querySelector("#OriginalCost").textContent = totalcost;
        document.querySelector("#OriginalVat").textContent = totalvat;
        document.querySelector("#TotalCstPerProduct").textContent = totalCostPerProduct;
        document.querySelector("#income").textContent = sells - totalCostPerProduct;
        if(sells - totalCostPerProduct >=0){
            document.querySelector("#income").classList.toggle("loss");
        }
        else if(sells - totalCostPerProduct < 0){
            document.querySelector("#income").classList.toggle("income");

        }
    });
}

function updatePage(fetchedData,costdate) {
    // console.log(costdate)
    const costArray = []
    const res = fetch(`http://localhost:5000/cost`)
    .then(res=>res.json())
    .then(data=>{
        data.map(every=>{
            const todaysCostFilter = data.find(today => {
                return every.data.date === costdate?costdate:costDate;
            })
            if(todaysCostFilter){
                const total = parseInt(todaysCostFilter.data.food?todaysCostFilter.data.food:0)+parseInt(todaysCostFilter.data.Marchandise?todaysCostFilter.data.Marchandise:0)+parseInt(todaysCostFilter.data.Other?todaysCostFilter.data.Other:"0")
                costArray.push(todaysCostFilter.data.food,todaysCostFilter.data.Marchandise,todaysCostFilter.data.Other,total)
                // console.log(costArray)
            }
        })
        document.getElementById("forFood").textContent = `${costArray[0]}`;
        document.getElementById("forMarchandise").textContent = `${costArray[1]}`;
        document.getElementById("forOthers").textContent = `${costArray[2]}`;
        document.getElementById("SubTotal").textContent = parseInt(costArray[0])+parseInt(costArray[1])+parseInt(costArray[2]);
        document.getElementById("dailyCost").textContent = 250+100+25+parseInt(costArray[0])+parseInt(costArray[1])+parseInt(costArray[2]);
        let totalIcomeEstimated = 0
        if((250+100+25+parseInt(costArray[0])+parseInt(costArray[1])+parseInt(costArray[2]))>fetchedData.SellsOfTheDay){
            totalIcomeEstimated = (250+100+25+parseInt(costArray[0])+parseInt(costArray[1])+parseInt(costArray[2])) - fetchedData.SellsOfTheDay
        }
        else if((250+100+25+parseInt(costArray[0])+parseInt(costArray[1])+parseInt(costArray[2]))<fetchedData.SellsOfTheDay){
            totalIcomeEstimated =fetchedData.SellsOfTheDay - (250+100+25+parseInt(costArray[0])+parseInt(costArray[1])+parseInt(costArray[2])) 

        }
        getPriceOffEvrySoldProduct(totalIcomeEstimated, fetchedData);
        
    })
    document.getElementById("totalSells").textContent = `Total Sells : ${fetchedData.SellsOfTheDay}`;

    document.getElementById("fixedCost").textContent = 250+100+25;
    
  
    // document.getElementById("OtherCost").textContent = costArray[1]
    document.getElementById("productQuantitySold").innerHTML =
        `<div>
            <h3>Total Quantity : ${fetchedData.TotalProductQtySold}</h3>
            <small>(Invoice count: ${fetchedData.InvoiceCount})</small>
        </div>`;
}

window.onload = async () => {
    date = new Date().toDateString().slice(4,15)
    // document.getElementById("dateSelection").value = date;
    dataFetcher(date).then((fetchedData) => updatePage(fetchedData));
    const todayDate = new Date().toDateString().slice(0, 15);
    document.getElementById('todaysDate').textContent = "Today is: "+todayDate;

    const lastSubmittedDate = localStorage.getItem('lastSubmittedDate');
    const today = new Date().toDateString().slice(4, 15);
    if (lastSubmittedDate === today) {
        document.getElementById("costForm").innerHTML = `<h3 style="color:green;">Cost Submitted!!</h3>`;
    }
};
function costSubmit(event) {
    
    event.preventDefault();
    const e = event.target;
    const currentDate = new Date().toDateString().slice(4, 15);
    const object = {
        date: currentDate,
        food: e.food.value,
        Marchandise: e.Marchandise.value,
        Other: e.other.value,
    };
    const data = fetch('http://localhost:5000/cost/daily/add', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ data: object })
    });
    document.getElementById("costForm").innerText = "Submitted!!";

    // Store the submitted date in local storage
    localStorage.setItem('lastSubmittedDate', currentDate);
}
