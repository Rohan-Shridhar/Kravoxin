// Storage Helper functions

/**
 * Returns the current local date and time in yyyymmddhhmmss format.
 * @param {Date} date
 * @returns {string}
 */
function formatCopyTimestamp(date = new Date()) {
  const pad = (value) => String(value).padStart(2, '0');

  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate()),
    pad(date.getHours()),
    pad(date.getMinutes()),
    pad(date.getSeconds())
  ].join('');
}

/**
 * Normalizes existing history entries to the current shape.
 * @param {Array} history
 * @returns {Array}
 */
function normalizeHistory(history) {
  return history.map((item) => {
    if (typeof item === 'string') {
      return { text: item, favorite: false, timestamp: '' };
    }

    return {
      text: item?.text ?? '',
      favorite: Boolean(item?.favorite),
      timestamp: typeof item?.timestamp === 'string' ? item.timestamp : ''
    };
  });
}

/**
 * Gets the clipboard history list from local storage.
 * @returns {Promise<Array>} Array of items: { text: string, favorite: boolean, timestamp: string }
 */
async function getHistory() {
  return new Promise((resolve) => {
    chrome.storage.local.get({ history: [] }, (result) => {
      resolve(normalizeHistory(result.history));
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
    chrome.storage.local.set({ history: normalizeHistory(history) }, () => {
      resolve();
    });
  });
}

/**
 * Adds a new item to the front of the history.
 * @param {string} text
 * @param {string} timestamp
 * @returns {Promise<void>}
 */
async function addHistoryItem(text, timestamp = formatCopyTimestamp()) {
  const history = await getHistory();
  // Newest items should appear first
  history.unshift({ text, favorite: false, timestamp });
  await saveHistory(history);
}

/**
 * Updates the timestamp for an existing history item after it is copied again.
 * @param {number} index
 * @returns {Promise<void>}
 */
async function markHistoryItemCopied(index) {
  const history = await getHistory();
  if (index >= 0 && index < history.length) {
    history[index].timestamp = formatCopyTimestamp();
    await saveHistory(history);
  }
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
}

/**
 * Toggles the favorite state for a history item.
 * @param {number} index
 * @returns {Promise<void>}
 */
async function toggleFavoriteHistoryItem(index) {
  const history = await getHistory();
  if (index >= 0 && index < history.length) {
    history[index].favorite = !history[index].favorite;
    await saveHistory(history);
  }
}

/**
 * Clears all non-favorite items from clipboard history.
 * @returns {Promise<void>}
 */
async function clearAllHistory() {
  const history = await getHistory();
  const favoritesOnly = history.filter((item) => item.favorite);
  await saveHistory(favoritesOnly);
}
