/**
 * Kravoxin - Landing Page Interactive Scripts
 * Styled & Inspired by MongoDB (https://www.mongodb.com/)
 */

document.addEventListener('DOMContentLoaded', () => {
  initPencilBanner();
  initNavigation();
  initHeroSimulator();
  initCodeBoxTabs();
  initTerminalCopy();
  initEnvironmentDetection();
  initBugReportForm();
  initSpotlightSearch();
  initScrollAnimations();
  initBackToTop();
});

/* ==========================================================================
   1. Pencil Announcement Banner Carousel
   ========================================================================== */
function initPencilBanner() {
  const items = document.querySelectorAll('.pencil-item');
  const prevBtn = document.getElementById('pencil-prev');
  const nextBtn = document.getElementById('pencil-next');
  if (!items.length) return;

  let currentIndex = 0;
  let bannerInterval;

  function showSlide(index) {
    items.forEach((item, i) => {
      item.classList.toggle('active', i === index);
    });
    currentIndex = index;
  }

  function nextSlide() {
    const next = (currentIndex + 1) % items.length;
    showSlide(next);
  }

  function prevSlide() {
    const prev = (currentIndex - 1 + items.length) % items.length;
    showSlide(prev);
  }

  if (nextBtn && prevBtn) {
    nextBtn.addEventListener('click', (e) => {
      e.preventDefault();
      nextSlide();
      resetInterval();
    });

    prevBtn.addEventListener('click', (e) => {
      e.preventDefault();
      prevSlide();
      resetInterval();
    });
  }

  function startInterval() {
    bannerInterval = setInterval(nextSlide, 5500);
  }

  function resetInterval() {
    clearInterval(bannerInterval);
    startInterval();
  }

  startInterval();
}

/* ==========================================================================
   2. Sticky Navigation & Smooth Scroll
   ========================================================================== */
function initNavigation() {
  const nav = document.querySelector('.site-nav');
  const navLinks = document.querySelectorAll('.nav-link, .mobile-nav-link');
  const mobileToggle = document.getElementById('mobile-menu-toggle');
  const mobileDrawer = document.getElementById('mobile-nav-drawer');

  // Sticky nav shadow
  window.addEventListener('scroll', () => {
    if (window.scrollY > 30) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  });

  // Mobile drawer toggle
  if (mobileToggle && mobileDrawer) {
    mobileToggle.addEventListener('click', () => {
      const isOpen = mobileDrawer.classList.toggle('open');
      mobileToggle.innerHTML = isOpen 
        ? '<i class="fa-solid fa-xmark"></i>' 
        : '<i class="fa-solid fa-bars"></i>';
    });

    // Close on mobile link click
    document.querySelectorAll('.mobile-nav-link').forEach(link => {
      link.addEventListener('click', () => {
        mobileDrawer.classList.remove('open');
        mobileToggle.innerHTML = '<i class="fa-solid fa-bars"></i>';
      });
    });
  }

  // Active section indicator on scroll
  const sections = document.querySelectorAll('section[id], header[id]');
  window.addEventListener('scroll', () => {
    let current = '';
    const scrollPos = window.pageYOffset + 150;

    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      if (scrollPos >= top && scrollPos < top + height) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  });
}

/* ==========================================================================
   3. Hero Interactive Kravoxin Extension Simulator & Storage Sync
   ========================================================================== */
