chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "doubleClickInput") {
        chrome.action.openPopup();
    }
});
