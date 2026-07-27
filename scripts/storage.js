// Storage Helper functions

/**
 * Gets the clipboard history list from local storage.
 * @returns {Promise<Array>} Array of items: { text: string }
 */
async function getHistory() {
  return new Promise((resolve) => {
    chrome.storage.local.get({ history: [] }, (result) => {
      resolve(result.history);
    });
  });
}

/**
 * Saves the entire history array to local storage.
 * @param {Array} history 
 * @returns {Promise<void>}
 */
async function saveHistory(history) {
  return new Promise((resolve) => {
    chrome.storage.local.set({ history }, () => {
      resolve();
    });
  });
}

/**
 * Adds a new item to the front of the history.
 * @param {string} text 
 * @returns {Promise<void>}
 */
async function addHistoryItem(text) {
  const history = await getHistory();
  // Newest items should appear first
  history.unshift({ text });
  await saveHistory(history);
}

/**
 * Deletes a history item by its index.
 * @param {number} index 
 * @returns {Promise<void>}
 */
async function deleteHistoryItem(index) {
  const history = await getHistory();
  if (index >= 0 && index < history.length) {
    history.splice(index, 1);
    await saveHistory(history);
  }
/**
 * Clears all items from clipboard history.
 * @returns {Promise<void>}
 */
async function clearAllHistory() {
  await saveHistory([]);
}