function initHeroSimulator() {
  const popupList = document.getElementById('v-popup-list');
  const jsonViewer = document.getElementById('v-storage-json');
  const searchInput = document.getElementById('v-search-input');
  const clearAllBtn = document.getElementById('v-clear-all-btn');
  const customCopyInput = document.getElementById('custom-copy-input');
  const customCopyBtn = document.getElementById('custom-copy-btn');
  const tabBtns = document.querySelectorAll('.demo-tab-btn');
  const contentPanes = document.querySelectorAll('.demo-content-pane');

  if (!popupList) return;

  // Initial mock history representing actual Kravoxin data
  let historyData = [
    {
      text: 'git clone https://github.com/Rohan-Shridhar/Kravoxin.git',
      favorite: true,
      timestamp: formatTimestamp(new Date(Date.now() - 1000 * 60 * 5))
    },
    {
      text: 'const client = new MongoClient("mongodb+srv://cluster0.example.net");',
      favorite: false,
      timestamp: formatTimestamp(new Date(Date.now() - 1000 * 60 * 18))
    },
    {
      text: 'chrome.storage.local.set({ history: normalizedItems });',
      favorite: true,
      timestamp: formatTimestamp(new Date(Date.now() - 1000 * 60 * 45))
    },
    {
      text: 'npm install --save-dev @types/chrome',
      favorite: false,
      timestamp: formatTimestamp(new Date(Date.now() - 1000 * 60 * 120))
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
  function renderVirtualPopup(filterText = '') {
    popupList.innerHTML = '';
    const filtered = historyData.filter(item => 
      item.text.toLowerCase().includes(filterText.toLowerCase())
    );

    if (filtered.length === 0) {
      popupList.innerHTML = `
        <div style="text-align: center; padding: 32px 16px; color: var(--text-muted); font-size: 13px;">
          <i class="fa-regular fa-clipboard" style="font-size: 28px; margin-bottom: 8px; opacity: 0.5;"></i>
          <p>No matching snippets found</p>
        </div>
      `;
      updateJsonViewer();
      return;
    }

    filtered.forEach((item, idx) => {
      const realIndex = historyData.indexOf(item);
      const li = document.createElement('div');
      li.className = `v-history-item ${item.favorite ? 'is-favorite' : ''}`;
      li.innerHTML = `
        <div class="v-item-text" title="${escapeHtml(item.text)}">${escapeHtml(item.text)}</div>
        <div class="v-item-footer">
          <span class="v-item-time"><i class="fa-regular fa-clock"></i> ${formatDisplayTime(item.timestamp)}</span>
          <div class="v-item-btn-group">
            <button class="v-action-btn star-btn ${item.favorite ? 'active' : ''}" title="${item.favorite ? 'Unfavorite' : 'Favorite'}" data-index="${realIndex}">
              <i class="${item.favorite ? 'fa-solid' : 'fa-regular'} fa-star"></i>
            </button>
            <button class="v-action-btn copy-btn" title="Copy snippet" data-index="${realIndex}">
              <i class="fa-regular fa-copy"></i>
              <span>Copy</span>
            </button>
            <button class="v-action-btn delete-btn" title="Delete" data-index="${realIndex}">
              <i class="fa-regular fa-trash-can"></i>
            </button>
          </div>
        </div>
      `;

      // Favorite toggle
      li.querySelector('.star-btn').addEventListener('click', () => {
        historyData[realIndex].favorite = !historyData[realIndex].favorite;
        renderVirtualPopup(searchInput.value);
        showToast(historyData[realIndex].favorite ? 'Starred item in Kravoxin' : 'Removed from favorites', 'fa-star');
      });

      // Copy Action
      li.querySelector('.copy-btn').addEventListener('click', async (e) => {
        const btn = e.currentTarget;
        try {
          await navigator.clipboard.writeText(item.text);
        } catch (err) {
          // fallback
        }
        btn.innerHTML = '<i class="fa-solid fa-check"></i> <span>Copied!</span>';
        btn.style.color = 'var(--brand-forest)';
        btn.style.borderColor = 'var(--brand-forest)';
        showToast(`Copied to clipboard: "${item.text.slice(0, 28)}..."`, 'fa-circle-check');
        setTimeout(() => {
          btn.innerHTML = '<i class="fa-regular fa-copy"></i> <span>Copy</span>';
          btn.style.color = '';
          btn.style.borderColor = '';
        }, 1500);
      });

      // Delete Action
      li.querySelector('.delete-btn').addEventListener('click', () => {
        historyData.splice(realIndex, 1);
        renderVirtualPopup(searchInput.value);
        showToast('Snippet deleted from local history', 'fa-trash-can');
      });

      popupList.appendChild(li);
    });

    updateJsonViewer();
  }

  // Update Live JSON Viewer tab
  function updateJsonViewer() {
    if (!jsonViewer) return;
    const jsonString = JSON.stringify({ history: historyData }, null, 2);
    jsonViewer.innerHTML = syntaxHighlightJson(jsonString);
  }

  function syntaxHighlightJson(json) {
    json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, (match) => {
      let cls = 'json-number';
      if (/^"/.test(match)) {
        if (/:$/.test(match)) {
          cls = 'json-key';
        } else {
          cls = 'json-string';
        }
      } else if (/true|false/.test(match)) {
        cls = 'json-boolean';
      }
      return `<span class="${cls}">${match}</span>`;
    });
  }

  // Add new item from sample or custom copy
  function simulateCapture(text) {
    if (!text || !text.trim()) return;
    try {
      navigator.clipboard.writeText(text);
    } catch (e) {
      // browser may block without user gesture
    }
    historyData.unshift({
      text: text.trim(),
      favorite: false,
      timestamp: formatTimestamp(new Date())
    });
    renderVirtualPopup(searchInput.value);
    showToast(`Kravoxin captured: "${text.slice(0, 32)}..."`, 'fa-bolt');
  }

  // Attach sample snippet card click handlers
  document.querySelectorAll('.sample-snippet-card').forEach(card => {
    card.addEventListener('click', () => {
      const snippet = card.getAttribute('data-snippet') || card.querySelector('.snippet-text-content').textContent;
      simulateCapture(snippet);
    });
  });

  // Custom text copy button
  if (customCopyBtn && customCopyInput) {
    customCopyBtn.addEventListener('click', () => {
      if (customCopyInput.value) {
        simulateCapture(customCopyInput.value);
        customCopyInput.value = '';
      }
    });

    customCopyInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        customCopyBtn.click();
      }
    });
  }

  // Search input handler
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      renderVirtualPopup(e.target.value);
    });
  }

  // Clear all non-favorites button
  if (clearAllBtn) {
    clearAllBtn.addEventListener('click', () => {
      const nonFavCount = historyData.filter(i => !i.favorite).length;
      if (nonFavCount === 0) {
        showToast('Only favorites remain in history', 'fa-circle-info');
        return;
      }
      historyData = historyData.filter(item => item.favorite);
      renderVirtualPopup(searchInput.value);
      showToast(`Cleaned ${nonFavCount} non-favorite items`, 'fa-broom');
    });
  }

  // Tab switcher
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-tab');
      tabBtns.forEach(b => b.classList.remove('active'));
      contentPanes.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      const targetPane = document.getElementById(targetTab);
      if (targetPane) targetPane.classList.add('active');
    });
  });

  // Initial render
  renderVirtualPopup();
}

