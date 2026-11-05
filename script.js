/**
 * Kravoxin — Landing Page Interactive Engine
 * Design Language: UnvibeCode (https://financeflash.github.io/unvibecode/)
 * Handles:
 *  1. Live Kravoxin Virtual Extension Simulator & Local Storage Sync
 *  2. Terminal OS / Browser Installation Command Switcher
 *  3. Global 1-Click Copy with Clipboard Feedback & Accessibility Announcer
 *  4. Architecture Demo Modal Dialog (<dialog>)
 *  5. Browser Marquee Ticker Play/Pause Controller
 *  6. Client Environment Auto-Detection (Browser, OS, Screen)
 *  7. GitHub Issue Bug Report Generator
 *  8. Toast Notification Utility
 */

document.addEventListener('DOMContentLoaded', () => {
  initVirtualSimulator();
  initTerminalTabs();
  initCopyButtons();
  initArchitectureModal();
  initTickerControls();
  initEnvironmentDetection();
  initBugReportForm();
});

/* ==========================================================================
   1. Live Kravoxin Virtual Extension Simulator & chrome.storage.local Sync
   ========================================================================== */
function initVirtualSimulator() {
  const listContainer = document.getElementById('sim-list-container');
  const searchInput = document.getElementById('sim-search-input');
  const jsonView = document.getElementById('sim-pane-json');
  const statsLabel = document.getElementById('sim-status-stats');
  const clearBtn = document.getElementById('sim-clear-btn');
  const tabPopup = document.getElementById('sim-tab-popup');
  const tabJson = document.getElementById('sim-tab-json');
  const panePopup = document.getElementById('sim-pane-popup');
  const sampleCards = document.querySelectorAll('.sample-repo-card');

  if (!listContainer) return;

  // Initial mock history representing actual Kravoxin data
  let historyData = [
    {
      text: 'git clone https://github.com/Rohan-Shridhar/Kravoxin.git',
      favorite: true,
      timestamp: formatTimestamp(new Date(Date.now() - 1000 * 60 * 3))
    },
    {
      text: "chrome.storage.local.get(['history'], (res) => console.log(res));",
      favorite: true,
      timestamp: formatTimestamp(new Date(Date.now() - 1000 * 60 * 14))
    },
    {
      text: "curl -H 'Authorization: Bearer sk-live_9428571' https://api.service.com/v1",
      favorite: false,
      timestamp: formatTimestamp(new Date(Date.now() - 1000 * 60 * 42))
    },
    {
      text: "export DATABASE_URL='postgresql://postgres:secret@localhost:5432/kravoxin'",
      favorite: false,
      timestamp: formatTimestamp(new Date(Date.now() - 1000 * 60 * 95))
    }
  ];

  function formatTimestamp(d = new Date()) {
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
  }

  function formatDisplayTime(ts) {
    if (!ts || ts.length < 14) return 'Just now';
    const hours = ts.slice(8, 10);
    const mins = ts.slice(10, 12);
    return `${hours}:${mins}`;
  }

  // Render Virtual Kravoxin Extension Items
  function renderList(query = '') {
    listContainer.innerHTML = '';
    const q = query.toLowerCase().trim();

    // Sort: favorites first, then newest first
    const sorted = [...historyData].sort((a, b) => {
      if (a.favorite && !b.favorite) return -1;
      if (!a.favorite && b.favorite) return 1;
      return (b.timestamp || '').localeCompare(a.timestamp || '');
    });

    const filtered = sorted.filter((item) =>
      item.text.toLowerCase().includes(q)
    );

    if (filtered.length === 0) {
      listContainer.innerHTML = `
        <div style="text-align: center; padding: 36px 16px; color: var(--muted); font-size: 13px;">
          <p style="margin: 0 0 6px; font-weight: 700;">No matching clippings found</p>
          <span style="font-family: var(--mono); font-size: 11px;">Try typing a different keyword or copy a new snippet above.</span>
        </div>
      `;
      updateJsonViewer();
      updateStats();
      return;
    }

    filtered.forEach((item) => {
      const realIndex = historyData.indexOf(item);
      const el = document.createElement('div');
      el.className = `sim-snippet-item ${item.favorite ? 'is-favorite' : ''}`;

      el.innerHTML = `
        <div class="sim-snippet-text" title="${escapeHtml(item.text)}">${escapeHtml(item.text)}</div>
        <div class="sim-snippet-meta">
          <span class="sim-snippet-time">${formatDisplayTime(item.timestamp)}</span>
          <div class="sim-item-actions">
            <button type="button" class="sim-action-btn star ${item.favorite ? 'active' : ''}" title="${item.favorite ? 'Unpin favorite' : 'Pin to top'}">
              ${item.favorite ? '★ Pinned' : '☆ Pin'}
            </button>
            <button type="button" class="sim-action-btn copy-item-btn" title="Re-copy text to clipboard">
              Copy
            </button>
            <button type="button" class="sim-action-btn delete-item-btn" title="Delete from local storage">
              ×
            </button>
          </div>
        </div>
      `;

      // Favorite toggle
      el.querySelector('.star').addEventListener('click', (e) => {
        e.stopPropagation();
        historyData[realIndex].favorite = !historyData[realIndex].favorite;
        renderList(searchInput ? searchInput.value : '');
        showToast(
          historyData[realIndex].favorite
            ? 'Pinned item to top of Kravoxin'
            : 'Unpinned snippet'
        );
      });

      // Copy Action
      el.querySelector('.copy-item-btn').addEventListener('click', async (e) => {
        e.stopPropagation();
        const btn = e.currentTarget;
        let ok = false;
        try {
          if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(item.text);
            ok = true;
          } else {
            ok = fallbackCopy(item.text);
          }
        } catch (err) {
          ok = fallbackCopy(item.text);
        }

        btn.textContent = ok ? 'Copied!' : 'Copied';
        btn.style.borderColor = 'var(--emerald)';
        btn.style.color = 'var(--emerald)';
        showToast(`Copied snippet to clipboard`);

        setTimeout(() => {
          btn.textContent = 'Copy';
          btn.style.borderColor = '';
          btn.style.color = '';
        }, 1600);
      });

      // Delete Action
      el.querySelector('.delete-item-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        historyData.splice(realIndex, 1);
        renderList(searchInput ? searchInput.value : '');
        showToast('Snippet deleted from local store');
      });

      listContainer.appendChild(el);
    });

    updateJsonViewer();
    updateStats();
  }

  function updateJsonViewer() {
    if (!jsonView) return;
    const jsonStr = JSON.stringify({ history: historyData }, null, 2);
    jsonView.querySelector('code').textContent = jsonStr;
  }

  function updateStats() {
    if (!statsLabel) return;
    const favCount = historyData.filter((i) => i.favorite).length;
    statsLabel.textContent = `Storage: ${historyData.length} items (${favCount} pinned) · 100% Local`;
  }

  // Clean unpinned
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      const removed = historyData.filter((i) => !i.favorite).length;
      if (removed === 0) {
        showToast('Only pinned items remain in history');
        return;
      }
      historyData = historyData.filter((i) => i.favorite);
      renderList(searchInput ? searchInput.value : '');
      showToast(`Cleaned ${removed} unpinned clippings`);
    });
  }

  // Filter input
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      renderList(e.target.value);
    });
  }

  // Tab switching (Popup UI vs Raw JSON)
  if (tabPopup && tabJson) {
    tabPopup.addEventListener('click', () => {
      tabPopup.classList.add('active');
      tabJson.classList.remove('active');
      panePopup.style.display = 'block';
      jsonView.classList.remove('active');
    });

    tabJson.addEventListener('click', () => {
      tabJson.classList.add('active');
      tabPopup.classList.remove('active');
      panePopup.style.display = 'none';
      jsonView.classList.add('active');
      updateJsonViewer();
    });
  }

  // Inject sample card snippets on click
  sampleCards.forEach((card) => {
    const handleCardClick = async () => {
      const snippet = card.getAttribute('data-snippet');
      if (!snippet) return;

      // Copy to real clipboard
      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(snippet);
        } else {
          fallbackCopy(snippet);
        }
      } catch (err) {
        fallbackCopy(snippet);
      }

      // Add to virtual storage
      historyData.unshift({
        text: snippet,
        favorite: false,
        timestamp: formatTimestamp(new Date())
      });

      // Switch back to popup view if in JSON tab
      if (tabPopup && !tabPopup.classList.contains('active')) {
        tabPopup.click();
      }

      renderList(searchInput ? searchInput.value : '');
      showToast(`Kravoxin captured: "${snippet.slice(0, 30)}..."`);
    };

    card.addEventListener('click', handleCardClick);
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleCardClick();
      }
    });
  });

  // Initial render
  renderList();
}

