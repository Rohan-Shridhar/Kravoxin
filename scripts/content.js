document.addEventListener('copy', () => {
  const selectedText = window.getSelection().toString();
  if (selectedText && selectedText.trim() !== '') {
    chrome.runtime.sendMessage({
      action: 'add_to_history',
      text: selectedText
    }).catch(err => {
      // Catch connection errors if the extension is reloaded/inactive
      console.debug('Clipboard History: Error sending message', err);
    });
  }
});
