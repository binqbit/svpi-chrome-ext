let clickCount = 0;
let clickTimer = null;
let input = null;
const clickDelay = 300;

function handleClick(event) {
    clickCount++;

    if (clickCount === 1) {
        clickTimer = setTimeout(() => {
            if (clickCount === 2) {
                const selectedElement = event.target;
                if (selectedElement.tagName === 'INPUT') {
                    input = selectedElement;
                    chrome.runtime.sendMessage({ action: "doubleClickInput" });
                }
            }
            clickCount = 0;
        }, clickDelay);
    }

    event.stopPropagation();
}

document.addEventListener('click', handleClick);

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "insertPassword") {
        if (input) {
            input.value = request.password;
        }
    }
});