/* ==========================================================================
   2. Terminal OS / Installation Tabs
   ========================================================================== */
function initTerminalTabs() {
  const buttons = document.querySelectorAll('.os-buttons button');
  const codeEl = document.getElementById('commands');
  if (!buttons.length || !codeEl) return;

  const commands = {
    chrome: `# 1. Open Google Chrome or Brave\nchrome://extensions/\n\n# 2. Toggle "Developer mode" in the top-right corner\n# 3. Click "Load unpacked" and select the Kravoxin folder`,
    edge: `# 1. Open Microsoft Edge\nedge://extensions/\n\n# 2. Toggle "Developer mode" in the left sidebar\n# 3. Click "Load unpacked" and select the Kravoxin folder`,
    git: `git clone https://github.com/Rohan-Shridhar/Kravoxin.git\ncd Kravoxin\n# Open chrome://extensions and load unpacked folder`
  };

  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      buttons.forEach((b) => b.setAttribute('aria-pressed', 'false'));
      btn.setAttribute('aria-pressed', 'true');
      const os = btn.dataset.os;
      if (commands[os]) {
        codeEl.textContent = commands[os];
      }
    });
  });
}

/* ==========================================================================
   3. Global 1-Click Copy with Feedback & Accessible Announcer
   ========================================================================== */
