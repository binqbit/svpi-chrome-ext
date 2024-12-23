const clickDelay = 300;
let clickCount = 0;
let clickTimer = null;
let selectedInput = null;

function isPasswordInput(element) {
    if (element.tagName !== 'INPUT') {
        return false;
    }

    if (element.type === 'password') {
        return true;
    }

    if ('id' in element && element.id.toLowerCase().includes('password')) {
        return true;
    }

    if (element.name.toLowerCase().includes('password')) {
        return true;
    }

    if (element.className.toLowerCase().includes('password')) {
        return true;
    }

    if (element.placeholder.toLowerCase().includes('password')) {
        return true;
    }

    return false;
}

function enterPassword(password) {
    if (selectedInput) {
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
        nativeInputValueSetter.call(selectedInput, password);
        const event = new Event('input', { bubbles: true });
        selectedInput.dispatchEvent(event);
    }
}

document.addEventListener('click', (event)  =>{
    clickCount ++;

    if (clickCount === 1) {
        clickTimer = setTimeout(() => {
            if (clickCount === 2) {
                const selectedElement = event.target;
                if (isPasswordInput(selectedElement)) {
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
        enterPassword(request.password);
    }
});