/* ==========================================================================
   4. Code Box Tabs & 1-Click Code Copy
   ========================================================================== */
function initCodeBoxTabs() {
  const tabs = document.querySelectorAll('.code-tab');
  const panes = document.querySelectorAll('.code-snippet-pane');
  const copyBtn = document.getElementById('btn-copy-spec-code');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetPaneId = tab.getAttribute('data-pane');
      tabs.forEach(t => t.classList.remove('active'));
      panes.forEach(p => p.classList.remove('active'));

      tab.classList.add('active');
      const target = document.getElementById(targetPaneId);
      if (target) target.classList.add('active');
    });
  });

  if (copyBtn) {
    copyBtn.addEventListener('click', async () => {
      const activePane = document.querySelector('.code-snippet-pane.active pre code');
      if (activePane) {
        try {
          await navigator.clipboard.writeText(activePane.innerText);
          copyBtn.innerHTML = '<i class="fa-solid fa-check"></i> Copied!';
          copyBtn.style.borderColor = 'var(--brand-green)';
          copyBtn.style.color = 'var(--brand-green)';
          showToast('Code snippet copied to clipboard', 'fa-check');
          setTimeout(() => {
            copyBtn.innerHTML = '<i class="fa-regular fa-copy"></i> Copy Code';
            copyBtn.style.borderColor = '';
            copyBtn.style.color = '';
          }, 2000);
        } catch (err) {
          showToast('Failed to copy code snippet', 'fa-circle-exclamation');
        }
      }
    });
  }
}

/* ==========================================================================
   5. Terminal Command 1-Click Copy
   ========================================================================== */
function initTerminalCopy() {
  const terminalBtn = document.getElementById('copy-terminal-cmd');
  if (!terminalBtn) return;

  terminalBtn.addEventListener('click', async () => {
    const cmdText = document.getElementById('terminal-text').innerText.trim();
    try {
      await navigator.clipboard.writeText(cmdText);
      terminalBtn.innerHTML = '<i class="fa-solid fa-check"></i> Copied!';
      terminalBtn.style.backgroundColor = 'var(--brand-green)';
      terminalBtn.style.color = 'var(--bg-dark)';
      showToast('Cloning command copied to clipboard!', 'fa-terminal');
      setTimeout(() => {
        terminalBtn.innerHTML = '<i class="fa-regular fa-copy"></i> Copy';
        terminalBtn.style.backgroundColor = '';
        terminalBtn.style.color = '';
      }, 2000);
    } catch (err) {
      showToast('Could not copy command', 'fa-circle-exclamation');
    }
  });
}

/* ==========================================================================
   6. Client Environment Auto-Detection
   ========================================================================== */
