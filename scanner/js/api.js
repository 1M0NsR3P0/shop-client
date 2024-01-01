document.getElementById('append').addEventListener('click', () => {
    const trackingId = document.getElementById('tId');
    const reason = document.getElementById('reason');
    appender(trackingId.value, reason.value);
})

const appender = (trackingId, reason) => {
    (trackingId && reason) ? localStorage.setItem(trackingId, reason) : console.log()
}
append()
function append() {
    const key = Object.keys(localStorage);
    const val = Object.values(localStorage);
    for (let i = 0; i < Object.keys(localStorage).length; i++) {
        const list = document.createElement('li');
        list.innerHTML = `
        <p id="copyText">${key[i]} <br>
    reason: ${val[i]}</p>

    `
        document.getElementById('parentNode').appendChild(list)

    }
}
function deleteLocalStorage() {
    // console.log('ihavebeen called')
    localStorage.clear()
}
document.getElementById('icon').addEventListener('click',function(){
    let ico = document.getElementById('icon')
    ico.src = 'imgaes/icons/clipboard_copied.svg'
    ico.style.backgroundColor = 'green'
    const copyText = document.getElementById('parentNode'); 
    copyText.select
    navigator.clipboard.writeText(copyText.innerText)
})