/**
 * Sends a message to the extension runtime with retry logic.
 * Handles "Extension context invalidated" errors that occur when
 * the service worker is terminated (Manifest V3 behavior).
 * @param {object} message - The message to send
 * @param {number} maxRetries - Maximum retry attempts (default 3)
 * @param {number} delayMs - Delay between retries in ms (default 100)
 * @returns {Promise<any>}
 */
async function sendMessageWithRetry(message, maxRetries = 3, delayMs = 100) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    // Check if extension runtime context is still valid
    if (!chrome.runtime?.id) {
      if (attempt < maxRetries - 1) {
        // Wait for service worker to potentially reinitialize
        await new Promise(resolve => setTimeout(resolve, delayMs));
        continue;
      }
      throw new Error('Extension context invalidated - runtime ID not available');
    }

    try {
      const response = await chrome.runtime.sendMessage(message);
      return response;
    } catch (err) {
      // If context was invalidated during the call, retry
      if (err.message?.includes('context invalidated') || err.message?.includes('Extension context')) {
        if (attempt < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, delayMs));
          continue;
        }
      }
      throw err;
    }
  }
}

document.addEventListener('copy', () => {
  const selectedText = window.getSelection().toString();
  if (selectedText && selectedText.trim() !== '') {
    sendMessageWithRetry({
      action: 'add_to_history',
      text: selectedText
    }).catch(err => {
      // Catch connection errors if the extension is reloaded/inactive
      console.debug('Kravoxin: Error sending message', err);
    });
  }
});