function initCopyButtons() {
  const copyButtons = document.querySelectorAll('[data-copy]');
  const copyStatus = document.getElementById('copy-status');

  copyButtons.forEach((btn) => {
    btn.addEventListener('click', async () => {
      const targetId = btn.dataset.copy;
      const targetEl = document.getElementById(targetId);
      if (!targetEl) return;

      const text = targetEl.textContent.trim();
      const originalLabel = btn.textContent;
      let ok = false;

      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(text);
          ok = true;
        } else {
          ok = fallbackCopy(text);
        }
      } catch (err) {
        ok = fallbackCopy(text);
      }

      btn.textContent = ok ? 'Copied' : 'Select & copy';
      if (copyStatus) {
        copyStatus.textContent = ok
          ? 'Text copied to clipboard.'
          : 'Copy unavailable. Select text manually.';
      }

      showToast(ok ? 'Copied to clipboard' : 'Select and copy manually');

      setTimeout(() => {
        btn.textContent = originalLabel;
      }, 2200);
    });
  });
}

function fallbackCopy(text) {
  try {
    const area = document.createElement('textarea');
    area.value = text;
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand('copy');
    area.remove();
    return ok;
  } catch (e) {
    return false;
  }
}

/* ==========================================================================
   4. Architecture Modal Dialog (<dialog>)
   ========================================================================== */
function initArchitectureModal() {
  const dialog = document.getElementById('sample-demo-dialog');
  const watchBtn = document.getElementById('sample-watch');
  const closeBtn = document.getElementById('sample-demo-close');

  if (!dialog || !watchBtn || !closeBtn) return;

  watchBtn.addEventListener('click', () => {
    dialog.showModal();
  });

  closeBtn.addEventListener('click', () => {
    dialog.close();
  });

  dialog.addEventListener('click', (e) => {
    if (e.target === dialog) {
      dialog.close();
    }
  });
}

/* ==========================================================================
   5. Browser Marquee Ticker Controller
   ========================================================================== */
function initTickerControls() {
  const root = document.getElementById('uvc-logo-preview');
  const toggleBtn = document.getElementById('ticker-toggle-btn');
  if (!root || !toggleBtn) return;

  toggleBtn.addEventListener('click', () => {
    const isPaused = root.classList.toggle('paused');
    toggleBtn.textContent = isPaused ? 'Play' : 'Pause';
    toggleBtn.setAttribute('aria-pressed', String(isPaused));
  });
}

/* ==========================================================================
   6. Client Environment Auto-Detection
   ========================================================================== */
function initEnvironmentDetection() {
  const envField = document.getElementById('bug-env-field');
  if (!envField) return;

  let browser = 'Chromium';
  const ua = navigator.userAgent;

  if (ua.includes('Edg/')) {
    browser = 'Microsoft Edge';
  } else if (ua.includes('Brave') || (navigator.brave && typeof navigator.brave.isBrave === 'function')) {
    browser = 'Brave Browser';
  } else if (ua.includes('OPR/') || ua.includes('Opera')) {
    browser = 'Opera';
  } else if (ua.includes('Arc')) {
    browser = 'Arc Browser';
  } else if (ua.includes('Chrome/')) {
    browser = 'Google Chrome';
  }

  let os = 'Windows';
  if (ua.includes('Macintosh') || ua.includes('Mac OS')) {
    os = 'macOS';
  } else if (ua.includes('Linux')) {
    os = 'Linux';
  } else if (ua.includes('CrOS')) {
    os = 'ChromeOS';
  }

  const res = `${window.screen.width} × ${window.screen.height}`;
  envField.value = `${browser} on ${os} (${res}) | Kravoxin v1.4.0 (Manifest V3)`;
}

/* ==========================================================================
   7. GitHub Issue Bug Report Generator
   ========================================================================== */
function initBugReportForm() {
  const form = document.getElementById('bug-report-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const titleInput = document.getElementById('bug-title-input');
    const categorySelect = document.getElementById('bug-category-select');
    const descInput = document.getElementById('bug-desc-input');
    const envField = document.getElementById('bug-env-field');

    const title = titleInput ? titleInput.value.trim() : 'Bug report';
    const category = categorySelect ? categorySelect.value : 'Bug';
    const desc = descInput ? descInput.value.trim() : '';
    const env = envField ? envField.value : '';

    const issueTitle = `[${category}] ${title}`;
    const issueBody = `## Summary
${desc}

### Environment Details
- **Environment:** ${env}
- **Extension:** Kravoxin v1.4.0 (Manifest V3)
- **Local Storage:** chrome.storage.local

### Steps to Reproduce
1. Copy text on webpage
2. Open Kravoxin popup
3. Observe behavior

*Submitted via Kravoxin Landing Page Generator*`;

    const githubUrl = `https://github.com/Rohan-Shridhar/Kravoxin/issues/new?title=${encodeURIComponent(issueTitle)}&body=${encodeURIComponent(issueBody)}`;

    window.open(githubUrl, '_blank', 'noopener,noreferrer');
    showToast('GitHub issue template opened in new tab');
  });
}

/* ==========================================================================
   8. Toast Notification Utility
   ========================================================================== */
function showToast(message) {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<span>${escapeHtml(message)}</span>`;

  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('removing');
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 250);
  }, 2600);
}

function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
