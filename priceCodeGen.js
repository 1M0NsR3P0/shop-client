// let price  = "4005.20";
function genPriceCode(price){
    let arr = []
for(let i = 0;i<=price.length;i++){
    switch (price[i]) {
        case "1":
            arr.push('i')
          break;
        case "2":
            arr.push('Z')
          break;
        case "3":
            arr.push('E')
          break;
        case "4":
            arr.push('a')
          break;
        case "5":
            arr.push('S')
          break;
        case "6":
            arr.push('b')
          break;
        case "7":
            arr.push('T')
          break;
        case "8":
            arr.push('B')
          break;
        case "9":
            arr.push('q')
          break;
        case "0":
            arr.push('L')
          break;
        case ".":
            arr.push('D')
          break;

          case " ":
          arr = []
          break;
          case "":
          arr = []
          break;
        default:
            
          // code to be executed if expression doesn't match any of the cases
      }
      
}
const myString = arr.join('');
return myString;
}


// const time = setTimeout(() => {
//     console.clear()
// }, 2000);
// genPrice(price)
// console.log(genPrice(price))