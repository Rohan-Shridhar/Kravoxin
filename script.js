document.addEventListener('DOMContentLoaded', () => {
  initClipboardPreview();
  initInstallTabs();
  initCopyButtons();
});

function initClipboardPreview() {
  const list = document.getElementById('snippet-list');
  const search = document.getElementById('snippet-search');
  const count = document.getElementById('item-count');
  const dataOutput = document.getElementById('data-output');
  const listTab = document.getElementById('list-tab');
  const dataTab = document.getElementById('data-tab');
  const listPanel = document.getElementById('list-panel');
  const dataPanel = document.getElementById('data-panel');
  const status = document.getElementById('page-status');
  if (!list || !search || !count || !dataOutput) return;

  const snippets = [
    { label: 'SHELL / GIT', text: 'git log --oneline --decorate -8', pinned: true },
    { label: 'JAVASCRIPT', text: "const here = new URL('.', import.meta.url);", pinned: false },
    { label: 'NOTE', text: 'Check the storage event before refreshing.', pinned: false }
  ];

  const samples = {
    git: { label: 'SHELL / GIT', text: 'git status --short', pinned: false },
    css: { label: 'CSS', text: '--paper: #f3f1e9;', pinned: false }
  };

  function render() {
    const query = search.value.trim().toLocaleLowerCase();
    const visible = snippets
      .filter((snippet) => `${snippet.label} ${snippet.text}`.toLocaleLowerCase().includes(query))
      .map((snippet, index) => ({ snippet, index }))
      .sort((a, b) => Number(b.snippet.pinned) - Number(a.snippet.pinned));

    list.replaceChildren();
    count.textContent = String(snippets.length).padStart(2, '0');
    dataOutput.textContent = JSON.stringify({ history: snippets }, null, 2);

    if (visible.length === 0) {
      const empty = document.createElement('li');
      empty.className = 'empty-state';
      empty.textContent = 'No clippings match that search.';
      list.appendChild(empty);
      return;
    }

    visible.forEach(({ snippet, index }) => {
      const row = document.createElement('li');
      row.className = 'snippet-row';

      const main = document.createElement('div');
      main.className = 'snippet-main';

      const label = document.createElement('span');
      label.className = 'snippet-label';
      label.textContent = snippet.label;

      const text = document.createElement('code');
      text.className = 'snippet-text';
      text.textContent = snippet.text;
      main.append(label, text);

      const actions = document.createElement('div');
      actions.className = 'snippet-actions';

      const pin = document.createElement('button');
      pin.type = 'button';
      pin.className = snippet.pinned ? 'is-pinned' : '';
      pin.textContent = snippet.pinned ? 'Pinned' : 'Pin';
      pin.setAttribute('aria-label', `${snippet.pinned ? 'Unpin' : 'Pin'} ${snippet.label.toLowerCase()} clipping`);
      pin.setAttribute('aria-pressed', String(snippet.pinned));
      pin.addEventListener('click', () => {
        snippets[index].pinned = !snippets[index].pinned;
        render();
      });

      const copy = document.createElement('button');
      copy.type = 'button';
      copy.textContent = 'Copy';
      copy.setAttribute('aria-label', `Copy ${snippet.label.toLowerCase()} clipping`);
      copy.addEventListener('click', () => copyText(snippet.text, status));

      const remove = document.createElement('button');
      remove.type = 'button';
      remove.textContent = 'Remove';
      remove.setAttribute('aria-label', `Remove ${snippet.label.toLowerCase()} clipping`);
      remove.addEventListener('click', () => {
        snippets.splice(index, 1);
        render();
        announce(status, 'Clipping removed from the preview.');
      });

      actions.append(pin, copy, remove);
      row.append(main, actions);
      list.appendChild(row);
    });
  }

  search.addEventListener('input', render);

  document.querySelectorAll('[data-sample]').forEach((button) => {
    button.addEventListener('click', () => {
      const sample = samples[button.dataset.sample];
      if (!sample) return;
      snippets.unshift({ ...sample });
      render();
      announce(status, 'Sample added to this temporary preview.');
    });
  });

  document.getElementById('clear-unpinned')?.addEventListener('click', () => {
    const before = snippets.length;
    const pinned = snippets.filter((snippet) => snippet.pinned);
    snippets.splice(0, snippets.length, ...pinned);
    render();
    announce(status, before === pinned.length
      ? 'Only pinned clippings remain.'
      : `${before - pinned.length} unpinned clippings cleared from the preview.`);
  });

  function selectTab(selectedTab, otherTab, selectedPanel, otherPanel) {
    selectedTab.classList.add('is-active');
    otherTab.classList.remove('is-active');
    selectedTab.setAttribute('aria-selected', 'true');
    otherTab.setAttribute('aria-selected', 'false');
    selectedPanel.hidden = false;
    otherPanel.hidden = true;
  }

  listTab?.addEventListener('click', () => selectTab(listTab, dataTab, listPanel, dataPanel));
  dataTab?.addEventListener('click', () => selectTab(dataTab, listTab, dataPanel, listPanel));
  document.addEventListener('keydown', (event) => {
    if (event.key === '/' && !event.ctrlKey && !event.metaKey && !event.altKey
      && !['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) {
      event.preventDefault();
      search.focus();
    }
  });

  render();
}

function initInstallTabs() {
  const buttons = document.querySelectorAll('.console-tabs [data-os]');
  const code = document.getElementById('commands');
  if (!buttons.length || !code) return;

  const instructions = {
    chrome: '# Open Chrome or Brave\nchrome://extensions/\n\n# Enable Developer mode, then choose Load unpacked\n# Select the downloaded Kravoxin folder',
    edge: '# Open Microsoft Edge\nedge://extensions/\n\n# Enable Developer mode, then choose Load unpacked\n# Select the downloaded Kravoxin folder',
    git: 'git clone https://github.com/Rohan-Shridhar/Kravoxin.git\ncd Kravoxin\n\n# Open your browser extensions page\n# Enable Developer mode and choose Load unpacked'
  };

  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      buttons.forEach((tab) => tab.setAttribute('aria-pressed', 'false'));
      button.setAttribute('aria-pressed', 'true');
      code.textContent = instructions[button.dataset.os];
    });
  });
}

