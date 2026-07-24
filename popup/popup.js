document.addEventListener('DOMContentLoaded', async () => {
  const historyList = document.getElementById('history-list');
  const emptyState = document.getElementById('empty-state');

  // Load and render history items
  async function renderHistory() {
    // getHistory is available from storage.js loaded in popup.html
    const history = await getHistory();

    if (history.length === 0) {
      emptyState.style.display = 'flex';
      historyList.innerHTML = '';
      return;
    }

    emptyState.style.display = 'none';
    historyList.innerHTML = '';

    history.forEach((item, index) => {
      const li = document.createElement('li');
      li.className = 'history-item';

      const contentDiv = document.createElement('div');
      contentDiv.className = 'item-content';
      contentDiv.textContent = item.text;

      const actionsDiv = document.createElement('div');
      actionsDiv.className = 'item-actions';

      // Copy Button
      const copyBtn = document.createElement('button');
      copyBtn.className = 'btn btn-copy';
      copyBtn.innerHTML = `
        <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path stroke-linecap="round" stroke-linejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"></path>
        </svg>
        <span>Copy</span>
      `;
      copyBtn.addEventListener('click', async () => {
        try {
          await navigator.clipboard.writeText(item.text);
          const span = copyBtn.querySelector('span');
          const originalText = span.textContent;
          span.textContent = 'Copied!';
          copyBtn.style.boxShadow = '0 0 12px var(--primary-color)';
          
          setTimeout(() => {
            span.textContent = originalText;
            copyBtn.style.boxShadow = '';
          }, 1000);
        } catch (err) {
          console.error('Failed to copy text: ', err);
        }
      });

      // Delete Button
      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'btn btn-delete';
      deleteBtn.innerHTML = `
        <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
        </svg>
        <span>Delete</span>
      `;
      deleteBtn.addEventListener('click', async () => {
        // Remove item from storage using its index
        await deleteHistoryItem(index);
        // Re-render the history view
        renderHistory();
      });

      actionsDiv.appendChild(copyBtn);
      actionsDiv.appendChild(deleteBtn);
      li.appendChild(contentDiv);
      li.appendChild(actionsDiv);
      historyList.appendChild(li);
    });
  }

  // Initial render
  await renderHistory();
});
