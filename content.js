chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "extractText") {
    const selection = window.getSelection().toString();
    if (selection) {
      sendResponse({ text: selection });
    } else {
      const text = document.body.innerText;
      sendResponse({ text: text.substring(0, 5000) });
    }
  }
});