function initEnvironmentDetection() {
  const browserEl = document.getElementById('detected-browser');
  const osEl = document.getElementById('detected-os');
  const resolutionEl = document.getElementById('detected-resolution');
  const formBrowserInput = document.getElementById('bug-browser-field');

  let browser = 'Chrome (Chromium)';
  const ua = navigator.userAgent;

  if (ua.includes('Edg/')) {
    browser = 'Microsoft Edge';
  } else if (ua.includes('Brave')) {
    browser = 'Brave Browser';
  } else if (ua.includes('OPR/') || ua.includes('Opera')) {
    browser = 'Opera';
  } else if (ua.includes('Arc')) {
    browser = 'Arc Browser';
  } else if (ua.includes('Chrome/')) {
    browser = 'Google Chrome';
  }

  let os = 'Windows';
  if (navigator.userAgent.includes('Macintosh') || navigator.userAgent.includes('Mac OS')) {
    os = 'macOS';
  } else if (navigator.userAgent.includes('Linux')) {
    os = 'Linux';
  }

  const res = `${window.screen.width} × ${window.screen.height}`;
  const envString = `${browser} on ${os} (${res})`;

  if (browserEl) browserEl.textContent = browser;
  if (osEl) osEl.textContent = os;
  if (resolutionEl) resolutionEl.textContent = res;
  if (formBrowserInput) formBrowserInput.value = envString;
}

/* ==========================================================================
   7. Bug Report Form Submission to GitHub Issues
   ========================================================================== */
function initBugReportForm() {
  const form = document.getElementById('bug-report-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const title = document.getElementById('bug-title-input').value.trim();
    const category = document.getElementById('bug-category-select').value;
    const description = document.getElementById('bug-desc-input').value.trim();
    const browserInfo = document.getElementById('bug-browser-field').value;

    const issueTitle = `[${category}] ${title}`;
    const issueBody = `## Bug Report\n\n` +
      `### Summary\n${description}\n\n` +
      `### Category\n${category}\n\n` +
      `### Environment Information\n- **Browser / OS:** ${browserInfo}\n- **Extension Version:** Kravoxin v1.4.0\n\n` +
      `### Steps to Reproduce\n1. Copy text on webpage\n2. Open Kravoxin popup\n3. Observe behavior\n\n` +
      `*Submitted via Kravoxin Landing Page*`;

    const githubUrl = `https://github.com/Rohan-Shridhar/Kravoxin/issues/new?title=${encodeURIComponent(issueTitle)}&body=${encodeURIComponent(issueBody)}`;

    window.open(githubUrl, '_blank');
    form.reset();
    initEnvironmentDetection();
    showToast('GitHub issue generator launched!', 'fa-github');
  });
}

/* ==========================================================================
   8. Spotlight Quick Search Modal (Cmd+K / Ctrl+K)
   ========================================================================== */
function initSpotlightSearch() {
  const backdrop = document.getElementById('spotlight-search-modal');
  const triggerBtns = document.querySelectorAll('.open-search-modal');
  const closeBtn = document.getElementById('close-search-modal');
  const searchInput = document.getElementById('spotlight-search-input');
  const resultItems = document.querySelectorAll('.search-result-item');

  if (!backdrop) return;

  function openModal() {
    backdrop.classList.add('open');
    setTimeout(() => {
      if (searchInput) {
        searchInput.focus();
        searchInput.value = '';
        filterResults('');
      }
    }, 50);
  }

  function closeModal() {
    backdrop.classList.remove('open');
  }

  triggerBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openModal();
    });
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', closeModal);
  }

  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) closeModal();
  });

  // Keyboard shortcut Ctrl+K or Cmd+K
  window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      if (backdrop.classList.contains('open')) {
        closeModal();
      } else {
        openModal();
      }
    } else if (e.key === 'Escape' && backdrop.classList.contains('open')) {
      closeModal();
    }
  });

  function filterResults(query) {
    const q = query.toLowerCase().trim();
    resultItems.forEach(item => {
      const text = item.textContent.toLowerCase();
      item.style.display = text.includes(q) ? 'flex' : 'none';
    });
  }

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      filterResults(e.target.value);
    });
  }

  resultItems.forEach(item => {
    item.addEventListener('click', () => {
      const targetId = item.getAttribute('data-target');
      closeModal();
      if (targetId) {
        const el = document.querySelector(targetId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });
  });
}

/* ==========================================================================
   9. Scroll Reveal Animations
   ========================================================================== */
function initScrollAnimations() {
  const revealElements = document.querySelectorAll('.reveal-on-scroll');

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        obs.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  });

  revealElements.forEach(el => observer.observe(el));
}

/* ==========================================================================
   10. Back to Top Button
   ========================================================================== */
function initBackToTop() {
  const btn = document.getElementById('back-to-top-btn');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 400) {
      btn.classList.add('visible');
    } else {
      btn.classList.remove('visible');
    }
  });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ==========================================================================
   Toast Notification Utility
   ========================================================================== */
function showToast(message, iconClass = 'fa-check') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `
    <i class="fa-solid ${iconClass} toast-icon"></i>
    <span>${escapeHtml(message)}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('removing');
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300);
  }, 3200);
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
