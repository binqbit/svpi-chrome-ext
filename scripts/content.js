const clickDelay = 300;
let clickCount = 0;
let clickTimer = null;
let selectedInput = null;

document.addEventListener('click', (event)  =>{
    clickCount ++;

    if (clickCount === 1) {
        clickTimer = setTimeout(() => {
            if (clickCount === 2) {
                const selectedElement = event.target;
                if (selectedElement.tagName === 'INPUT') {
                    selectedInput = selectedElement;
                    chrome.runtime.sendMessage({ action: "doubleClickInput" });
                }
            }
            clickCount = 0;
        }, clickDelay);
    }

    event.stopPropagation();
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "insertPassword") {
        if (selectedInput) {
            selectedInput.value = request.password;
        }
    }
});