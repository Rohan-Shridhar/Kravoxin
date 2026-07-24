importScripts('storage.js');

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'add_to_history') {
    addHistoryItem(message.text)
      .then(() => {
        sendResponse({ success: true });
      })
      .catch((err) => {
        console.error('Failed to add clipboard item:', err);
        sendResponse({ success: false, error: err.message });
      });
    return true; // Keep the message channel open for async response
  }
});