function initCopyButtons() {
  document.querySelectorAll('[data-copy]').forEach((button) => {
    button.addEventListener('click', async () => {
      const target = document.getElementById(button.dataset.copy);
      if (!target) return;
      const copied = await copyText(target.textContent.trim(), document.getElementById('page-status'));
      button.textContent = copied ? 'Copied' : 'Could not copy';
      window.setTimeout(() => {
        button.textContent = 'Copy';
      }, 1800);
    });
  });
}

async function copyText(text, status) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(text);
      } catch {
        if (!fallbackCopy(text)) {
          announce(status, 'Copy was unavailable. Select the text to copy it manually.');
          return false;
        }
      }
    } else if (!fallbackCopy(text)) {
      announce(status, 'Copy was unavailable. Select the text to copy it manually.');
      return false;
    }
    announce(status, 'Copied to clipboard.');
    return true;
  } catch {
    announce(status, 'Copy was unavailable. Select the text to copy it manually.');
    return false;
  }
}

function fallbackCopy(text) {
  const area = document.createElement('textarea');
  area.value = text;
  area.setAttribute('readonly', '');
  area.style.position = 'fixed';
  area.style.opacity = '0';
  document.body.appendChild(area);
  area.select();
  const copied = document.execCommand('copy');
  area.remove();
  return copied;
}

function announce(status, message) {
  if (status) status.textContent = message;
  const previous = document.querySelector('.toast');
  previous?.remove();

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.setAttribute('aria-hidden', 'true');
  toast.textContent = message;
  document.body.appendChild(toast);
  window.setTimeout(() => toast.remove(), 2400);
}
